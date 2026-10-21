/**
 * FitSense AI - Core Application Logic
 * High-speed pose detection, 60 FPS interpolated rendering,
 * user authentication, voice guidance, and interactive side visualizer.
 */

// Helper selector
const $ = (id) => document.getElementById(id);

// DOM Elements
const video = $("camera");
const canvas = $("poseCanvas");
const ctx = canvas.getContext("2d");
const cameraButton = $("cameraButton");
const stopButton = $("stopCameraButton");
const message = $("cameraMessage");
const feedback = $("feedback");
const stability = $("stabilityValue");
const bar = $("stabilityBar");
const hold = $("holdTime");
const holdRing = $("holdRing");
const fpsDisplay = $("fpsDisplay");
const hudOverlay = $("hudOverlay");
const hudAngleValue = $("hudAngleValue");
const checkpointsList = $("checkpointsList");

// State Variables
let stream = null;
let language = "en";
let sound = true;
let isAnalyzing = false;
let isStartingCamera = false;
let cameraActive = false;
let animationFrameId = null;
let analyzeTimeoutId = null;

let selectedPose = "tree";
let poseCatalog = {};
let currentCheckpoints = [];
let targetHoldSeconds = 5;

let startedAt = null;
let holdSuccessTriggered = false;
let lastServerResponseTime = Date.now();
let frameCount = 0;
let lastFpsUpdateTime = Date.now();
let currentFps = 0;

// Landmark interpolation arrays for butter-smooth 60 FPS rendering
let targetLandmarks = [];
let smoothedLandmarks = [];
let targetStability = 0;
let smoothedStability = 0;
let latestAngles = {};

// Speech synthesis
let voices = [];
let spokenInstructions = new Set();

// Skeletal Connection Pairs (MediaPipe 33-point topology)
const SKELETON_CONNECTIONS = [
    [11, 12], // Shoulders
    [11, 13], [13, 15], // Left arm
    [12, 14], [14, 16], // Right arm
    [11, 23], [12, 24], // Torso sides
    [23, 24], // Pelvis / Hips
    [23, 25], [25, 27], // Left leg
    [24, 26], [26, 28], // Right leg
    [27, 29], [29, 31], [27, 31], // Left foot
    [28, 30], [30, 32], [28, 32]  // Right foot
];

// Multilingual text catalog
const TEXT_CATALOG = {
    en: {
        camera_on: "Camera is live! Follow the animated guide on the right.",
        sound_on: "Voice coaching enabled.",
        sound_off: "Voice coaching muted.",
        good_hold: "Hold steady! You are doing great.",
        pose_completed: "Congratulations! Perfect form achieved."
    },
    hi: {
        camera_on: "कैमरा चालू है! दाईं ओर दिए गए एनिमेटेड गाइड का पालन करें।",
        sound_on: "आवाज मार्गदर्शन चालू है।",
        sound_off: "आवाज बंद कर दी गई है।",
        good_hold: "स्थिर रहें! बहुत बढ़िया।",
        pose_completed: "बधाई हो! आपका आसन बिल्कुल सही है।"
    },
    gu: {
        camera_on: "કેમેરા ચાલુ છે! જમણી બાજુએ આપેલ એનિમેટેડ માર્ગદર્શિકા જુઓ.",
        sound_on: "અવાજ માર્ગદર્શન ચાલુ છે.",
        sound_off: "અવાજ બંધ છે.",
        good_hold: "સ્થિર રહો! ખૂબ સરસ.",
        pose_completed: "અભિનંદન! આસન સફળતાપૂર્વક પૂર્ણ થયું."
    }
};

const phrase = (key) => TEXT_CATALOG[language]?.[key] || TEXT_CATALOG.en[key] || "";

// Current User State
let currentUser = {
    id: 1,
    username: "yogi",
    display_name: "Yogi Alex",
    avatar: "🧘‍♂️"
};

// ============================================================================
// USER AUTHENTICATION & PROFILE
// ============================================================================

