import os
import json
import sqlite3
from datetime import datetime
from dotenv import load_dotenv
from groq_client import call_groq_chat

load_dotenv()
DATA_DIR = os.getenv("DATA_DIR", ".")
RAG_EVAL_DB = os.path.join(DATA_DIR, "rag_eval.db")


def init_rag_eval_db():
    con = sqlite3.connect(RAG_EVAL_DB)
    con.execute("""
        CREATE TABLE IF NOT EXISTS rag_scores (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        TEXT NOT NULL,
            question       TEXT NOT NULL,
            faithfulness   INTEGER,
            relevancy      INTEGER,
            context_quality INTEGER,
            reasoning      TEXT,
            timestamp      TEXT NOT NULL
        )
    """)
    con.execute("CREATE INDEX IF NOT EXISTS idx_rag_user ON rag_scores(user_id)")
    con.commit()
    con.close()


def judge_response(question: str, context: str, answer: str) -> dict:
    """LLM-as-judge: score faithfulness, relevancy, and context quality."""
    prompt = f"""You are a strict RAG evaluation judge. Score the following chatbot response on three dimensions.

QUESTION:
{question}

RETRIEVED CONTEXT (what the chatbot was given):
{context[:1500]}

CHATBOT ANSWER:
{answer[:800]}

Score each dimension from 1 to 5:
- faithfulness: Does the answer ONLY use information from the retrieved context? (5 = entirely grounded, 1 = contains invented facts)
- relevancy: Does the answer actually address the question asked? (5 = directly answers it, 1 = completely off-topic)
- context_quality: Was the retrieved context actually useful for answering this question? (5 = highly relevant chunks, 1 = irrelevant chunks)

Respond ONLY with valid JSON, no markdown:
{{
  "faithfulness": <1-5>,
  "relevancy": <1-5>,
  "context_quality": <1-5>,
  "reasoning": "<1 sentence explaining the lowest score or any notable issue>"
}}"""

    try:
        raw = call_groq_chat([{"role": "user", "content": prompt}], max_tokens=150, temperature=0.1)
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        print(f"[RAG Eval] judge failed: {e}")
        return {}


def log_rag_score(user_id: str, question: str, scores: dict):
    if not scores:
        return
    try:
        con = sqlite3.connect(RAG_EVAL_DB)
        con.execute(
            """INSERT INTO rag_scores
               (user_id, question, faithfulness, relevancy, context_quality, reasoning, timestamp)
               VALUES (?,?,?,?,?,?,?)""",
            (
                user_id,
                question[:300],
                scores.get("faithfulness"),
                scores.get("relevancy"),
                scores.get("context_quality"),
                scores.get("reasoning", ""),
                datetime.utcnow().isoformat(),
            )
        )
        con.commit()
        con.close()
    except Exception as e:
        print(f"[RAG Eval] log_rag_score failed: {e}")


def get_rag_stats(user_id: str, limit: int = 30) -> dict:
    con = sqlite3.connect(RAG_EVAL_DB)

    total = con.execute(
        "SELECT COUNT(*) FROM rag_scores WHERE user_id=?", (user_id,)
    ).fetchone()[0]

    avgs = con.execute(
        """SELECT
             AVG(faithfulness), AVG(relevancy), AVG(context_quality)
           FROM rag_scores WHERE user_id=?""",
        (user_id,)
    ).fetchone()

    recent = con.execute(
        """SELECT question, faithfulness, relevancy, context_quality, reasoning, timestamp
           FROM rag_scores WHERE user_id=?
           ORDER BY timestamp DESC LIMIT ?""",
        (user_id, limit)
    ).fetchall()

    # Score distribution (how many 1s, 2s, 3s, 4s, 5s for faithfulness)
    dist = con.execute(
        """SELECT faithfulness, COUNT(*) FROM rag_scores
           WHERE user_id=? AND faithfulness IS NOT NULL
           GROUP BY faithfulness ORDER BY faithfulness""",
        (user_id,)
    ).fetchall()

    con.close()

    return {
        "total_evaluations": total,
        "averages": {
            "faithfulness": round(avgs[0], 2) if avgs[0] else None,
            "relevancy": round(avgs[1], 2) if avgs[1] else None,
            "context_quality": round(avgs[2], 2) if avgs[2] else None,
        },
        "faithfulness_distribution": {str(row[0]): row[1] for row in dist},
        "recent": [
            {
                "question": r[0],
                "faithfulness": r[1],
                "relevancy": r[2],
                "context_quality": r[3],
                "reasoning": r[4],
                "timestamp": r[5],
            }
            for r in recent
        ],
    }
