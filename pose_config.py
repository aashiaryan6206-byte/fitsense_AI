"""Pose guidance catalog served to the browser and used by pose analysis."""

POSE_CONFIG = {
    "tree": {
        "name": "Tree Pose", "image": "/static/tree-pose-human.svg",
        "description": "Balance on one leg with the other foot supported on the inner calf or thigh.",
        "instructions": ["Root the standing foot and keep its toes relaxed.", "Place the raised foot on the inner calf or thigh, never on the knee.", "Keep both hip points facing forward and lift through the crown of your head.", "Bring your hands overhead only while keeping your shoulders relaxed."],
        "common_mistakes": ["Raised foot presses against the knee.", "Standing hip hikes or rotates outward."],
        "corrections": {"foot placement": "Move the raised foot to the inner calf or thigh; leave the knee joint clear.", "hip alignment": "Level both sides of your pelvis and face your hips forward.", "arm position": "Reach both arms overhead while relaxing your shoulders.", "leg position": "Bend the raised knee and place that foot on the inner calf or thigh.", "posture": "Stack shoulders over hips and face your hips forward."},
        "success_message": "Steady Tree Pose. Keep your standing foot grounded and breathe smoothly.",
    },
    "mountain": {
        "name": "Mountain Pose", "image": "/static/mountain-pose-human.svg",
        "description": "Stand evenly through both feet with a long, relaxed spine.",
        "instructions": ["Place feet hip-width apart or together and spread your toes.", "Distribute weight across the heel, big-toe mound, and little-toe mound.", "Soften the knees without locking them; stack ribs over pelvis.", "Let arms rest by your sides and broaden across the collarbones."],
        "common_mistakes": ["Weight shifts onto one foot or the heels.", "Knees lock and ribs flare forward."],
        "corrections": {"weight balance": "Press evenly through the three points of both feet.", "leg alignment": "Unlock the knees and bring your lower ribs over your pelvis.", "posture": "Stack shoulders over hips and keep your spine comfortably tall."},
        "success_message": "Strong Mountain Pose. Stay grounded through both feet and breathe steadily.",
    },
    "warrior": {
        "name": "Warrior II", "image": "/static/warrior-pose-human.svg",
        "description": "Build a wide stance, bend the front knee, and extend both arms at shoulder height.",
        "instructions": ["Separate your feet into a wide stance and turn the front toes forward.", "Bend the front knee over the ankle while keeping the back leg strong.", "Stack shoulders over hips and extend both arms parallel to the floor.", "Gaze calmly over the front hand without leaning your torso forward."],
        "common_mistakes": ["Front knee falls inward or moves beyond the ankle.", "Back foot turns in or arms drop below shoulder height."],
        "corrections": {"front knee": "Track the kneecap toward the second toe and keep it over the ankle.", "arms": "Reach through both fingertips at shoulder height; keep the back leg active."},
        "success_message": "Strong Warrior II. Keep the front knee tracking over the ankle and reach through both arms.",
    },
}

