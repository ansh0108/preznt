import os
import json
import asyncio
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
        sections.append(" ".join(parts))

    for doc in profile.get("documents", []):
        raw = (doc.get("raw_text") or "").strip()
        source = doc.get("source", "")
        if raw and doc.get("type") == "document" and "linkedin" not in source.lower():
            sections.append(f"--- RESUME RAW TEXT ---\n{raw[:2500]}")
            break

    return "\n\n".join(sections)


def _enforce_length(improved: str, original: str, tolerance: float = 0.05) -> str:
    max_len = int(len(original) * (1 + tolerance))
    if len(improved) <= max_len:
        return improved
    trimmed = improved[:max_len]
    last_space = trimmed.rfind(" ")
    if last_space > int(max_len * 0.75):
        trimmed = trimmed[:last_space]
    return trimmed.rstrip(".,;: ")


async def _run_agent(name: str, messages: list, max_tokens: int = 800) -> dict:
    """Run a single Groq call in a thread (non-blocking) and parse JSON response."""
    try:
        raw = await asyncio.to_thread(call_groq, messages, max_tokens, 0.2)
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        print(f"[Gap] Agent '{name}' failed: {e}")
        return {}


async def analyze_gap(job_description: str, user_id: str, user_name: str, profile: dict | None = None) -> dict:
    """
    Parallel 4-agent gap analysis.
    Agents run concurrently via asyncio.gather — total time = slowest single agent.
    """
    structured_context = build_profile_context(profile) if profile else ""

    # Single vector search shared across all agents
    jd_query = job_description[:500]
    results = await asyncio.to_thread(search_index, jd_query, user_id, top_k=5, index_dir=INDEXES_DIR)
    vector_context = "\n\n".join([r["text"] for r in results])

    ctx_short = structured_context[:3000]
    profile_context = f"{ctx_short}\n\n--- Relevant Profile Chunks ---\n{vector_context}".strip()
    jd_short = job_description[:2000]

    jd_lower = job_description.lower()
    is_technical = any(w in jd_lower for w in [
        "engineer", "developer", "data", "ml", "python", "sql", "software",
        "backend", "frontend", "fullstack", "devops", "analyst"
    ])
    role_note = (
        "Technical role: focus on tool/framework/language matches and project relevance."
        if is_technical else
        "Non-technical role: focus on transferable skills, domain knowledge, communication, and leadership."
    )

    user_block = f"JOB DESCRIPTION:\n{jd_short}\n\n---\n\nCANDIDATE PROFILE:\n{profile_context}"

    # ── Agent 1: ATS Scanner ──────────────────────────────────────────────────
    a1_system = f"""You are an ATS scanner. {role_note}

Scan the candidate profile against the job description for keyword overlap.

Rules for missing_keywords / suggested_skills:
- Scan ALL sections before marking anything missing.
- Only flag a skill as missing if it is genuinely absent everywhere.
- suggested_skills: ONLY skills/tools LITERALLY named in the JD — never infer. "data visualization" ≠ Tableau unless Tableau is written in the JD.
- Treat synonyms as matches (e.g. "Machine Learning" matches ML + Python + model deployment).

Respond ONLY with valid JSON, no markdown:
{{
  "ats_score": <integer 0-100>,
  "matching_keywords": ["<keyword from JD found in profile>"],
  "missing_keywords": [
    {{"keyword": "<missing JD keyword>", "importance": "<Must Have|Nice to Have>", "context": "<why it matters, 1 sentence>"}}
  ],
  "suggested_skills": ["<skill/tool LITERALLY named in JD but absent from profile>"]
}}"""

    # ── Agent 2: Resume Coach (Bullet Improvements) ───────────────────────────
    a2_system = f"""You are a resume coach who rewrites experience bullets in STAR format. {role_note}

Rules:
- "original" MUST be copied VERBATIM from the RESUME RAW TEXT section — character for character.
- If no RESUME RAW TEXT, use exact lines from experience descriptions.
- "improved" MUST follow STAR format AND be within ±5% of original character count.
- Only improve Experience or Project bullets — NEVER touch Skills.
- Provide at least 2 bullet improvements.

Respond ONLY with valid JSON, no markdown:
{{
  "bullet_improvements": [
    {{"section": "<Experience|Project>", "original": "<EXACT verbatim text>", "improved": "<STAR rewrite within ±5% char count>", "why": "<what makes this better for ATS and human readers>"}}
  ]
}}"""

    # ── Agent 3: Career Advisor (Positioning & Fit) ───────────────────────────
    a3_system = f"""You are a senior career advisor assessing candidate fit and narrative. {role_note}

⚠️ LANGUAGE RULE: Use second person ("You" / "Your") throughout. Never say "{user_name} has..." or "The candidate...".

Provide at least 3 strengths with specific evidence from their actual profile.

Respond ONLY with valid JSON, no markdown:
{{
  "overall_fit": "<Strong|Moderate|Weak>",
  "summary": "<2-3 sentence executive summary — be specific and honest>",
  "strengths": [
    {{"point": "<brief strength title>", "detail": "<1-2 sentences of specific evidence from their profile>"}}
  ],
  "tone_feedback": "<1-2 paragraphs on tone, framing, positioning — use second person throughout>"
}}"""

    # ── Agent 4: Strategy Coach (Quick Wins & Differentiation) ───────────────
    a4_system = f"""You are a job search strategist. {role_note}

⚠️ LANGUAGE RULE: Use second person ("You" / "Your") throughout.

quick_wins must be SPECIFIC — reference their actual experience, projects, or companies by name.
Never write generic advice like "tailor your resume" or "network with professionals".
Good example: "Add 'XGBoost' and 'SHAP' explicitly to your Skills section — they appear in your Customer Churn project but aren't visible at a glance."

Provide at least 3 quick wins and 3 differentiation tips.

Respond ONLY with valid JSON, no markdown:
{{
  "differentiation_tips": ["<specific tip for standing out — role-specific and actionable>"],
  "quick_wins": ["<action they can take in the next 7 days — specific to this candidate and this role>"]
}}"""

    # ── Launch all 4 agents concurrently ─────────────────────────────────────
    a1, a2, a3, a4 = await asyncio.gather(
        _run_agent("ats-scanner", [{"role": "system", "content": a1_system}, {"role": "user", "content": user_block}], max_tokens=600),
        _run_agent("bullet-coach", [{"role": "system", "content": a2_system}, {"role": "user", "content": user_block}], max_tokens=900),
        _run_agent("career-advisor", [{"role": "system", "content": a3_system}, {"role": "user", "content": user_block}], max_tokens=700),
        _run_agent("strategy-coach", [{"role": "system", "content": a4_system}, {"role": "user", "content": user_block}], max_tokens=500),
    )

    # ── Merge results ─────────────────────────────────────────────────────────
    bullets = a2.get("bullet_improvements", [])
    for b in bullets:
        if b.get("original") and b.get("improved"):
            b["improved"] = _enforce_length(b["improved"], b["original"])

    return {
        "ats_score": a1.get("ats_score", 0),
        "overall_fit": a3.get("overall_fit", "Moderate"),
        "summary": a3.get("summary", ""),
        "strengths": a3.get("strengths", []),
        "matching_keywords": a1.get("matching_keywords", []),
        "missing_keywords": a1.get("missing_keywords", []),
        "suggested_skills": a1.get("suggested_skills", []),
        "bullet_improvements": bullets,
        "tone_feedback": a3.get("tone_feedback", ""),
        "differentiation_tips": a4.get("differentiation_tips", []),
        "quick_wins": a4.get("quick_wins", []),
    }
