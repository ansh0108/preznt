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

    return "\n\n".join(sections)


def analyze_gap(job_description: str, user_id: str, user_name: str, profile: dict | None = None) -> dict:
    """ATS-aware gap analysis between candidate profile and a specific job description."""

    structured_context = build_profile_context(profile) if profile else ""

    results = search_index(job_description[:500], user_id, top_k=8, index_dir=INDEXES_DIR)
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
  "bullet_improvements": [
    {{"section": "<Experience/Project/Skills>", "original": "<existing bullet or description>", "improved": "<rewritten in Google XYZ format: Accomplished X by doing Y, resulting in Z>", "why": "<what makes this version better for ATS and human readers>"}}
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
- bullet_improvements: use REAL content from their profile as "original", rewrite it in XYZ format
- Be specific — reference actual companies, projects, tools from their profile
- Do NOT give generic advice. Every item must be tied to their actual profile and this specific JD
- missing_keywords: only include things actually mentioned in the JD that are absent from the profile
- Provide at least 2 bullet_improvements, 3 strengths, 3 missing keywords (if any), and 3 quick wins"""

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
        return json.loads(raw)
    except Exception as e:
        return {
            "error": f"Could not parse analysis: {str(e)}",
            "raw": raw[:1000]
        }
