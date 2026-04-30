import sqlite3
import os
import json
import uuid
from datetime import datetime

DATA_DIR = os.getenv("DATA_DIR", ".")
DB_PATH = os.path.join(DATA_DIR, "auth.db")


def init_saved_analyses_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS saved_analyses (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    con.commit()
    con.close()


def save_analysis(user_id: str, type_: str, title: str, content: dict) -> str:
    analysis_id = str(uuid.uuid4())[:8]
    con = sqlite3.connect(DB_PATH)
    con.execute(
        "INSERT INTO saved_analyses (id, user_id, type, title, content, created_at) VALUES (?,?,?,?,?,?)",
        (analysis_id, user_id, type_, title, json.dumps(content), datetime.utcnow().isoformat())
    )
    con.commit()
    con.close()
    return analysis_id


def get_saved_analyses(user_id: str, type_: str | None = None) -> list:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    if type_:
        rows = con.execute(
            "SELECT * FROM saved_analyses WHERE user_id=? AND type=? ORDER BY created_at DESC LIMIT 20",
            (user_id, type_)
        ).fetchall()
    else:
        rows = con.execute(
            "SELECT * FROM saved_analyses WHERE user_id=? ORDER BY created_at DESC LIMIT 20",
            (user_id,)
        ).fetchall()
    con.close()
    return [{"id": r["id"], "type": r["type"], "title": r["title"],
             "content": json.loads(r["content"]), "created_at": r["created_at"]} for r in rows]


def delete_saved_analysis(analysis_id: str, user_id: str) -> bool:
    con = sqlite3.connect(DB_PATH)
    cur = con.execute("DELETE FROM saved_analyses WHERE id=? AND user_id=?", (analysis_id, user_id))
    con.commit()
    con.close()
    return cur.rowcount > 0
