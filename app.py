"""FitSense AI - Backend Web Application.
Provides high-speed MediaPipe pose detection, biomechanical analysis,
user authentication, and session progress tracking.
"""

import base64
import binascii
import os
import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, render_template, request, session
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

import database
from pose_config import POSE_CATALOG, POSE_CONFIG
from pose_engine import assess_pose

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
)

app.config.update(
    SECRET_KEY=os.environ.get("SECRET_KEY", "fitsense-ai-yoga-secret-key-2026"),
    MAX_CONTENT_LENGTH=8 * 1024 * 1024,
    TRUSTED_HOSTS=["127.0.0.1", "localhost"],
)

# Initialize database tables & seed sample data
database.init_db()

# Initialize MediaPipe PoseLandmarker detector
options = vision.PoseLandmarkerOptions(
    base_options=python.BaseOptions(
        model_asset_path=os.path.join(BASE_DIR, "models", "pose_landmarker.task")
    ),
    num_poses=1,
    min_pose_detection_confidence=0.5,
    min_pose_presence_confidence=0.5,
)
detector = vision.PoseLandmarker.create_from_options(options)


@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Permissions-Policy", "camera=(self), microphone=(), geolocation=()"
    )
    # Permissive CSP for local assets, SVG data URLs, inline styling and audio synthesis
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self' data: blob:; "
        "img-src 'self' data: blob:; "
        "media-src 'self' blob:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self' 'unsafe-inline'; "
        "connect-src 'self'; "
        "font-src 'self' data:; "
        "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    )
    return response


# ============================================================================
# PAGE ROUTES
# ============================================================================

@app.get("/")
def home():
    return render_template("index.html")


@app.get("/pose-config")
def pose_config():
    return jsonify(poses=POSE_CATALOG)


# ============================================================================
# USER AUTHENTICATION & PROFILE APIS
# ============================================================================

@app.get("/api/auth/me")
def get_current_user():
    user_id = session.get("user_id")
    if user_id:
        user = database.get_user_by_id(user_id)
        if user:
            return jsonify(authenticated=True, user=user)

    # Return default or guest state
    return jsonify(
        authenticated=False,
        user={"id": 0, "username": "guest", "display_name": "Guest Yogi", "avatar": "🧘"}
    )


@app.post("/api/auth/register")
def register():
    payload = request.get_json(silent=True) or {}
    username = payload.get("username", "").strip()
    display_name = payload.get("display_name", "").strip() or username
    password = payload.get("password", "").strip()
    avatar = payload.get("avatar", "🧘")

    user, message, error = database.smart_login_or_register(username, password, display_name, avatar)
    if error:
        return jsonify(error=error), 400

    session["user_id"] = user["id"]
    return jsonify(success=True, user=user, message=message or "Registration successful!")


@app.post("/api/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    username = payload.get("username", "").strip()
    password = payload.get("password", "").strip()
    display_name = payload.get("display_name")
    avatar = payload.get("avatar")

    user, message, error = database.smart_login_or_register(username, password, display_name, avatar)
    if error:
        return jsonify(error=error), 400

    session["user_id"] = user["id"]
    return jsonify(success=True, user=user, message=message or f"Welcome back, {user['display_name']}!")


@app.post("/api/auth/logout")
def logout():
    session.pop("user_id", None)
    return jsonify(success=True, message="Logged out successfully.")


# ============================================================================
# USER WORKOUT HISTORY APIS
# ============================================================================

@app.get("/api/history")
def get_history():
    user_id = session.get("user_id", 1)  # Default to user 1 if not logged in
    stats = database.get_user_history_stats(user_id)
    return jsonify(stats)


@app.post("/api/history")
def record_session():
    user_id = session.get("user_id", 1)
    payload = request.get_json(silent=True) or {}
    pose_id = payload.get("pose_id", "tree")
    pose_name = payload.get("pose_name", "Tree Pose")
    duration = payload.get("duration", 0)
    score = payload.get("score", 0)

    success = database.save_user_session(user_id, pose_id, pose_name, duration, score)
    return jsonify(success=success)


@app.delete("/api/history")
def clear_history():
    user_id = session.get("user_id", 1)
    database.clear_user_history(user_id)
    return jsonify(success=True)


# ============================================================================
# HIGH-SPEED POSE ANALYSIS API
# ============================================================================

@app.post("/analyze-pose")
def analyze_pose():
    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image", "")
    pose = payload.get("pose", "tree")

    if pose not in POSE_CONFIG:
        pose = "general"
    config = POSE_CATALOG.get(pose, POSE_CATALOG["general"])

    try:
        # Fast base64 decode and OpenCV image loading
        encoded = image_data.split(",", 1)[1] if "," in image_data else image_data
        frame_bytes = base64.b64decode(encoded, validate=False)
        frame = cv2.imdecode(np.frombuffer(frame_bytes, np.uint8), cv2.IMREAD_COLOR)

        if frame is None or frame.size == 0 or frame.shape[0] > 4096 or frame.shape[1] > 4096:
            raise ValueError("Corrupt image data")

        # MediaPipe RGB detection
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = detector.detect(mp_image)

    except Exception:
        return jsonify(error="Invalid camera frame format."), 400

    # No pose detected
    if not result.pose_landmarks:
        return jsonify(
            detected=False,
            pose=config,
            instruction="full_body",
            correction="Step back until your full body is visible in the camera frame.",
            stability=0,
            success=False,
            checkpoints={},
            angles={},
            landmarks=[],
        )

    points = result.pose_landmarks[0]
    instruction, stability, success, correction, angles, checkpoints = assess_pose(points, pose)

    return jsonify(
        detected=True,
        pose=config,
        instruction=instruction,
        correction=correction,
        success_message=config["success_message"] if success else None,
        success=success,
        stability=round(stability),
        angles=angles,
        checkpoints=checkpoints,
        landmarks=[
            {"x": float(p.x), "y": float(p.y), "visibility": float(p.visibility)}
            for p in points
        ],
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