async function fetchCurrentUser() {
    // 1. Instant hydration from localStorage
    try {
        const cached = localStorage.getItem("fitsense_user");
        if (cached) {
            currentUser = JSON.parse(cached);
            updateUserUI();
        }
    } catch (e) {}

    // 2. Synchronize with server session
    try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
            currentUser = data.user;
            localStorage.setItem("fitsense_user", JSON.stringify(currentUser));
            updateUserUI();
        } else if (!localStorage.getItem("fitsense_user")) {
            // Default user state
            currentUser = data.user || currentUser;
            updateUserUI();
        }
    } catch (err) {
        console.warn("Could not sync current user with server:", err);
    }
}

function updateUserUI() {
    const avatarEl = $("userAvatar");
    const nameEl = $("userDisplayName");
    const welcomeGreeting = $("welcomeGreeting");
    const historyUserTitle = $("historyUserTitle");
    const authBtn = $("authModalBtn");
    const modalCurrentUserName = $("modalCurrentUserName");
    const currentUserActions = $("currentUserActions");

    const isGuest = !currentUser || currentUser.id === 0 || currentUser.username === "guest";
    const displayName = currentUser?.display_name || currentUser?.username || "Guest Yogi";
    const avatar = currentUser?.avatar || "🧘";

    if (avatarEl) avatarEl.textContent = avatar;
    if (nameEl) nameEl.textContent = displayName;
    if (welcomeGreeting) welcomeGreeting.textContent = `Namaste, ${displayName}!`;
    if (historyUserTitle) historyUserTitle.textContent = `${displayName}'s Progress`;

    if (authBtn) {
        authBtn.innerHTML = isGuest ? `<span>🔑</span> Sign In` : `<span>👤</span> ${displayName}`;
    }

    if (currentUserActions) {
        currentUserActions.hidden = isGuest;
        if (modalCurrentUserName) modalCurrentUserName.textContent = displayName;
    }
}

