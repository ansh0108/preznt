from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import uuid
import json
import shutil
import requests
import re
from dotenv import load_dotenv

from parser import (
    parse_linkedin_pdf, parse_github_repos, parse_pdf_file,
    parse_docx_file, parse_pptx_file, parse_txt_file, prepare_documents
)
from embeddings import build_index, index_exists
from chatbot import chat
from gap_analysis import analyze_gap
from groq_client import call_groq
from auth import init_db, create_user, get_user_by_email, get_user_by_id, verify_password, make_token, get_current_user, link_portfolio

load_dotenv()
app = FastAPI()
init_db()

app.add_middleware(CORSMiddleware, allow_origins=[
                   "*"], allow_methods=["*"], allow_headers=["*"])

# DATA_DIR allows Railway persistent volume mount (set DATA_DIR=/data in Railway env)
DATA_DIR = os.getenv("DATA_DIR", ".")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
INDEXES_DIR = os.path.join(DATA_DIR, "indexes")
PROFILES_DIR = os.path.join(DATA_DIR, "profiles")
PHOTOS_DIR = os.path.join(DATA_DIR, "photos")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(INDEXES_DIR, exist_ok=True)
os.makedirs(PROFILES_DIR, exist_ok=True)
os.makedirs(PHOTOS_DIR, exist_ok=True)


class ProfileSetup(BaseModel):
    name: str
    title: str
    bio: str
    github_urls: list[str] = []
    github_username: str = ""
    target_roles: list[str] = []


class ChatRequest(BaseModel):
    user_id: str
    question: str
    history: list = []


class GapRequest(BaseModel):
    user_id: str
    target_role: str


class CoverLetterRequest(BaseModel):
    user_id: str
    job_description: str
    company_name: str = ""
    role_name: str = ""
    existing_letter: str = ""
    refinement: str = ""


class SignupRequest(BaseModel):
    email: str
    password: str
    user_type: str  # "seeker" or "recruiter"


class LoginRequest(BaseModel):
    email: str
    password: str


class LinkPortfolioRequest(BaseModel):
    portfolio_id: str


class AddGithubRequest(BaseModel):
    github_url: str


@app.post("/auth/signup")
async def signup(req: SignupRequest):
    if req.user_type not in ("seeker", "recruiter"):
        raise HTTPException(status_code=400, detail="user_type must be 'seeker' or 'recruiter'")
    user = create_user(req.email, req.password, req.user_type)
    token = make_token(user["id"])
    return {"token": token, "user_type": user["user_type"], "user_id": user["id"], "portfolio_id": None}


@app.post("/auth/login")
async def login(req: LoginRequest):
    user = get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = make_token(user["id"])
    return {"token": token, "user_type": user["user_type"], "user_id": user["id"], "portfolio_id": user.get("portfolio_id")}


@app.get("/auth/me")
async def me(authorization: str = Header(None)):
    user = get_current_user(authorization)
    profile_name = None
    if user.get("portfolio_id"):
        p = load_profile(user["portfolio_id"])
        if p:
            profile_name = p.get("name")
    return {"user_id": user["id"], "email": user["email"], "user_type": user["user_type"], "portfolio_id": user.get("portfolio_id"), "profile_name": profile_name}


@app.post("/auth/link-portfolio")
async def link_portfolio_endpoint(req: LinkPortfolioRequest, authorization: str = Header(None)):
    user = get_current_user(authorization)
    link_portfolio(user["id"], req.portfolio_id)
    return {"message": "Portfolio linked"}


@app.post("/profile/{user_id}/github")
async def add_github_url(user_id: str, req: AddGithubRequest):
    profile = load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    url = req.github_url.strip()
    if not url or "github.com" not in url:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")
    existing = profile.get("github_urls", [])
    if url not in existing:
        existing.append(url)
        profile["github_urls"] = existing
        profile["indexed"] = False
        save_profile(user_id, profile)
    return {"message": "GitHub URL added", "github_urls": existing}


@app.get("/health")
async def health():
    return {"status": "ok"}


def save_profile(user_id: str, profile: dict):
    with open(os.path.join(PROFILES_DIR, f"{user_id}.json"), "w") as f:
        json.dump(profile, f)


