"""Database models and helpers for FitSense AI.
Handles user registration, authentication, sessions, and workout history with SQLite.
"""

import os
import sqlite3
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "fitsense.db")


def get_db_connection():
    """Returns a SQLite connection configured with Row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Initializes the SQLite database tables if they do not exist."""
    with get_db_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                display_name TEXT NOT NULL,
                password_hash TEXT DEFAULT '',
                avatar TEXT DEFAULT '🧘',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS workout_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                pose_id TEXT NOT NULL,
                pose_name TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                accuracy_score INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_user ON workout_sessions(user_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_date ON workout_sessions(created_at);
        """)

        # Seed default yogi if users table is empty
        cursor = conn.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            default_hash = generate_password_hash("yoga123")
            conn.execute(
                "INSERT INTO users (username, display_name, password_hash, avatar) VALUES (?, ?, ?, ?)",
                ("yogi", "Yogi Alex", default_hash, "🧘‍♂️")
            )
            conn.execute("""
                INSERT INTO workout_sessions (user_id, pose_id, pose_name, duration_seconds, accuracy_score)
                VALUES (1, 'tree', 'Tree Pose (Vrikshasana)', 25, 92),
                       (1, 'warrior', 'Warrior II (Virabhadrasana II)', 30, 88)
            """)
        conn.commit()


def smart_login_or_register(username, password="", display_name=None, avatar="🧘"):
    """Seamless login or automatic registration:
    - If user exists: checks password if set, logs in.
    - If user does not exist: creates new user immediately and logs in.
    Returns (user_dict, message, error_string).
    """
    username = (username or "").strip()
    password = (password or "").strip()

    if not username:
        return None, None, "Please enter a username or your name."

    # Normalize display name
    clean_display = (display_name or "").strip() or username.replace("_", " ").title()

    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT id, username, display_name, password_hash, avatar FROM users WHERE username = ?",
            (username,)
        )
        row = cursor.fetchone()

        if row:
            # Existing user: verify password if password was previously set and password provided
            stored_hash = row["password_hash"]
            if stored_hash and password:
                if not check_password_hash(stored_hash, password):
                    return None, None, "Incorrect password for this user. If you are new, please use a different username."

            # Update avatar or display name if provided and differed
            if avatar and avatar != row["avatar"]:
                conn.execute("UPDATE users SET avatar = ? WHERE id = ?", (avatar, row["id"]))
                conn.commit()

            return {
                "id": row["id"],
                "username": row["username"],
                "display_name": row["display_name"],
                "avatar": avatar or row["avatar"]
            }, f"Welcome back, {row['display_name']}!", None

        else:
            # New user: auto-register on the fly
            pwd_hash = generate_password_hash(password) if password else ""
            cursor = conn.execute(
                "INSERT INTO users (username, display_name, password_hash, avatar) VALUES (?, ?, ?, ?)",
                (username, clean_display, pwd_hash, avatar or "🧘")
            )
            user_id = cursor.lastrowid
            conn.commit()

            return {
                "id": user_id,
                "username": username,
                "display_name": clean_display,
                "avatar": avatar or "🧘"
            }, f"Welcome to FitSense, {clean_display}! Your account is ready.", None


def register_user(username, display_name, password, avatar="🧘"):
    """Registers a new user."""
    user, msg, err = smart_login_or_register(username, password, display_name, avatar)
    return user, err


def authenticate_user(username, password):
    """Authenticates user or registers if new."""
    user, msg, err = smart_login_or_register(username, password)
    return user, err


def get_user_by_id(user_id):
    """Fetches user public profile by ID."""
    if not user_id:
        return None
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT id, username, display_name, avatar, created_at FROM users WHERE id = ?",
            (user_id,)
        )
        row = cursor.fetchone()
        if row:
            return {
                "id": row["id"],
                "username": row["username"],
                "display_name": row["display_name"],
                "avatar": row["avatar"],
                "created_at": row["created_at"]
            }
    return None


def get_user_by_username(username):
    """Fetches user public profile by username."""
    if not username:
        return None
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT id, username, display_name, avatar, created_at FROM users WHERE username = ?",
            (username.strip(),)
        )
        row = cursor.fetchone()
        if row:
            return {
                "id": row["id"],
                "username": row["username"],
                "display_name": row["display_name"],
                "avatar": row["avatar"],
                "created_at": row["created_at"]
            }
    return None


def save_user_session(user_id, pose_id, pose_name, duration_seconds, accuracy_score):
    """Saves a completed yoga workout session."""
    if not user_id or duration_seconds <= 0:
        return False
    with get_db_connection() as conn:
        conn.execute(
            """INSERT INTO workout_sessions 
               (user_id, pose_id, pose_name, duration_seconds, accuracy_score)
               VALUES (?, ?, ?, ?, ?)""",
            (user_id, pose_id, pose_name, max(1, int(duration_seconds)), max(0, min(100, int(accuracy_score))))
        )
        conn.commit()
    return True


def get_user_history_stats(user_id):
    """Returns sessions history and aggregated stats for a user."""
    if not user_id:
        return {"sessions": [], "total_sessions": 0, "total_minutes": 0, "avg_accuracy": 0, "favorite_pose": "Tree Pose"}

    with get_db_connection() as conn:
        cursor = conn.execute(
            """SELECT id, pose_id, pose_name, duration_seconds, accuracy_score, created_at 
               FROM workout_sessions 
               WHERE user_id = ? 
               ORDER BY id DESC LIMIT 50""",
            (user_id,)
        )
        rows = cursor.fetchall()
        sessions = [
            {
                "id": r["id"],
                "pose_id": r["pose_id"],
                "pose_name": r["pose_name"],
                "duration": r["duration_seconds"],
                "score": r["accuracy_score"],
                "date": r["created_at"]
            }
            for r in rows
        ]

        total_sessions = len(sessions)
        total_seconds = sum(s["duration"] for s in sessions)
        total_minutes = round(total_seconds / 60, 1)
        avg_score = round(sum(s["score"] for s in sessions) / total_sessions) if total_sessions else 0

        cursor_fav = conn.execute(
            """SELECT pose_name, COUNT(*) as cnt 
               FROM workout_sessions 
               WHERE user_id = ? 
               GROUP BY pose_name ORDER BY cnt DESC LIMIT 1""",
            (user_id,)
        )
        fav_row = cursor_fav.fetchone()
        favorite_pose = fav_row["pose_name"] if fav_row else "Tree Pose"

        return {
            "sessions": sessions,
            "total_sessions": total_sessions,
            "total_minutes": total_minutes,
            "avg_accuracy": avg_score,
            "favorite_pose": favorite_pose
        }


def clear_user_history(user_id):
    """Clears history for given user."""
    if not user_id:
        return False
    with get_db_connection() as conn:
        conn.execute("DELETE FROM workout_sessions WHERE user_id = ?", (user_id,))
        conn.commit()
    return True
