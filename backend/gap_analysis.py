import os
import json
from dotenv import load_dotenv
from embeddings import search_index
from groq_client import call_groq

load_dotenv()
INDEXES_DIR = os.path.join(os.getenv("DATA_DIR", "."), "indexes")


def build_profile_context(profile: dict) -> str:
    """Build a comprehensive structured context from all profile sources."""
    sections = []

    name = profile.get("name", "")
    title = profile.get("title", "")
    bio = profile.get("bio", "") or profile.get("linkedin_summary", "")
    if name or title:
        sections.append(f"CANDIDATE: {name} — {title}")
    if bio:
        sections.append(f"SUMMARY: {bio}")

    skills = profile.get("skills", [])
    if skills:
        sections.append(f"SKILLS ({len(skills)} total): " + ", ".join(skills))

    for edu in profile.get("education", []):
        sections.append(f"EDUCATION: {edu.get('degree', '')} at {edu.get('school', '')} ({edu.get('dates', '')})")

    for exp in profile.get("experience", []):
        parts = [f"EXPERIENCE: {exp.get('title', '')} at {exp.get('company', '')} ({exp.get('dates', '')})"]
        if exp.get("description"):
            parts.append(exp["description"])
        sections.append("\n".join(parts))

    for repo in profile.get("github_repos", []):
        parts = [f"GITHUB PROJECT: {repo.get('name', '')} ({repo.get('language', '')})"]
        if repo.get("description"):
            parts.append(repo["description"])
        if repo.get("topics"):
            parts.append("Topics: " + ", ".join(repo["topics"]))
        sections.append("\n".join(parts))

    for proj in profile.get("resume_projects", []):
        parts = [f"RESUME PROJECT: {proj.get('name', '')}"]
        if proj.get("description"):
            parts.append(proj["description"])
        if proj.get("tech_stack"):
            parts.append("Tech: " + ", ".join(proj["tech_stack"]))
        sections.append("\n".join(parts))

    for link in profile.get("links", []):
        t = link.get("type", "other").upper()
        parts = [f"{t}: {link.get('title', '')}"]
        if link.get("issuer"):
            parts.append(f"by {link['issuer']}")
        if link.get("date"):
            parts.append(f"({link['date']})")
        if link.get("description"):
            parts.append(link["description"])
        sections.append(" ".join(parts))

    # Append raw resume text so bullet improvements use exact resume lines
    for doc in profile.get("documents", []):
        raw = (doc.get("raw_text") or "").strip()
        source = doc.get("source", "")
        if raw and doc.get("type") == "document" and "linkedin" not in source.lower():
            sections.append(f"--- RESUME RAW TEXT (use exact lines from here for bullet improvements) ---\n{raw[:2500]}")
            break  # only need the first resume doc

    return "\n\n".join(sections)


def _enforce_length(improved: str, original: str, tolerance: float = 0.05) -> str:
    """Hard-trim improved bullet to within +5% of original character count at a word boundary."""
    max_len = int(len(original) * (1 + tolerance))
    if len(improved) <= max_len:
        return improved
    trimmed = improved[:max_len]
    last_space = trimmed.rfind(" ")
    if last_space > int(max_len * 0.75):
        trimmed = trimmed[:last_space]
    return trimmed.rstrip(".,;: ")


