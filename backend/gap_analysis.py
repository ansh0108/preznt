import os
import json
from groq import Groq
from dotenv import load_dotenv
from embeddings import search_index

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
INDEXES_DIR = os.path.join(os.getenv("DATA_DIR", "."), "indexes")


def build_profile_context(profile: dict) -> str:
    """Build a comprehensive structured context from all profile sources."""
    sections = []

    # All skills from every source
    skills = profile.get("skills", [])
    if skills:
        sections.append(f"SKILLS ({len(skills)} total):\n" + ", ".join(skills))

    # Work experience
    for exp in profile.get("experience", []):
        parts = [f"EXPERIENCE: {exp.get('title', '')} at {exp.get('company', '')} ({exp.get('dates', '')})"]
        if exp.get("description"):
            parts.append(exp["description"])
        sections.append("\n".join(parts))

    # Education
    for edu in profile.get("education", []):
        sections.append(f"EDUCATION: {edu.get('degree', '')} at {edu.get('school', '')} ({edu.get('dates', '')})")

    # GitHub projects
    for repo in profile.get("github_repos", []):
        parts = [f"GITHUB PROJECT: {repo.get('name', '')} ({repo.get('language', '')})"]
        if repo.get("description"):
            parts.append(repo["description"])
        if repo.get("topics"):
            parts.append("Topics: " + ", ".join(repo["topics"]))
        sections.append("\n".join(parts))

    # Resume projects
    for proj in profile.get("resume_projects", []):
        parts = [f"RESUME PROJECT: {proj.get('name', '')}"]
        if proj.get("description"):
            parts.append(proj["description"])
        if proj.get("tech_stack"):
            parts.append("Tech: " + ", ".join(proj["tech_stack"]))
        sections.append("\n".join(parts))

    return "\n\n".join(sections)


def analyze_gap(target_role: str, user_id: str, user_name: str, profile: dict | None = None) -> dict:
    """Analyze skill gaps between user profile and target role."""

    # Build structured context from full profile (all sources)
    structured_context = build_profile_context(profile) if profile else ""

    # Also do vector search for any additional relevant chunks
    results = search_index(f"skills experience projects {target_role}", user_id, top_k=8, index_dir=INDEXES_DIR)
    vector_context = "\n\n".join([r["text"] for r in results])

    profile_context = f"{structured_context}\n\n--- Additional Context ---\n{vector_context}".strip()

    system = """You are a career advisor AI. Analyze a candidate's profile against a target role and return a structured gap analysis.

Respond ONLY with valid JSON in this exact format:
{
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": [
    {"skill": "Tableau", "importance": "Must Have", "reason": "Required for data visualization in this role"}
  ],
  "recommended_projects": [
    {"title": "Build a Sales Dashboard in Tableau", "description": "...", "difficulty": "Beginner"}
  ],
  "overall_fit": "Strong / Moderate / Weak",
  "summary": "2-3 sentence honest assessment",
  "strengths": ["strength1", "strength2"],
  "quick_wins": ["action1", "action2"]
}"""

    user_message = f"""Target Role: {target_role}

Candidate Profile (includes data from LinkedIn, resume, and GitHub):
{profile_context}

Analyze the gap between this candidate's current profile and the target role. Be specific and actionable. Make sure to consider ALL listed skills and projects from every source."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_message}
        ],
        temperature=0.3,
        max_tokens=2000
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except Exception as e:
        return {
            "error": f"Could not parse analysis: {str(e)}",
            "raw": raw[:500]
        }
