import os
from dotenv import load_dotenv
from embeddings import search_index
from groq_client import call_groq

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

    return "\n".join(parts)


def chat(question: str, user_id: str, user_name: str, chat_history: list = [], profile: dict | None = None) -> str:
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
            "content": f"""You are {user_name}'s AI portfolio assistant. Answer questions about {user_name} in first person as if you are {user_name}.

STRICT RESPONSE RULES:
- Always answer in first person. Use "I", "my", "me" — never refer to "{user_name}" in third person.
- Keep answers SHORT — maximum 5 bullet points.
- Each bullet point MUST be on its own line, starting with "•".
- Format EVERY response as a bulleted list. No paragraphs ever.
- Lead with the most impressive or relevant point first.
- Be specific: name the exact project, tool, or company.
- Never repeat the question. Jump straight to the answer.
- Never make up information not in the context.

Example of correct format:
• Built X using Y at Z
• Achieved specific outcome
• Used tools A, B, C

Full profile context (LinkedIn + resume + GitHub):
{full_context}"""
        }
    ]

    for msg in chat_history[-6:]:
        messages.append(msg)

    messages.append({"role": "user", "content": question})

    return call_groq(messages, max_tokens=300, temperature=0.3)