# Each additional pose already offered by the UI has a distinct, pose-specific
# cue set. No reference art for these poses is present in the project assets.
_EXTRA_POSES = {
    "Child's Pose": ("Rest hips toward heels with knees comfortable apart.", "Reach arms forward and lengthen the sides of your torso.", "Hips remain high", "Soften the hips toward the heels only as far as your knees allow."),
    "Cat-Cow": ("On hands and knees, stack wrists under shoulders and knees under hips.", "Inhale to broaden the chest; exhale to round the spine and draw the navel in.", "Shoulders collapse", "Press the floor away and move the spine gradually with each breath."),
    "Downward-Facing Dog": ("Spread fingers and press evenly through both hands.", "Lift hips up and back while keeping the spine long.", "Lower back rounds", "Bend the knees and lift the hips higher to lengthen your back."),
    "Cobra Pose": ("Place hands beside the lower ribs with elbows close to your sides.", "Use a gentle backbend led by the chest; keep the pelvis grounded.", "Arms force the lift", "Reduce the lift and draw your chest forward without pushing hard through your hands."),
    "Sphinx Pose": ("Place elbows beneath shoulders and forearms parallel.", "Lengthen forward through the crown while keeping the pubic bone grounded.", "Shoulders creep to ears", "Draw shoulders down and broaden the collarbones."),
    "Bridge Pose": ("Plant feet hip-width apart with heels close enough to touch lightly.", "Press through feet and lift hips while keeping knees parallel.", "Knees splay outward", "Keep knees tracking over ankles and engage the inner thighs gently."),
    "Camel Pose": ("Kneel with knees hip-width and thighs upright.", "Lengthen upward before taking a small backbend; support the low back if needed.", "Hips shift behind knees", "Bring hips over knees and keep the bend distributed through the upper back."),
    "Chair Pose": ("Sit hips back as if reaching for a chair, keeping weight in the heels.", "Keep knees tracking in line with toes and lift the chest.", "Knees move inward", "Press knees gently apart to align them over the middle toes."),
    "Corpse Pose": ("Lie on your back with legs relaxed and comfortably apart.", "Rest arms beside the body with palms open and jaw soft.", "Tension in face or hands", "Unclench the jaw and let the fingers rest without effort."),
    "Crow Pose": ("Place hands shoulder-width apart and spread fingers firmly.", "Rest knees high on the upper arms and shift shoulders forward gradually.", "Weight stays behind wrists", "Lean forward until shoulders move ahead of wrists before lifting a foot."),
    "Dancer Pose": ("Stand tall and hold one foot behind you with the same-side hand.", "Press the foot into the hand as the chest reaches forward.", "Standing knee locks", "Keep a soft bend in the standing knee and steady your gaze."),
    "Dolphin Pose": ("Set forearms shoulder-width apart and press them down.", "Lift hips up and back while lengthening the spine.", "Elbows slide wide", "Keep elbows beneath shoulders and press forearms evenly."),
    "Eagle Pose": ("Bend both knees and cross one thigh over the other.", "Wrap arms at the elbows and lift elbows while relaxing shoulders.", "Standing foot loses balance", "Use a wall or uncross the toes to steady the standing leg."),
    "Easy Pose": ("Sit on a folded blanket with legs crossed comfortably.", "Stack shoulders over hips and let the knees release toward the floor.", "Lower back slumps", "Sit higher and tip the pelvis slightly forward to lengthen the spine."),
    "Fire Log Pose": ("Stack one shin over the other with ankles above knees.", "Flex both feet and sit evenly on both sitting bones.", "Ankle presses into knee", "Adjust the shin position so ankle rests above the knee, not on it."),
    "Fish Pose": ("Lie back and place forearms beside your torso.", "Lift the chest and rest the crown lightly without putting weight on the head.", "Neck bears body weight", "Support your upper back with your arms and keep pressure off the head."),
    "Garland Pose": ("Set feet slightly wider than hips and turn toes out naturally.", "Lower into a squat while keeping heels grounded if comfortable.", "Heels lift and torso collapses", "Widen your stance or place a folded support under your heels."),
    "Half Moon Pose": ("Place one hand on a block below the shoulder and open the chest sideways.", "Stack the lifted hip over the standing hip and flex the raised foot.", "Top hip rolls toward floor", "Rotate your ribs and pelvis open while keeping the standing leg firm."),
    "Happy Baby": ("Lie on your back and draw knees toward your armpits.", "Hold feet or ankles and keep the sacrum heavy on the floor.", "Shoulders lift", "Hold behind the thighs and relax your shoulders toward the mat."),
    "Head-to-Knee Forward Bend": ("Extend one leg and bend the other foot toward the inner thigh.", "Hinge from the hips over the straight leg with a long spine.", "Back rounds to reach the foot", "Use a strap and stop where you can keep the spine long."),
    "Hero Pose": ("Kneel with knees together and feet outside the hips.", "Sit between heels only if knees feel comfortable; elevate hips on a block as needed.", "Knee discomfort", "Raise the seat on firm support or leave the pose if knees feel strained."),
    "Locust Pose": ("Lie on your belly with legs extended and arms beside you.", "Reach legs back and lift chest gently without compressing the neck.", "Chin juts forward", "Keep the back of your neck long and gaze down slightly."),
    "Low Lunge": ("Step one foot forward and lower the back knee with padding if needed.", "Keep the front knee above the ankle and lift the chest.", "Front knee passes far ahead", "Shorten your stance or shift the front foot forward until knee stacks over ankle."),
    "Lotus Pose": ("Sit tall and cross legs only within comfortable hip rotation.", "Place each foot on the opposite thigh without pulling the knee.", "Knee is forced downward", "Choose an easier cross-legged seat; never press a bent knee into position."),
    "Pigeon Pose": ("Bring one shin forward and extend the other leg behind you.", "Square hips as much as comfortable and support the front hip with a block.", "Front knee feels pinched", "Bring the front heel closer to the pelvis and support the hip."),
    "Plank Pose": ("Stack shoulders over wrists and press the floor away.", "Reach heels back and keep head, hips, and heels in one line.", "Hips sag", "Draw the lower belly in and lower knees if needed to keep a straight line."),
    "Pyramid Pose": ("Set feet on two tracks with front toes facing forward.", "Hinge over the front leg while keeping both sides of the waist long.", "Back rounds", "Bend the front knee slightly and bring hands to blocks."),
    "Reclined Twist": ("Lie on your back and draw knees toward your chest.", "Lower knees to one side while keeping both shoulders relaxed.", "Opposite shoulder lifts", "Use a cushion under the knees and reduce the twist until shoulders settle."),
    "Seated Forward Fold": ("Sit with legs extended and toes pointing upward.", "Hinge forward from the hip creases and keep the front torso long.", "Spine rounds sharply", "Bend the knees and reach a strap around the feet to maintain length."),
    "Staff Pose": ("Sit with legs straight and feet flexed, using a blanket under hips if needed.", "Press thighs down and grow tall through the crown.", "Back leans behind hips", "Elevate the seat and bring shoulders above the sitting bones."),
    "Sugarcane Pose": ("From Half Moon, bend the lifted knee and hold the foot behind you.", "Keep the standing leg steady and open the chest without forcing the knee.", "Standing leg wobbles", "Use a wall or block and keep a soft bend in the standing knee."),
    "Supported Shoulder Stand": ("Stack folded blankets under shoulders and keep the neck free.", "Support the back with hands and lift legs only while breathing easily.", "Head turns under load", "Keep your head centered and exit if neck pressure or discomfort appears."),
    "Triangle Pose": ("Take a wide stance and turn the front toes forward.", "Reach over the front leg, then rest hand on shin or block without collapsing.", "Torso drops toward floor", "Bring the hand higher and lengthen both sides of the waist."),
    "Upward-Facing Dog": ("Press hands beside the waist and extend arms without locking elbows.", "Lift thighs and chest while broadening the collarbones.", "Shoulders hunch", "Draw shoulders back and down; reduce the backbend if needed."),
    "Wheel Pose": ("Place hands beside ears and feet hip-width apart.", "Press evenly through hands and feet and lift only within a comfortable range.", "Knees splay wide", "Track knees over feet and use a smaller supported backbend."),
    "Wide-Legged Forward Fold": ("Stand wide with toes slightly inward and feet grounded.", "Hinge at hips and lengthen the spine before folding.", "Weight falls into heels", "Shift weight toward the balls of the feet and soften knees."),
    "Wild Thing": ("From side plank, step the top foot behind you with control.", "Lift hips and open the chest while keeping the supporting shoulder stable.", "Supporting shoulder collapses", "Press the floor away and reduce the backbend or return to side plank."),
    "Yogi Squat": ("Place feet wider than hips and turn toes outward comfortably.", "Lower hips between heels and bring palms together at the chest.", "Heels lift", "Widen the feet or use a folded mat under the heels."),
    "Bound Angle Pose": ("Bring soles of feet together and let knees release outward.", "Hold ankles and sit tall on both sitting bones.", "Knees pushed down", "Support thighs with blocks and allow the hips to open gradually."),
    "Boat Pose": ("Sit with knees bent and lean back from the hips with a long spine.", "Lift shins or straighten legs while reaching arms forward.", "Lower back rounds", "Keep knees bent and chest lifted; lower feet if the spine rounds."),
    "Bow Pose": ("Lie on your belly, bend knees, and hold ankles from outside.", "Kick feet into hands to lift chest and thighs gently.", "Knees spread very wide", "Keep knees about hip-width and reduce the lift if the low back pinches."),
    "Four-Limbed Staff": ("Begin in plank and shift shoulders slightly forward.", "Bend elbows close to ribs and lower with body in one straight line.", "Hips sag during lowering", "Lower knees first and keep the trunk engaged through the descent."),
    "Forward Fold": ("Stand with feet grounded and soften your knees.", "Hinge from hips and let head and arms release without pulling.", "Hamstrings force a rounded back", "Bend knees more and rest hands on blocks or shins."),
    "Legs-Up-The-Wall": ("Lie beside a wall and rest legs vertically against it.", "Keep the back of the pelvis supported and let shoulders soften.", "Hips too far from wall", "Scoot closer only as far as your hamstrings comfortably allow."),
    "Lizard Pose": ("Step one foot outside the same-side hand and lower the back knee if needed.", "Keep the front knee tracking over toes and lengthen the back leg.", "Front knee rolls inward", "Press the knee outward in line with the middle toes and use blocks."),
    "Revolved Triangle": ("Set a short, stable stance with hips facing mostly forward.", "Hinge over the front leg and rotate ribs from the upper back.", "Twist comes from a rounded low back", "Shorten stance, use a block, and lengthen the spine before rotating."),
    "Side Plank": ("Stack one shoulder over the supporting wrist and turn feet sideways.", "Lift hips and reach the top arm upward while pressing the floor away.", "Hips drop", "Bend the lower knee for support and lift the underside of the waist."),
    "Standing Forward Fold": ("Stand with feet hip-width and unlock the knees.", "Fold from the hip creases and let the head hang comfortably.", "Knees lock", "Keep a generous bend in the knees and distribute weight across the feet."),
    "Sun Salutation": ("Move through each transition with breath rather than momentum.", "Keep hands grounded in plank transitions and step with control.", "Rushing between poses", "Pause in each shape and coordinate one deliberate movement per breath."),
    "Warrior I": ("Face hips forward with a wide stance and back heel grounded.", "Bend the front knee over the ankle and reach arms upward without flaring ribs.", "Back foot turns too far inward", "Angle the back foot slightly out and widen your stance for balance."),
    "Warrior III": ("Hinge forward from hips and extend the lifted leg behind you.", "Keep both hip points facing the floor and reach arms forward or back.", "Lifted hip opens sideways", "Lower the raised leg slightly and square the pelvis toward the floor."),
    "Wide Squat": ("Set feet wide with toes turned out to a comfortable angle.", "Bend knees in line with toes and keep chest lifted.", "Knees collapse inward", "Press knees outward to follow the direction of your toes."),
}

for _index, (_name, (_cue1, _cue2, _mistake, _correction)) in enumerate(_EXTRA_POSES.items()):
    _key = f"library-{_index}"
    POSE_CONFIG[_key] = {
        "name": _name,
        "image": None,
        "description": f"Pose-specific alignment guide for {_name}.",
        "instructions": [_cue1, _cue2],
        "common_mistakes": [_mistake + "."],
        "corrections": {"alignment": _correction, "posture": _correction, "visibility": "Step back until your full body is visible in the camera."},
        "success_message": f"You are holding {_name}. Keep the movement comfortable and breathe steadily.",
    }

POSE_CONFIG["general"] = {
    "name": "General Pose", "image": None,
    "description": "General full-body visibility and upright posture feedback.",
    "instructions": ["Keep your full body visible to the camera.", "Move slowly and stay within a comfortable range."],
    "common_mistakes": ["One or more body landmarks are not visible."],
    "corrections": {"visibility": "Step back until your full body is visible in the camera."},
    "success_message": "Good alignment. Hold comfortably and breathe slowly.",
}

POSE_CATALOG = {key: {"id": key, **value} for key, value in POSE_CONFIG.items()}
