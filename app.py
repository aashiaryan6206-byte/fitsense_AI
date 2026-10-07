import base64
import os

import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, render_template, request
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, template_folder=os.path.join(BASE_DIR, "templates"), static_folder=os.path.join(BASE_DIR, "static"))
options = vision.PoseLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=os.path.join(BASE_DIR, "models", "pose_landmarker.task")),
    num_poses=1, min_pose_detection_confidence=.55, min_pose_presence_confidence=.55
)
detector = vision.PoseLandmarker.create_from_options(options)


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


@app.post("/analyze-pose")
def analyze_pose():
    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image", "")
    pose = payload.get("pose", "tree")
    try:
        encoded = image_data.split(",", 1)[1]
        frame = cv2.imdecode(np.frombuffer(base64.b64decode(encoded), np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError
        result = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
    except (IndexError, ValueError, cv2.error):
        return jsonify(error="Invalid camera frame."), 400
    if not result.pose_landmarks:
        return jsonify(detected=False, instruction="full_body", stability=0, landmarks=[])
    points = result.pose_landmarks[0]
    instruction, stability = assess(points, pose if pose in {"tree", "mountain", "warrior", "general"} else "general")
    return jsonify(detected=True, instruction=instruction, stability=round(stability), landmarks=[{"x": p.x, "y": p.y, "visibility": p.visibility} for p in points])


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
