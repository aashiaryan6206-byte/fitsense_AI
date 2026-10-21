"""Pose guidance catalog served to the browser and used by pose analysis.
Enriched with biomechanical angle rules, animated visualizer definitions, and hints.
"""

POSE_CONFIG = {
    "tree": {
        "name": "Tree Pose (Vrikshasana)",
        "sanskrit": "Vrikshasana",
        "difficulty": "Beginner / Intermediate",
        "category": "Balance & Focus",
        "target_hold": 5,
        "image": "/static/tree-pose-human.svg",
        "anim_type": "tree",
        "guess_hint": "Stand on one leg, place the other foot on your inner calf/thigh, and raise your hands overhead.",
        "description": "Balance gracefully on one leg with the opposite foot supported on the inner calf or thigh, reaching arms toward the sky.",
        "instructions": [
            "Root down firmly through your standing foot, spreading your toes.",
            "Lift the opposite foot and place it on your inner calf or inner thigh — never on the knee.",
            "Bring your hands overhead into prayer (Anjali Mudra) or reach wide.",
            "Level your hips and lengthen upward through the crown of your head."
        ],
        "common_mistakes": [
            "Pressing the raised foot directly against the standing knee joint.",
            "Tilting or hiking the hip outward.",
            "Hunching shoulders up toward the ears."
        ],
        "corrections": {
            "foot placement": "Place your raised foot on your inner calf or thigh; keep your knee joint clear.",
            "arm position": "Reach both arms overhead while keeping your shoulders relaxed.",
            "posture": "Lengthen your spine and square both hips forward.",
            "visibility": "Step back until your whole body is visible in the frame."
        },
        "checkpoints": [
            {"id": "arms_up", "label": "Arms overhead"},
            {"id": "bent_leg", "label": "One leg bent at calf/thigh"},
            {"id": "upright", "label": "Spine tall & balanced"}
        ],
        "success_message": "Perfect Tree Pose! Steady balance, grounded foot, and relaxed breathing."
    },
    "mountain": {
        "name": "Mountain Pose (Tadasana)",
        "sanskrit": "Tadasana",
        "difficulty": "Beginner",
        "category": "Foundation & Posture",
        "target_hold": 5,
        "image": "/static/mountain-pose-human.svg",
        "anim_type": "mountain",
        "guess_hint": "Stand tall like a mountain with both feet grounded, long spine, and arms resting comfortably at your sides.",
        "description": "The foundational standing posture: stand evenly through both feet with an elongated, peaceful spine and relaxed shoulders.",
        "instructions": [
            "Stand with feet hip-width apart or touching, weight evenly distributed.",
            "Engage your quadriceps gently without locking your knees.",
            "Stack shoulders directly over hips, and pelvis neutral.",
            "Relax your arms by your sides, palms facing gently forward."
        ],
        "common_mistakes": [
            "Locking the knee joints backward.",
            "Leaning weight into the heels or onto one foot.",
            "Flaring the lower ribs or arching the lower back excessively."
        ],
        "corrections": {
            "weight balance": "Distribute weight evenly across both feet.",
            "posture": "Grow tall through the crown and soften your shoulders away from ears.",
            "leg alignment": "Unlock your knees gently and engage your core.",
            "visibility": "Step back so your full head-to-toe body is visible."
        },
        "checkpoints": [
            {"id": "both_legs_straight", "label": "Both legs straight & grounded"},
            {"id": "upright_spine", "label": "Tall spine stacked over hips"},
            {"id": "arms_relaxed", "label": "Arms relaxed at sides"}
        ],
        "success_message": "Solid Mountain Pose! Grounded, centered, and standing tall."
    },
    "warrior": {
        "name": "Warrior II (Virabhadrasana II)",
        "sanskrit": "Virabhadrasana II",
        "difficulty": "Intermediate",
        "category": "Strength & Stamina",
        "target_hold": 5,
        "image": "/static/warrior-pose-human.svg",
        "anim_type": "warrior",
        "guess_hint": "Take a wide stance, bend your front knee into a 90° lunge, and stretch both arms out parallel to the mat.",
        "description": "A powerful stance building stamina, hip flexibility, and fierce concentration.",
        "instructions": [
            "Step feet wide apart; turn front toes forward and back foot slightly angled.",
            "Bend the front knee directly over the front ankle toward 90 degrees.",
            "Keep the back leg straight, firm, and fully grounded.",
            "Extend both arms parallel to the floor at shoulder level; gaze softly over the front fingertips."
        ],
        "common_mistakes": [
            "Front knee collapsing inward past the big toe.",
            "Torso leaning forward toward the front knee instead of centering over hips.",
            "Dropping arms below shoulder height."
        ],
        "corrections": {
            "front knee": "Bend front knee deeply until it stacks over your ankle.",
            "arms": "Reach both arms straight out at shoulder level, parallel to the ground.",
            "posture": "Stack your shoulders directly above your hips, centering your torso.",
            "visibility": "Step back so your full wide stance is in camera view."
        },
        "checkpoints": [
            {"id": "front_lunge", "label": "Front knee bent at ~90°"},
            {"id": "arms_horizontal", "label": "Arms stretched wide at shoulders"},
            {"id": "back_leg_straight", "label": "Back leg straight & strong"}
        ],
        "success_message": "Fierce Warrior II! Powerful lunge, wide arm span, and steady focus."
    },
    "chair": {
        "name": "Chair Pose (Utkatasana)",
        "sanskrit": "Utkatasana",
        "difficulty": "Intermediate",
        "category": "Strength & Core",
        "target_hold": 5,
        "image": None,
        "anim_type": "chair",
        "guess_hint": "Sit hips back as if into a chair, bend your knees, and raise both arms upward alongside your ears.",
        "description": "Strengthens thighs, calves, and spine while opening the chest and shoulders.",
        "instructions": [
            "Stand with feet together or hip-width apart.",
            "Inhale and raise both arms straight up beside your ears.",
            "Exhale and bend your knees, shifting weight into your heels as if sitting back into a chair.",
            "Keep your chest lifted and spine long, drawing lower belly in."
        ],
        "common_mistakes": [
            "Knees jutting out far ahead of toes.",
            "Rounding the upper back or dropping the chest.",
            "Putting all weight into the toes instead of the heels."
        ],
        "corrections": {
            "knee bend": "Sink hips lower and keep weight in your heels.",
            "arms": "Reach both arms upward in line with your ears.",
            "posture": "Keep chest open and spine long.",
            "visibility": "Step back so your full body is visible."
        },
        "checkpoints": [
            {"id": "knees_bent", "label": "Knees bent 90-120° (sitting back)"},
            {"id": "arms_up", "label": "Arms reaching upward"},
            {"id": "chest_lifted", "label": "Chest lifted & spine long"}
        ],
        "success_message": "Mighty Chair Pose! Strong legs, lifted chest, and fiery focus."
    },
    "plank": {
        "name": "Plank Pose (Phalakasana)",
        "sanskrit": "Phalakasana",
        "difficulty": "Intermediate",
        "category": "Core & Arm Strength",
        "target_hold": 5,
        "image": None,
        "anim_type": "plank",
        "guess_hint": "Create a straight, horizontal line from head to heels, supported on hands and toes.",
        "description": "Full-body core toner aligning shoulders over wrists and maintaining a solid neutral spine.",
        "instructions": [
            "Plant hands shoulder-width apart with fingers spread wide.",
            "Step feet back so your body forms one straight diagonal line from crown to heels.",
            "Engage your abdominals, press the floor away, and keep neck neutral."
        ],
        "common_mistakes": [
            "Hips sagging down toward the floor (straining lower back).",
            "Hips sticking way up in the air.",
            "Collapsing chest between shoulders."
        ],
        "corrections": {
            "hips": "Keep your body in a straight line: don't let hips sag or pike high.",
            "shoulders": "Stack shoulders over wrists and press actively away from the floor.",
            "posture": "Engage your abdominal core and squeeze your glutes.",
            "visibility": "Turn sideways to camera so your full body length is visible."
        },
        "checkpoints": [
            {"id": "straight_line", "label": "Straight line head to heels"},
            {"id": "arms_vertical", "label": "Arms straight under shoulders"},
            {"id": "core_active", "label": "Core engaged, no sagging"}
        ],
        "success_message": "Rock-solid Plank! Perfect straight line, strong core, and steady breath."
    },
    "cobra": {
        "name": "Cobra Pose (Bhujangasana)",
        "sanskrit": "Bhujangasana",
        "difficulty": "Beginner / Intermediate",
        "category": "Backbend & Heart Opening",
        "target_hold": 5,
        "image": None,
        "anim_type": "cobra",
        "guess_hint": "Lie on your belly, place hands beneath shoulders, and gently arch your chest forward and upward.",
        "description": "Rejuvenating backbend that expands the chest, strengthens the spine, and invigorates energy.",
        "instructions": [
            "Lie prone with tops of the feet grounded hip-width apart.",
            "Place palms under shoulders with elbows hugging ribs.",
            "Inhale to gently peel chest forward and up using back strength, keeping neck long."
        ],
        "common_mistakes": [
            "Cramming the back of the neck by throwing the chin upward.",
            "Locking elbows and forcing height with hand pressure.",
            "Lifting pelvis off the ground."
        ],
        "corrections": {
            "chest": "Draw chest forward and up while keeping shoulders away from ears.",
            "elbows": "Keep elbows slightly bent and close to your ribs.",
            "posture": "Keep your pelvis and tops of feet grounded.",
            "visibility": "Position camera at side view so your torso arch is visible."
        },
        "checkpoints": [
            {"id": "chest_lifted", "label": "Chest lifted forward and up"},
            {"id": "shoulders_down", "label": "Shoulders relaxed away from ears"},
            {"id": "pelvis_grounded", "label": "Pelvis & legs grounded"}
        ],
        "success_message": "Beautiful Cobra Pose! Open chest, long spine, and graceful arch."
    },
    "downdog": {
        "name": "Downward Dog (Adho Mukha Svanasana)",
        "sanskrit": "Adho Mukha Svanasana",
        "difficulty": "Beginner / Intermediate",
        "category": "Full Body Stretch",
        "target_hold": 5,
        "image": None,
        "anim_type": "downdog",
        "guess_hint": "Form an inverted 'V' shape with hips pressing high into the air, arms and legs straight.",
        "description": "Invigorating stretch lengthening hamstrings, calves, and spine while building upper body strength.",
        "instructions": [
            "Set hands shoulder-width and feet hip-width apart.",
            "Press hips up and back, lengthening your tailbone toward the sky.",
            "Spread fingers wide and press palms firmly into the ground.",
            "Let head hang freely between biceps; soften knees if hamstrings are tight."
        ],
        "common_mistakes": [
            "Rounding the spine rather than hinging at the hips.",
            "Shoulders bunching up around the ears.",
            "Placing hands too close or too far from feet."
        ],
        "corrections": {
            "hips": "Press hips higher and back to lengthen your entire spine.",
            "spine": "Soften knees if needed to keep your back long and straight.",
            "arms": "Press the floor away and broaden across your upper back.",
            "visibility": "Set camera to side view so your inverted V shape is captured."
        },
        "checkpoints": [
            {"id": "inverted_v", "label": "Inverted 'V' shape formed"},
            {"id": "hips_high", "label": "Hips lifted high & tailbone reaching"},
            {"id": "arms_straight", "label": "Arms pressing floor away"}
        ],
        "success_message": "Invigorating Downward Dog! Long spine, active hands, and full body stretch."
    },
    "triangle": {
        "name": "Triangle Pose (Trikonasana)",
        "sanskrit": "Trikonasana",
        "difficulty": "Intermediate",
        "category": "Flexibility & Balance",
        "target_hold": 5,
        "image": None,
        "anim_type": "triangle",
        "guess_hint": "Stand wide, reach one hand down toward your shin/ankle, and extend the other straight toward the sky.",
        "description": "Expands chest, stretches hamstrings and groins, and improves lateral spine flexibility.",
        "instructions": [
            "Step feet wide apart, front toes facing forward, back foot slightly angled.",
            "Reach torso sideways over front leg, then hinge at the hip crease.",
            "Rest front hand on shin, block, or floor; extend top arm straight up to form a vertical line.",
            "Turn ribs and gaze upward toward the top thumb."
        ],
        "common_mistakes": [
            "Collapsing chest downward toward floor instead of rotating it open.",
            "Locking front knee excessively.",
            "Bending spine sideways rather than hinging at hips."
        ],
        "corrections": {
            "chest": "Rotate top shoulder and ribs open toward the ceiling.",
            "arms": "Reach both arms in a straight vertical line.",
            "posture": "Lengthen both sides of your waist equally.",
            "visibility": "Stand where your full wide triangle stance fits in frame."
        },
        "checkpoints": [
            {"id": "straight_legs", "label": "Both legs straight in wide stance"},
            {"id": "vertical_arms", "label": "Arms forming a vertical line"},
            {"id": "open_chest", "label": "Torso & chest rotated open"}
        ],
        "success_message": "Radiant Triangle Pose! Expansive reach, open chest, and steady balance."
    },
    "bridge": {
        "name": "Bridge Pose (Setu Bandhasana)",
        "sanskrit": "Setu Bandhasana",
        "difficulty": "Beginner / Intermediate",
        "category": "Backbend & Core",
        "target_hold": 5,
        "image": None,
        "anim_type": "bridge",
        "guess_hint": "Lie on your back with knees bent, feet flat on the floor, and lift your hips high toward the sky.",
        "description": "Strengthens glutes, hamstrings, and back while expanding chest and lungs.",
        "instructions": [
            "Lie on your back, bend knees, and place feet flat hip-width apart.",
            "Press into feet and arms to lift hips up toward the ceiling.",
            "Keep knees parallel and directly over ankles.",
            "Interlace hands beneath your back if comfortable, rolling shoulders under."
        ],
        "common_mistakes": [
            "Letting knees splay out wide or turn inward.",
            "Compressing the back of the neck.",
            "Dropping hips low."
        ],
        "corrections": {
            "hips": "Press through your heels and lift hips higher toward the ceiling.",
            "knees": "Keep knees hip-width apart, parallel to each other.",
            "chest": "Open your chest toward your chin without turning your head.",
            "visibility": "Position camera at side view showing hip elevation."
        },
        "checkpoints": [
            {"id": "hips_lifted", "label": "Hips elevated high above floor"},
            {"id": "knees_parallel", "label": "Knees bent ~90° & parallel"},
            {"id": "chest_open", "label": "Chest lifted toward chin"}
        ],
        "success_message": "Exquisite Bridge Pose! High hips, grounded feet, and open chest."
    },
    "warrior1": {
        "name": "Warrior I (Virabhadrasana I)",
        "sanskrit": "Virabhadrasana I",
        "difficulty": "Intermediate",
        "category": "Strength & Grounding",
        "target_hold": 5,
        "image": None,
        "anim_type": "warrior1",
        "guess_hint": "Front knee bent into a deep lunge, hips facing forward, both arms reaching high overhead.",
        "description": "Builds lower-body power, opens hip flexors, and creates an uplifting sense of courage.",
        "instructions": [
            "Take a wide stance; turn front toes forward, back foot angled 45 degrees.",
            "Square your hips forward and bend the front knee to 90 degrees.",
            "Sweep both arms overhead, palms facing each other or together.",
            "Keep back leg straight and grounded through the outer heel."
        ],
        "common_mistakes": [
            "Hips twisted open to the side instead of facing front.",
            "Back heel lifting off the floor.",
            "Arching lower back excessively."
        ],
        "corrections": {
            "hips": "Square both hip points directly forward.",
            "front knee": "Stack front knee directly over front ankle.",
            "arms": "Reach both arms high overhead with relaxed shoulders.",
            "visibility": "Ensure whole body is in frame."
        },
        "checkpoints": [
            {"id": "front_lunge", "label": "Front knee bent at ~90°"},
            {"id": "arms_overhead", "label": "Both arms reaching high overhead"},
            {"id": "hips_square", "label": "Hips squared forward"}
        ],
        "success_message": "Noble Warrior I! Grounded stance, square hips, and triumphant reach."
    },
    "general": {
        "name": "General Flow & Alignment",
        "sanskrit": "Asana General",
        "difficulty": "All Levels",
        "category": "Posture Check",
        "target_hold": 5,
        "image": None,
        "anim_type": "mountain",
        "guess_hint": "Stand tall facing the camera so FitSense can detect your posture and key body landmarks.",
        "description": "Full-body visibility, symmetry check, and general postural alignment feedback.",
        "instructions": [
            "Step back until your entire body from head to feet is within the camera frame.",
            "Stand tall, balance weight evenly, and breathe smoothly."
        ],
        "common_mistakes": ["Body partially cut off by camera boundaries."],
        "corrections": {
            "visibility": "Step back until your full body is visible in the camera frame.",
            "posture": "Stand tall, stack shoulders over hips, and breathe deeply."
        },
        "checkpoints": [
            {"id": "head_visible", "label": "Head & shoulders clearly visible"},
            {"id": "torso_visible", "label": "Torso & hips in frame"},
            {"id": "legs_visible", "label": "Legs & feet clearly detected"}
        ],
        "success_message": "Clear posture detected! Ready for your yoga flow."
    }
}

POSE_CATALOG = {key: {"id": key, **value} for key, value in POSE_CONFIG.items()}
