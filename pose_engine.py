"""Biomechanical pose assessment engine for FitSense AI.
Calculates 3D/2D joint angles, checks posture alignment, and evaluates form stability.
"""

import numpy as np


def joint_angle(a, b, c):
    """Calculates angle ABC (at vertex B) in degrees."""
    first = np.array([a.x - b.x, a.y - b.y])
    second = np.array([c.x - b.x, c.y - b.y])
    norm_prod = np.linalg.norm(first) * np.linalg.norm(second) + 1e-6
    cosine = np.clip(np.dot(first, second) / norm_prod, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosine)))


def assess_pose(points, pose="tree"):
    """Evaluates user posture against biomechanical targets for the requested pose.
    Returns: (instruction, stability, success, correction, angles, checkpoints_met)
    """
    if len(points) < 33:
        return "full_body", 0, False, "Step back until your full body is visible in the camera.", {}, {}

    # MediaPipe pose landmarks
    # Nose: 0
    # Left shoulder: 11, Right shoulder: 12
    # Left elbow: 13, Right elbow: 14
    # Left wrist: 15, Right wrist: 16
    # Left hip: 23, Right hip: 24
    # Left knee: 25, Right knee: 26
    # Left ankle: 27, Right ankle: 28

    sl, sr = points[11], points[12]
    el, er = points[13], points[14]
    wl, wr = points[15], points[16]
    hl, hr = points[23], points[24]
    kl, kr = points[25], points[26]
    al, ar = points[27], points[28]

    # Visibility check for essential posture joints
    key_joints = (sl, sr, wl, wr, hl, hr, kl, kr, al, ar)
    if min(p.visibility for p in key_joints) < 0.35:
        return "full_body", 0, False, "Step back so your full body from hands to feet is in view.", {}, {}

    # Calculate standard joint angles
    left_knee_angle = joint_angle(hl, kl, al)
    right_knee_angle = joint_angle(hr, kr, ar)
    left_hip_angle = joint_angle(sl, hl, kl)
    right_hip_angle = joint_angle(sr, hr, kr)
    left_elbow_angle = joint_angle(sl, el, wl)
    right_elbow_angle = joint_angle(sr, er, wr)
    left_shoulder_angle = joint_angle(hl, sl, el)
    right_shoulder_angle = joint_angle(hr, sr, er)

    angles = {
        "left_knee": round(left_knee_angle),
        "right_knee": round(right_knee_angle),
        "left_hip": round(left_hip_angle),
        "right_hip": round(right_hip_angle),
        "left_elbow": round(left_elbow_angle),
        "right_elbow": round(right_elbow_angle),
        "left_shoulder": round(left_shoulder_angle),
        "right_shoulder": round(right_shoulder_angle),
    }

    # Torso uprightness: horizontal shift between shoulders center and hips center
    shoulders_cx = (sl.x + sr.x) / 2
    hips_cx = (hl.x + hr.x) / 2
    upright = abs(shoulders_cx - hips_cx) < 0.12

    # Hands position relative to shoulders
    arms_up = (wl.y < sl.y) and (wr.y < sr.y)
    hands_near_head = (wl.y < sl.y + 0.1) and (wr.y < sr.y + 0.1)
    arms_horizontal = (abs(wl.y - sl.y) < 0.16) and (abs(wr.y - sr.y) < 0.16)

    # Leg bending
    bent_leg = min(left_knee_angle, right_knee_angle) < 145

    checkpoints_met = {}

    # === TREE POSE ===
    if pose == "tree":
        # One leg standing straight (> 155°), one leg bent (< 140°)
        leg_check = (max(left_knee_angle, right_knee_angle) > 155) and (min(left_knee_angle, right_knee_angle) < 145)
        checkpoints_met["arms_up"] = arms_up
        checkpoints_met["bent_leg"] = leg_check
        checkpoints_met["upright"] = upright

        score = 25
        if arms_up: score += 25
        if leg_check: score += 30
        if upright: score += 20

        if not arms_up:
            return "arms_up", score, False, "Raise both arms overhead and relax your shoulders.", angles, checkpoints_met
        if not leg_check:
            return "bend_leg", score, False, "Bend one knee and place your foot on your opposite inner calf.", angles, checkpoints_met
        if not upright:
            return "stand_tall", score, False, "Stand tall, align your spine, and level both hips.", angles, checkpoints_met
        return "good_pose", min(100, score), True, "Excellent Tree Pose! Maintain balance and breathe smoothly.", angles, checkpoints_met

    # === MOUNTAIN POSE ===
    elif pose == "mountain":
        legs_straight = (left_knee_angle > 158) and (right_knee_angle > 158)
        arms_relaxed = (wl.y > sl.y + 0.2) and (wr.y > sr.y + 0.2)
        checkpoints_met["both_legs_straight"] = legs_straight
        checkpoints_met["upright_spine"] = upright
        checkpoints_met["arms_relaxed"] = arms_relaxed

        score = 30 + 35 * int(upright) + 25 * int(legs_straight) + 10 * int(arms_relaxed)
        if not upright:
            return "mountain_tall", score, False, "Stack your shoulders directly over your hips.", angles, checkpoints_met
        if not legs_straight:
            return "mountain_legs", score, False, "Straighten both legs and plant both feet firmly.", angles, checkpoints_met
        return "mountain_good", min(100, score), True, "Strong Mountain Pose. Keep your chest open and breathe deeply.", angles, checkpoints_met

    # === WARRIOR II ===
    elif pose == "warrior":
        # One knee bent ~90 (75-125), back knee straight (> 155)
        lunge_ok = (min(left_knee_angle, right_knee_angle) < 130) and (max(left_knee_angle, right_knee_angle) > 150)
        arms_wide = arms_horizontal and (abs(wl.x - wr.x) > 0.45)
        checkpoints_met["front_lunge"] = lunge_ok
        checkpoints_met["arms_horizontal"] = arms_wide
        checkpoints_met["back_leg_straight"] = max(left_knee_angle, right_knee_angle) > 150

        score = 25 + 40 * int(arms_wide) + 35 * int(lunge_ok)
        if not arms_wide:
            return "warrior_arms", score, False, "Extend both arms straight at shoulder height parallel to the floor.", angles, checkpoints_met
        if not lunge_ok:
            return "warrior_lunge", score, False, "Bend your front knee deeply until it stacks over your ankle.", angles, checkpoints_met
        return "warrior_good", min(100, score), True, "Fierce Warrior II! Strong lunge and broad arm reach.", angles, checkpoints_met

    # === WARRIOR I ===
    elif pose == "warrior1":
        lunge_ok = min(left_knee_angle, right_knee_angle) < 135
        checkpoints_met["front_lunge"] = lunge_ok
        checkpoints_met["arms_overhead"] = arms_up
        checkpoints_met["hips_square"] = upright

        score = 30 + 35 * int(lunge_ok) + 35 * int(arms_up)
        if not arms_up:
            return "arms_up", score, False, "Reach both arms straight up overhead toward the sky.", angles, checkpoints_met
        if not lunge_ok:
            return "warrior_lunge", score, False, "Deepen your front lunge toward a 90-degree angle.", angles, checkpoints_met
        return "warrior_good", min(100, score), True, "Great Warrior I! Uplifted reach and grounded base.", angles, checkpoints_met

    # === CHAIR POSE ===
    elif pose == "chair":
        # Both knees bent (80 - 140)
        both_knees_bent = (left_knee_angle < 145) and (right_knee_angle < 145)
        checkpoints_met["knees_bent"] = both_knees_bent
        checkpoints_met["arms_up"] = arms_up
        checkpoints_met["chest_lifted"] = upright

        score = 25 + 45 * int(both_knees_bent) + 30 * int(arms_up)
        if not both_knees_bent:
            return "chair_knees", score, False, "Bend both knees and sit your hips back as if into a chair.", angles, checkpoints_met
        if not arms_up:
            return "chair_arms", score, False, "Raise your arms alongside your ears with chest lifted.", angles, checkpoints_met
        return "chair_good", min(100, score), True, "Powerful Chair Pose! Strong thighs and lifted chest.", angles, checkpoints_met

    # === PLANK POSE ===
    elif pose == "plank":
        # Spine & hips horizontal
        torso_angle = abs(sl.y - hl.y) < 0.22 or abs(sr.y - hr.y) < 0.22
        arms_straight = (left_elbow_angle > 140) and (right_elbow_angle > 140)
        legs_straight = (left_knee_angle > 150) and (right_knee_angle > 150)
        checkpoints_met["straight_line"] = torso_angle and legs_straight
        checkpoints_met["arms_vertical"] = arms_straight
        checkpoints_met["core_active"] = torso_angle

        score = 30 + 40 * int(torso_angle) + 30 * int(arms_straight)
        if not torso_angle:
            return "plank_hips", score, False, "Form a straight line from shoulders to heels; don't sag hips.", angles, checkpoints_met
        if not arms_straight:
            return "plank_arms", score, False, "Straighten your arms and press firmly away from the floor.", angles, checkpoints_met
        return "plank_good", min(100, score), True, "Solid Plank! Strong core and straight line.", angles, checkpoints_met

    # === COBRA POSE ===
    elif pose == "cobra":
        chest_up = min(sl.y, sr.y) < min(hl.y, hr.y) - 0.15
        hips_down = max(hl.y, hr.y) > 0.4
        checkpoints_met["chest_lifted"] = chest_up
        checkpoints_met["shoulders_down"] = True
        checkpoints_met["pelvis_grounded"] = hips_down

        score = 40 + 35 * int(chest_up) + 25 * int(hips_down)
        if not chest_up:
            return "cobra_chest", score, False, "Peel your chest gently forward and up, softening shoulders.", angles, checkpoints_met
        return "cobra_good", min(100, score), True, "Graceful Cobra! Open heart and elongated neck.", angles, checkpoints_met

    # === DOWNWARD DOG ===
    elif pose == "downdog":
        hips_high = min(hl.y, hr.y) < min(sl.y, sr.y)
        legs_ext = (left_knee_angle > 140) and (right_knee_angle > 140)
        checkpoints_met["inverted_v"] = hips_high
        checkpoints_met["hips_high"] = hips_high
        checkpoints_met["arms_straight"] = left_elbow_angle > 140 and right_elbow_angle > 140

        score = 35 + 40 * int(hips_high) + 25 * int(legs_ext)
        if not hips_high:
            return "downdog_hips", score, False, "Lift your hips high toward the ceiling in an inverted V shape.", angles, checkpoints_met
        return "downdog_good", min(100, score), True, "Energizing Downward Dog! Long spine and high hips.", angles, checkpoints_met

    # === TRIANGLE POSE ===
    elif pose == "triangle":
        legs_straight = (left_knee_angle > 150) and (right_knee_angle > 150)
        arms_vertical = (abs(wl.x - wr.x) < 0.3) and (abs(wl.y - wr.y) > 0.35)
        checkpoints_met["straight_legs"] = legs_straight
        checkpoints_met["vertical_arms"] = arms_vertical
        checkpoints_met["open_chest"] = True

        score = 35 + 35 * int(legs_straight) + 30 * int(arms_vertical)
        if not legs_straight:
            return "triangle_legs", score, False, "Keep both legs straight in your wide stance.", angles, checkpoints_met
        if not arms_vertical:
            return "triangle_arms", score, False, "Reach one hand toward your leg and the other toward the sky.", angles, checkpoints_met
        return "triangle_good", min(100, score), True, "Radiant Triangle Pose! Expansive reach and open chest.", angles, checkpoints_met

    # === BRIDGE POSE ===
    elif pose == "bridge":
        knees_bent = (left_knee_angle < 130) and (right_knee_angle < 130)
        hips_up = (hl.y < kl.y) or (hr.y < kr.y)
        checkpoints_met["hips_lifted"] = hips_up
        checkpoints_met["knees_parallel"] = knees_bent
        checkpoints_met["chest_open"] = True

        score = 30 + 40 * int(hips_up) + 30 * int(knees_bent)
        if not hips_up:
            return "bridge_hips", score, False, "Press into your feet and lift your hips higher.", angles, checkpoints_met
        return "bridge_good", min(100, score), True, "Strong Bridge Pose! High hips and grounded feet.", angles, checkpoints_met

    # === GENERAL FALLBACK ===
    else:
        checkpoints_met["head_visible"] = points[0].visibility > 0.4
        checkpoints_met["torso_visible"] = (sl.visibility > 0.4 and sr.visibility > 0.4)
        checkpoints_met["legs_visible"] = (al.visibility > 0.4 and ar.visibility > 0.4)
        score = 55 + 45 * int(upright)
        if not upright:
            return "stand_tall", score, False, "Stand tall with an aligned spine facing the camera.", angles, checkpoints_met
        return "general_good", min(100, score), True, "Good alignment! Breathe steadily and stay centered.", angles, checkpoints_met
