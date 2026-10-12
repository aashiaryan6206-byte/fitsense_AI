const $ = (id) => document.getElementById(id);
const video = $("camera"), canvas = $("poseCanvas"), ctx = canvas.getContext("2d");
const cameraButton = $("cameraButton"), stopButton = $("stopCameraButton"), message = $("cameraMessage");
const feedback = $("feedback"), stability = $("stabilityValue"), bar = $("stabilityBar"), hold = $("holdTime");
let stream, language = "en", sound = true, analyzeTimer, holdTimer, startedAt, lastInstruction = "", voices = [];
let isStartingCamera = false;
let spokenInstructions = new Set();
let selectedPose = "tree";
let poseEngine = "tree";
let poseGuide = {};
let poseCatalog = {};

const text = {
    en: {
        start: "Camera is on. Start Tree Pose: stand tall, put one foot on the opposite inner calf, and raise both arms.",
        sound_on: "Voice guidance is on.",
        full_body: "Step back so your full body is visible in the camera.",
        arms_up: "Raise both arms overhead. Keep your shoulders relaxed.",
        bend_leg: "Bend one knee. Put that foot on the opposite inner calf, never on the knee.",
        stand_tall: "Stand taller. Lift your chest and keep your hips level.",
        good_pose: "Great Tree Pose. Look forward, breathe slowly, and hold your balance.",
        mountain_tall: "Stand taller. Stack your shoulders over your hips.", mountain_legs: "Straighten both legs and press both feet into the floor.", mountain_good: "Great Mountain Pose. Stay tall and breathe steadily.",
        warrior_arms: "Stretch both arms wide at shoulder height.", warrior_lunge: "Bend your front knee over the ankle for a strong lunge.", warrior_good: "Great Warrior Two. Keep your arms long and your front knee bent."
        ,general_good: "Good alignment. Hold the pose comfortably and breathe slowly."
    },
    hi: {
        start: "कैमरा चालू है। वृक्षासन शुरू करें। सीधे खड़े हों, एक पैर को दूसरे पैर की अंदरूनी पिंडली पर रखें और दोनों हाथ ऊपर उठाएं।",
        sound_on: "वॉइस गाइडेंस चालू है।",
        full_body: "अपना पूरा शरीर कैमरे में दिखाएं।",
        arms_up: "दोनों हाथ ऊपर उठाएं। कंधे ढीले रखें।",
        bend_leg: "एक घुटना मोड़ें। पैर को दूसरे पैर की अंदरूनी पिंडली पर रखें, घुटने पर नहीं।",
        stand_tall: "और सीधे खड़े हों। छाती ऊपर रखें और कूल्हे सीधे रखें।",
        good_pose: "बहुत अच्छा वृक्षासन। सामने देखें, धीरे सांस लें और संतुलन बनाएं।"
    },
    gu: {
        start: "केमेरा चालु छे. वृक्षासन शरू करो.", sound_on: "वोइस गाइडन्स चालु छे.",
        full_body: "तमारुं आखुं शरीर केमेरामां देखाडो.", arms_up: "बंने हाथ उपर उठावो.",
        bend_leg: "एक घूंटण वाळो. पग सामेनी पिंडी पर मूको, घूंटण पर नहिं.", stand_tall: "सीधा ऊभा रहो अने छाती उपर राखो.",
        good_pose: "सरस वृक्षासन. सामे जुओ अने धीरे श्वास लो."
    }
};
const links = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
const phrase = (key) => text[language][key] || text.en[key];

function renderPose(pose) {
    const guide = poseCatalog[pose];
    if (!guide) return;
    const image = $("poseGuideImage");
    image.hidden = !guide.image;
    if (guide.image) image.src = guide.image;
    image.alt = guide.image ? `Human demonstrating ${guide.name}.` : "";
    $("referenceImageMissing").hidden = Boolean(guide.image);
    $("referencePoseName").textContent = guide.name;
    $("poseDescription").textContent = guide.description;
    $("poseSteps").replaceChildren(...guide.instructions.map(item => Object.assign(document.createElement("li"), {textContent:item})));
    $("poseMistakes").replaceChildren(...guide.common_mistakes.map(item => Object.assign(document.createElement("li"), {textContent:item})));
    document.querySelectorAll("#threeContainer > .pose-steps:not(#poseSteps):not(#poseMistakes)").forEach(item => { item.hidden = true; });
    $("threeContainer").querySelector(".reference-human")?.setAttribute("hidden", "");
}