function initAuthModal() {
    const modal = $("authModal");
    const modalBtn = $("authModalBtn");
    const userBadge = $("userProfileBadge");
    const closeBtn = $("closeAuthModal");

    const tabLogin = $("tabLogin");
    const tabGuest = $("tabGuest");

    const loginForm = $("loginForm");
    const guestForm = $("guestForm");
    const logoutBtn = $("logoutBtn");

    function openModal(tab = "login") {
        modal.classList.add("active");
        modal.style.display = "flex";
        modal.removeAttribute("hidden");
        const errEl = $("loginError");
        const succEl = $("loginSuccess");
        if (errEl) { errEl.hidden = true; errEl.style.display = "none"; }
        if (succEl) { succEl.hidden = true; succEl.style.display = "none"; }
        updateUserUI();
        switchTab(tab);
    }

    function closeModal() {
        modal.classList.remove("active");
        modal.style.display = "none";
        modal.setAttribute("hidden", "");
    }

    function switchTab(tab) {
        if (tabLogin && tabGuest) {
            tabLogin.classList.toggle("active", tab === "login");
            tabGuest.classList.toggle("active", tab === "guest");
        }
        if (loginForm && guestForm) {
            loginForm.hidden = tab !== "login";
            loginForm.classList.toggle("active", tab === "login");
            guestForm.hidden = tab !== "guest";
            guestForm.classList.toggle("active", tab === "guest");
        }
    }

    modalBtn.onclick = () => openModal("login");
    userBadge.onclick = () => openModal("login");
    closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    if (tabLogin) tabLogin.onclick = () => switchTab("login");
    if (tabGuest) tabGuest.onclick = () => switchTab("guest");

    // Avatar selector
    document.querySelectorAll(".avatar-opt").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".avatar-opt").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
        };
    });

    // Smart Login & Auto-Register Handler
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const errEl = $("loginError");
        const succEl = $("loginSuccess");
        if (errEl) { errEl.hidden = true; errEl.style.display = "none"; }
        if (succEl) { succEl.hidden = true; succEl.style.display = "none"; }

        const username = $("loginUsername").value.trim();
        const password = $("loginPassword").value.trim();
        const selectedAvatar = document.querySelector(".avatar-opt.selected")?.dataset.avatar || "🧘";
        const submitBtn = $("loginSubmitBtn");

        if (!username) {
            if (errEl) {
                errEl.textContent = "Please enter your username or name.";
                errEl.hidden = false;
                errEl.style.display = "block";
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Signing In...";

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    display_name: username,
                    avatar: selectedAvatar
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not log in. Please try again.");

            currentUser = data.user;
            localStorage.setItem("fitsense_user", JSON.stringify(currentUser));
            updateUserUI();

            if (succEl) {
                succEl.textContent = `✓ ${data.message || `Welcome, ${currentUser.display_name}!`}`;
                succEl.hidden = false;
                succEl.style.display = "block";
            }

            // Immediately dismiss the login modal completely and open the yoga camera!
            setTimeout(() => {
                closeModal();
                renderPose(selectedPose);
                showScreen("workoutScreen");
                startCamera();
            }, 300);

        } catch (err) {
            if (errEl) {
                errEl.textContent = err.message || "Login failed. Please check your credentials.";
                errEl.hidden = false;
                errEl.style.display = "block";
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign In & Open Yoga Camera 🚀";
        }
    };

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } catch (e) {}
            localStorage.removeItem("fitsense_user");
            currentUser = { id: 0, username: "guest", display_name: "Guest Yogi", avatar: "🧘" };
            updateUserUI();
            const succEl = $("loginSuccess");
            if (succEl) {
                succEl.textContent = "✓ Logged out successfully.";
                succEl.hidden = false;
            }
            setTimeout(() => {
                closeModal();
                renderHistory();
            }, 400);
        };
    }

    // Guest Mode Handler - Immediately opens Yoga Camera!
    guestForm.onsubmit = (e) => {
        e.preventDefault();
        const name = $("guestNameInput").value.trim() || "Guest Yogi";
        currentUser = {
            id: 0,
            username: name.toLowerCase().replace(/\s+/g, "_"),
            display_name: name,
            avatar: "🧘"
        };
        localStorage.setItem("fitsense_user", JSON.stringify(currentUser));
        updateUserUI();
        closeModal();
        renderPose(selectedPose);
        showScreen("workoutScreen");
        startCamera();
    };
}

// ============================================================================
// POSE CATALOG & ANIMATED VISUALIZER
// ============================================================================

async function loadPoseCatalog() {
    try {
        const response = await fetch("/pose-config");
        const data = await response.json();
        poseCatalog = data.poses || {};
        renderPoseGrid();
        renderPose(selectedPose);
    } catch (err) {
        console.error("Failed to load pose configuration:", err);
        feedback.textContent = "Could not load pose catalog. Please refresh.";
    }
}

function renderPoseGrid() {
    const grid = $("poseGrid");
    if (!grid) return;
    grid.replaceChildren();

    Object.values(poseCatalog).filter(p => p.id !== "general").forEach(pose => {
        const card = document.createElement("div");
        card.className = `pose-card ${pose.id === selectedPose ? "selected" : ""}`;
        card.dataset.pose = pose.id;

        // Render animated visual preview thumbnail
        const previewHtml = window.PoseVisualizer?.getThumbnail(pose.id) || `<div class="pose-icon">🧘</div>`;

        card.innerHTML = `
            ${previewHtml}
            <div class="pose-card-info">
                <span class="pose-card-sanskrit">${pose.sanskrit || ""}</span>
                <h3>${pose.name}</h3>
                <p>${pose.description}</p>
                <div class="pose-card-tags">
                    <span class="tag-pill">${pose.difficulty || "All Levels"}</span>
                    <span class="tag-pill">${pose.category || "Yoga Flow"}</span>
                </div>
            </div>
            <span class="arrow">→</span>
        `;

        card.onclick = () => {
            selectedPose = pose.id;
            document.querySelectorAll(".pose-card").forEach(c => c.classList.toggle("selected", c === card));
            renderPose(selectedPose);
            showScreen("workoutScreen");
            startCamera();
        };

        grid.appendChild(card);
    });
}

