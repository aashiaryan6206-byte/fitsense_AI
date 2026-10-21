/**
 * FitSense AI - Animated Pose Visualizer
 * Renders smooth animated SVG human figures with posture guides,
 * joint target highlights, and breathing animations so users can
 * easily understand and match the exact yoga pose.
 */

const PoseVisualizer = (function () {
    // Pose animation configurations and SVG path definitions
    const poses = {
        tree: {
            title: "Tree Pose",
            sanskrit: "Vrikshasana",
            hint: "Stand on one leg, place the other foot on your inner calf/thigh, and bring both hands together overhead.",
            render: (step = 0) => `
                <svg viewBox="0 0 340 460" class="pose-svg animated-tree" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.35"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#ffbe98"/>
                            <stop offset="100%" stop-color="#e08e64"/>
                        </linearGradient>
                        <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#42e695"/>
                            <stop offset="100%" stop-color="#1b8253"/>
                        </linearGradient>
                    </defs>
                    <!-- Energy Aura Ring -->
                    <circle cx="170" cy="220" r="140" fill="url(#auraGlow)" class="anim-breathe"/>
                    <!-- Floor shadow -->
                    <ellipse cx="170" cy="435" rx="80" ry="12" fill="#051510" opacity="0.6"/>
                    
                    <!-- Grounded Standing Leg (Left) -->
                    <path d="M158 240 L158 430" stroke="#102a20" stroke-width="26" stroke-linecap="round"/>
                    <ellipse cx="150" cy="435" rx="18" ry="8" fill="#e08e64"/>

                    <!-- Bent Tree Leg (Right) - animated foot to calf -->
                    <g class="anim-tree-leg">
                        <path d="M178 240 Q245 285 220 325 L168 335" fill="none" stroke="#16382b" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="168" cy="335" r="9" fill="#e08e64"/>
                        <!-- Target alignment ring on foot on calf -->
                        <circle cx="168" cy="335" r="18" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>
                    </g>

                    <!-- Torso -->
                    <path d="M142 120 L198 120 L188 245 L152 245 Z" fill="url(#suitGrad)" rx="8"/>

                    <!-- Head & Neck -->
                    <rect x="163" y="98" width="14" height="24" fill="url(#skinGrad)" rx="5"/>
                    <circle cx="170" cy="74" r="28" fill="url(#skinGrad)"/>
                    <path d="M145 68 Q170 36 195 68 Q170 54 145 68 Z" fill="#1b2e26"/>

                    <!-- Raised Arms Overhead in Prayer (Namaste) -->
                    <g class="anim-tree-arms">
                        <!-- Left arm -->
                        <path d="M144 125 Q115 65 162 26" fill="none" stroke="url(#skinGrad)" stroke-width="17" stroke-linecap="round"/>
                        <!-- Right arm -->
                        <path d="M196 125 Q225 65 178 26" fill="none" stroke="url(#skinGrad)" stroke-width="17" stroke-linecap="round"/>
                        <!-- Hands meeting -->
                        <ellipse cx="170" cy="22" rx="10" ry="14" fill="#ffbe98"/>
                        <!-- Target glow on hands -->
                        <circle cx="170" cy="22" r="16" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>
                    </g>
                    <!-- Posture Alignment Spine Line -->
                    <line x1="170" y1="50" x2="170" y2="245" stroke="#42e695" stroke-width="2" stroke-dasharray="3 3" opacity="0.6"/>
                </svg>
            `
        },

        mountain: {
            title: "Mountain Pose",
            sanskrit: "Tadasana",
            hint: "Stand upright with feet grounded, spine tall and lengthened, shoulders relaxed, arms at your sides.",
            render: () => `
                <svg viewBox="0 0 340 460" class="pose-svg animated-mountain" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraMtn" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.25"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                        <linearGradient id="skinMtn" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#ffbe98"/>
                            <stop offset="100%" stop-color="#e08e64"/>
                        </linearGradient>
                        <linearGradient id="suitMtn" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#42e695"/>
                            <stop offset="100%" stop-color="#1b8253"/>
                        </linearGradient>
                    </defs>
                    <circle cx="170" cy="220" r="145" fill="url(#auraMtn)" class="anim-breathe"/>
                    <ellipse cx="170" cy="435" rx="85" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Both straight legs -->
                    <path d="M152 245 L148 430" stroke="#102a20" stroke-width="24" stroke-linecap="round"/>
                    <path d="M188 245 L192 430" stroke="#102a20" stroke-width="24" stroke-linecap="round"/>
                    <ellipse cx="140" cy="435" rx="16" ry="8" fill="#e08e64"/>
                    <ellipse cx="200" cy="435" rx="16" ry="8" fill="#e08e64"/>

                    <!-- Torso -->
                    <path d="M138 120 L202 120 L194 248 L146 248 Z" fill="url(#suitMtn)" rx="8"/>

                    <!-- Head & Neck -->
                    <rect x="163" y="98" width="14" height="24" fill="url(#skinMtn)" rx="5"/>
                    <circle cx="170" cy="74" r="28" fill="url(#skinMtn)"/>
                    <path d="M145 68 Q170 36 195 68 Q170 54 145 68 Z" fill="#1b2e26"/>

                    <!-- Arms relaxed by sides with gentle breathing wave -->
                    <g class="anim-mtn-arms">
                        <path d="M136 125 L118 260" stroke="url(#skinMtn)" stroke-width="17" stroke-linecap="round"/>
                        <circle cx="118" cy="265" r="9" fill="#ffbe98"/>
                        <path d="M204 125 L222 260" stroke="url(#skinMtn)" stroke-width="17" stroke-linecap="round"/>
                        <circle cx="222" cy="265" r="9" fill="#ffbe98"/>
                    </g>
                    <!-- Posture alignment vertical laser -->
                    <line x1="170" y1="40" x2="170" y2="435" stroke="#42e695" stroke-width="2" stroke-dasharray="4 4" opacity="0.7"/>
                </svg>
            `
        },

        warrior: {
            title: "Warrior II",
            sanskrit: "Virabhadrasana II",
            hint: "Take a wide stance, bend your front knee into a 90° lunge, and stretch both arms out parallel to the floor.",
            render: () => `
                <svg viewBox="0 0 420 380" class="pose-svg animated-warrior" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraWar" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                        <linearGradient id="suitWar" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#42e695"/>
                            <stop offset="100%" stop-color="#1b8253"/>
                        </linearGradient>
                    </defs>
                    <circle cx="210" cy="200" r="160" fill="url(#auraWar)" class="anim-breathe"/>
                    <ellipse cx="210" cy="360" rx="160" ry="14" fill="#051510" opacity="0.6"/>

                    <!-- Front bent leg (Left) 90 degree lunge -->
                    <g class="anim-warrior-front-leg">
                        <path d="M190 220 L110 235 L110 355" fill="none" stroke="#102a20" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
                        <ellipse cx="98" cy="358" rx="20" ry="9" fill="#e08e64"/>
                        <!-- Target alignment ring on 90° knee -->
                        <circle cx="110" cy="235" r="18" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>
                    </g>

                    <!-- Back straight leg (Right) -->
                    <path d="M225 220 L330 355" stroke="#16382b" stroke-width="24" stroke-linecap="round"/>
                    <ellipse cx="340" cy="358" rx="18" ry="9" fill="#e08e64"/>

                    <!-- Torso stacked over hips -->
                    <path d="M182 110 L234 110 L226 225 L188 225 Z" fill="url(#suitWar)" rx="8"/>

                    <!-- Head facing over front hand -->
                    <rect x="202" y="90" width="12" height="22" fill="#ffbe98" rx="4"/>
                    <circle cx="206" cy="68" r="26" fill="#ffbe98"/>
                    <path d="M185 64 Q208 38 230 64 Q208 52 185 64 Z" fill="#1b2e26"/>

                    <!-- Arms extended parallel to floor -->
                    <g class="anim-warrior-arms">
                        <!-- Front arm extending left -->
                        <path d="M184 118 L48 118" stroke="#ffbe98" stroke-width="17" stroke-linecap="round"/>
                        <circle cx="42" cy="118" r="8" fill="#e08e64"/>
                        <circle cx="48" cy="118" r="16" fill="none" stroke="#42e695" stroke-width="2" stroke-dasharray="3 3" class="anim-pulse-target"/>
                        
                        <!-- Back arm extending right -->
                        <path d="M232 118 L370 118" stroke="#ffbe98" stroke-width="17" stroke-linecap="round"/>
                        <circle cx="376" cy="118" r="8" fill="#e08e64"/>
                    </g>
                    <!-- Horizontal alignment guideline -->
                    <line x1="30" y1="118" x2="390" y2="118" stroke="#42e695" stroke-width="2" stroke-dasharray="4 4" opacity="0.5"/>
                </svg>
            `
        },

        chair: {
            title: "Chair Pose",
            sanskrit: "Utkatasana",
            hint: "Sit your hips back as if into a chair, bend your knees to 90-110°, and raise your arms up alongside your ears.",
            render: () => `
                <svg viewBox="0 0 340 440" class="pose-svg animated-chair" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraChair" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="170" cy="220" r="140" fill="url(#auraChair)" class="anim-breathe"/>
                    <ellipse cx="170" cy="425" rx="80" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Knees bent sitting back (shins angled forward, thighs horizontal) -->
                    <path d="M230 250 L140 270 L170 420" fill="none" stroke="#102a20" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
                    <ellipse cx="185" cy="424" rx="22" ry="9" fill="#e08e64"/>
                    <circle cx="140" cy="270" r="18" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>

                    <!-- Angled Torso -->
                    <path d="M230 250 L190 145 L160 155 L210 258 Z" fill="#20bd72" rx="8"/>

                    <!-- Head -->
                    <circle cx="168" cy="120" r="26" fill="#ffbe98"/>

                    <!-- Arms raised along ears -->
                    <g class="anim-chair-arms">
                        <path d="M185 145 L115 48" stroke="#ffbe98" stroke-width="16" stroke-linecap="round"/>
                        <circle cx="112" cy="45" r="16" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>
                    </g>
                </svg>
            `
        },

        plank: {
            title: "Plank Pose",
            sanskrit: "Phalakasana",
            hint: "Form a straight, solid line from your head to your heels, pressing the floor away with arms under shoulders.",
            render: () => `
                <svg viewBox="0 0 420 320" class="pose-svg animated-plank" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraPlank" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="210" cy="180" r="140" fill="url(#auraPlank)" class="anim-breathe"/>
                    <ellipse cx="210" cy="295" rx="170" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Straight horizontal body from head (left) to feet (right) -->
                    <!-- Straight arms supporting shoulders -->
                    <path d="M125 155 L125 285" stroke="#ffbe98" stroke-width="18" stroke-linecap="round"/>
                    <circle cx="125" cy="288" r="10" fill="#e08e64"/>
                    <circle cx="125" cy="155" r="16" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>

                    <!-- Head -->
                    <circle cx="68" cy="142" r="24" fill="#ffbe98"/>

                    <!-- Straight Torso & Legs -->
                    <path d="M110 148 L350 205" stroke="#20bd72" stroke-width="32" stroke-linecap="round"/>
                    <path d="M350 205 L375 282" stroke="#102a20" stroke-width="20" stroke-linecap="round"/>
                    <ellipse cx="380" cy="285" rx="12" ry="7" fill="#e08e64"/>

                    <!-- Laser straight alignment line -->
                    <line x1="55" y1="135" x2="385" y2="215" stroke="#42e695" stroke-width="2" stroke-dasharray="5 4" opacity="0.8"/>
                </svg>
            `
        },

        downdog: {
            title: "Downward-Facing Dog",
            sanskrit: "Adho Mukha Svanasana",
            hint: "Form an inverted 'V' shape with hips lifted toward the sky, hands pressing mat firmly, spine long.",
            render: () => `
                <svg viewBox="0 0 380 340" class="pose-svg animated-downdog" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraDog" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="190" cy="180" r="140" fill="url(#auraDog)" class="anim-breathe"/>
                    <ellipse cx="190" cy="315" rx="150" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Arms from hands (left) to shoulders -->
                    <path d="M75 305 L145 190" stroke="#ffbe98" stroke-width="18" stroke-linecap="round"/>
                    <ellipse cx="70" cy="310" rx="14" ry="7" fill="#e08e64"/>

                    <!-- Head relaxed between arms -->
                    <circle cx="132" cy="225" r="22" fill="#ffbe98"/>

                    <!-- Inverted V: Spine from shoulders to high hips -->
                    <path d="M145 190 L195 85" stroke="#20bd72" stroke-width="28" stroke-linecap="round"/>
                    <!-- Target ring on high hips -->
                    <circle cx="195" cy="85" r="22" fill="none" stroke="#42e695" stroke-width="3" stroke-dasharray="5 3" class="anim-pulse-target"/>

                    <!-- Legs from hips down to heels (right) -->
                    <path d="M195 85 L310 305" stroke="#102a20" stroke-width="24" stroke-linecap="round"/>
                    <ellipse cx="315" cy="310" rx="16" ry="8" fill="#e08e64"/>

                    <!-- Inverted V alignment guidelines -->
                    <line x1="75" y1="305" x2="195" y2="85" stroke="#42e695" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>
                    <line x1="195" y1="85" x2="310" y2="305" stroke="#42e695" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>
                </svg>
            `
        },

        cobra: {
            title: "Cobra Pose",
            sanskrit: "Bhujangasana",
            hint: "Lie on your belly, hands under shoulders, peel your chest gently forward and up into an arch.",
            render: () => `
                <svg viewBox="0 0 420 300" class="pose-svg animated-cobra" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraCobra" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="180" cy="180" r="130" fill="url(#auraCobra)" class="anim-breathe"/>
                    <ellipse cx="210" cy="285" rx="170" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Legs & Pelvis flat on mat -->
                    <path d="M190 265 L370 275" stroke="#102a20" stroke-width="26" stroke-linecap="round"/>
                    <ellipse cx="380" cy="275" rx="14" ry="7" fill="#e08e64"/>

                    <!-- Hands & supporting arms -->
                    <path d="M130 185 L145 275" stroke="#ffbe98" stroke-width="16" stroke-linecap="round"/>
                    <ellipse cx="148" cy="278" rx="14" ry="6" fill="#e08e64"/>

                    <!-- Arched chest & spine -->
                    <path d="M200 265 Q170 240 130 185 Q115 150 110 115" fill="none" stroke="#20bd72" stroke-width="28" stroke-linecap="round"/>
                    
                    <!-- Head tilted slightly upward -->
                    <circle cx="118" cy="85" r="24" fill="#ffbe98"/>

                    <!-- Heart chakra target glow -->
                    <circle cx="120" cy="150" r="20" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>
                </svg>
            `
        },

        triangle: {
            title: "Triangle Pose",
            sanskrit: "Trikonasana",
            hint: "Stand wide, reach one hand down toward shin or floor, and extend top arm straight to the sky.",
            render: () => `
                <svg viewBox="0 0 380 400" class="pose-svg animated-triangle" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraTri" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="190" cy="200" r="145" fill="url(#auraTri)" class="anim-breathe"/>
                    <ellipse cx="190" cy="380" rx="140" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Wide straight legs -->
                    <path d="M190 220 L100 375" stroke="#102a20" stroke-width="24" stroke-linecap="round"/>
                    <path d="M210 220 L290 375" stroke="#102a20" stroke-width="24" stroke-linecap="round"/>
                    <ellipse cx="90" cy="378" rx="16" ry="8" fill="#e08e64"/>
                    <ellipse cx="300" cy="378" rx="16" ry="8" fill="#e08e64"/>

                    <!-- Sideways Torso -->
                    <path d="M200 220 L140 150" stroke="#20bd72" stroke-width="28" stroke-linecap="round"/>
                    <circle cx="125" cy="130" r="24" fill="#ffbe98"/>

                    <!-- Vertical Arms -->
                    <!-- Lower arm down to ankle -->
                    <path d="M140 150 L100 340" stroke="#ffbe98" stroke-width="16" stroke-linecap="round"/>
                    <!-- Upper arm straight up to sky -->
                    <path d="M140 150 L160 30" stroke="#ffbe98" stroke-width="16" stroke-linecap="round"/>
                    <circle cx="160" cy="30" r="18" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>

                    <!-- Vertical alignment line -->
                    <line x1="100" y1="340" x2="160" y2="30" stroke="#42e695" stroke-width="2" stroke-dasharray="4 4" opacity="0.7"/>
                </svg>
            `
        },

        bridge: {
            title: "Bridge Pose",
            sanskrit: "Setu Bandhasana",
            hint: "Lie on back with knees bent, press into feet to lift hips high toward the sky.",
            render: () => `
                <svg viewBox="0 0 400 300" class="pose-svg animated-bridge" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraBridge" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="200" cy="180" r="130" fill="url(#auraBridge)" class="anim-breathe"/>
                    <ellipse cx="200" cy="285" rx="160" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Head & shoulders grounded (left) -->
                    <circle cx="85" cy="265" r="22" fill="#ffbe98"/>
                    <path d="M100 270 L135 270" stroke="#20bd72" stroke-width="22" stroke-linecap="round"/>

                    <!-- Torso bridging upward to high hips -->
                    <path d="M135 270 Q180 150 235 140" fill="none" stroke="#20bd72" stroke-width="28" stroke-linecap="round"/>
                    <!-- High hip target -->
                    <circle cx="235" cy="140" r="22" fill="none" stroke="#42e695" stroke-width="3" stroke-dasharray="5 3" class="anim-pulse-target"/>

                    <!-- Bent knees to grounded feet (right) -->
                    <path d="M235 140 L310 145 L330 275" fill="none" stroke="#102a20" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
                    <ellipse cx="335" cy="278" rx="16" ry="8" fill="#e08e64"/>
                </svg>
            `
        },

        warrior1: {
            title: "Warrior I",
            sanskrit: "Virabhadrasana I",
            hint: "Deep front knee bend, hips squared forward, both arms reaching high toward the sky.",
            render: () => `
                <svg viewBox="0 0 380 440" class="pose-svg animated-warrior1" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="auraWar1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#42e695" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#42e695" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <circle cx="190" cy="220" r="150" fill="url(#auraWar1)" class="anim-breathe"/>
                    <ellipse cx="190" cy="425" rx="140" ry="12" fill="#051510" opacity="0.6"/>

                    <!-- Front bent leg (left) -->
                    <path d="M180 260 L120 275 L120 420" fill="none" stroke="#102a20" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
                    <ellipse cx="110" cy="424" rx="20" ry="9" fill="#e08e64"/>

                    <!-- Back straight leg (right) -->
                    <path d="M205 260 L300 420" stroke="#16382b" stroke-width="24" stroke-linecap="round"/>
                    <ellipse cx="308" cy="424" rx="16" ry="8" fill="#e08e64"/>

                    <!-- Torso -->
                    <path d="M175 145 L225 145 L215 265 L180 265 Z" fill="#20bd72" rx="8"/>

                    <!-- Head -->
                    <circle cx="195" cy="115" r="26" fill="#ffbe98"/>

                    <!-- Both arms high overhead -->
                    <g class="anim-warrior1-arms">
                        <path d="M180 150 L170 30" stroke="#ffbe98" stroke-width="16" stroke-linecap="round"/>
                        <path d="M220 150 L210 30" stroke="#ffbe98" stroke-width="16" stroke-linecap="round"/>
                        <circle cx="190" cy="25" r="18" fill="none" stroke="#42e695" stroke-width="2.5" stroke-dasharray="4 3" class="anim-pulse-target"/>
                    </g>
                </svg>
            `
        }
    };

    /**
     * Renders the animated pose graphic into target container
     */
    function render(containerId, poseKey = "tree") {
        const container = document.getElementById(containerId);
        if (!container) return;

        const config = poses[poseKey] || poses.tree;
        container.innerHTML = `
            <div class="pose-visualizer-card">
                <div class="pose-vis-header">
                    <span class="pose-vis-badge">🎯 TARGET POSE</span>
                    <span class="pose-vis-sanskrit">${config.sanskrit || ""}</span>
                </div>
                <div class="pose-svg-stage">
                    ${config.render()}
                </div>
                <div class="pose-guess-hint">
                    <div class="hint-icon">💡</div>
                    <div class="hint-text">
                        <strong>Pose Goal:</strong> ${config.hint}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Returns thumbnail animated preview for catalog cards
     */
    function getThumbnail(poseKey) {
        const config = poses[poseKey] || poses.tree;
        return `
            <div class="card-animated-preview">
                ${config.render()}
            </div>
        `;
    }

    return {
        render,
        getThumbnail,
        poses
    };
})();

// Export globally
window.PoseVisualizer = PoseVisualizer;