async function loadPoseCatalog() {
    const response = await fetch("/pose-config");
    const data = await response.json();
    poseCatalog = data.poses;
    const grid = $("poseGrid");
    grid.replaceChildren();
    Object.values(poseCatalog).filter(pose => pose.id !== "general").forEach(pose => {
        const card = document.createElement("button");
        card.className = "pose-card";
        card.dataset.pose = pose.id;
        card.innerHTML = `<div class="pose-icon">🧘</div><div><h2></h2><p></p></div><span class="arrow">→</span>`;
        card.querySelector("h2").textContent = pose.name;
        card.querySelector("p").textContent = pose.description;
        card.onclick = () => {
            selectedPose = pose.id;
            poseEngine = pose.id;
            document.querySelectorAll(".pose-card[data-pose]").forEach(item => item.classList.toggle("selected", item === card));
            renderPose(selectedPose);
            feedback.textContent = pose.success_message;
            show("workoutScreen");
        };
        grid.append(card);
    });
    poseGuide = Object.fromEntries(Object.entries(poseCatalog).map(([id, pose]) => [id, {name:pose.name, start:`Begin ${pose.name}. ${pose.instructions[0]}`} ]));
    renderPose(selectedPose);
}

function speak(value) {
    if (!sound || !("speechSynthesis" in window)) return;
    const voice = new SpeechSynthesisUtterance(value);
    voice.lang = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";
    const matchingVoice = voices.find(item => item.lang.toLowerCase().startsWith(voice.lang.slice(0, 2).toLowerCase()));
    if (matchingVoice) voice.voice = matchingVoice;
    voice.rate = .9;
    // Never allow old feedback to build up in the browser's speech queue.
    window.speechSynthesis.cancel();
    speechSynthesis.speak(voice);
}

function loadVoices() { voices = speechSynthesis.getVoices(); }
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

function draw(points = []) {
    canvas.width = video.clientWidth; canvas.height = video.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#42e695"; ctx.fillStyle = "#eafff2"; ctx.lineWidth = 4;
    links.forEach(([a,b]) => { if (points[a]?.visibility > .35 && points[b]?.visibility > .35) { ctx.beginPath(); ctx.moveTo((1-points[a].x)*canvas.width, points[a].y*canvas.height); ctx.lineTo((1-points[b].x)*canvas.width, points[b].y*canvas.height); ctx.stroke(); }});
    points.forEach(p => { if (p.visibility > .35) { ctx.beginPath(); ctx.arc((1-p.x)*canvas.width, p.y*canvas.height, 5, 0, 7); ctx.fill(); }});
}

async function analyze() {
    if (!stream || video.readyState < 2) return;
    const frame = document.createElement("canvas"), width = 640;
    frame.width = width; frame.height = video.videoHeight * width / video.videoWidth;
    frame.getContext("2d").drawImage(video, 0, 0, frame.width, frame.height);
    try {
        const response = await fetch("/analyze-pose", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({image:frame.toDataURL("image/jpeg",.72), pose:poseEngine})});
        const result = await response.json(); if (!response.ok) throw Error(result.error);
        if (result.pose?.id) renderPose(result.pose.id);
        const instruction = result.success_message || phrase(result.instruction); feedback.textContent = instruction; stability.textContent = `${result.stability}%`; bar.style.width = `${result.stability}%`; draw(result.landmarks);
        $("correctionMessage").hidden = Boolean(result.success_message || !result.correction);
        $("correctionMessage").textContent = result.success_message ? "" : `Try this: ${result.correction || "Adjust your alignment for this pose."}`;
        // Say a particular correction only once in a session. The on-screen
        // feedback still updates continuously, without repeating audio.
        if (!spokenInstructions.has(result.instruction)) {
            spokenInstructions.add(result.instruction);
            speak(instruction);
        }
        lastInstruction = instruction;
    } catch (error) {
        feedback.textContent = "Pose analysis is unavailable. Keep your full body in view and try again.";
    }
}

