import base64
import binascii
import os

import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, render_template, request
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from pose_config import POSE_CATALOG, POSE_CONFIG


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, template_folder=os.path.join(BASE_DIR, "templates"), static_folder=os.path.join(BASE_DIR, "static"))
app.config.update(
    MAX_CONTENT_LENGTH=8 * 1024 * 1024,
    TRUSTED_HOSTS=["127.0.0.1", "localhost"],
)
options = vision.PoseLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=os.path.join(BASE_DIR, "models", "pose_landmarker.task")),
    num_poses=1, min_pose_detection_confidence=.55, min_pose_presence_confidence=.55
)
detector = vision.PoseLandmarker.create_from_options(options)


@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Permissions-Policy", "camera=(self), microphone=(), geolocation=()")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; media-src 'self' blob:; "
        "style-src 'self'; script-src 'self'; connect-src 'self'; font-src 'self'; "
        "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    )
    return response


def joint_angle(a, b, c):
    first, second = np.array([a.x - b.x, a.y - b.y]), np.array([c.x - b.x, c.y - b.y])
    return np.degrees(np.arccos(np.clip(np.dot(first, second) / (np.linalg.norm(first) * np.linalg.norm(second) + 1e-6), -1, 1)))


def assess(points, pose="tree"):
    sl, sr, wl, wr = points[11], points[12], points[15], points[16]
    hl, hr, kl, kr, al, ar = points[23], points[24], points[25], points[26], points[27], points[28]
    if min(p.visibility for p in (sl, sr, wl, wr, hl, hr, kl, kr, al, ar)) < .35:
        return "full_body", 0
    upright = abs((sl.x + sr.x - hl.x - hr.x) / 2) < .13
    arms_up = wl.y < sl.y and wr.y < sr.y
    bent_leg = min(joint_angle(hl, kl, al), joint_angle(hr, kr, ar)) < 145
    if pose == "general":
        return ("stand_tall" if not upright else "general_good"), 55 + 45 * upright
    if pose == "mountain":
        score = 45 + 35 * upright + 20 * (not bent_leg)
        if not upright: return "mountain_tall", score
        if bent_leg: return "mountain_legs", score
        return "mountain_good", score
    if pose == "warrior":
        arms_wide = abs(wl.y - sl.y) < .16 and abs(wr.y - sr.y) < .16
        score = 30 + 35 * arms_wide + 35 * bent_leg
        if not arms_wide: return "warrior_arms", score
        if not bent_leg: return "warrior_lunge", score
        return "warrior_good", score
    score = 35 + 25 * arms_up + 25 * bent_leg + 15 * upright
    if not arms_up:
        return "arms_up", score
    if not bent_leg:
        return "bend_leg", score
    if not upright:
        return "stand_tall", score
    return "good_pose", score


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/pose-config")
def pose_config():
    return jsonify(poses=POSE_CATALOG)


@app.post("/analyze-pose")
def analyze_pose():
    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image", "")
    pose = payload.get("pose", "tree")
    if pose not in POSE_CONFIG:
        pose = "general"
    config = POSE_CATALOG[pose]
    try:
        encoded = image_data.split(",", 1)[1]
        frame = cv2.imdecode(np.frombuffer(base64.b64decode(encoded, validate=True), np.uint8), cv2.IMREAD_COLOR)
        if frame is None or frame.size == 0 or frame.shape[0] > 4096 or frame.shape[1] > 4096:
            raise ValueError
        result = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
    except (IndexError, ValueError, binascii.Error, cv2.error):
        return jsonify(error="Invalid camera frame."), 400
    if not result.pose_landmarks:
        return jsonify(detected=False, pose=config, instruction="full_body", correction=config["corrections"].get("visibility", next(iter(config["corrections"].values()))), stability=0, landmarks=[])
    points = result.pose_landmarks[0]
    instruction, stability = assess(points, pose if pose in {"tree", "mountain", "warrior", "general"} else "general")
    success = instruction in {"good_pose", "mountain_good", "warrior_good", "general_good"}
    correction_key = {"arms_up": "arm position", "bend_leg": "leg position", "stand_tall": "posture", "mountain_tall": "posture", "mountain_legs": "leg alignment", "warrior_arms": "arms", "warrior_lunge": "front knee"}.get(instruction)
    correction = (config["corrections"].get(correction_key) if correction_key else None) or next(iter(config["corrections"].values()))
    return jsonify(detected=True, pose=config, instruction=instruction, correction=correction, success_message=config["success_message"] if success else None, stability=round(stability), landmarks=[{"x": p.x, "y": p.y, "visibility": p.visibility} for p in points])


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