def load_profile(user_id: str) -> dict:
    path = os.path.join(PROFILES_DIR, f"{user_id}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def summarize_experience(title: str, company: str, raw_description: str) -> str:
    if not raw_description or len(raw_description) < 40:
        return raw_description
    prompt = f"""Rewrite this work experience in exactly 3 sentences from first-person perspective.
- Start sentences with "I"
- Be specific: mention exact tools, technologies, measurable outcomes
- Professional and natural tone
- Do NOT refer to yourself in third person ever

Role: {title} at {company}
Original: {raw_description}

3-sentence first-person rewrite:"""
    try:
        return call_groq([{"role": "user", "content": prompt}], max_tokens=180, temperature=0.2)
    except Exception as e:
        print(f"[LLM] Summarize failed for {title}: {e}")
        return raw_description[:300]


def extract_skills_from_all_sources(profile: dict, github_repos: list) -> list:
    """Extract a comprehensive, deduplicated skills list from all profile sources."""

    sources = []

    for exp in profile.get("experience", []):
        if exp.get("description"):
            sources.append(f"Role: {exp['title']} at {exp['company']}\n{exp['description']}")

    if profile.get("linkedin_summary"):
        sources.append(profile["linkedin_summary"])

    for proj in profile.get("resume_projects", []):
        if proj.get("description"):
            sources.append(f"Project: {proj['name']}\n{proj['description']}")
        if proj.get("tech_stack"):
            sources.append(f"Skills used: {', '.join(proj['tech_stack'])}")

    for repo in github_repos:
        if repo.get("description"):
            sources.append(f"GitHub project: {repo['name']}\n{repo['description']}")
        if repo.get("topics"):
            sources.append(f"Topics: {', '.join(repo['topics'])}")
        if repo.get("readme"):
            sources.append(repo["readme"][:500])

    existing = profile.get("skills", [])

    if not sources:
        return existing

    combined_text = "\n\n".join(sources)[:5000]

    prompt = f"""Extract a comprehensive list of skills from this professional profile. This person may be in any field — tech, marketing, sales, finance, research, design, etc.

Include ALL relevant skills: tools, software, platforms, methodologies, frameworks, domain-specific techniques, analytical methods, research methods, certifications. Include both technical and domain-specific professional skills.
Exclude: soft skills (communication, teamwork), company names, university names, locations, person names, vague adjectives.

Seed skills already known: {', '.join(existing)}

Profile text:
{combined_text}

Return ONLY a JSON array of skill strings, nothing else. Example: ["Python", "Tableau", "Van Westendorp", "SAP Analytics Cloud", "Journey Mapping"]
Aim for 15-25 specific, accurate skills. No duplicates. Capitalize properly."""

    try:
        raw = call_groq([{"role": "user", "content": prompt}], max_tokens=500, temperature=0.1)
        raw = raw.replace("```json", "").replace("```", "").strip()
        skills = json.loads(raw)
        if isinstance(skills, list):
            seen = set()
            merged = []
            for s in skills:
                if isinstance(s, str) and s.strip() and s.lower() not in seen:
                    seen.add(s.lower())
                    merged.append(s.strip())
            print(f"[Skills] Extracted {len(merged)} skills from all sources")
            return merged[:30]
    except Exception as e:
        print(f"[Skills] Extraction failed: {e}")

    return existing



# Authoritative keyword map for known tools — checked before LLM to avoid miscategorization.
KNOWN_SKILL_MAP = {
    "Programming Languages": [
        "python", "r", "sql", "javascript", "typescript", "java", "scala", "go", "c++", "c#",
        "bash", "shell", "matlab", "ruby", "php", "swift", "kotlin", "html", "css", "html/css",
    ],
    "Machine Learning & AI": [
        "scikit-learn", "tensorflow", "pytorch", "keras", "xgboost", "lightgbm", "catboost",
        "lasso", "ridge", "prophet", "arima", "sarima", "sarimax", "lstm", "random forest",
        "isolation forest", "decision tree", "gradient boosting", "nlp", "llm", "transformers",
        "huggingface", "sentence transformers", "faiss", "statsmodels", "regression",
        "classification", "clustering", "forecasting", "time series", "deep learning",
        "machine learning", "neural network", "groq llama", "groq", "openai", "langchain",
        "pandas", "numpy", "scipy", "statsmodels", "spacy",
    ],
    "Data & Analytics": [
        "tableau", "power bi", "powerbi", "looker", "metabase", "qlik", "dax", "data analysis",
        "data intelligence", "data visualization", "business intelligence", "bi", "analytics",
        "reporting", "excel", "microsoft excel", "google sheets", "data modeling", "etl",
        "data warehousing", "data pipeline", "management information systems",
    ],
    "Databases": [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "oracle", "mssql",
        "cassandra", "bigquery", "redshift", "duckdb", "snowflake",
    ],
    "Data Engineering": [
        "spark", "pyspark", "hadoop", "kafka", "airflow", "dbt", "databricks", "polars",
        "data pipeline", "data warehouse", "data lake", "etl",
    ],
    "Frameworks & Tools": [
        "fastapi", "flask", "django", "react", "node", "next.js", "vue", "angular",
        "streamlit", "gradio", "vite", "node.js", "express",
    ],
    "Cloud & DevOps": [
        "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "ci/cd",
        "terraform", "linux", "cloud", "heroku", "railway", "vercel",
    ],
    "SAP & Enterprise": [
        "sap", "sap analytics cloud", "sap hana", "salesforce", "crm", "erp",
    ],
}


def cluster_skills_with_llm(skills: list, profile: dict) -> dict:
    """Cluster skills: keyword map first for known tools, LLM only for the remainder."""
    if not skills:
        return {}

    clusters = {}
    used = set()

    # Pass 1: authoritative keyword matching for well-known tools
    for category, keywords in KNOWN_SKILL_MAP.items():
        matched = [s for s in skills if s.lower() in keywords or any(k in s.lower() for k in keywords if len(k) > 4)]
        if matched:
            clusters[category] = matched
            used.update(s.lower() for s in matched)

    # Pass 2: LLM clusters the remaining unknown/domain skills
    remaining = [s for s in skills if s.lower() not in used]
    if remaining:
        roles = [f"{e.get('title','')} at {e.get('company','')}" for e in profile.get("experience", [])[:3]]
        role_context = ", ".join(roles) if roles else ""

        prompt = f"""Group these remaining skills into appropriate portfolio categories for this person.

Person's roles: {role_context}
Skills to categorize: {', '.join(remaining)}

Rules:
- Use domain-appropriate names (e.g. "Research Methods", "Marketing Tools", "Business Analysis", "Design Tools")
- Do NOT create "Programming Languages", "Machine Learning", "Databases" — those are handled separately
- Each skill in exactly one category, no empty categories, 2-4 word category names
- If unsure, put in "Other"

Return ONLY valid JSON: {{"Category Name": ["skill1", "skill2"]}}"""

        try:
            raw = call_groq([{"role": "user", "content": prompt}], max_tokens=400, temperature=0.1)
            raw = raw.replace("```json", "").replace("```", "").strip()
            llm_clusters = json.loads(raw)
            if isinstance(llm_clusters, dict):
                for cat, cat_skills in llm_clusters.items():
                    if cat_skills:
                        clusters[cat] = cat_skills
                        used.update(s.lower() for s in cat_skills)
        except Exception as e:
            print(f"[Skills] LLM clustering failed: {e}")
            leftover = [s for s in remaining if s.lower() not in used]
            if leftover:
                clusters["Other"] = leftover

    # Catch anything still uncategorized
    still_missing = [s for s in skills if s.lower() not in used]
    if still_missing:
        clusters.setdefault("Other", []).extend(still_missing)

    print(f"[Skills] Clustered into {len(clusters)} categories")
    return clusters


def extract_contact_info(text: str) -> dict:
    """Extract email and phone from raw resume text using regex."""
    email_match = re.search(r'\b[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}\b', text)
    phone_match = re.search(
        r'(\+?\d[\d\s\-\(\)\.]{8,14}\d)', text)
    return {
        "email": email_match.group(0).strip() if email_match else "",
        "phone": phone_match.group(0).strip() if phone_match else ""
    }


def extract_resume_data(text: str, filename: str) -> dict:
    if not text or len(text) < 100:
        return {"projects": [], "skills": []}
    prompt = f"""Extract structured information from this resume/document. This person may work in any field — tech, marketing, sales, finance, research, design, etc.

Return ONLY valid JSON, nothing else:
{{
  "projects": [
    {{
      "name": "Project Name",
      "description": "2-3 sentence narrative: what the person set out to do, how they approached it, and what was achieved. Write in a natural storytelling style — not bullet points or resume fragments.",
      "tech_stack": ["Tool or method used", "Another tool"],
      "type": "personal"
    }}
  ],
  "skills": ["Python", "SQL", "Van Westendorp", "Journey Mapping"]
}}

Rules:
- Only clearly defined projects (not job responsibilities)
- skills = tools, software, platforms, methodologies, domain-specific techniques — include both technical AND domain/professional skills relevant to this person's field
- Exclude vague soft skills (communication, teamwork) but include domain-specific methods
- Max 10 projects, 20 skills
- tech_stack can include non-technical tools and methods (e.g. "SAP Analytics Cloud", "Van Westendorp", "Figma")

Document:
{text[:4000]}"""
    try:
        raw = call_groq([{"role": "user", "content": prompt}], max_tokens=1500, temperature=0.1)
        raw = raw.replace("```json", "").replace("```", "").strip()
        data = json.loads(raw)
        projects = data.get("projects", [])
        skills = data.get("skills", [])
        print(
            f"[Resume] {filename}: {len(projects)} projects, {len(skills)} skills")
        for p in projects:
            print(f"  PROJECT: {p.get('name', '')}")
        return {"projects": projects, "skills": skills}
    except Exception as e:
        print(f"[Resume] Extract failed for {filename}: {e}")
        return {"projects": [], "skills": []}


def generate_short_bio(profile: dict) -> str:
    """Generate a 2-sentence bio from the full profile."""
    summary = profile.get("linkedin_summary", "")
    title = profile.get("title", "")
    skills = ", ".join(profile.get("skills", [])[:8])
    experience = profile.get("experience", [])
    current = f"{experience[0].get('title', '')} at {experience[0].get('company', '')}" if experience else ""
    prompt = f"""Write a single short tagline (max 10 words) for this person's portfolio. It should capture their role and specialty. No quotes, no punctuation at end.

Examples: "Data analyst specializing in BI and visualization" / "Full-stack engineer focused on AI products"

Name: {profile.get('name', '')}
Title: {title}
Current role: {current}
Top skills: {skills}

Tagline:"""
    try:
        return call_groq([{"role": "user", "content": prompt}], max_tokens=30, temperature=0.3).strip('"').strip("'")
    except Exception as e:
        print(f"[LLM] Tagline failed: {e}")
        return title


def generate_repo_description(repo: dict) -> str:
    name = repo.get("name", "")
    language = repo.get("language", "")
    topics = ", ".join(repo.get("topics", []))
    readme = repo.get("readme", "")
    if not readme and not name:
        return ""
    prompt = f"""Write exactly 2 sentences describing what this GitHub project does and its tech stack. Specific and technical. No fluff.

Project: {name}
Language: {language}
Topics: {topics}
README: {readme[:1500]}

2-sentence description:"""
    try:
        return call_groq([{"role": "user", "content": prompt}], max_tokens=120, temperature=0.3)
    except Exception as e:
        print(f"[LLM] Repo desc failed for {name}: {e}")
        return ""


# ── Photo endpoints ───────────────────────────────────────────────────────────
@app.get("/profiles/list")
async def list_profiles():
    """Return only profiles linked to a verified seeker auth account."""
    # Get portfolio_ids that belong to real seeker accounts
    linked_ids = set()
    try:
        import sqlite3 as _sq3
        con = _sq3.connect(os.path.join(DATA_DIR, "auth.db"))
        rows = con.execute(
            "SELECT portfolio_id FROM users WHERE user_type='seeker' AND portfolio_id IS NOT NULL"
        ).fetchall()
        con.close()
        linked_ids = {r[0] for r in rows}
    except Exception:
        pass

    profiles = []
    for fname in os.listdir(PROFILES_DIR):
        if not fname.endswith(".json"):
            continue
        try:
            with open(os.path.join(PROFILES_DIR, fname)) as f:
                p = json.load(f)
            if not p.get("indexed"):
                continue
            if p["user_id"] not in linked_ids:
                continue
            exp = p.get("experience", [])
            current_role = f"{exp[0].get('title','')} at {exp[0].get('company','')}" if exp else ""
            profiles.append({
                "user_id": p["user_id"],
                "name": p.get("name", ""),
                "title": p.get("title", ""),
                "tagline": p.get("tagline", ""),
                "skills": p.get("skills", [])[:8],
                "current_role": current_role,
                "has_photo": bool(p.get("photo_ext")),
            })
        except Exception:
            continue
    return {"profiles": profiles}


@app.post("/upload/photo/{user_id}")
async def upload_photo(user_id: str, file: UploadFile = File(...)):
    profile = load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    ext = file.filename.split(".")[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    for old_ext in ("jpg", "jpeg", "png", "webp", "gif"):
        old = os.path.join(PHOTOS_DIR, f"{user_id}.{old_ext}")
        if os.path.exists(old):
            os.remove(old)
    photo_path = os.path.join(PHOTOS_DIR, f"{user_id}.{ext}")
    with open(photo_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    profile["photo_ext"] = ext
    save_profile(user_id, profile)
    return {"message": "Photo uploaded", "url": f"/photo/{user_id}"}


@app.get("/photo/{user_id}")
async def get_photo(user_id: str):
    profile = load_profile(user_id)
    if not profile or not profile.get("photo_ext"):
        raise HTTPException(status_code=404, detail="No photo")
    photo_path = os.path.join(PHOTOS_DIR, f"{user_id}.{profile['photo_ext']}")
    if not os.path.exists(photo_path):
        raise HTTPException(status_code=404, detail="Photo missing")
    return FileResponse(photo_path)


# ── GitHub user repos ─────────────────────────────────────────────────────────
@app.get("/github/repos")
async def get_github_user_repos(username: str = Query(...)):
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
    headers = {
        "Accept": "application/vnd.github.v3+json",
        **({"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {})
    }
    all_repos = []
    page = 1
    while True:
        resp = requests.get(
            f"https://api.github.com/users/{username}/repos",
            headers=headers,
            params={"per_page": 100, "page": page,
                    "sort": "updated", "type": "owner"},
            timeout=10
        )
        if resp.status_code == 404:
            raise HTTPException(
                status_code=404, detail=f"GitHub user '{username}' not found")
        if resp.status_code != 200:
            raise HTTPException(
                status_code=400, detail=f"GitHub API error: {resp.status_code}")
        data = resp.json()
        if not data:
            break
        for r in data:
            if not r.get("fork", False):
                all_repos.append({
                    "name": r.get("name", ""),
                    "description": r.get("description") or "",
                    "language": r.get("language") or "",
                    "stars": r.get("stargazers_count", 0),
                    "forks": r.get("forks_count", 0),
                    "topics": r.get("topics", []),
                    "url": r.get("html_url", ""),
                    "updated_at": r.get("updated_at", ""),
                })
        if len(data) < 100:
            break
        page += 1
    all_repos.sort(key=lambda x: (x["stars"], x["updated_at"]), reverse=True)
    return {"username": username, "repos": all_repos, "total": len(all_repos)}


@app.post("/setup/profile")
async def setup_profile(data: ProfileSetup):
    user_id = str(uuid.uuid4())[:8]
    profile = {
        "user_id": user_id, "name": data.name, "title": data.title,
        "bio": data.bio, "github_urls": data.github_urls,
        "github_username": data.github_username,
        "target_roles": data.target_roles, "documents": [],
        "indexed": False, "education": [], "experience": [],
        "skills": [], "linkedin_summary": "",
        "github_repos": [], "resume_projects": [], "photo_ext": None,
        "resume_filename": None
    }
    save_profile(user_id, profile)
    return {"user_id": user_id, "message": "Profile created"}


@app.post("/upload/linkedin/{user_id}")
async def upload_linkedin(user_id: str, file: UploadFile = File(...)):
    profile = load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    filepath = os.path.join(UPLOADS_DIR, f"{user_id}_linkedin.pdf")
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    parsed = parse_linkedin_pdf(filepath)
    profile["documents"].append(
        {"type": parsed["type"], "raw_text": parsed["raw_text"], "source": parsed["source"]})
    structured = parsed.get("structured", {})
    profile["education"] = structured.get("education", [])
    profile["experience"] = structured.get("experience", [])
    profile["skills"] = structured.get("skills", [])
    profile["linkedin_summary"] = structured.get("summary", "")
    profile["indexed"] = False
    save_profile(user_id, profile)
    return {"message": "LinkedIn PDF uploaded", "found": {"experience": len(profile["experience"]), "education": len(profile["education"]), "skills": len(profile["skills"])}}


@app.post("/upload/document/{user_id}")
async def upload_document(user_id: str, file: UploadFile = File(...)):
    profile = load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    ext = file.filename.split(".")[-1].lower()
    filepath = os.path.join(UPLOADS_DIR, f"{user_id}_{file.filename}")
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    parsers = {"pdf": parse_pdf_file, "docx": parse_docx_file,
               "pptx": parse_pptx_file, "ppt": parse_pptx_file}
    parsed = parsers.get(ext, parse_txt_file)(filepath, file.filename)
    profile["documents"].append(parsed)

    print(f"[Resume] Extracting from {file.filename}...")
    extracted = extract_resume_data(parsed.get("raw_text", ""), file.filename)
    existing_names = {p.get("name", "").lower()
                      for p in profile.get("resume_projects", [])}
    new_projects = [p for p in extracted["projects"]
                    if p.get("name", "").lower() not in existing_names]
    profile.setdefault("resume_projects", []).extend(new_projects)
    existing_skills = {s.lower() for s in profile.get("skills", [])}
    new_skills = [s for s in extracted["skills"]
                  if s.lower() not in existing_skills]
    profile["skills"] = profile.get("skills", []) + new_skills

    if not profile.get("resume_filename"):
        profile["resume_filename"] = f"{user_id}_{file.filename}"
    # Extract contact info if not already set
    if not profile.get("email") or not profile.get("phone"):
        contact = extract_contact_info(parsed.get("raw_text", ""))
        if contact["email"] and not profile.get("email"):
            profile["email"] = contact["email"]
        if contact["phone"] and not profile.get("phone"):
            profile["phone"] = contact["phone"]
    profile["indexed"] = False
    save_profile(user_id, profile)
    return {"message": f"{file.filename} uploaded", "extracted": {"projects": len(new_projects), "skills": len(new_skills)}}


@app.post("/index/{user_id}")
async def index_profile(user_id: str):
    profile = load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # 1. Summarize experience descriptions
    if profile.get("experience"):
        print(
            f"[LLM] Summarizing {len(profile['experience'])} experience entries...")
        for exp in profile["experience"]:
            if exp.get("description") and len(exp["description"]) > 60:
                exp["description"] = summarize_experience(
                    exp["title"], exp["company"], exp["description"])
        save_profile(user_id, profile)

    all_data = list(profile.get("documents", []))

    # 2. Fetch GitHub repos
    enriched_repos = []
    if profile.get("github_urls"):
        repos = parse_github_repos(profile["github_urls"])
        for r in repos:
            desc = (r.get("description") or "").strip()
            if not desc and (r.get("readme") or r.get("name")):
                print(f"[LLM] Generating description for {r['name']}...")
                desc = generate_repo_description(r)
            enriched_repos.append({
                "name": r.get("name", ""), "description": desc,
                "language": r.get("language") or "",
                "stars": r.get("stars", 0), "forks": r.get("forks", 0),
                "topics": r.get("topics", []), "url": r.get("url", "")
            })
        profile["github_repos"] = enriched_repos
        all_data.extend(repos)

    # 3. Extract comprehensive skills from ALL sources
    print("[LLM] Extracting comprehensive skills from all sources...")
    profile["skills"] = extract_skills_from_all_sources(profile, enriched_repos)

    # 4. Cluster skills dynamically
    print("[LLM] Clustering skills...")
    profile["skill_clusters"] = cluster_skills_with_llm(profile["skills"], profile)

    # 5. Generate tagline
    print("[LLM] Generating tagline...")
    profile["tagline"] = generate_short_bio(profile)
    save_profile(user_id, profile)

    chunks = 0
    if all_data:
        documents = prepare_documents(all_data)
        result = build_index(documents, user_id, INDEXES_DIR)
        chunks = result["chunks"]

    profile["indexed"] = True
    profile["chunk_count"] = chunks
    save_profile(user_id, profile)
    return {"message": f"Index built with {chunks} chunks", "chunks": chunks}


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    profile = load_profile(req.user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not index_exists(req.user_id, INDEXES_DIR):
        raise HTTPException(status_code=400, detail="Profile not indexed yet.")
    answer = chat(req.question, req.user_id, profile["name"], req.history, profile)
    return {"answer": answer}


@app.post("/gap-analysis")
async def gap_analysis_endpoint(req: GapRequest):
    profile = load_profile(req.user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not index_exists(req.user_id, INDEXES_DIR):
        raise HTTPException(status_code=400, detail="Profile not indexed yet.")
    result = analyze_gap(req.target_role, req.user_id, profile["name"], profile)
    return result


@app.post("/cover-letter")
async def cover_letter_endpoint(req: CoverLetterRequest):
    profile = load_profile(req.user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    from gap_analysis import build_profile_context
    profile_context = build_profile_context(profile)

    company = req.company_name or "the company"
    role = req.role_name or "this role"

    if req.refinement and req.existing_letter:
        prompt = f"""You are carefully editing a cover letter based on a specific instruction. Think through the change before making it.

Current cover letter:
{req.existing_letter}

Candidate's instruction: "{req.refinement}"

How to approach this:
1. Read the instruction carefully — understand exactly what they want changed
2. Identify only the sentences or phrases that need to change
3. Make surgical edits — do not rewrite the whole letter
4. If the instruction asks to emphasise something, weave it naturally into the existing flow
5. If the instruction asks to remove something, cut it cleanly without leaving gaps
6. Preserve everything else exactly as written

Rules:
- Stay under 200 words
- Keep the Dear/Sincerely structure
- Do not invent new experience not in the original letter
- Do not change the tone or voice — just apply the specific edit
- Return only the final revised cover letter, no explanation"""
    else:
        prompt = f"""Write a cover letter for {profile['name']} applying to {role} at {company}.

Candidate Profile:
{profile_context}

Job Description:
{req.job_description[:3000]}

Format it EXACTLY like this structure:
Dear Hiring Manager,

[Opening paragraph — 2-3 sentences. Why this role, why this company. Be specific.]

[Middle paragraph — 3-4 sentences. One or two concrete examples from their actual experience or projects that directly match the JD. Name real projects/companies/tools.]

[Closing paragraph — 2 sentences. Express enthusiasm, mention you'd love to discuss further.]

Sincerely,
{profile['name']}

Rules:
- STRICT maximum 200 words total
- Do not use filler phrases like "I am excited to apply", "I am confident that", "passionate about"
- Sound like a real human wrote it, not a template
- Only reference things actually in the profile — no invented experience
- No placeholder text like [Date] or [Address]"""

    try:
        letter = call_groq([{"role": "user", "content": prompt}], max_tokens=800, temperature=0.4)
        return {"cover_letter": letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/resume/{user_id}")
async def get_resume(user_id: str):
    profile = load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    filename = profile.get("resume_filename")
    if not filename:
        raise HTTPException(status_code=404, detail="No resume uploaded")
    filepath = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Resume file missing")
    return FileResponse(filepath, media_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename=\"{profile['name'].replace(' ', '_')}_Resume.pdf\""})


@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    profile = load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    # Derive github_username from stored field or from repo URLs
    github_username = profile.get("github_username", "")
    if not github_username and profile.get("github_urls"):
        m = re.search(r"github\.com/([^/]+)/", profile["github_urls"][0])
        if m:
            github_username = m.group(1)
    return {
        "user_id": profile["user_id"], "name": profile["name"],
        "title": profile["title"], "bio": profile.get("bio", ""),
        "linkedin_summary": profile.get("linkedin_summary", ""),
        "github_urls": profile.get("github_urls", []),
        "github_username": github_username,
        "github_repos": profile.get("github_repos", []),
        "resume_projects": profile.get("resume_projects", []),
        "education": profile.get("education", []),
        "experience": profile.get("experience", []),
        "skills": profile.get("skills", []),
        "skill_clusters": profile.get("skill_clusters", {}),
        "target_roles": profile.get("target_roles", []),
        "tagline": profile.get("tagline", ""),
        "email": profile.get("email", ""),
        "phone": profile.get("phone", ""),
        "indexed": profile.get("indexed", False),
        "has_photo": bool(profile.get("photo_ext")),
        "has_resume": bool(profile.get("resume_filename") and os.path.exists(os.path.join(UPLOADS_DIR, profile.get("resume_filename", ""))))
    }