function renderPose(poseKey) {
    const pose = poseCatalog[poseKey];
    if (!pose) return;

    selectedPose = poseKey;
    targetHoldSeconds = pose.target_hold || 5;
    $("targetTime").textContent = targetHoldSeconds;

    // Render Side Animated Guide
    if (window.PoseVisualizer) {
        window.PoseVisualizer.render("animatedPoseGuide", poseKey);
    }

    // Set difficulty badge
    const diffBadge = $("poseDifficultyBadge");
    if (diffBadge) diffBadge.textContent = pose.difficulty || "Beginner";

    // Setup Checkpoints Checklist
    currentCheckpoints = pose.checkpoints || [
        { id: "alignment", label: "Full body visible and aligned" }
    ];
    renderCheckpoints();

    feedback.textContent = `Ready for ${pose.name}. Click Start Camera to begin.`;
    $("correctionMessage").hidden = true;
    updateStability(0);
}

function renderCheckpoints(metStatus = {}) {
    if (!checkpointsList) return;
    checkpointsList.replaceChildren();

    let allMet = true;
    currentCheckpoints.forEach(cp => {
        const isMet = Boolean(metStatus[cp.id]);
        if (!isMet) allMet = false;

        const li = document.createElement("li");
        li.className = `checkpoint-item ${isMet ? "met" : ""}`;
        li.innerHTML = `
            <span class="chk-icon">${isMet ? "✓" : "○"}</span>
            <span class="chk-label">${cp.label}</span>
        `;
        checkpointsList.appendChild(li);
    });

    const summary = $("checkpointsSummary");
    if (summary) {
        if (allMet && Object.keys(metStatus).length > 0) {
            summary.textContent = "All points aligned!";
            summary.classList.add("all-good");
        } else {
            summary.textContent = "Match alignment points";
            summary.classList.remove("all-good");
        }
    }
}

// ============================================================================
// ULTRA-FAST CAMERA PIPELINE & 60 FPS INTERPOLATION
// ============================================================================

async function startCamera() {
    if (isStartingCamera || stream) return;

    if (!navigator.mediaDevices?.getUserMedia) {
        message.innerHTML = `<h3>Camera Unsupported</h3><p>Please open <code>http://127.0.0.1:5000</code> in Google Chrome or Microsoft Edge.</p>`;
        message.style.display = "block";
        return;
    }

    isStartingCamera = true;
    cameraButton.disabled = true;
    message.innerHTML = `<div class="spinner"></div><h3>Connecting Camera...</h3>`;
    message.style.display = "block";

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        video.style.display = "block";
        message.style.display = "none";
        hudOverlay.hidden = false;

        $("cameraStatus").textContent = "Camera Live";
        $("cameraStatus").className = "status-pill status-live";
        $("liveDotIndicator").classList.add("pulsing");

        cameraButton.disabled = true;
        stopButton.disabled = false;
        cameraActive = true;
        startedAt = Date.now();
        holdSuccessTriggered = false;
        spokenInstructions.clear();

        // Canvas sizing
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Reset smoothed landmarks
        smoothedLandmarks = [];
        targetLandmarks = [];

        // Start 60 FPS Render Loop
        startRenderLoop();

        // Start High-Speed Adaptive Frame Detection Loop
        scheduleNextAnalyze(10);

        const welcomeVoice = poseCatalog[selectedPose]?.name 
            ? `Ready for ${poseCatalog[selectedPose].name}. Follow the animated guide.` 
            : phrase("camera_on");
        speak(welcomeVoice);

    } catch (err) {
        console.error("Camera startup error:", err);
        message.innerHTML = `<h3>Camera Issue</h3><p>${err.message || "Could not access webcam."}</p>`;
        message.style.display = "block";
        $("cameraStatus").textContent = "Unavailable";
        $("cameraStatus").className = "status-pill status-err";
    } finally {
        isStartingCamera = false;
        if (!stream) cameraButton.disabled = false;
    }
}

