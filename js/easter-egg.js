'use strict';

/**
 * HUFLIT English Hub
 * Cosmic Easter Egg — Random Universe Experience
 */

(() => {
    const CONFIG = Object.freeze({
        requiredClicks: 5,
        clickWindow: 2500,
        duration: 10000,
        fadeDuration: 700,
        starCount: 180
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

    let clickCount = 0;
    let clickResetTimer = null;
    let activeExperience = null;

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

    function getRandomScene() {
        return SCENES[Math.floor(Math.random() * SCENES.length)];
    }

    function createSolarSystem() {
        const system = createElement('div', 'cosmic-solar-system');
        const sun = createElement('div', 'cosmic-sun');

        sun.setAttribute('aria-hidden', 'true');
        system.appendChild(sun);

        for (let index = 1; index <= 5; index += 1) {
            const orbit = createElement(
                'div',
                `cosmic-orbit cosmic-orbit--${[
                    'one',
                    'two',
                    'three',
                    'four',
                    'five'
                ][index - 1]}`
            );

            const planet = createElement('div', 'cosmic-planet');

            if (index === 5) {
                planet.classList.add('cosmic-planet--ring');
            }

            orbit.appendChild(planet);
            system.appendChild(orbit);
        }

        return system;
    }

    function createGalaxy() {
        const galaxy = createElement('div', 'cosmic-galaxy');
        const core = createElement('div', 'cosmic-galaxy-core');

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
                return createElement('div', 'cosmic-meteor-scene');
        }
    }

    function createStars(canvas, sceneId) {
        const context = canvas.getContext('2d');

        if (!context) {
            return () => {};
        }

        let width = 0;
        let height = 0;
        let animationFrame = null;
        let lastMeteorTime = 0;

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        const stars = [];
        const meteors = [];

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function resizeCanvas() {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);

            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);

            context.setTransform(ratio, 0, 0, ratio, 0, 0);

            stars.length = 0;

            for (let index = 0; index < CONFIG.starCount; index += 1) {
                stars.push({
                    x: random(0, width),
                    y: random(0, height),
                    radius: random(.4, 1.8),
                    opacity: random(.25, .95),
                    phase: random(0, Math.PI * 2),
                    speed: random(.5, 1.8)
                });
            }
        }

        function spawnMeteor() {
            meteors.push({
                x: random(width * .25, width * 1.1),
                y: random(-height * .2, height * .7),
                length: random(70, 190),
                speed: random(8, 15),
                opacity: random(.65, 1)
            });
        }

        function drawStars(time) {
            context.clearRect(0, 0, width, height);

            stars.forEach((star) => {
                const twinkle = reducedMotion
                    ? 1
                    : .65 + Math.sin(
                        time * .001 * star.speed + star.phase
                    ) * .35;

                context.beginPath();
                context.arc(
                    star.x,
                    star.y,
                    star.radius,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    `rgba(225, 232, 255, ${star.opacity * twinkle})`;

                context.fill();
            });
        }

        function drawMeteors() {
            meteors.forEach((meteor) => {
                const gradient = context.createLinearGradient(
                    meteor.x,
                    meteor.y,
                    meteor.x + meteor.length,
                    meteor.y - meteor.length * .55
                );

                gradient.addColorStop(0, 'rgba(255,255,255,0)');
                gradient.addColorStop(1, `rgba(210,230,255,${meteor.opacity})`);

                context.beginPath();
                context.moveTo(meteor.x, meteor.y);
                context.lineTo(
                    meteor.x + meteor.length,
                    meteor.y - meteor.length * .55
                );

                context.strokeStyle = gradient;
                context.lineWidth = 2;
                context.stroke();

                context.beginPath();
                context.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
                context.fillStyle = '#fff';
                context.fill();

                meteor.x -= meteor.speed;
                meteor.y += meteor.speed * .55;
                meteor.opacity -= .006;
            });

            for (let index = meteors.length - 1; index >= 0; index -= 1) {
                const meteor = meteors[index];

                if (
                    meteor.x < -meteor.length ||
                    meteor.y > height + meteor.length ||
                    meteor.opacity <= 0
                ) {
                    meteors.splice(index, 1);
                }
            }
        }

        function animate(time = 0) {
            drawStars(time);

            if (sceneId === 'meteor' && !reducedMotion) {
                if (time - lastMeteorTime > random(450, 1100)) {
                    spawnMeteor();
                    lastMeteorTime = time;
                }

                drawMeteors();
            }

            if (!reducedMotion) {
                animationFrame = window.requestAnimationFrame(animate);
            }
        }

        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }

            window.removeEventListener('resize', resizeCanvas);
        };
    }

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

            document.body.style.overflow = experience.previousOverflow;
        }, CONFIG.fadeDuration);
    }

    function activateExperience() {
        if (activeExperience) {
            return;
        }

        const scene = getRandomScene();
        const previousOverflow = document.body.style.overflow;

        const overlay = createElement('div', 'cosmic-experience');
        overlay.dataset.scene = scene.id;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', `${scene.title} experience`);
        overlay.setAttribute('tabindex', '-1');

        const canvas = createElement('canvas', 'cosmic-canvas');
        canvas.setAttribute('aria-hidden', 'true');

        const nebula = createElement('div', 'cosmic-nebula');
        nebula.setAttribute('aria-hidden', 'true');

        const sceneContainer = createElement('div', 'cosmic-scene');

        const heading = createElement('div', 'cosmic-heading');
        const eyebrow = createElement(
            'span',
            'cosmic-eyebrow',
            'HUFLIT ENGLISH HUB • SECRET EXPERIENCE'
        );

        const title = createElement('h2', 'cosmic-title', scene.title);
        const description = createElement(
            'p',
            'cosmic-description',
            scene.description
        );

        heading.append(eyebrow, title, description);

        const exitButton = createElement(
            'button',
            'cosmic-exit',
            'SKIP EXPERIENCE'
        );

        exitButton.type = 'button';
        exitButton.setAttribute('aria-label', 'Đóng hiệu ứng vũ trụ');
        exitButton.addEventListener('click', closeExperience);

        sceneContainer.appendChild(createSceneContent(scene));

        overlay.append(
            canvas,
            nebula,
            sceneContainer,
            heading,
            exitButton
        );

        const cleanupCanvas = createStars(canvas, scene.id);

        activeExperience = {
            element: overlay,
            cleanupCanvas,
            previousOverflow,
            fadeTimer: null,
            removeTimer: null
        };

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        window.requestAnimationFrame(() => {
            overlay.classList.add('is-visible');
            overlay.focus({ preventScroll: true });
        });

        function handleEscape(event) {
            if (event.key === 'Escape' && activeExperience) {
                closeExperience();
            }
        }

        overlay.addEventListener('keydown', handleEscape);

        activeExperience.fadeTimer = window.setTimeout(() => {
            if (!activeExperience) {
                return;
            }

            overlay.classList.add('is-leaving');

            activeExperience.removeTimer = window.setTimeout(() => {
                if (!activeExperience) {
                    return;
                }

                cleanupCanvas();
                overlay.remove();
                document.body.style.overflow = previousOverflow;
                activeExperience = null;
            }, CONFIG.fadeDuration);
        }, CONFIG.duration - CONFIG.fadeDuration);

        overlay.addEventListener('remove', () => {
            overlay.removeEventListener('keydown', handleEscape);
        }, { once: true });
    }

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

    function initialize() {
        const trigger = document.querySelector(
            '[data-easter-egg-trigger]'
        );

        if (!trigger) {
            console.warn('[Cosmic Easter Egg] Logo trigger not found.');
            return;
        }

        trigger.addEventListener('click', handleLogoClick);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, {
            once: true
        });
    } else {
        initialize();
    }
})();
