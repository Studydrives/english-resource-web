'use strict';

/**
 * HUFLIT English Hub
 * Cosmic Easter Egg — Cinematic Universe Experience
 */

(() => {
    const CONFIG = Object.freeze({
        requiredClicks: 5,
        clickWindow: 2500,
        duration: 10000,
        fadeDuration: 700,
        starCount: 260,
        maxPixelRatio: 2
    });

    const SCENES = Object.freeze([
        {
            id: 'solar',
            title: 'Solar System',
            description: 'A journey through our solar system.'
        },
        {
            id: 'galaxy',
            title: 'Spiral Galaxy',
            description: 'Explore the beauty of the Milky Way.'
        },
        {
            id: 'meteor',
            title: 'Meteor Shower',
            description: 'Watch the stars cross the universe.'
        }
    ]);

    const PLANETS = [
        'Mercury',
        'Venus',
        'Earth',
        'Mars',
        'Jupiter'
    ];

    let clickCount = 0;
    let clickResetTimer = null;
    let activeExperience = null;

    const reducedMotionQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text) {
            element.textContent = text;
        }

        return element;
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomScene() {
        return SCENES[Math.floor(Math.random() * SCENES.length)];
    }

    /* =========================================
       SOLAR SYSTEM
    ========================================= */

    function createSolarSystem() {
        const system = createElement(
            'div',
            'cosmic-solar-system'
        );

        const sun = createElement(
            'div',
            'cosmic-sun'
        );

        sun.setAttribute('aria-hidden', 'true');
        system.appendChild(sun);

        const orbitNames = [
            'one',
            'two',
            'three',
            'four',
            'five'
        ];

        orbitNames.forEach((name, index) => {
            const orbit = createElement(
                'div',
                `cosmic-orbit cosmic-orbit--${name}`
            );

            const planet = createElement(
                'div',
                'cosmic-planet'
            );

            planet.setAttribute('aria-hidden', 'true');
            planet.dataset.planet = PLANETS[index];

            if (index === 4) {
                planet.classList.add('cosmic-planet--ring');
            }

            orbit.appendChild(planet);
            system.appendChild(orbit);
        });

        return system;
    }

    /* =========================================
       SPIRAL GALAXY
    ========================================= */

    function createGalaxy() {
        const galaxy = createElement(
            'div',
            'cosmic-galaxy'
        );

        const core = createElement(
            'div',
            'cosmic-galaxy-core'
        );

        galaxy.setAttribute('aria-hidden', 'true');
        core.setAttribute('aria-hidden', 'true');

        galaxy.appendChild(core);

        return galaxy;
    }

    function createSceneContent(scene) {
        switch (scene.id) {
            case 'solar':
                return createSolarSystem();

            case 'galaxy':
                return createGalaxy();

            case 'meteor':
            default:
                return createElement(
                    'div',
                    'cosmic-meteor-scene'
                );
        }
    }

    /* =========================================
       CANVAS ENGINE
    ========================================= */

    function createStars(canvas, sceneId) {
        const context = canvas.getContext('2d', {
            alpha: true
        });

        if (!context) {
            return () => {};
        }

        let width = 0;
        let height = 0;
        let pixelRatio = 1;
        let animationFrame = null;
        let lastMeteorTime = 0;
        let lastFrameTime = 0;
        let disposed = false;

        const stars = [];
        const meteors = [];
        const galaxyParticles = [];

        const reducedMotion = reducedMotionQuery.matches;

        function resizeCanvas() {
            pixelRatio = Math.min(
                window.devicePixelRatio || 1,
                CONFIG.maxPixelRatio
            );

            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = Math.round(width * pixelRatio);
            canvas.height = Math.round(height * pixelRatio);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            context.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
            );

            createStarField();
            createGalaxyParticles();
        }

        /* Star field */

        function createStarField() {
            stars.length = 0;

            const density = Math.min(
                CONFIG.starCount,
                Math.max(
                    100,
                    Math.floor(width * height / 5500)
                )
            );

            for (let index = 0; index < density; index += 1) {
                stars.push({
                    x: random(0, width),
                    y: random(0, height),
                    radius: random(.35, 1.7),
                    opacity: random(.2, .9),
                    phase: random(0, Math.PI * 2),
                    speed: random(.4, 1.8),
                    temperature: random(0, 1)
                });
            }
        }

        function drawStars(time) {
            stars.forEach((star) => {
                const twinkle = reducedMotion
                    ? 1
                    : .62 + Math.sin(
                        time * .001 * star.speed + star.phase
                    ) * .38;

                const alpha = star.opacity * twinkle;

                let color = '225,232,255';

                if (star.temperature > .85) {
                    color = '255,219,190';
                } else if (star.temperature < .15) {
                    color = '174,205,255';
                }

                context.beginPath();

                context.arc(
                    star.x,
                    star.y,
                    star.radius,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    `rgba(${color},${alpha})`;

                context.fill();

                if (star.radius > 1.4) {
                    context.beginPath();

                    context.arc(
                        star.x,
                        star.y,
                        star.radius * 3,
                        0,
                        Math.PI * 2
                    );

                    context.fillStyle =
                        `rgba(${color},${alpha * .08})`;

                    context.fill();
                }
            });
        }

        /* Galaxy dust particles */

        function createGalaxyParticles() {
            galaxyParticles.length = 0;

            if (sceneId !== 'galaxy') {
                return;
            }

            const centerX = width / 2;
            const centerY = height / 2;

            const baseRadius = Math.min(width, height) * .43;

            for (let index = 0; index < 850; index += 1) {
                const arm = index % 4;

                const distance = Math.sqrt(
                    Math.random()
                ) * baseRadius;

                const angle =
                    distance * .014 +
                    arm * (Math.PI / 2) +
                    random(-.25, .25);

                const spread = random(-18, 18) *
                    (distance / baseRadius);

                galaxyParticles.push({
                    x: centerX +
                        Math.cos(angle) * distance +
                        spread,

                    y: centerY +
                        Math.sin(angle) * distance +
                        spread,

                    radius: random(.3, 1.5),
                    opacity: random(.08, .65),
                    phase: random(0, Math.PI * 2),
                    speed: random(.2, .8),

                    hue: random(210, 290)
                });
            }
        }

        function drawGalaxyParticles(time) {
            if (sceneId !== 'galaxy') {
                return;
            }

            const centerX = width / 2;
            const centerY = height / 2;

            galaxyParticles.forEach((particle) => {
                const twinkle = reducedMotion
                    ? 1
                    : .7 + Math.sin(
                        time * .001 * particle.speed +
                        particle.phase
                    ) * .3;

                const alpha = particle.opacity * twinkle;

                context.beginPath();

                context.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    `hsla(${particle.hue},85%,82%,${alpha})`;

                context.fill();
            });

            const glow = context.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                Math.min(width, height) * .35
            );

            glow.addColorStop(
                0,
                'rgba(205,180,255,.12)'
            );

            glow.addColorStop(
                .35,
                'rgba(116,100,220,.045)'
            );

            glow.addColorStop(
                1,
                'rgba(70,90,180,0)'
            );

            context.fillStyle = glow;
            context.fillRect(0, 0, width, height);
        }

        /* Meteor shower */

        function spawnMeteor() {
            const angle = random(
                Math.PI * .12,
                Math.PI * .38
            );

            const speed = random(7, 17);
            const length = random(65, 230);

            meteors.push({
                x: random(width * .25, width * 1.15),
                y: random(-height * .35, height * .65),

                vx: -Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,

                length,
                speed,
                opacity: random(.65, 1),

                width: random(1, 2.8),
                life: 1,

                color: Math.random() > .75
                    ? '180,215,255'
                    : '255,255,255'
            });
        }

        function drawMeteor(meteor) {
            const tailX =
                meteor.x - meteor.vx * meteor.length / meteor.speed;

            const tailY =
                meteor.y - meteor.vy * meteor.length / meteor.speed;

            const gradient = context.createLinearGradient(
                meteor.x,
                meteor.y,
                tailX,
                tailY
            );

            gradient.addColorStop(
                0,
                `rgba(${meteor.color},${meteor.opacity})`
            );

            gradient.addColorStop(
                .25,
                `rgba(${meteor.color},${meteor.opacity * .55})`
            );

            gradient.addColorStop(
                1,
                `rgba(${meteor.color},0)`
            );

            context.save();

            context.beginPath();
            context.moveTo(meteor.x, meteor.y);
            context.lineTo(tailX, tailY);

            context.strokeStyle = gradient;
            context.lineWidth = meteor.width;
            context.lineCap = 'round';

            context.shadowBlur = 16;
            context.shadowColor =
                `rgba(${meteor.color},.8)`;

            context.stroke();

            context.beginPath();

            context.arc(
                meteor.x,
                meteor.y,
                meteor.width * 1.6,
                0,
                Math.PI * 2
            );

            context.fillStyle = '#fff';
            context.shadowBlur = 20;
            context.fill();

            context.restore();

            meteor.x += meteor.vx;
            meteor.y += meteor.vy;
            meteor.opacity -= .009;
            meteor.life -= .008;
        }

        function drawMeteors() {
            meteors.forEach(drawMeteor);

            for (
                let index = meteors.length - 1;
                index >= 0;
                index -= 1
            ) {
                const meteor = meteors[index];

                if (
                    meteor.x < -meteor.length ||
                    meteor.y > height + meteor.length ||
                    meteor.opacity <= 0 ||
                    meteor.life <= 0
                ) {
                    meteors.splice(index, 1);
                }
            }
        }

        /* Solar ambient particles */

        function drawSolarDust(time) {
            if (sceneId !== 'solar') {
                return;
            }

            const centerX = width / 2;
            const centerY = height / 2;

            const radius = Math.min(width, height) * .46;

            for (let index = 0; index < 38; index += 1) {
                const angle =
                    time * .00008 +
                    index * (Math.PI * 2 / 38);

                const distance =
                    radius * (.35 + (index % 5) * .13);

                const x =
                    centerX + Math.cos(angle) * distance;

                const y =
                    centerY + Math.sin(angle) * distance;

                const alpha =
                    .15 + Math.sin(time * .001 + index) * .1;

                context.beginPath();

                context.arc(
                    x,
                    y,
                    index % 4 === 0 ? 1.5 : .7,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    `rgba(255,205,135,${Math.max(0, alpha)})`;

                context.fill();
            }
        }

        /* Main animation loop */

        function animate(time = 0) {
            if (disposed) {
                return;
            }

            const delta = Math.min(
                time - lastFrameTime || 16,
                40
            );

            lastFrameTime = time;

            context.clearRect(0, 0, width, height);

            drawStars(time);
            drawGalaxyParticles(time);
            drawSolarDust(time);

            if (sceneId === 'meteor' && !reducedMotion) {
                if (
                    time - lastMeteorTime >
                    random(350, 950)
                ) {
                    spawnMeteor();

                    if (Math.random() > .72) {
                        spawnMeteor();
                    }

                    lastMeteorTime = time;
                }

                drawMeteors();
            }

            if (!reducedMotion) {
                animationFrame =
                    window.requestAnimationFrame(animate);
            }
        }

        resizeCanvas();
        animate();

        window.addEventListener(
            'resize',
            resizeCanvas,
            { passive: true }
        );

        return () => {
            if (disposed) {
                return;
            }

            disposed = true;

            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }

            window.removeEventListener(
                'resize',
                resizeCanvas
            );

            stars.length = 0;
            meteors.length = 0;
            galaxyParticles.length = 0;
        };
    }

    /* =========================================
       EXPERIENCE CLEANUP
    ========================================= */

    function closeExperience() {
        if (!activeExperience) {
            return;
        }

        const experience = activeExperience;

        activeExperience = null;

        window.clearTimeout(experience.fadeTimer);
        window.clearTimeout(experience.removeTimer);

        experience.element.classList.add('is-leaving');

        experience.removeTimer = window.setTimeout(() => {
            experience.cleanupCanvas();

            experience.element.remove();

            document.body.style.overflow =
                experience.previousOverflow;

            if (
                experience.previousFocus &&
                experience.previousFocus.isConnected
            ) {
                experience.previousFocus.focus({
                    preventScroll: true
                });
            }
        }, CONFIG.fadeDuration);
    }

    /* =========================================
       EXPERIENCE CREATION
    ========================================= */

    function activateExperience() {
        if (activeExperience) {
            return;
        }

        const scene = getRandomScene();

        const previousOverflow =
            document.body.style.overflow;

        const previousFocus = document.activeElement;

        const overlay = createElement(
            'div',
            'cosmic-experience'
        );

        overlay.dataset.scene = scene.id;

        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        overlay.setAttribute(
            'aria-label',
            `${scene.title} experience`
        );

        overlay.setAttribute('tabindex', '-1');

        const canvas = createElement(
            'canvas',
            'cosmic-canvas'
        );

        canvas.setAttribute('aria-hidden', 'true');

        const nebula = createElement(
            'div',
            'cosmic-nebula'
        );

        nebula.setAttribute('aria-hidden', 'true');

        const sceneContainer = createElement(
            'div',
            'cosmic-scene'
        );

        const heading = createElement(
            'div',
            'cosmic-heading'
        );

        const eyebrow = createElement(
            'span',
            'cosmic-eyebrow',
            'HUFLIT ENGLISH HUB • SECRET EXPERIENCE'
        );

        const title = createElement(
            'h2',
            'cosmic-title',
            scene.title
        );

        const description = createElement(
            'p',
            'cosmic-description',
            scene.description
        );

        heading.append(
            eyebrow,
            title,
            description
        );

        const exitButton = createElement(
            'button',
            'cosmic-exit',
            'SKIP EXPERIENCE'
        );

        exitButton.type = 'button';

        exitButton.setAttribute(
            'aria-label',
            'Đóng hiệu ứng vũ trụ'
        );

        exitButton.addEventListener(
            'click',
            closeExperience
        );

        sceneContainer.appendChild(
            createSceneContent(scene)
        );

        overlay.append(
            canvas,
            nebula,
            sceneContainer,
            heading,
            exitButton
        );

        const cleanupCanvas = createStars(
            canvas,
            scene.id
        );

        function handleEscape(event) {
            if (
                event.key === 'Escape' &&
                activeExperience
            ) {
                event.preventDefault();
                closeExperience();
            }
        }

        function handleFocus(event) {
            if (
                event.key !== 'Tab' ||
                !activeExperience
            ) {
                return;
            }

            event.preventDefault();
            exitButton.focus();
        }

        overlay.addEventListener(
            'keydown',
            handleEscape
        );

        overlay.addEventListener(
            'keydown',
            handleFocus
        );

        activeExperience = {
            element: overlay,
            cleanupCanvas,
            previousOverflow,
            previousFocus,
            fadeTimer: null,
            removeTimer: null
        };

        document.body.appendChild(overlay);

        document.body.style.overflow = 'hidden';

        window.requestAnimationFrame(() => {
            if (!activeExperience) {
                return;
            }

            overlay.classList.add('is-visible');

            overlay.focus({
                preventScroll: true
            });
        });

        activeExperience.fadeTimer =
            window.setTimeout(() => {
                if (!activeExperience) {
                    return;
                }

                closeExperience();
            }, CONFIG.duration);
    }

    /* =========================================
       LOGO CLICK TRIGGER
    ========================================= */

    function handleLogoClick() {
        if (activeExperience) {
            return;
        }

        clickCount += 1;

        window.clearTimeout(clickResetTimer);

        clickResetTimer = window.setTimeout(() => {
            clickCount = 0;
        }, CONFIG.clickWindow);

        if (clickCount >= CONFIG.requiredClicks) {
            clickCount = 0;

            window.clearTimeout(clickResetTimer);

            activateExperience();
        }
    }

    /* =========================================
       INITIALIZATION
    ========================================= */

    function initialize() {
        const trigger = document.querySelector(
            '[data-easter-egg-trigger]'
        );

        if (!trigger) {
            console.warn(
                '[Cosmic Easter Egg] Logo trigger not found.'
            );

            return;
        }

        trigger.addEventListener(
            'click',
            handleLogoClick
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();
