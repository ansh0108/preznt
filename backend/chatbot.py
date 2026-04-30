import os
import hashlib
from dotenv import load_dotenv
from embeddings import search_index
from groq_client import call_groq_chat

# Simple in-memory cache: (user_id, question_hash) -> answer
_chat_cache: dict = {}

load_dotenv()
INDEXES_DIR = os.path.join(os.getenv("DATA_DIR", "."), "indexes")


def build_profile_summary(profile: dict) -> str:
    """Build a structured summary of all profile data for the LLM."""
    parts = []

    skills = profile.get("skills", [])
    if skills:
        parts.append("Skills: " + ", ".join(skills))

    for exp in profile.get("experience", []):
        line = f"Experience: {exp.get('title', '')} at {exp.get('company', '')} ({exp.get('dates', '')})"
        if exp.get("description"):
            line += f" — {exp['description']}"
        parts.append(line)

    for edu in profile.get("education", []):
        parts.append(f"Education: {edu.get('degree', '')} at {edu.get('school', '')} ({edu.get('dates', '')})")

    for repo in profile.get("github_repos", []):
        line = f"GitHub Project: {repo.get('name', '')} ({repo.get('language', '')})"
        if repo.get("description"):
            line += f" — {repo['description']}"
        if repo.get("topics"):
            line += f" | Topics: {', '.join(repo['topics'])}"
        parts.append(line)

    for proj in profile.get("resume_projects", []):
        line = f"Resume Project: {proj.get('name', '')}"
        if proj.get("description"):
            line += f" — {proj['description']}"
        if proj.get("tech_stack"):
            line += f" | Tech: {', '.join(proj['tech_stack'])}"
        parts.append(line)

    for link in profile.get("links", []):
        t = link.get("type", "other").capitalize()
        line = f"{t}: {link.get('title', '')}"
        if link.get("issuer"):
            line += f" (by {link['issuer']})"
        if link.get("date"):
            line += f" — {link['date']}"
        parts.append(line)

    return "\n".join(parts)


def chat(question: str, user_id: str, user_name: str, chat_history: list = [], profile: dict | None = None) -> str:
    # Cache hit: same question + same user, no chat history context needed
    if not chat_history:
        cache_key = (user_id, hashlib.md5(question.strip().lower().encode()).hexdigest())
        if cache_key in _chat_cache:
            print(f"[Chat] Cache hit for user {user_id}")
            return _chat_cache[cache_key]

    # Vector search for relevant chunks
    results = search_index(question, user_id, top_k=6, index_dir=INDEXES_DIR)
    vector_context = "\n\n".join([f"[From {r['source']}]\n{r['text']}" for r in results])

    # Full structured profile data from all sources
    structured_summary = build_profile_summary(profile) if profile else ""

    full_context = f"{structured_summary}\n\n--- Relevant Details ---\n{vector_context}".strip() if structured_summary else vector_context

    if not full_context:
        return "I don't have enough information to answer that question yet."

    messages = [
        {
            "role": "system",
            "content": f"""You are a portfolio assistant speaking AS {user_name} — answer questions in first person, as if you are {user_name} speaking directly.

STRICT RULES:
- ONLY answer questions about {user_name}'s professional background: skills, experience, projects, education, tools, career goals, and anything in the profile context below.
- If a question is off-topic (general knowledge, world events, coding tutorials, opinions on unrelated topics, anything not about {user_name}'s background), respond with: "I'm here to answer questions about my background and experience — feel free to ask about my skills, projects, or work history!"
- ONLY use information from the profile context below. Never invent, infer, or add skills, tools, companies, or experiences not explicitly mentioned.
- If something is not in the context, say "I haven't worked with that" or "I don't have experience in that area" — do not guess.
- Use "I", "my", "me" throughout. Never refer to {user_name} in third person.
- Be specific: mention real project names, companies, and tools from the context.

FORMATTING RULES (always follow):
- For any answer with multiple points, ALWAYS use bullet points starting with "- ".
- Highlight important words, technologies, company names, and project names using **bold** (wrap in double asterisks).
- Keep each bullet concise — one idea per bullet.
- Lead with 1 short sentence summary, then bullets if there are multiple points.
- No walls of text. Max 5-6 bullets per answer.

Full profile context (LinkedIn + resume + GitHub):
{full_context}"""
        }
    ]

    for msg in chat_history[-6:]:
        messages.append(msg)

    messages.append({"role": "user", "content": question})

    answer = call_groq_chat(messages)
    if not chat_history:
        cache_key = (user_id, hashlib.md5(question.strip().lower().encode()).hexdigest())
        _chat_cache[cache_key] = answer
    return answer