function stopCamera() {
    cameraActive = false;
    if (analyzeTimeoutId) clearTimeout(analyzeTimeoutId);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    if (stream) {
        if (startedAt) saveCompletedSession();
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    video.srcObject = null;
    video.style.display = "none";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hudOverlay.hidden = true;

    message.innerHTML = `
        <div class="camera-prompt-icon">📷</div>
        <h3>Camera Off</h3>
        <p>Click Start Camera to begin posture analysis.</p>
    `;
    message.style.display = "block";

    cameraButton.disabled = false;
    stopButton.disabled = true;

    $("cameraStatus").textContent = "Ready";
    $("cameraStatus").className = "status-pill status-ready";
    $("liveDotIndicator").classList.remove("pulsing");
    fpsDisplay.textContent = "-- FPS";

    feedback.textContent = "Session stopped. Great work!";
    $("correctionMessage").hidden = true;
    updateStability(0);
    resetHoldTimer();

    if ("speechSynthesis" in window) speechSynthesis.cancel();
}

/**
 * Adaptive Pose Analysis Loop:
 * Captures an optimized, low-latency 320x240 frame, posts to backend,
 * and as soon as the result returns, triggers the next frame with a 40ms interval.
 */
async function analyzeFrame() {
    if (!cameraActive || !stream || video.readyState < 2 || isAnalyzing) return;

    isAnalyzing = true;
    const now = Date.now();

    // Fast offscreen canvas snapshot (320px wide is ideal for 16ms MediaPipe execution)
    const offCanvas = document.createElement("canvas");
    const targetW = 320;
    const aspect = (video.videoHeight || 480) / (video.videoWidth || 640);
    offCanvas.width = targetW;
    offCanvas.height = Math.round(targetW * aspect);

    const offCtx = offCanvas.getContext("2d");
    offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
    const jpegData = offCanvas.toDataURL("image/jpeg", 0.52);

    try {
        const response = await fetch("/analyze-pose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: jpegData, pose: selectedPose })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Analysis error");

        handleAnalysisResult(result);

        // Update FPS calculations
        frameCount++;
        if (now - lastFpsUpdateTime >= 1000) {
            currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdateTime));
            fpsDisplay.textContent = `${currentFps} FPS`;
            frameCount = 0;
            lastFpsUpdateTime = now;
        }

    } catch (err) {
        // Silently handle transient network drop
    } finally {
        isAnalyzing = false;
        // Schedule next analyze frame with a minimal 45ms gap (~15-18 server queries/sec)
        if (cameraActive) {
            scheduleNextAnalyze(45);
        }
    }
}

function scheduleNextAnalyze(ms = 45) {
    if (analyzeTimeoutId) clearTimeout(analyzeTimeoutId);
    analyzeTimeoutId = setTimeout(analyzeFrame, ms);
}

function handleAnalysisResult(res) {
    if (!res.detected || !res.landmarks || res.landmarks.length === 0) {
        targetLandmarks = [];
        targetStability = 0;
        feedback.textContent = res.correction || "Step back so your full body is in frame.";
        $("correctionMessage").hidden = true;
        renderCheckpoints({});
        return;
    }

    targetLandmarks = res.landmarks;
    targetStability = res.stability || 0;
    latestAngles = res.angles || {};

    // Update real-time HUD badge with knee or relevant angle
    if (latestAngles.left_knee || latestAngles.right_knee) {
        const angle = Math.min(latestAngles.left_knee || 180, latestAngles.right_knee || 180);
        hudAngleValue.textContent = `${angle}°`;
    }

    // Update Checkpoints Met
    renderCheckpoints(res.checkpoints || {});

    // Update AI Coach Feedback
    const isSuccess = Boolean(res.success);
    if (isSuccess) {
        feedback.textContent = res.success_message || "Posture aligned! Hold steady.";
        feedback.classList.add("feedback-success");
        $("correctionMessage").hidden = true;
    } else {
        feedback.textContent = res.correction || "Adjust your posture to match the side guide.";
        feedback.classList.remove("feedback-success");
        $("correctionMessage").hidden = false;
        $("correctionMessage").textContent = `Coach Cue: ${res.correction}`;
    }

    // Audio Coaching (Throttled per distinct instruction)
    if (!spokenInstructions.has(res.instruction) && res.correction) {
        spokenInstructions.add(res.instruction);
        speak(res.correction);
    }
}

