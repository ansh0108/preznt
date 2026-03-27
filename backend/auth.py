import os
import json
import sqlite3
import uuid
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = os.getenv("DATA_DIR", ".")
DB_PATH = os.path.join(DATA_DIR, "auth.db")
SECRET_KEY = os.getenv("JWT_SECRET", "prolio-secret-key-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 30


def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            user_type TEXT NOT NULL,
            portfolio_id TEXT,
            portfolio_ids TEXT DEFAULT '[]',
            primary_portfolio_id TEXT DEFAULT '',
            created_at TEXT
        )
    """)
    # Migrations for existing DBs that don't have the new columns
    for col, default in [("portfolio_ids", "'[]'"), ("primary_portfolio_id", "''")]:
        try:
            con.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT DEFAULT {default}")
        except Exception:
            pass
    con.commit()
    con.close()


def _get_portfolio_ids(user: dict) -> list:
    """Get portfolio IDs, handling migration from legacy single portfolio_id."""
    ids = json.loads(user.get("portfolio_ids") or "[]")
    if not ids and user.get("portfolio_id"):
        ids = [user["portfolio_id"]]
    return ids


def get_user_by_email(email: str):
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    row = con.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    con.close()
    return dict(row) if row else None


def get_user_by_id(user_id: str):
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    row = con.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    con.close()
    return dict(row) if row else None


def create_user(email: str, password: str, user_type: str) -> dict:
    uid = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    now = datetime.utcnow().isoformat()
    con = sqlite3.connect(DB_PATH)
    try:
        con.execute(
            "INSERT INTO users (id, email, password_hash, user_type, portfolio_id, portfolio_ids, primary_portfolio_id, created_at) VALUES (?,?,?,?,?,?,?,?)",
            (uid, email, password_hash, user_type, None, "[]", "", now)
        )
        con.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        con.close()
    return {"id": uid, "email": email, "user_type": user_type, "portfolio_id": None}


def link_portfolio(user_id: str, portfolio_id: str):
    """Link a portfolio to user. Adds to list and sets as primary if first."""
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    row = con.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not row:
        con.close()
        return
    user = dict(row)
    ids = _get_portfolio_ids(user)
    if portfolio_id not in ids:
        ids.append(portfolio_id)
    primary = user.get("primary_portfolio_id") or portfolio_id
    con.execute(
        "UPDATE users SET portfolio_id=?, portfolio_ids=?, primary_portfolio_id=? WHERE id=?",
        (portfolio_id, json.dumps(ids), primary, user_id)
    )
    con.commit()
    con.close()


def add_portfolio_to_user(user_id: str, portfolio_id: str):
    """Add a new portfolio to user's list without changing primary."""
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    row = con.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not row:
        con.close()
        return
    user = dict(row)
    ids = _get_portfolio_ids(user)
    if portfolio_id not in ids:
        ids.append(portfolio_id)
    primary = user.get("primary_portfolio_id") or ids[0]
    con.execute(
        "UPDATE users SET portfolio_ids=?, primary_portfolio_id=? WHERE id=?",
        (json.dumps(ids), primary, user_id)
    )
    con.commit()
    con.close()


def set_primary_portfolio(user_id: str, portfolio_id: str):
    con = sqlite3.connect(DB_PATH)
    con.execute("UPDATE users SET primary_portfolio_id=?, portfolio_id=? WHERE id=?",
                (portfolio_id, portfolio_id, user_id))
    con.commit()
    con.close()


def remove_portfolio_from_user(user_id: str, portfolio_id: str):
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    row = con.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not row:
        con.close()
        return
    user = dict(row)
    ids = _get_portfolio_ids(user)
    ids = [i for i in ids if i != portfolio_id]
    primary = user.get("primary_portfolio_id") or ""
    if primary == portfolio_id:
        primary = ids[0] if ids else ""
    legacy = ids[0] if ids else None
    con.execute(
        "UPDATE users SET portfolio_id=?, portfolio_ids=?, primary_portfolio_id=? WHERE id=?",
        (legacy, json.dumps(ids), primary, user_id)
    )
    con.commit()
    con.close()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    user_id = decode_token(token)
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
