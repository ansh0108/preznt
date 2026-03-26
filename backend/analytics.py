import os
import sqlite3
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
DATA_DIR = os.getenv("DATA_DIR", ".")
ANALYTICS_DB = os.path.join(DATA_DIR, "analytics.db")


def init_analytics_db():
    con = sqlite3.connect(ANALYTICS_DB)
    con.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id   TEXT NOT NULL,
            event_type TEXT NOT NULL,
            data      TEXT,
            timestamp TEXT NOT NULL
        )
    """)
    con.execute("CREATE INDEX IF NOT EXISTS idx_user ON events(user_id)")
    con.commit()
    con.close()


def log_event(user_id: str, event_type: str, data: str = None):
    try:
        con = sqlite3.connect(ANALYTICS_DB)
        con.execute(
            "INSERT INTO events (user_id, event_type, data, timestamp) VALUES (?,?,?,?)",
            (user_id, event_type, data, datetime.utcnow().isoformat())
        )
        con.commit()
        con.close()
    except Exception as e:
        print(f"[analytics] log_event failed: {e}")


def get_analytics(user_id: str) -> dict:
    con = sqlite3.connect(ANALYTICS_DB)

    total_views = con.execute(
        "SELECT COUNT(*) FROM events WHERE user_id=? AND event_type='view'",
        (user_id,)
    ).fetchone()[0]

    # Views per day for last 14 days
    view_rows = con.execute("""
        SELECT DATE(timestamp) as day, COUNT(*) as cnt
        FROM events
        WHERE user_id=? AND event_type='view'
          AND timestamp >= datetime('now', '-14 days')
        GROUP BY day
        ORDER BY day
    """, (user_id,)).fetchall()
    views_by_day = [{"date": r[0], "count": r[1]} for r in view_rows]

    # Recent chat questions (newest first, last 30)
    q_rows = con.execute("""
        SELECT data, timestamp FROM events
        WHERE user_id=? AND event_type='chat'
        ORDER BY timestamp DESC
        LIMIT 30
    """, (user_id,)).fetchall()
    recent_questions = [{"question": r[0], "time": r[1]} for r in q_rows]

    # Tab click counts
    t_rows = con.execute("""
        SELECT data, COUNT(*) as cnt FROM events
        WHERE user_id=? AND event_type='tab'
        GROUP BY data
    """, (user_id,)).fetchall()
    tab_clicks = {r[0]: r[1] for r in t_rows}

    con.close()
    return {
        "total_views": total_views,
        "views_by_day": views_by_day,
        "recent_questions": recent_questions,
        "tab_clicks": tab_clicks,
    }
