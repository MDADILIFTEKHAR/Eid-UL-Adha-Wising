/**
 * ==========================================================================
 * EID CINEMATIQUE - INTERACTIVE ENGINE
 * Features: GPU Canvas Physics, Web Audio Synth, Custom Card Image Compiler
 * Author: MDADILIFTEKHAR
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- STATE MANAGEMENT ---
    const state = {
        timeDilation: 1.0,
        currentSlide: 0,
        isPlaying: true,
        climaxActive: false,
        bgPhysics: {
            lanterns: true,
            petals: true,
            sparks: true,
            interactive: true,
            raytracing: true,
            fog: true,
            beatsync: true,
            illumination: true,
            colorGrade: "emerald-gold"
        },
        cardFx: {
            fireworks: true,
            glow: true,
            theme: "emerald"
        },
        audio: {
            initialized: false,
            playing: false,
            context: null,
            synthNode: null,
            analyser: null,
            visualizerId: null,
            beatTimer: null,
            tempo: 80, // BPM
            beatIndex: 0
        }
    };

    // --- DOM REFERENCES ---
    const bgCanvas = document.getElementById("bg-canvas");
    const visualizerCanvas = document.getElementById("visualizer");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const prevSceneBtn = document.getElementById("prev-scene-btn");
    const nextSceneBtn = document.getElementById("next-scene-btn");
    const speedSlider = document.getElementById("speed-slider");
    const speedIndicator = document.getElementById("speed-indicator");
    const cinemaScreen = document.getElementById("cinema-screen");
    const camButtons = document.querySelectorAll(".cam-btn");
    const slides = document.querySelectorAll(".cinema-slide");
    
    // Physics toggles
    const toggleLanterns = document.getElementById("toggle-lanterns");
    const togglePetals = document.getElementById("toggle-petals");
    const toggleSparks = document.getElementById("toggle-sparks");
    const toggleInteractive = document.getElementById("toggle-interactive");

    // AI Console References
    const aiColorGrade = document.getElementById("ai-color-grade");
    const toggleRaytracing = document.getElementById("toggle-raytracing");
    const toggleFog = document.getElementById("toggle-fog");
    const toggleBeatsync = document.getElementById("toggle-beatsync");
    const toggleIllumination = document.getElementById("toggle-illumination");
    const climaxTriggerBtn = document.getElementById("climax-trigger-btn");
    const sceneVal = document.getElementById("scene-detection-val");
    const fpsVal = document.getElementById("fps-val");
    const gpuVal = document.getElementById("gpu-val");
    const particleCountVal = document.getElementById("particle-count-val");

    // Card workshop
    const inputRecipient = document.getElementById("recipient-name");
    const selectBlessing = document.getElementById("card-blessing");
    const themeColors = document.querySelectorAll(".theme-color");
    const wishingCard = document.getElementById("wishing-card");
    const previewRecipient = document.getElementById("preview-recipient");
    const previewBlessing = document.getElementById("preview-blessing");
    const cardToggleFireworks = document.getElementById("card-toggle-fireworks");
    const cardToggleGlow = document.getElementById("card-toggle-glow");
    const cardFxCanvas = document.getElementById("card-fx-canvas");
    const downloadCardBtn = document.getElementById("download-card-btn");
    const shareCardBtn = document.getElementById("share-card-btn");
    const statusToast = document.getElementById("status-toast");
    const soundscapeBtn = document.getElementById("soundscape-btn");

    // NEW Viewport foreground canvas references
    const cinemaCanvas = document.getElementById("cinema-canvas");
    const cinemaCtx = cinemaCanvas ? cinemaCanvas.getContext("2d") : null;
    const aiDirectorLog = document.getElementById("ai-director-log");

    // Melodic Maqam Oud scales (F Maqam Hijaz: F, Gb, A, Bb, C, Db, Eb, F)
    const hijazScale = [
        174.61, // F3
        185.00, // Gb3
        220.00, // A3
        233.08, // Bb3
        261.63, // C4
        277.18, // Db4
        311.13, // Eb4
        349.23, // F4
        369.99, // Gb4
        440.00, // A4
        466.16, // Bb4
        523.25  // C5
    ];

    const maqamPatterns = {
        0: [0, 2, 3, 2, 0, 2, 0, -1], // Scene I: slow mystery suspense
        1: [4, 7, 7, 7, 5, 7, 9, 7], // Scene II: energetic surprise reveal
        2: [4, 5, 7, 6, 7, 5, 4, 2], // Scene III: emotional warm feast
        3: [7, 9, 10, 9, 7, 9, 5, 7], // Scene IV: soaring celebration finale
        climax: [7, 9, 10, 11, 10, 9, 7, 9, 10, 9, 7, 5, 4, 2, 0, 2] // Climax runs
    };

    // AI Director Log Dictionary
    const directorLogs = {
        0: {
            handheld: "🎥 [AI DIRECTOR] HANDHELD CAM: sneaking behind luxury arches. Friends decorating secretly in slow-motion, whispering excitement.",
            drone: "🚁 [AI DIRECTOR] DRONE ZOOM: low crane sweep over dark courtyard. Warm sunset shadows concealing family hiding gifts.",
            orbit: "🔄 [AI DIRECTOR] 360° ORBIT: tracking children preparing glowing lanterns, sharing quiet emotional smiles.",
            wide: "🎬 [AI DIRECTOR] IMAX WIDE: establishing dim courtyard silhouette. Mystical planning background music active."
        },
        1: {
            handheld: "🎥 [AI DIRECTOR] HANDHELD CAM: extreme closeup tracking shocked face on entry! Golden ambient lights suddenly flashing on!",
            drone: "🚁 [AI DIRECTOR] DRONE ZOOM: soaring vertical over door opening. Shouting 'Surprise!' as colorful confetti storm fills screen.",
            orbit: "🔄 [AI DIRECTOR] 360° ORBIT: camera spinning around grand reveal moment. Viewport fireworks bursting dynamically.",
            wide: "🎬 [AI DIRECTOR] IMAX WIDE: wide view of shocked loved one surrounded by massive glowing calligraphy and floating lanterns."
        },
        2: {
            handheld: "🎥 [AI DIRECTOR] HANDHELD CAM: captures emotional tears of happiness and warm hugs. Saffron biryani steaming closeups.",
            drone: "🚁 [AI DIRECTOR] DRONE ZOOM: overhead sweep across royal banquet dinner table. Dates and dry fruits glowing under candlelight.",
            orbit: "🔄 [AI DIRECTOR] 360° ORBIT: camera revolving around family dining together. Global illumination amplifying reflections.",
            wide: "🎬 [AI DIRECTOR] IMAX WIDE: capturing laughing faces and emotional family hugs. Rich Netflix documentary LUT engaged."
        },
        3: {
            handheld: "🎥 [AI DIRECTOR] HANDHELD CAM: low-angle minaret panorama. sky lantern releases rising under glowing crescent moon.",
            drone: "🚁 [AI DIRECTOR] DRONE ZOOM: spectacular aerial above illuminated mosque. Massive firework festival lighting night sky.",
            orbit: "🔄 [AI DIRECTOR] 360° ORBIT: tracking giant glowing Arabic 'Eid Mubarak' calligraphies. Volumetric god rays locked at 8K detail.",
            wide: "🎬 [AI DIRECTOR] IMAX WIDE: entire group standing together looking at sky. Deep emotional orchestral climax playing."
        },
        climax: {
            handheld: "💥 [AI CLIMAX ENGAGED] Handheld camera shakes maximized! Bass-sync explosion pulse drawing intensive fireworks!",
            drone: "💥 [AI CLIMAX ENGAGED] Dramatic speed-ramps zooming over mosque courtyard. Activating gravity-free sky lantern flotilla!",
            orbit: "💥 [AI CLIMAX ENGAGED] 360° orbital around crescent moon minaret. Holographic golden 'Eid Mubarak' calligraphies active!",
            wide: "💥 [AI CLIMAX ENGAGED] Epic Climax Finale: orchestrating synchronized viewport fireworks, sub-bass drops & rapid Oud runs!"
        }
    };

    // --- MOUSE TRACKING ---
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, isDown: false };
    
    window.addEventListener("mousemove", (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    window.addEventListener("mousedown", () => { mouse.isDown = true; });
    window.addEventListener("mouseup", () => { mouse.isDown = false; });
    window.addEventListener("mouseleave", () => {
        mouse.targetX = -1000;
        mouse.targetY = -1000;
    });

    // ==========================================================================
    // 1. BACKGROUND ANTIGRAVITY PHYSICS ENGINE (HTML5 CANVAS)
    // ==========================================================================
    const ctx = bgCanvas.getContext("2d");
    let particles = [];
    const maxParticles = 120;

    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle Classes
    class Lantern {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * bgCanvas.width;
            this.y = initial ? Math.random() * bgCanvas.height : bgCanvas.height + 50;
            this.size = Math.random() * 20 + 15;
            this.speedY = -(Math.random() * 0.4 + 0.2);
            this.swaySpeed = Math.random() * 0.02 + 0.005;
            this.swayAmplitude = Math.random() * 2 + 1;
            this.swayOffset = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.5 + 0.35;
            this.hue = Math.random() > 0.35 ? 43 : 154; // Gold or Emerald
        }

        update() {
            const dt = state.timeDilation;
            this.y += this.speedY * dt;
            this.swayOffset += this.swaySpeed * dt;
            this.x += Math.sin(this.swayOffset) * this.swayAmplitude * 0.15 * dt;

            // Interactive mouse repeller
            if (state.bgPhysics.interactive && mouse.x > 0) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x += (dx / dist) * force * 3 * dt;
                    this.y += (dy / dist) * force * 2 * dt;
                }
            }

            if (this.y < -50 || this.x < -50 || this.x > bgCanvas.width + 50) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.sin(this.swayOffset) * 0.08);
            
            // Outer glow if global illumination active
            if (state.bgPhysics.illumination) {
                ctx.shadowBlur = this.size * 0.95;
                ctx.shadowColor = this.hue === 43 ? "rgba(229, 169, 59, 0.45)" : "rgba(74, 222, 128, 0.35)";
            }
            
            // Draw Lantern Geometry (Islamic Lantern shape)
            ctx.fillStyle = this.hue === 43 ? `rgba(229, 169, 59, ${this.opacity})` : `rgba(6, 43, 24, ${this.opacity})`;
            ctx.strokeStyle = `rgba(229, 169, 59, ${this.opacity + 0.25})`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(0, -this.size * 0.7);
            ctx.quadraticCurveTo(this.size * 0.4, -this.size * 0.3, this.size * 0.4, 0);
            ctx.lineTo(this.size * 0.3, this.size * 0.6);
            ctx.lineTo(-this.size * 0.3, this.size * 0.6);
            ctx.lineTo(-this.size * 0.4, 0);
            ctx.quadraticCurveTo(-this.size * 0.4, -this.size * 0.3, 0, -this.size * 0.7);
            ctx.fill();
            ctx.stroke();

            // Lantern inner light core
            ctx.fillStyle = `rgba(255, 245, 220, ${this.opacity + 0.35})`;
            ctx.beginPath();
            ctx.arc(0, this.size * 0.1, this.size * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Bottom tassel
            ctx.strokeStyle = `rgba(229, 169, 59, ${this.opacity})`;
            ctx.beginPath();
            ctx.moveTo(0, this.size * 0.6);
            ctx.lineTo(0, this.size * 0.95);
            ctx.stroke();

            ctx.restore();
        }
    }

    class RosePetal {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * bgCanvas.width;
            this.y = initial ? Math.random() * bgCanvas.height : -50;
            this.size = Math.random() * 8 + 6;
            this.speedY = Math.random() * 0.6 + 0.3;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() * 0.02 - 0.01);
            this.opacity = Math.random() * 0.5 + 0.35;
            this.swayPhase = Math.random() * Math.PI;
            this.color = Math.random() > 0.4 ? "rgba(229, 169, 59," : "rgba(190, 24, 74,"; // Golden or Ruby petals
        }

        update() {
            const dt = state.timeDilation;
            this.y += this.speedY * dt;
            this.x += (this.speedX + Math.sin(this.swayPhase) * 0.2) * dt;
            this.rotation += this.rotSpeed * dt;
            this.swayPhase += 0.01 * dt;

            // Interactive wind
            if (state.bgPhysics.interactive && mouse.x > 0) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180) {
                    const windForce = (180 - dist) / 180;
                    this.x += (dx / dist) * windForce * 4 * dt;
                    this.y += (dy / dist) * windForce * 2 * dt;
                }
            }

            if (this.y > bgCanvas.height + 20 || this.x < -20 || this.x > bgCanvas.width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `${this.color}${this.opacity})`;
            ctx.shadowBlur = 5;
            ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(this.size * 0.5, -this.size * 0.5, this.size, 0, 0, this.size * 1.5);
            ctx.bezierCurveTo(-this.size, 0, -this.size * 0.5, -this.size * 0.5, 0, 0);
            ctx.fill();
            
            ctx.restore();
        }
    }

    class Spark {
        constructor(x, y, isExplosion = false, customColor = null) {
            this.x = x || Math.random() * bgCanvas.width;
            this.y = y || Math.random() * bgCanvas.height;
            this.size = Math.random() * 2 + 1;
            
            if (isExplosion) {
                const angle = Math.random() * Math.PI * 2;
                const vel = Math.random() * 4.5 + 1.5;
                this.vx = Math.cos(angle) * vel;
                this.vy = Math.sin(angle) * vel;
                this.size = Math.random() * 3.5 + 1.5;
            } else {
                this.vx = Math.random() * 0.4 - 0.2;
                this.vy = -(Math.random() * 0.3 + 0.1);
            }
            
            this.opacity = Math.random() * 0.8 + 0.2;
            this.decay = isExplosion ? (Math.random() * 0.015 + 0.008) : (Math.random() * 0.008 + 0.003);
            this.color = customColor || (Math.random() > 0.2 ? "rgba(229, 169, 59," : "rgba(255, 235, 180,"); // Rich golden sparks
        }

        update() {
            const dt = state.timeDilation;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.opacity -= this.decay * dt;
        }

        draw() {
            ctx.save();
            ctx.fillStyle = `${this.color}${this.opacity})`;
            if (state.bgPhysics.illumination) {
                ctx.shadowBlur = this.size * 5;
                ctx.shadowColor = "rgba(229, 169, 59, 0.85)";
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class LevitatingCandle {
        constructor() {
            this.reset(true);
        }
        reset(initial = false) {
            this.x = Math.random() * bgCanvas.width;
            this.y = initial ? Math.random() * bgCanvas.height : bgCanvas.height + 60;
            this.size = Math.random() * 8 + 6;
            this.speedY = -(Math.random() * 0.25 + 0.1);
            this.swaySpeed = Math.random() * 0.01 + 0.003;
            this.swayAmplitude = Math.random() * 1.5 + 0.5;
            this.swayOffset = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.4 + 0.4;
        }
        update() {
            const dt = state.timeDilation;
            this.y += this.speedY * dt;
            this.swayOffset += this.swaySpeed * dt;
            this.x += Math.sin(this.swayOffset) * this.swayAmplitude * 0.1 * dt;

            // Interactive repeller
            if (state.bgPhysics.interactive && mouse.x > 0) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    this.x += (dx / dist) * 2 * dt;
                }
            }

            if (this.y < -60 || this.x < -60 || this.x > bgCanvas.width + 60) {
                this.reset();
            }
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Candle Base
            ctx.fillStyle = `rgba(255, 235, 180, ${this.opacity * 0.85})`;
            ctx.strokeStyle = `rgba(229, 169, 59, ${this.opacity * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(-this.size * 0.4, -this.size, this.size * 0.8, this.size * 2);
            ctx.fill();
            ctx.stroke();

            // Flame glow
            if (state.bgPhysics.illumination) {
                ctx.shadowBlur = 18;
                ctx.shadowColor = "rgba(249, 115, 22, 0.9)";
            }
            ctx.fillStyle = `rgba(249, 115, 22, ${this.opacity + 0.3})`;
            ctx.beginPath();
            ctx.moveTo(0, -this.size - 2);
            ctx.quadraticCurveTo(this.size * 0.35, -this.size * 0.6, 0, -this.size * 2.2);
            ctx.quadraticCurveTo(-this.size * 0.35, -this.size * 0.6, 0, -this.size - 2);
            ctx.fill();

            // Inner warm flame core
            ctx.fillStyle = `rgba(255, 245, 180, ${this.opacity + 0.4})`;
            ctx.beginPath();
            ctx.arc(0, -this.size * 1.3, this.size * 0.22, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    class CrescentHologram {
        constructor() {
            this.x = bgCanvas.width * 0.82;
            this.y = bgCanvas.height * 0.22;
            this.radius = 45;
            this.angle = 0;
            this.rotSpeed = 0.004;
        }
        update() {
            const dt = state.timeDilation;
            this.angle += this.rotSpeed * dt;
            this.x = bgCanvas.width * 0.82;
            this.y = bgCanvas.height * 0.22;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * 0.2);

            // Orbiting star glow path
            if (state.bgPhysics.illumination) {
                ctx.shadowBlur = 30;
                ctx.shadowColor = "rgba(229, 169, 59, 0.75)";
            }
            
            // Draw Crescent
            ctx.fillStyle = "rgba(229, 169, 59, 0.75)";
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, -Math.PI * 0.5, Math.PI * 0.5, false);
            ctx.arc(this.radius * 0.38, 0, this.radius * 0.85, Math.PI * 0.5, -Math.PI * 0.5, true);
            ctx.closePath();
            ctx.fill();

            // Orbiting star
            const starX = Math.cos(this.angle) * (this.radius * 1.4);
            const starY = Math.sin(this.angle) * (this.radius * 1.4);
            ctx.translate(starX, starY);
            
            ctx.fillStyle = "rgba(255, 245, 200, 0.9)";
            if (state.bgPhysics.illumination) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = "rgba(255, 245, 200, 0.9)";
            }
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 8, Math.sin((18 + i * 72) * Math.PI / 180) * 8);
                ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 3, Math.sin((54 + i * 72) * Math.PI / 180) * 3);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    class LightTrail {
        constructor(x, y, color = null) {
            this.x = x;
            this.y = y;
            this.vx = Math.random() * 2 - 1;
            this.vy = Math.random() * 2 - 1;
            this.size = Math.random() * 4 + 2;
            this.opacity = 1.0;
            this.decay = Math.random() * 0.015 + 0.008;
            this.color = color || "229, 169, 59";
        }
        update() {
            const dt = state.timeDilation;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.opacity -= this.decay * dt;
        }
        draw() {
            ctx.save();
            if (state.bgPhysics.illumination) {
                ctx.shadowBlur = this.size * 6;
                ctx.shadowColor = `rgba(${this.color}, ${this.opacity * 0.8})`;
            }
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class CalligraphyClimax {
        constructor() {
            this.opacity = 0;
            this.targetOpacity = 0;
            this.active = false;
        }
        trigger() {
            this.active = true;
            this.opacity = 0;
            this.targetOpacity = 0.9;
            setTimeout(() => {
                this.targetOpacity = 0;
            }, 6000);
            setTimeout(() => {
                this.active = false;
            }, 12000);
        }
        update() {
            if (!this.active) return;
            this.opacity += (this.targetOpacity - this.opacity) * 0.035 * state.timeDilation;
        }
        draw() {
            if (!this.active || this.opacity <= 0.01) return;
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (state.bgPhysics.illumination) {
                ctx.shadowBlur = 45;
                ctx.shadowColor = "rgba(229, 169, 59, 0.95)";
            }
            ctx.fillStyle = `rgba(229, 169, 59, ${this.opacity})`;
            
            // Draw giant glowing Arabic
            ctx.font = "700 130px 'Cinzel Decorative', serif";
            ctx.fillText("عيد مبارك", bgCanvas.width / 2, bgCanvas.height / 2 - 80);
            
            // Draw secondary English text
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.font = "700 48px 'Cinzel', serif";
            ctx.letterSpacing = "10px";
            ctx.fillText("EID MUBARAK", bgCanvas.width / 2, bgCanvas.height / 2 + 50);
            
            ctx.restore();
        }
    }

    // Instantiation
    const crescentMoon = new CrescentHologram();
    const calligraphyArt = new CalligraphyClimax();

    // Populate Particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            if (i < 20) particles.push(new Lantern());
            else if (i < 50) particles.push(new RosePetal());
            else if (i < 65) particles.push(new LevitatingCandle());
            else particles.push(new Spark());
        }
    }
    initParticles();

    // FPS / Performance tracking metrics
    let lastFrameTime = performance.now();
    let frameTimes = [];

    // Canvas Frame Loop
    function animate() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        // Performance telemetries
        const now = performance.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;
        frameTimes.push(delta);
        if (frameTimes.length > 30) frameTimes.shift();

        // Mouse smoothing interpolation
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // Generate Sparkler effects on active click drag
        if (state.bgPhysics.sparks && mouse.isDown && mouse.x > 0) {
            for (let k = 0; k < 3; k++) {
                particles.push(new Spark(mouse.x, mouse.y, true));
            }
        }

        // Mouse motion light trails
        if (state.bgPhysics.interactive && mouse.x > 0 && Math.random() > 0.45) {
            particles.push(new LightTrail(mouse.x, mouse.y));
        }

        // 1. Draw Crescent Moon & Star Hologram
        crescentMoon.update();
        crescentMoon.draw();

        // 2. Draw and Update Active Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            if (p instanceof Lantern) {
                if (state.bgPhysics.lanterns) {
                    p.update();
                    p.draw();
                }
            } else if (p instanceof RosePetal) {
                if (state.bgPhysics.petals) {
                    p.update();
                    p.draw();
                }
            } else if (p instanceof LevitatingCandle) {
                if (state.bgPhysics.raytracing) {
                    p.update();
                    p.draw();
                }
            } else if (p instanceof LightTrail) {
                p.update();
                if (p.opacity <= 0) {
                    particles.splice(i, 1);
                } else {
                    p.draw();
                }
            } else if (p instanceof Spark) {
                p.update();
                if (p.opacity <= 0) {
                    if (particles.length > maxParticles) {
                        particles.splice(i, 1);
                    } else {
                        particles[i] = new Spark();
                    }
                } else if (state.bgPhysics.sparks) {
                    p.draw();
                }
            }
        }

        // 3. Draw giant Arabic Calligraphy climax overlay
        calligraphyArt.update();
        calligraphyArt.draw();

        requestAnimationFrame(animate);
    }
    animate();

    // ==========================================================================
    // 1.5 FOREGROUND VIEWPONT CANVAS PHYSICS (HTML5 CANVAS)
    // ==========================================================================
    let foregroundParticles = [];

    // Scene-specific interactive particle classes
    class ViewportSteam {
        constructor(w, h) {
            this.w = w;
            this.h = h;
            this.reset(true);
        }
        reset(initial = false) {
            this.x = this.w * (0.32 + Math.random() * 0.36); // Center of food table
            this.y = initial ? Math.random() * this.h * 0.5 + this.h * 0.4 : this.h * 0.8 + Math.random() * 15;
            this.size = Math.random() * 12 + 10;
            this.vx = Math.random() * 0.2 - 0.1;
            this.vy = -(Math.random() * 0.4 + 0.15);
            this.opacity = Math.random() * 0.25 + 0.1;
            this.decay = Math.random() * 0.002 + 0.001;
        }
        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.size += 0.06 * dt;
            this.opacity -= this.decay * dt;
            if (this.opacity <= 0 || this.y < 0) this.reset();
        }
        draw(ctx) {
            ctx.save();
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            grad.addColorStop(0, `rgba(255, 245, 230, ${this.opacity})`);
            grad.addColorStop(1, 'rgba(255, 245, 230, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class ViewportSpice {
        constructor(w, h) {
            this.w = w;
            this.h = h;
            this.reset(true);
        }
        reset(initial = false) {
            this.x = Math.random() * this.w;
            this.y = initial ? Math.random() * this.h : this.h + 20;
            this.size = Math.random() * 3 + 1.5;
            this.speedY = -(Math.random() * 0.3 + 0.1);
            this.swaySpeed = Math.random() * 0.02 + 0.005;
            this.swayAmp = Math.random() * 1.5 + 0.5;
            this.angle = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.5 + 0.35;
        }
        update(dt) {
            this.y += this.speedY * dt;
            this.angle += this.swaySpeed * dt;
            this.x += Math.sin(this.angle) * this.swayAmp * 0.2 * dt;
            if (this.y < -20) this.reset();
        }
        draw(ctx) {
            ctx.save();
            ctx.fillStyle = `rgba(229, 169, 59, ${this.opacity})`;
            ctx.shadowBlur = this.size * 3;
            ctx.shadowColor = "rgba(229, 169, 59, 0.85)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class ViewportSilk {
        constructor(w, h) {
            this.w = w;
            this.h = h;
            this.reset();
        }
        reset() {
            this.points = [];
            const count = 5;
            const startX = -100;
            const startY = this.h * (0.22 + Math.random() * 0.45);
            for (let i = 0; i < count; i++) {
                this.points.push({
                    x: startX + i * (this.w / (count - 1)) * 1.3,
                    y: startY + Math.random() * 40 - 20,
                    baseY: startY,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.015 + 0.005
                });
            }
            this.opacity = Math.random() * 0.22 + 0.12;
            this.color = Math.random() > 0.5 ? "229, 169, 59" : "190, 24, 74"; // Gold or ruby silk
        }
        update(dt) {
            for (let pt of this.points) {
                pt.phase += pt.speed * dt;
                pt.y = pt.baseY + Math.sin(pt.phase) * 32;
                pt.x += 0.25 * dt;
            }
            if (this.points[0].x > this.w + 120) this.reset();
        }
        draw(ctx) {
            ctx.save();
            ctx.strokeStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.lineWidth = 14;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${this.color}, 0.55)`;
            
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                const xc = (this.points[i - 1].x + this.points[i].x) / 2;
                const yc = (this.points[i - 1].y + this.points[i].y) / 2;
                ctx.quadraticCurveTo(this.points[i - 1].x, this.points[i - 1].y, xc, yc);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    class ViewportFirework {
        constructor(w, h, x = null, y = null, color = null) {
            this.w = w;
            this.h = h;
            this.x = x || Math.random() * w;
            this.y = h + 10;
            this.targetY = y || Math.random() * (h * 0.55) + 30;
            this.speed = Math.random() * 3 + 4.5;
            this.exploded = false;
            this.sparks = [];
            this.color = color || (Math.random() > 0.5 ? "229, 169, 59" : (Math.random() > 0.5 ? "74, 222, 128" : "190, 24, 74")); // gold, green, ruby
            synthesizeFireworkSound("launch");
        }
        update(dt) {
            if (!this.exploded) {
                this.y -= this.speed * dt;
                if (this.y <= this.targetY) {
                    this.exploded = true;
                    this.explode();
                }
            } else {
                for (let i = this.sparks.length - 1; i >= 0; i--) {
                    const s = this.sparks[i];
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    s.vy += 0.055 * dt; // gravity
                    s.opacity -= 0.02 * dt;
                    if (s.opacity <= 0) {
                        this.sparks.splice(i, 1);
                    }
                }
            }
        }
        explode() {
            const count = Math.random() * 20 + 25;
            synthesizeFireworkSound("boom");
            if (Math.random() > 0.45) {
                setTimeout(() => synthesizeFireworkSound("crackle"), 160);
            }
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 3.2 + 0.8;
                this.sparks.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    opacity: 1.0,
                    size: Math.random() * 2 + 1
                });
            }
        }
        draw(ctx) {
            if (!this.exploded) {
                ctx.save();
                ctx.fillStyle = `rgba(${this.color}, 0.85)`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.color}, 0.85)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                ctx.save();
                for (const s of this.sparks) {
                    ctx.fillStyle = `rgba(${this.color}, ${s.opacity})`;
                    ctx.shadowBlur = s.size * 3;
                    ctx.shadowColor = `rgba(${this.color}, ${s.opacity})`;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    }

    class ViewportConfetti {
        constructor(w, h, isBurst = false) {
            this.w = w;
            this.h = h;
            this.reset(isBurst);
        }
        reset(isBurst = false) {
            if (isBurst) {
                this.x = this.w * (0.35 + Math.random() * 0.3);
                this.y = this.h * 0.5 + Math.random() * 30;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 4;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 1.8; // blast upwards
            } else {
                this.x = Math.random() * this.w;
                this.y = -15;
                this.vx = Math.random() * 1.8 - 0.9;
                this.vy = Math.random() * 1.2 + 0.8;
            }
            this.sizeW = Math.random() * 6 + 4;
            this.sizeH = Math.random() * 10 + 5;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
            this.opacity = Math.random() * 0.6 + 0.4;
            this.color = `hsl(${Math.random() * 360}, 95%, 60%)`;
        }
        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 0.038 * dt; // slow gravity drift
            this.rotation += this.rotationSpeed * dt;
            this.opacity -= 0.0035 * dt;
        }
        draw(ctx) {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(-this.sizeW/2, -this.sizeH/2, this.sizeW, this.sizeH);
            ctx.restore();
        }
    }

    function initForegroundParticles() {
        foregroundParticles = [];
        if (!cinemaCanvas) return;
        const w = cinemaCanvas.width;
        const h = cinemaCanvas.height;
        
        if (state.currentSlide === 0) { // Scene I: Secret Prep
            for (let i = 0; i < 2; i++) foregroundParticles.push(new ViewportSilk(w, h));
            for (let i = 0; i < 15; i++) foregroundParticles.push(new ViewportSpice(w, h));
        } else if (state.currentSlide === 1) { // Scene II: Surprise Entry
            // Spawn standard falling confetti
            for (let i = 0; i < 30; i++) foregroundParticles.push(new ViewportConfetti(w, h));
            // Trigger massive blast explosion!
            for (let i = 0; i < 22; i++) foregroundParticles.push(new ViewportConfetti(w, h, true));
            // Sound sync!
            synthesizeFireworkSound("boom");
            setTimeout(() => synthesizeFireworkSound("crackle"), 180);
        } else if (state.currentSlide === 2) { // Scene III: Emotional Feast & Tears
            for (let i = 0; i < 8; i++) foregroundParticles.push(new ViewportSteam(w, h));
            for (let i = 0; i < 18; i++) foregroundParticles.push(new ViewportSpice(w, h));
            for (let i = 0; i < 1; i++) foregroundParticles.push(new ViewportSilk(w, h));
        } else if (state.currentSlide === 3) { // Scene IV: Mosque Sky
            // Spawned dynamically on tick
        }
    }

    function resizeCinemaCanvas() {
        if (cinemaCanvas && cinemaScreen) {
            cinemaCanvas.width = cinemaScreen.clientWidth;
            cinemaCanvas.height = cinemaScreen.clientHeight;
            initForegroundParticles();
        }
    }
    resizeCinemaCanvas();
    window.addEventListener("resize", resizeCinemaCanvas);

    function animateCinemaCanvas() {
        if (!cinemaCanvas || !cinemaCtx) {
            requestAnimationFrame(animateCinemaCanvas);
            return;
        }
        
        // Smear background to allow nice cinematic motion blur trails
        cinemaCtx.fillStyle = "rgba(0, 0, 0, 0.24)";
        cinemaCtx.fillRect(0, 0, cinemaCanvas.width, cinemaCanvas.height);

        const dt = state.timeDilation;

        // Periodically spawn random scene-specific sky fireworks or climax bursts
        if (state.currentSlide === 3 && state.isPlaying && !state.climaxActive && Math.random() < 0.015) {
            foregroundParticles.push(new ViewportFirework(cinemaCanvas.width, cinemaCanvas.height));
        }

        // Draw and update active particles
        for (let i = foregroundParticles.length - 1; i >= 0; i--) {
            const p = foregroundParticles[i];
            p.update(dt);
            p.draw(cinemaCtx);
            
            // Cleanup dead elements
            if (p instanceof ViewportFirework && p.exploded && p.sparks.length === 0) {
                foregroundParticles.splice(i, 1);
            }
        }

        // Sim GPU stats sync
        if (fpsVal && Math.random() > 0.9) {
            fpsVal.textContent = (59.0 + Math.random() * 2.0).toFixed(1) + " FPS";
            if (gpuVal) {
                const load = state.climaxActive ? 42 + Math.floor(Math.random() * 8) : 18 + Math.floor(Math.random() * 6);
                gpuVal.textContent = load + "%";
            }
            if (particleCountVal) {
                const total = particles.length + foregroundParticles.length;
                particleCountVal.textContent = `${total} / 300`;
            }
        }

        requestAnimationFrame(animateCinemaCanvas);
    }
    animateCinemaCanvas();


    // ==========================================================================
    // 2. CINEMATIC SCENE SLIDER CONTROLS
    // ==========================================================================
    let sliderTimer = null;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        slides[index].classList.add("active");
        state.currentSlide = index;

        // Sync visual particles inside viewport
        initForegroundParticles();

        // Update real-time AI director log feed
        updateDirectorLog();

        // Sync AI telemetry scene name
        if (sceneVal) {
            const sceneNames = ["SECRET PREPARATION", "SURPRISE ENTRY", "EMOTIONAL REUNION", "MOONLIT FINALE"];
            sceneVal.textContent = sceneNames[index] || "SECRET PREPARATION";
        }
    }

    function nextSlide() {
        let index = state.currentSlide + 1;
        if (index >= slides.length) index = 0;
        showSlide(index);
    }

    function prevSlide() {
        let index = state.currentSlide - 1;
        if (index < 0) index = slides.length - 1;
        showSlide(index);
    }

    function startAutoplay() {
        stopAutoplay();
        if (state.isPlaying) {
            // Slider interval adapts to timeDilation speed!
            const interval = (6000 / state.timeDilation);
            sliderTimer = setInterval(nextSlide, interval);
        }
    }

    function stopAutoplay() {
        if (sliderTimer) {
            clearInterval(sliderTimer);
            sliderTimer = null;
        }
    }

    // Slider Event Listeners
    prevSceneBtn.addEventListener("click", () => {
        prevSlide();
        if (state.isPlaying) startAutoplay();
    });

    nextSceneBtn.addEventListener("click", () => {
        nextSlide();
        if (state.isPlaying) startAutoplay();
    });

    playPauseBtn.addEventListener("click", () => {
        state.isPlaying = !state.isPlaying;
        if (state.isPlaying) {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            playPauseBtn.classList.add("active");
            startAutoplay();
        } else {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playPauseBtn.classList.remove("active");
            stopAutoplay();
        }
    });

    startAutoplay();


    // ==========================================================================
    // 3. DIRECTOR CONTROLS (TIME DILATION, CAMERA VIEWS)
    // ==========================================================================
    
    // Time Dilation Slider
    speedSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        state.timeDilation = val;
        speedIndicator.textContent = val.toFixed(1) + "x";
        
        // Update CSS variable to slow down/speed up CSS animations
        document.documentElement.style.setProperty("--time-dilation", val);
        
        // Dynamically adjust slide intervals if playing
        if (state.isPlaying) {
            startAutoplay();
        }
    });

    // Camera Selector
    camButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            camButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const view = btn.dataset.view;
            
            // Reset all camera and viewport styles
            cinemaScreen.className = "cinema-screen";
            
            // Add matching cinematic angle classes
            if (view === "handheld") {
                cinemaScreen.classList.add("camera-handheld", "view-wide");
            } else if (view === "drone") {
                cinemaScreen.classList.add("camera-drone", "view-wide");
            } else if (view === "orbit") {
                cinemaScreen.classList.add("camera-orbit", "view-wide");
            } else if (view === "wide") {
                cinemaScreen.classList.add("camera-handheld"); // Slight shake on widescreen
            }

            // Sync AI Director narrative log instantly
            updateDirectorLog();
        });
    });

    // Visual Physic Toggles
    toggleLanterns.addEventListener("click", () => {
        state.bgPhysics.lanterns = !state.bgPhysics.lanterns;
        toggleLanterns.classList.toggle("active", state.bgPhysics.lanterns);
    });

    togglePetals.addEventListener("click", () => {
        state.bgPhysics.petals = !state.bgPhysics.petals;
        togglePetals.classList.toggle("active", state.bgPhysics.petals);
    });

    toggleSparks.addEventListener("click", () => {
        state.bgPhysics.sparks = !state.bgPhysics.sparks;
        toggleSparks.classList.toggle("active", state.bgPhysics.sparks);
    });

    toggleInteractive.addEventListener("click", () => {
        state.bgPhysics.interactive = !state.bgPhysics.interactive;
        toggleInteractive.classList.toggle("active", state.bgPhysics.interactive);
    });


    // ==========================================================================
    // 4. WEB AUDIO SYNTHESIZER AND DYNAMIC SOUNDSCAPE
    // ==========================================================================
    let beatInterval = null;

    function triggerBassDrop() {
        if (!state.audio.initialized || !state.audio.playing) return;
        const ctx = state.audio.context;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);
        
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        
        osc.connect(gain);
        gain.connect(state.audio.analyser || ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 1.25);
    }

    function triggerDrumBeat(type = "kick") {
        if (!state.audio.initialized || !state.audio.playing) return;
        const ctx = state.audio.context;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        if (type === "kick") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        } else { // Snare or metallic cymbal clap
            osc.type = "sine";
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        }
        
        osc.connect(gain);
        gain.connect(state.audio.analyser || ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);

        // Fire dynamic beat sync updates
        if (state.bgPhysics.beatsync) {
            onBeatPulse();
        }
    }

    function onBeatPulse() {
        // Visual Cinema Scale Pulse
        if (cinemaScreen) {
            cinemaScreen.style.transform = "scale(1.025)";
            cinemaScreen.style.transition = "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            setTimeout(() => {
                cinemaScreen.style.transform = "";
            }, 150);
        }

        // Spawn a burst of golden sparks inside the background canvas
        const randomX = Math.random() * bgCanvas.width;
        const randomY = Math.random() * bgCanvas.height * 0.4;
        for (let i = 0; i < 4; i++) {
            particles.push(new Spark(randomX, randomY, true));
        }

        // Pulse custom properties or lighting values
        const pulseGlow = document.querySelector(".volumetric-glow");
        if (pulseGlow) {
            pulseGlow.style.opacity = "0.95";
            setTimeout(() => {
                pulseGlow.style.opacity = "";
            }, 200);
        }
    }

    function startBeatSequencer() {
        stopBeatSequencer();
        if (!state.audio.playing) return;
        
        const bpm = state.audio.tempo;
        const intervalMs = (60 / bpm) * 1000 * 0.5; // Eighth notes progression
        
        beatInterval = setInterval(() => {
            if (!state.audio.playing) return;
            const index = state.audio.beatIndex;
            
            // Basic rhythmic drum pattern (kick on 1, 5, snare/cymbal on 3, 7)
            if (index % 4 === 0) {
                triggerDrumBeat("kick");
            } else if (index % 4 === 2) {
                triggerDrumBeat("snare");
            } else if (index % 8 === 7 && Math.random() > 0.6) {
                triggerDrumBeat("kick");
            }
            
            // Algorithmic Hijaz Maqam Oud note synthesis
            const currentPattern = state.climaxActive ? maqamPatterns.climax : maqamPatterns[state.currentSlide];
            const pLength = currentPattern ? currentPattern.length : 0;
            
            let noteDuration = 0.35;
            let shouldPlayNote = false;
            
            if (state.climaxActive) {
                shouldPlayNote = true; // Play rapid climax Maqam runs
                noteDuration = 0.22;
            } else if (state.currentSlide === 0) {
                shouldPlayNote = index % 4 === 0; // Scene I: slow plucked notes (suspense pause)
                noteDuration = 0.65;
            } else if (state.currentSlide === 1) {
                shouldPlayNote = index % 2 === 0; // Scene II: energetic surprise reveal note
                noteDuration = 0.45;
            } else if (state.currentSlide === 2) {
                shouldPlayNote = index % 2 === 0; // Scene III: emotional warm feast plucks
                noteDuration = 0.5;
            } else if (state.currentSlide === 3) {
                shouldPlayNote = index % 2 === 0 || index % 4 === 3; // Scene IV: beautiful soaring arpeggios
                noteDuration = 0.38;
            }

            if (shouldPlayNote && currentPattern && pLength > 0) {
                const scaleIndex = currentPattern[index % pLength];
                if (scaleIndex >= 0) { // Support negative notes as restful pauses
                    const freq = hijazScale[scaleIndex];
                    playOudNote(freq, noteDuration);
                }
            }

            state.audio.beatIndex = (index + 1) % 16;
        }, intervalMs);
    }

    function stopBeatSequencer() {
        if (beatInterval) {
            clearInterval(beatInterval);
            beatInterval = null;
        }
    }

    function initializeAudio() {
        if (state.audio.initialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        state.audio.context = ctx;

        // Analyser Node
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        state.audio.analyser = analyser;

        // Sound Synthesis Circuit
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);

        // Low sweep pad synthesis (Orchestral strings in F minor)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        
        // Dynamic Bandpass filtered white noise for "Spiritual Choir/Hum" simulation
        const noiseNode = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.Q.value = 8.0;
        noiseFilter.frequency.value = 349.23; // F4 choir note
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.055; // Subtle airy hum

        const filter = ctx.createBiquadFilter();
        const delay = ctx.createDelay(1.0);
        const delayGain = ctx.createGain();

        // Serene string drone
        osc1.type = "sine";
        osc1.frequency.value = 174.61; // F3
        
        osc2.type = "sawtooth"; // Rich harmonic texture
        osc2.frequency.value = 220.00; // A3

        subOsc.type = "sine";
        subOsc.frequency.value = 87.31; // F2 deep sub bass

        // Filter sweeps
        filter.type = "lowpass";
        filter.Q.value = 5.0;
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        // Delay loop for cathedral-like reverb
        delay.delayTime.value = 0.65;
        delayGain.gain.value = 0.45;

        // Connecting nodes
        osc1.connect(filter);
        osc2.connect(filter);
        subOsc.connect(filter);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        filter.connect(masterGain);
        filter.connect(delay);
        
        delay.connect(delayGain);
        delayGain.connect(delay); // Delay feedback loop
        delayGain.connect(masterGain);

        masterGain.connect(analyser);
        analyser.connect(ctx.destination);

        // Start Oscillators
        osc1.start();
        osc2.start();
        subOsc.start();
        noiseNode.start();

        // Slow pitch/filter modulation (ambient swell)
        let phase = 0;
        function modulateSynth() {
            if (!state.audio.playing) return;
            
            phase += 0.006;
            // Modulate filter cutoff between 250Hz and 1000Hz
            const cutoff = 620 + Math.sin(phase) * 370;
            filter.frequency.setValueAtTime(cutoff, ctx.currentTime);
            
            // Detune string sweep oscillator
            osc2.frequency.setValueAtTime(220.00 + Math.sin(phase * 1.3) * 2.0, ctx.currentTime);
            noiseFilter.frequency.setValueAtTime(349.23 + Math.sin(phase * 0.8) * 10, ctx.currentTime);
            
            setTimeout(modulateSynth, 50);
        }

        state.audio.synthNode = {
            masterGain,
            modulateSynth,
            noiseNode,
            osc1,
            osc2,
            subOsc
        };

        state.audio.initialized = true;
    }

    // Play/Pause soundscape action
    function toggleAudio() {
        initializeAudio();
        const audio = state.audio;
        const synth = audio.synthNode;
        const now = audio.context.currentTime;

        if (!audio.playing) {
            // Fade-in volume smoothly
            audio.context.resume().then(() => {
                synth.masterGain.gain.cancelScheduledValues(now);
                synth.masterGain.gain.setValueAtTime(synth.masterGain.gain.value, now);
                synth.masterGain.gain.linearRampToValueAtTime(0.38, now + 2.5); // Warm ambient volume
                
                audio.playing = true;
                soundscapeBtn.classList.add("active");
                soundscapeBtn.querySelector("i").className = "fa-solid fa-volume-high";
                
                synth.modulateSynth();
                renderVisualizer();
                startBeatSequencer();
                triggerBassDrop();
            });
        } else {
            // Fade-out volume smoothly to prevent pops
            synth.masterGain.gain.cancelScheduledValues(now);
            synth.masterGain.gain.setValueAtTime(synth.masterGain.gain.value, now);
            synth.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);
            
            stopBeatSequencer();
            setTimeout(() => {
                if (!audio.playing) {
                    audio.context.suspend();
                }
            }, 1600);

            audio.playing = false;
            soundscapeBtn.classList.remove("active");
            soundscapeBtn.querySelector("i").className = "fa-solid fa-volume-xmark";
            cancelAnimationFrame(audio.visualizerId);
            
            // Clean/clear visualizer canvas
            const visCtx = visualizerCanvas.getContext("2d");
            visCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        }
    }

    // Render visualizer canvas bars inside the button
    function renderVisualizer() {
        if (!state.audio.playing) return;

        const visCtx = visualizerCanvas.getContext("2d");
        const width = visualizerCanvas.width = visualizerCanvas.clientWidth;
        const height = visualizerCanvas.height = 6;
        
        const analyser = state.audio.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        analyser.getByteFrequencyData(dataArray);

        visCtx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i] / 255;
            const barHeight = val * height * 1.2;
            
            visCtx.fillStyle = `rgba(229, 169, 59, ${0.3 + val * 0.7})`;
            visCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            
            x += barWidth;
        }

        state.audio.visualizerId = requestAnimationFrame(renderVisualizer);
    }

    soundscapeBtn.addEventListener("click", toggleAudio);


    // ==========================================================================
    // 5. GREETING CARD CREATOR & CANVAS COMPILER ENGINE
    // ==========================================================================
    
    // Live update preview text
    inputRecipient.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        previewRecipient.textContent = val ? `Dear ${val},` : "Dear Blessed One,";
    });

    selectBlessing.addEventListener("change", (e) => {
        previewBlessing.textContent = e.target.value;
    });

    // Theme Selector clicks
    themeColors.forEach(colorBtn => {
        colorBtn.addEventListener("click", () => {
            themeColors.forEach(c => c.classList.remove("active"));
            colorBtn.classList.add("active");
            
            const theme = colorBtn.dataset.theme;
            state.cardFx.theme = theme;
            
            // Switch card background theme styling class
            wishingCard.className = `wishing-card theme-${theme}`;
            if (state.cardFx.glow) wishingCard.classList.add("glow-active");
        });
    });

    // Custom features toggles
    cardToggleFireworks.addEventListener("click", () => {
        state.cardFx.fireworks = !state.cardFx.fireworks;
        cardToggleFireworks.classList.toggle("active", state.cardFx.fireworks);
        if (!state.cardFx.fireworks) {
            const cardCtx = cardFxCanvas.getContext("2d");
            cardCtx.clearRect(0, 0, cardFxCanvas.width, cardFxCanvas.height);
        }
    });

    cardToggleGlow.addEventListener("click", () => {
        state.cardFx.glow = !state.cardFx.glow;
        cardToggleGlow.classList.toggle("active", state.cardFx.glow);
        wishingCard.classList.toggle("glow-active", state.cardFx.glow);
    });

    // Card Fireworks Animation Canvas
    const cardCtx = cardFxCanvas.getContext("2d");
    let cardFireworks = [];

    function resizeCardCanvas() {
        cardFxCanvas.width = wishingCard.clientWidth;
        cardFxCanvas.height = wishingCard.clientHeight;
    }
    resizeCardCanvas();
    // Re-evaluate on window changes or style loads
    setTimeout(resizeCardCanvas, 1000);
    window.addEventListener("resize", resizeCardCanvas);

    class CardFirework {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * cardFxCanvas.width;
            this.y = cardFxCanvas.height + 20;
            this.targetY = Math.random() * (cardFxCanvas.height * 0.5) + 30;
            this.speed = Math.random() * 2 + 3;
            this.exploded = false;
            this.sparks = [];
            
            // Match firework palette to active theme
            const theme = state.cardFx.theme;
            if (theme === "emerald") {
                this.color = Math.random() > 0.4 ? "43, 85%, 55%" : "154, 85%, 50%"; // Gold or Green
            } else if (theme === "sapphire") {
                this.color = Math.random() > 0.4 ? "210, 95%, 65%" : "0, 0%, 100%"; // Ice Blue or White
            } else if (theme === "ruby") {
                this.color = Math.random() > 0.4 ? "345, 90%, 55%" : "43, 85%, 55%"; // Ruby Red or Gold
            } else {
                this.color = Math.random() > 0.3 ? "43, 85%, 55%" : "0, 0%, 95%"; // Gold or Silver
            }
        }

        update() {
            if (!this.exploded) {
                this.y -= this.speed;
                if (this.y <= this.targetY) {
                    this.exploded = true;
                    this.explode();
                }
            } else {
                for (let i = this.sparks.length - 1; i >= 0; i--) {
                    const s = this.sparks[i];
                    s.x += s.vx;
                    s.y += s.vy;
                    s.vy += 0.04; // gravity drag
                    s.opacity -= 0.02;
                    if (s.opacity <= 0) {
                        this.sparks.splice(i, 1);
                    }
                }
                if (this.sparks.length === 0) {
                    this.reset();
                }
            }
        }

        explode() {
            const count = Math.random() * 20 + 25;
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2.2 + 0.6;
                this.sparks.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    opacity: 1.0,
                    size: Math.random() * 1.5 + 0.8
                });
            }
        }

        draw() {
            if (!this.exploded) {
                cardCtx.fillStyle = `hsla(${this.color.split(',')[0]}, 80%, 60%, 0.8)`;
                cardCtx.beginPath();
                cardCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                cardCtx.fill();
            } else {
                for (const s of this.sparks) {
                    cardCtx.fillStyle = `hsla(${this.color.split(',')[0]}, 100%, 75%, ${s.opacity})`;
                    cardCtx.beginPath();
                    cardCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                    cardCtx.fill();
                }
            }
        }
    }

    // Populate Card Fireworks
    for (let i = 0; i < 2; i++) {
        cardFireworks.push(new CardFirework());
    }

    function animateCardFx() {
        if (state.cardFx.fireworks) {
            cardCtx.fillStyle = "rgba(0, 0, 0, 0.15)";
            cardCtx.fillRect(0, 0, cardFxCanvas.width, cardFxCanvas.height);
            
            for (const fw of cardFireworks) {
                fw.update();
                fw.draw();
            }
        }
        requestAnimationFrame(animateCardFx);
    }
    animateCardFx();


    // ==========================================================================
    // 6. CARD EXPORTER (OFFSCREEN CANVAS GRAPHICS COMPILER)
    // ==========================================================================
    
    function compileAndDownloadCard() {
        const recipientName = inputRecipient.value.trim() || "Blessed One";
        const blessingText = selectBlessing.value;
        const theme = state.cardFx.theme;

        // Build premium high-resolution canvas layout (ideal print/share size)
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = 800;
        exportCanvas.height = 1100;
        const eCtx = exportCanvas.getContext("2d");

        // 1. Theme Gradients
        let bgGradient = eCtx.createRadialGradient(400, 550, 50, 400, 550, 600);
        let goldStroke = "#D4AF37";
        let subText = "#a1a1aa";
        
        if (theme === "emerald") {
            bgGradient.addColorStop(0, "#033a1e");
            bgGradient.addColorStop(1, "#011d0f");
            goldStroke = "#D4AF37";
            subText = "#94a3b8";
        } else if (theme === "sapphire") {
            bgGradient.addColorStop(0, "#0c2044");
            bgGradient.addColorStop(1, "#040e21");
            goldStroke = "#ffffff";
            subText = "#cbd5e1";
        } else if (theme === "ruby") {
            bgGradient.addColorStop(0, "#3a0014");
            bgGradient.addColorStop(1, "#1a0008");
            goldStroke = "#F3E5AB";
            subText = "#e2e8f0";
        } else { // Onyx
            bgGradient.addColorStop(0, "#1c1c1c");
            bgGradient.addColorStop(1, "#080808");
            goldStroke = "#D4AF37";
            subText = "#94a3b8";
        }

        eCtx.fillStyle = bgGradient;
        eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // 2. Elegant Border Framing
        eCtx.strokeStyle = goldStroke;
        eCtx.lineWidth = 2;
        eCtx.strokeRect(30, 30, 740, 1040);

        eCtx.strokeStyle = goldStroke;
        eCtx.lineWidth = 0.5;
        eCtx.strokeRect(38, 38, 724, 1024);

        // Corner Corner scroll accents
        const cornerSize = 25;
        eCtx.lineWidth = 4;
        // Top-Left
        eCtx.beginPath();
        eCtx.moveTo(30, 30 + cornerSize);
        eCtx.lineTo(30, 30);
        eCtx.lineTo(30 + cornerSize, 30);
        eCtx.stroke();
        // Top-Right
        eCtx.beginPath();
        eCtx.moveTo(770 - cornerSize, 30);
        eCtx.lineTo(770, 30);
        eCtx.lineTo(770, 30 + cornerSize);
        eCtx.stroke();
        // Bottom-Left
        eCtx.beginPath();
        eCtx.moveTo(30, 1070 - cornerSize);
        eCtx.lineTo(30, 1070);
        eCtx.lineTo(30 + cornerSize, 1070);
        eCtx.stroke();
        // Bottom-Right
        eCtx.beginPath();
        eCtx.moveTo(770 - cornerSize, 1070);
        eCtx.lineTo(770, 1070);
        eCtx.lineTo(770, 1070 - cornerSize);
        eCtx.stroke();

        // 3. Top Ornament Icons
        eCtx.fillStyle = goldStroke;
        eCtx.font = "24px Outfit";
        eCtx.textAlign = "center";
        eCtx.fillText("🌙   🕌   ⭐", 400, 100);

        // 4. Arabic Typography (Visual Calligraphy simulation)
        eCtx.fillStyle = goldStroke;
        eCtx.font = "700 80px Cinzel Decorative";
        eCtx.fillText("عيد مبارك", 400, 260);

        // 5. English Salutation
        eCtx.fillStyle = "#ffffff";
        eCtx.font = "700 45px Cinzel";
        eCtx.letterSpacing = "6px";
        eCtx.fillText("EID MUBARAK", 400, 380);

        // Gold divider line
        eCtx.strokeStyle = goldStroke;
        eCtx.lineWidth = 1;
        eCtx.beginPath();
        eCtx.moveTo(300, 430);
        eCtx.lineTo(500, 430);
        eCtx.stroke();

        // 6. Recipient Name
        eCtx.fillStyle = goldStroke;
        eCtx.font = "700 36px Outfit";
        eCtx.fillText(`Dear ${recipientName},`, 400, 520);

        // 7. Blessing Text wrapping
        eCtx.fillStyle = "#ffffff";
        eCtx.font = "300 24px Outfit";
        wrapText(eCtx, blessingText, 400, 610, 600, 36);

        // 8. Footer Accents
        eCtx.fillStyle = goldStroke;
        eCtx.font = "500 20px Outfit";
        eCtx.fillText("WITH WARMEST RESPECTS & LOVE", 400, 940);
        
        eCtx.fillStyle = subText;
        eCtx.font = "300 16px Outfit";
        eCtx.fillText("CR A F TE D   V I A   E I D   C I N E M A T I Q U E", 400, 980);

        // Trigger down-load sequence
        const dataUrl = exportCanvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `Eid_Mubarak_${recipientName.replace(/\s+/g, '_')}.png`;
        downloadLink.href = dataUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    // Helper text wrapper algorithm
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, currentY);
    }

    // Clipboard sharer copy mechanism
    function copyShareableMessage() {
        const recipientName = inputRecipient.value.trim() || "Blessed One";
        const blessingText = selectBlessing.value;
        
        const textToCopy = `🌙 *Eid-Ul-Adha Mubarak!* 🌙\n\nDear *${recipientName}*,\n\n"${blessingText}"\n\n✨ _Wishing you absolute peace, joy, and spiritual happiness on this sacred day._ ✨\n\n---\nCreated with *Eid Cinematique* (https://github.com/MDADILIFTEKHAR/Eid-UL-Adha-Wising)`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Trigger toast notification
            statusToast.style.display = "block";
            statusToast.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                statusToast.style.display = "none";
            }, 3000);
        }).catch(err => {
            console.error("Could not copy greeting: ", err);
        });
    }

    // ==========================================================================
    // 7. REAL-TIME AUDITORY SYNTHESIZERS AND CLIMAX WIRE-UP
    // ==========================================================================

    function playOudNote(freq, duration = 0.5) {
        if (!state.audio.initialized || !state.audio.playing) return;
        const ctx = state.audio.context;
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Blended Oud Timbre: Triangle warm core + detuned Sawtooth high string harmonics
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(freq * 1.004 + 0.2, now); // Detuned string-pair simulation
        
        const osc2Gain = ctx.createGain();
        osc2Gain.gain.setValueAtTime(0.06, now);
        osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        
        // String pluck dynamic filter envelope
        filter.type = "lowpass";
        filter.Q.setValueAtTime(5.0, now);
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(350, now + 0.16);

        // Amplitude Pluck Envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.28, now + 0.004); // high sharp pluck attack
        gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.12);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // smooth string damping

        // Connecting Oud plucker
        osc1.connect(filter);
        osc2.connect(osc2Gain);
        osc2Gain.connect(filter);

        filter.connect(gainNode);
        if (state.audio.analyser) {
            gainNode.connect(state.audio.analyser);
        } else {
            gainNode.connect(ctx.destination);
        }

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration + 0.06);
        osc2.stop(now + duration + 0.06);
    }

    function synthesizeFireworkSound(type) {
        if (!state.audio.initialized || !state.audio.playing) return;
        const ctx = state.audio.context;
        const now = ctx.currentTime;

        const masterGain = ctx.createGain();
        
        if (type === "launch") {
            // High whistling dynamic rise
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.exponentialRampToValueAtTime(1500, now + 0.35);

            gain.gain.setValueAtTime(0.03, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.36);
        } else if (type === "boom") {
            // High intensity cinema sub-bass boom
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(25, now + 0.55);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(280, now);

            gain.gain.setValueAtTime(0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.56);
        } else if (type === "crackle") {
            // Procedural chopped sparkler crackles
            const bufferSize = ctx.sampleRate * 0.22;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseNode = ctx.createBufferSource();
            noiseNode.buffer = noiseBuffer;

            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(2000, now);
            filter.Q.setValueAtTime(8.0, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            
            // Rapid chopped envelope simulator
            for (let t = 0; t < 0.18; t += 0.032) {
                gain.gain.setValueAtTime(Math.random() * 0.06 + 0.02, now + t);
                gain.gain.setValueAtTime(0.001, now + t + 0.012);
            }
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            noiseNode.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            noiseNode.start(now);
            noiseNode.stop(now + 0.23);
        }

        if (state.audio.analyser) {
            masterGain.connect(state.audio.analyser);
        } else {
            masterGain.connect(ctx.destination);
        }
    }

    function updateDirectorLog() {
        if (!aiDirectorLog) return;
        
        let activeCam = "handheld";
        camButtons.forEach(btn => {
            if (btn.classList.contains("active")) {
                activeCam = btn.dataset.view || "handheld";
            }
        });

        let logText = "";
        if (state.climaxActive) {
            logText = directorLogs.climax[activeCam] || directorLogs.climax.wide;
        } else {
            const sceneLogs = directorLogs[state.currentSlide];
            if (sceneLogs) {
                logText = sceneLogs[activeCam] || sceneLogs.handheld;
            }
        }
        
        aiDirectorLog.textContent = logText || "SYSTEM RUNNING IN 8K CINEMATIQUE PRESET...";
    }

    // Connect Climax Sequencer Event
    climaxTriggerBtn.addEventListener("click", () => {
        if (state.climaxActive) return;

        // Auto initialize audio nodes if not activated
        if (!state.audio.initialized) {
            initializeAudio();
        }
        if (!state.audio.playing) {
            toggleAudio();
        }

        state.climaxActive = true;

        // Trigger screen shakes
        if (cinemaScreen) {
            cinemaScreen.className = "cinema-screen camera-climax-shake view-wide";
        }

        // Trigger background Arabic calligraphy reveal
        if (calligraphyArt) {
            calligraphyArt.trigger();
        }

        // Speed up audio beat rhythm tempo
        state.audio.tempo = 112;
        startBeatSequencer();

        // Launch initial synchronized massive sub-bass explosion
        synthesizeFireworkSound("boom");
        setTimeout(() => synthesizeFireworkSound("crackle"), 180);

        // Update director telemetry
        updateDirectorLog();

        // Dynamic climax viewport firework storm interval
        let climaxInterval = setInterval(() => {
            if (!state.climaxActive) {
                clearInterval(climaxInterval);
                return;
            }
            if (cinemaCanvas) {
                foregroundParticles.push(new ViewportFirework(cinemaCanvas.width, cinemaCanvas.height));
            }
        }, 400);

        // Climax Timeline End
        setTimeout(() => {
            state.climaxActive = false;
            clearInterval(climaxInterval);

            // Revert viewport styles to normal
            if (cinemaScreen) {
                cinemaScreen.className = "cinema-screen view-wide";
                let activeCam = "handheld";
                camButtons.forEach(btn => {
                    if (btn.classList.contains("active")) {
                        activeCam = btn.dataset.view || "handheld";
                    }
                });
                cinemaScreen.className = `cinema-screen camera-${activeCam} view-wide`;
            }

            // Restore serene pacing tempo
            state.audio.tempo = 80;
            startBeatSequencer();

            // Re-sync director narrative logs
            updateDirectorLog();

        }, 6000);
    });

    // Initialize first telemetry log and particles
    setTimeout(() => {
        updateDirectorLog();
        initForegroundParticles();
    }, 1000);

    // Hook standard events
    downloadCardBtn.addEventListener("click", compileAndDownloadCard);
    shareCardBtn.addEventListener("click", copyShareableMessage);

});