def analyze_gap(job_description: str, user_id: str, user_name: str, profile: dict | None = None) -> dict:
    """ATS-aware gap analysis between candidate profile and a specific job description."""

    structured_context = build_profile_context(profile) if profile else ""

    results = search_index(job_description[:500], user_id, top_k=5, index_dir=INDEXES_DIR)
    vector_context = "\n\n".join([r["text"] for r in results])

    profile_context = f"{structured_context}\n\n--- Relevant Profile Chunks ---\n{vector_context}".strip()

    # Detect role type from JD to tailor advice
    jd_lower = job_description.lower()
    is_technical = any(w in jd_lower for w in ["engineer", "developer", "data", "ml", "python", "sql", "software", "backend", "frontend", "fullstack", "devops", "analyst"])

    system = f"""You are an expert ATS scanner and career coach who reviews resumes against specific job descriptions. You work with candidates at ALL career levels across technical and non-technical roles.

Your task: conduct a thorough, ATS-optimised analysis of the candidate's profile against the provided job description.

{'This appears to be a technical role. Pay close attention to tool/framework/language matches and project relevance.' if is_technical else 'This appears to be a non-technical or business role. Focus on transferable skills, domain knowledge, communication, and leadership signals.'}

Respond ONLY with valid JSON in this EXACT format (no extra keys, no markdown):
{{
  "ats_score": <integer 0-100 based on keyword overlap, skill relevance, and content alignment>,
  "overall_fit": "<Strong|Moderate|Weak>",
  "summary": "<2-3 sentence executive summary of the match — be specific and honest>",
  "strengths": [
    {{"point": "<brief strength title>", "detail": "<1-2 sentences of specific evidence from their profile>"}}
  ],
  "matching_keywords": ["<keyword from JD found in profile>"],
  "missing_keywords": [
    {{"keyword": "<missing JD keyword>", "importance": "<Must Have|Nice to Have>", "context": "<why it matters for this role, 1 sentence>"}}
  ],
  "suggested_skills": ["<skill or tool name only — short keyword, e.g. 'Tableau', 'dbt', 'Spark' — mentioned in JD but absent from profile>"],
  "bullet_improvements": [
    {{"section": "<Experience|Project>", "original": "<the EXACT existing sentence or bullet from their Experience or Project sections>", "improved": "<rewritten using STAR format: Situation/Task + Action + Result — must be within ±5% of the original's character count, so it fits the exact same space on a resume without any reformatting>", "why": "<what makes this version better for ATS and human readers>"}}
  ],
  "tone_feedback": "<1-2 paragraphs on tone, framing, and positioning — how to present their background as impactful and relevant, not academic or generic>",
  "differentiation_tips": ["<specific tip for standing out — each should be actionable and role-specific>"],
  "quick_wins": ["<action they can take in the next 7 days to improve their fit for this specific role>"]
}}

SCORING GUIDE for ats_score:
- 80-100: Strong keyword overlap, directly relevant experience, minimal gaps
- 60-79: Moderate match, several relevant skills but key gaps exist
- 40-59: Partial match, relevant background but significant gaps
- 0-39: Weak match, major skill or domain mismatch

IMPORTANT:
- bullet_improvements: ONLY improve Experience or Project bullets — NEVER touch the Skills section
- bullet_improvements: "original" must be copied VERBATIM and CHARACTER-FOR-CHARACTER from the RESUME RAW TEXT section — do NOT use LinkedIn descriptions, do NOT paraphrase or reconstruct the line
- bullet_improvements: if there is no RESUME RAW TEXT, use exact lines from the experience descriptions
- bullet_improvements: "improved" must follow STAR format AND be within ±5% of the original's character count — resume line width and spacing must be preserved exactly
- suggested_skills: ONLY short skill/tool keyword names (e.g. "Tableau", "Power BI", "dbt") from the JD that are absent from the profile — never full sentences
- Be specific — reference actual companies, projects, tools from their profile
- Do NOT give generic advice. Every item must be tied to their actual profile and this specific JD
- missing_keywords: only include things actually mentioned in the JD that are absent from the profile
- Provide at least 2 bullet_improvements (Experience/Project only), 3 strengths, 3 missing keywords (if any), and 3 quick wins"""

    user_message = f"""JOB DESCRIPTION:
{job_description}

---

CANDIDATE PROFILE (LinkedIn + resume + GitHub combined):
{profile_context}

Analyze this candidate against the job description above. Be specific, constructive, and ATS-aware."""

    raw = call_groq([
        {"role": "system", "content": system},
        {"role": "user", "content": user_message}
    ], max_tokens=3000, temperature=0.2)
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        result = json.loads(raw)
        for b in result.get("bullet_improvements", []):
            if b.get("original") and b.get("improved"):
                b["improved"] = _enforce_length(b["improved"], b["original"])
        return result
    except Exception as e:
        return {
            "error": f"Could not parse analysis: {str(e)}",
            "raw": raw[:1000]
        }