/**
 * 60 FPS Canvas Render Loop:
 * Uses lerp (Linear Interpolation) to smoothly animate skeleton landmarks
 * between server updates, drawing neon glowing joints and alignment arcs.
 */
function startRenderLoop() {
    function render() {
        if (!cameraActive) return;

        // Ensure canvas dimensions match video element
        if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Smooth stability
        smoothedStability += (targetStability - smoothedStability) * 0.15;
        updateStability(Math.round(smoothedStability));

        // Smooth landmarks interpolation
        if (targetLandmarks.length > 0) {
            if (smoothedLandmarks.length !== targetLandmarks.length) {
                smoothedLandmarks = targetLandmarks.map(p => ({ ...p }));
            } else {
                for (let i = 0; i < targetLandmarks.length; i++) {
                    const t = targetLandmarks[i];
                    const s = smoothedLandmarks[i];
                    s.x += (t.x - s.x) * 0.38;
                    s.y += (t.y - s.y) * 0.38;
                    s.visibility = t.visibility;
                }
            }

            drawSmoothSkeleton(smoothedLandmarks);
        }

        // Update Hold Timer
        updateHoldTimer();

        animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);
}

function drawSmoothSkeleton(points) {
    const w = canvas.width;
    const h = canvas.height;
    const isAligned = smoothedStability >= 75;

    // Glowing Holographic Skeleton Style
    const strokeColor = isAligned ? "#42e695" : "#ffd166";
    const jointColor = isAligned ? "#ffffff" : "#fff1b8";

    ctx.save();
    ctx.shadowBlur = isAligned ? 14 : 8;
    ctx.shadowColor = strokeColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw Skeleton Bones
    SKELETON_CONNECTIONS.forEach(([i, j]) => {
        const p1 = points[i];
        const p2 = points[j];
        if (p1 && p2 && p1.visibility > 0.35 && p2.visibility > 0.35) {
            // Mirror X coordinates for natural webcam experience
            const x1 = (1 - p1.x) * w;
            const y1 = p1.y * h;
            const x2 = (1 - p2.x) * w;
            const y2 = p2.y * h;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    });

    // Draw Glowing Joints
    points.forEach((p, idx) => {
        if (p.visibility > 0.4) {
            const x = (1 - p.x) * w;
            const y = p.y * h;

            ctx.beginPath();
            ctx.arc(x, y, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = jointColor;
            ctx.fill();

            // Pulsing target halo on major joints (Knees, Wrists, Shoulders)
            if ([15, 16, 25, 26, 11, 12].includes(idx)) {
                ctx.beginPath();
                ctx.arc(x, y, 9, 0, Math.PI * 2);
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    });

    ctx.restore();
}

function updateStability(val) {
    if (stability) stability.textContent = `${val}%`;
    if (bar) {
        bar.style.width = `${val}%`;
        bar.style.backgroundColor = val >= 75 ? "#42e695" : val >= 45 ? "#ffd166" : "#ff6b6b";
    }
}

// ============================================================================
// HOLD TIMER & SESSION REWARD
// ============================================================================

function updateHoldTimer() {
    if (!startedAt || !cameraActive) return;

    const elapsedSeconds = (Date.now() - startedAt) / 1000;
    const isGoodForm = smoothedStability >= 70;

    // Advance hold timer smoothly
    hold.textContent = `${elapsedSeconds.toFixed(1)}s`;

    // Circular progress ring calculation
    if (holdRing) {
        const totalCircumference = 2 * Math.PI * 34; // r = 34 => ~213.6
        const progress = Math.min(1, elapsedSeconds / targetHoldSeconds);
        const offset = totalCircumference - (progress * totalCircumference);
        holdRing.style.strokeDashoffset = offset;
        holdRing.style.stroke = isGoodForm ? "#42e695" : "#ffd166";
    }

    // Celebration when target hold seconds reached
    if (elapsedSeconds >= targetHoldSeconds && !holdSuccessTriggered) {
        holdSuccessTriggered = true;
        celebratePoseCompletion();
    }
}

function resetHoldTimer() {
    hold.textContent = "0.0s";
    if (holdRing) holdRing.style.strokeDashoffset = 214;
    startedAt = null;
    holdSuccessTriggered = false;
}

function celebratePoseCompletion() {
    speak(phrase("pose_completed"));
    feedback.textContent = `🌟 Awesome! You held ${poseCatalog[selectedPose]?.name || "this pose"} with great balance!`;
    feedback.classList.add("feedback-success");

    // Audio chime using Web Audio API
    playSuccessChime();
}

function playSuccessChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const actx = new AudioCtx();
        const osc = actx.createOscillator();
        const gain = actx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, actx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, actx.currentTime + 0.15); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, actx.currentTime + 0.35); // C6

        gain.gain.setValueAtTime(0.2, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 0.5);
    } catch (e) {
        // Audio context may require explicit user gesture
    }
}