async function startCamera() {
    if (isStartingCamera || stream) return;
    if (!navigator.mediaDevices?.getUserMedia) {
        message.textContent = "Camera needs Chrome or Edge and a secure local link (http://127.0.0.1:5000).";
        message.style.display = "block";
        return;
    }
    isStartingCamera = true;
    cameraButton.disabled = true;
    message.textContent = "Opening camera…";
    message.style.display = "block";
    try {
        stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false});
        video.srcObject = stream; await video.play(); video.style.display = "block"; message.style.display = "none";
        $("cameraStatus").textContent = "Camera live"; $("navStatus").textContent = "Camera on"; cameraButton.disabled = true; stopButton.disabled = false;
        const startMessage = poseGuide[selectedPose]?.start || "Camera is on. Keep your full body visible and follow the pose guide.";
        startedAt = Date.now(); lastInstruction = ""; spokenInstructions = new Set(["start"]); feedback.textContent = startMessage; speak(startMessage); analyze(); analyzeTimer = setInterval(analyze, 1800);
        holdTimer = setInterval(() => hold.textContent = `${((Date.now()-startedAt)/1000).toFixed(1)}s`, 100);
    } catch (error) {
        const errors = {
            NotAllowedError: "Camera permission was blocked. Click the lock icon beside the address bar, allow Camera, then try again.",
            NotFoundError: "No camera was found. Connect a webcam, then try again.",
            NotReadableError: "Your camera is busy in another app. Close Zoom, Teams, or another camera app and try again.",
            OverconstrainedError: "This camera does not support the requested video settings. Try again."
        };
        message.textContent = errors[error.name] || "Could not start the camera. Open this site at http://127.0.0.1:5000 in Chrome or Edge.";
        message.style.display = "block";
        $("cameraStatus").textContent = "Camera unavailable";
        $("navStatus").textContent = "Camera issue";
    } finally {
        isStartingCamera = false;
        if (!stream) cameraButton.disabled = false;
    }
}

function stopCamera() {
    if (stream && startedAt) saveSession();
    clearInterval(analyzeTimer); clearInterval(holdTimer); stream?.getTracks().forEach(track => track.stop()); stream = null; video.srcObject = null; video.style.display = "none";
    ctx.clearRect(0,0,canvas.width,canvas.height); message.textContent = "Click Start Camera"; message.style.display = "block"; cameraButton.disabled = false; stopButton.disabled = true;
    $("cameraStatus").textContent = "Camera off"; $("navStatus").textContent = "Ready"; feedback.textContent = "Start your camera to begin."; stability.textContent = "0%"; bar.style.width = "0%"; hold.textContent = "0.0s"; spokenInstructions.clear();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
}

function sessions() { return JSON.parse(localStorage.getItem("fitsense-yoga-history") || "[]"); }
function saveSession() {
    const duration = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const list = sessions();
    list.unshift({ pose: poseGuide[selectedPose]?.name || "Yoga pose", duration, score: Number.parseInt(stability.textContent) || 0, date: new Date().toLocaleString() });
    localStorage.setItem("fitsense-yoga-history", JSON.stringify(list.slice(0, 100)));
    startedAt = null;
}
function renderHistory() {
    const list = sessions(), totalSeconds = list.reduce((sum, item) => sum + item.duration, 0);
    $("historySessions").textContent = list.length;
    $("historyMinutes").textContent = Math.round(totalSeconds / 60);
    $("historyScore").textContent = list.length ? `${Math.round(list.reduce((sum, item) => sum + item.score, 0) / list.length)}%` : "0%";
    $("historyList").replaceChildren(...(list.length ? list.map(item => { const row=document.createElement("div"); row.innerHTML=`<div><strong>${item.pose}</strong><p>${item.date}</p></div><div><strong>${item.score}%</strong><p>${item.duration}s practice</p></div>`; return row; }) : [Object.assign(document.createElement("p"), {className:"history-empty", textContent:"No sessions yet. Complete a yoga session to see your progress here."})]));
}

document.querySelectorAll(".language-button").forEach(button => button.onclick = () => { language = button.dataset.language; show("poseScreen"); });
function show(id) { document.querySelectorAll(".screen").forEach(screen => screen.classList.toggle("active", screen.id === id)); document.body.classList.toggle("session-active", id === "workoutScreen"); }
$("startButton").onclick = () => show("workoutScreen"); $("exitButton").onclick = () => { stopCamera(); show("homeScreen"); };
$("historyButton").onclick = () => { renderHistory(); show("historyScreen"); };
$("clearHistoryButton").onclick = () => { localStorage.removeItem("fitsense-yoga-history"); renderHistory(); };
cameraButton.onclick = startCamera; stopButton.onclick = stopCamera; stopButton.disabled = true;
loadPoseCatalog().catch(() => { feedback.textContent = "Pose guidance could not be loaded. Refresh the page and try again."; });
$("soundButton").onclick = () => { sound = !sound; $("soundButton").textContent = sound ? "Sound ON" : "Sound OFF"; if (sound) speak(phrase("sound_on")); else if ("speechSynthesis" in window) speechSynthesis.cancel(); };

