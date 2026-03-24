from fastapi import FastAPI, UploadFile, File, HTTPException, Query
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

load_dotenv()
app = FastAPI()


def call_groq(messages: list, max_tokens: int = 500, temperature: float = 0.2) -> str:
    """Call Groq API directly via requests (avoids httpx/SDK network issues)."""
    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY', '')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        },
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()

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

    # Gather all text sources
    sources = []

    # LinkedIn experience descriptions
    for exp in profile.get("experience", []):
        if exp.get("description"):
            sources.append(
                f"Role: {exp['title']} at {exp['company']}\n{exp['description']}")

    # LinkedIn summary
    if profile.get("linkedin_summary"):
        sources.append(profile["linkedin_summary"])

    # Resume projects
    for proj in profile.get("resume_projects", []):
        if proj.get("description"):
            sources.append(f"Project: {proj['name']}\n{proj['description']}")
        if proj.get("tech_stack"):
            sources.append(f"Tech stack: {', '.join(proj['tech_stack'])}")

    # GitHub repos
    for repo in github_repos:
        if repo.get("description"):
            sources.append(
                f"GitHub project: {repo['name']}\n{repo['description']}")
        if repo.get("topics"):
            sources.append(f"Topics: {', '.join(repo['topics'])}")
        if repo.get("readme"):
            sources.append(repo["readme"][:500])

    # Existing skills as seed
    existing = profile.get("skills", [])

    if not sources:
        return existing

    combined_text = "\n\n".join(sources)[:5000]

    prompt = f"""Extract a comprehensive list of technical skills from this professional profile.

Include: programming languages, frameworks, libraries, tools, platforms, databases, methodologies, cloud services, data tools, ML/AI tools.
Exclude: soft skills, company names, university names, locations, person names, job titles.

Seed skills already known: {', '.join(existing)}

Profile text:
{combined_text}

Return ONLY a JSON array of skill strings, nothing else. Example: ["Python", "SQL", "Tableau", "FastAPI"]
Aim for 15-25 specific, accurate skills. No duplicates. Capitalize properly."""

    try:
        raw = call_groq([{"role": "user", "content": prompt}], max_tokens=500, temperature=0.1)
        raw = raw.replace("```json", "").replace("```", "").strip()
        skills = json.loads(raw)
        if isinstance(skills, list):
            # Merge with existing, deduplicate case-insensitively
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


def extract_resume_data(text: str, filename: str) -> dict:
    if not text or len(text) < 100:
        return {"projects": [], "skills": []}
    prompt = f"""Extract structured information from this resume/document.

Return ONLY valid JSON, nothing else:
{{
  "projects": [
    {{
      "name": "Project Name",
      "description": "2-3 sentence description: what it does, tech used, outcome",
      "tech_stack": ["Python", "React"],
      "type": "personal"
    }}
  ],
  "skills": ["Python", "SQL", "Tableau"]
}}

Rules:
- Only clearly defined projects (not job responsibilities)
- skills = tools, technologies, frameworks only (no soft skills, names, locations)
- Max 10 projects, 20 skills

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
            if not desc and r.get("readme"):
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

    # 4. Generate tagline
    print("[LLM] Generating tagline...")
    profile["tagline"] = generate_short_bio(profile)
    save_profile(user_id, profile)

    if not all_data:
        raise HTTPException(status_code=400, detail="No data to index.")

    documents = prepare_documents(all_data)
    result = build_index(documents, user_id, INDEXES_DIR)
    profile["indexed"] = True
    profile["chunk_count"] = result["chunks"]
    save_profile(user_id, profile)
    return {"message": f"Index built with {result['chunks']} chunks", "chunks": result["chunks"]}


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
        "target_roles": profile.get("target_roles", []),
        "tagline": profile.get("tagline", ""),
        "indexed": profile.get("indexed", False),
        "has_photo": bool(profile.get("photo_ext")),
        "has_resume": bool(profile.get("resume_filename") and os.path.exists(os.path.join(UPLOADS_DIR, profile.get("resume_filename", ""))))
    }