// ============================================================================
// VOICE GUIDANCE
// ============================================================================

function speak(text) {
    if (!sound || !("speechSynthesis" in window) || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";

    const match = voices.find(v => v.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2)));
    if (match) utterance.voice = match;
    utterance.rate = 0.95;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

function loadVoices() {
    if ("speechSynthesis" in window) {
        voices = speechSynthesis.getVoices();
    }
}
if ("speechSynthesis" in window) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
}

// ============================================================================
// PROGRESS & HISTORY (SYNCED TO USER)
// ============================================================================

async function saveCompletedSession() {
    if (!startedAt) return;
    const duration = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const score = Math.round(smoothedStability) || 0;
    const poseName = poseCatalog[selectedPose]?.name || "Yoga Pose";

    try {
        await fetch("/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pose_id: selectedPose,
                pose_name: poseName,
                duration: duration,
                score: score
            })
        });
    } catch (err) {
        console.warn("Could not sync session to server:", err);
    }
}

async function renderHistory() {
    try {
        const res = await fetch("/api/history");
        const data = await res.json();

        $("historySessions").textContent = data.total_sessions || 0;
        $("historyMinutes").textContent = data.total_minutes || 0;
        $("historyScore").textContent = `${data.avg_accuracy || 0}%`;
        $("historyFavorite").textContent = data.favorite_pose || "Tree Pose";

        const list = $("historyList");
        if (!list) return;

        if (!data.sessions || data.sessions.length === 0) {
            list.innerHTML = `<p class="history-empty">No sessions recorded yet for ${currentUser.display_name}. Complete your first yoga session to see your progress here!</p>`;
            return;
        }

        list.replaceChildren(
            ...data.sessions.map(s => {
                const row = document.createElement("div");
                row.className = "history-item";
                row.innerHTML = `
                    <div class="hist-left">
                        <span class="hist-icon">🧘</span>
                        <div>
                            <strong>${s.pose_name}</strong>
                            <p>${s.date || "Recent"}</p>
                        </div>
                    </div>
                    <div class="hist-right">
                        <span class="hist-score-badge ${s.score >= 80 ? 'high' : s.score >= 60 ? 'mid' : 'low'}">${s.score}% Form</span>
                        <span class="hist-duration">${s.duration}s hold</span>
                    </div>
                `;
                return row;
            })
        );
    } catch (err) {
        console.error("Failed to load history:", err);
    }
}

// ============================================================================
// NAVIGATION & SCREEN SWITCHING
// ============================================================================

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.toggle("active", s.id === id);
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        if (id === "homeScreen" && link.id === "navHomeBtn") link.classList.add("active");
        else if (id === "poseScreen" && link.id === "navPosesBtn") link.classList.add("active");
        else if (id === "historyScreen" && link.id === "historyButton") link.classList.add("active");
        else link.classList.remove("active");
    });

    document.body.classList.toggle("session-active", id === "workoutScreen");
}

// ============================================================================
// INITIALIZATION & EVENT LISTENERS
// ============================================================================

window.addEventListener("DOMContentLoaded", async () => {
    // 1. Fetch current user and setup auth
    await fetchCurrentUser();
    initAuthModal();

    // 2. Load pose catalog and render cards
    await loadPoseCatalog();

    // 3. Navigation hooks & Hero Quick Launch
    $("navLogo").onclick = () => showScreen("homeScreen");
    $("navHomeBtn").onclick = () => showScreen("homeScreen");
    $("navPosesBtn").onclick = () => showScreen("poseScreen");
    if ($("heroPosesBtn")) $("heroPosesBtn").onclick = () => showScreen("poseScreen");
    if ($("heroStartBtn")) $("heroStartBtn").onclick = () => showScreen("poseScreen");

    // Clicking "Start Session" opens the workout screen & turns on the camera
    $("startButton").onclick = () => {
        showScreen("workoutScreen");
        startCamera();
    };

    // Hero Quick Login & Immediate Camera Start
    const heroLoginForm = $("heroQuickLoginForm");
    if (heroLoginForm) {
        heroLoginForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = $("heroUsernameInput").value.trim();
            if (!username) return;

            const submitBtn = $("heroQuickStartBtn");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Opening Yoga Camera...";
            }

            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: username,
                        display_name: username,
                        avatar: "🧘"
                    })
                });
                const data = await res.json();
                if (data.user) {
                    currentUser = data.user;
                    localStorage.setItem("fitsense_user", JSON.stringify(currentUser));
                    updateUserUI();
                }
            } catch (err) {
                currentUser = { id: Date.now(), username: username, display_name: username, avatar: "🧘" };
                localStorage.setItem("fitsense_user", JSON.stringify(currentUser));
                updateUserUI();
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Start Yoga Camera 🚀";
                }
            }

            // Immediately OPEN the Yoga Camera & Workout Screen!
            renderPose(selectedPose);
            showScreen("workoutScreen");
            startCamera();
        };
    }
    $("historyButton").onclick = () => { renderHistory(); showScreen("historyScreen"); };
    $("heroHistoryBtn").onclick = () => { renderHistory(); showScreen("historyScreen"); };
    $("historyBackBtn").onclick = () => showScreen("poseScreen");
    $("switchPoseBtn").onclick = () => { stopCamera(); showScreen("poseScreen"); };

    $("clearHistoryButton").onclick = async () => {
        if (confirm(`Reset session history for ${currentUser.display_name}?`)) {
            await fetch("/api/history", { method: "DELETE" });
            renderHistory();
        }
    };

    $("exitButton").onclick = () => {
        stopCamera();
        renderHistory();
        showScreen("historyScreen");
    };

    // Camera buttons
    cameraButton.onclick = startCamera;
    stopButton.onclick = stopCamera;

    // Sound toggle
    $("soundButton").onclick = () => {
        sound = !sound;
        $("soundButton").textContent = sound ? "🔊 Sound ON" : "🔇 Sound OFF";
        speak(sound ? phrase("sound_on") : phrase("sound_off"));
    };

    // Language selection
    document.querySelectorAll(".language-button").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".language-button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            language = btn.dataset.language || "en";
            speak(phrase("sound_on"));
        };
    });
});
