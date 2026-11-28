'use strict';

/**
 * HUFLIT English Hub
 * Immersive 3D Cosmic Easter Eggs
 *
 * Three.js WebGL experience:
 * - Solar System: 8 planets, procedural textures, atmosphere, rings, asteroid belt.
 * - Spiral Galaxy: 55,000 particles, spiral arms, nebulae and luminous core.
 * - Meteor Shower: layered starfield, animated meteors, trails and particle bursts.
 *
 * Interaction:
 * - Drag: rotate camera
 * - Scroll: zoom
 * - Auto rotate
 * - Toggle orbital paths
 * - Meteor storm
 * - Fullscreen
 */

(() => {
    const CONFIG = Object.freeze({
        requiredClicks: 5,
        clickWindow: 2500,
        duration: 18000,
        fadeDuration: 700,
        maxPixelRatio: 1.5,
        galaxyParticles: 55000,
        maxMeteors: 24
    });

    const SCENES = Object.freeze([
        {
            id: 'solar',
            title: 'The Solar System',
            description: 'Explore the eight planets orbiting our star.'
        },
        {
            id: 'galaxy',
            title: 'Spiral Galaxy',
            description: 'A journey through billions of distant stars.'
        },
        {
            id: 'meteor',
            title: 'Meteor Shower',
            description: 'Witness a spectacular cosmic meteor storm.'
        }
    ]);

    const PLANETS = [
        {
            name: 'Mercury',
            radius: 0.75,
            orbit: 13,
            speed: 0.95,
            color: '#9d9b98',
            type: 'rocky'
        },
        {
            name: 'Venus',
            radius: 1.25,
            orbit: 19,
            speed: 0.72,
            color: '#d8a46e',
            type: 'venus'
        },
        {
            name: 'Earth',
            radius: 1.4,
            orbit: 26,
            speed: 0.55,
            color: '#2475bd',
            type: 'earth'
        },
        {
            name: 'Mars',
            radius: 1.05,
            orbit: 33,
            speed: 0.42,
            color: '#bd6547',
            type: 'mars'
        },
        {
            name: 'Jupiter',
            radius: 3.5,
            orbit: 47,
            speed: 0.24,
            color: '#c6a17d',
            type: 'gas'
        },
        {
            name: 'Saturn',
            radius: 3,
            orbit: 64,
            speed: 0.17,
            color: '#d8c49b',
            type: 'gas',
            rings: true
        },
        {
            name: 'Uranus',
            radius: 2,
            orbit: 79,
            speed: 0.12,
            color: '#91cbd0',
            type: 'ice',
            rings: true
        },
        {
            name: 'Neptune',
            radius: 1.9,
            orbit: 94,
            speed: 0.09,
            color: '#4169c8',
            type: 'ice'
        }
    ];

    let clickCount = 0;
    let clickResetTimer = null;
    let activeExperience = null;
    let enginePromise = null;

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    /* =========================================
       UTILITIES
    ========================================= */

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    const clamp = (value, min, max) =>
        Math.min(max, Math.max(min, value));

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function loadThreeJS() {
        if (!enginePromise) {
            enginePromise = import(
                'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'
            ).catch(error => {
                enginePromise = null;
                throw error;
            });
        }

        return enginePromise;
    }

    function getRandomScene() {
        return SCENES[
            Math.floor(Math.random() * SCENES.length)
        ];
    }

    /* =========================================
       EXPERIENCE INTERFACE
    ========================================= */

    function createExperienceShell(scene) {
        const overlay = createElement(
            'div',
            'cosmic-experience'
        );

        overlay.dataset.scene = scene.id;

        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', scene.title);
        overlay.setAttribute('tabindex', '-1');

        const stage = createElement(
            'div',
            'cosmic-scene'
        );

        stage.setAttribute('aria-hidden', 'true');

        const heading = createElement(
            'header',
            'cosmic-heading'
        );

        heading.append(
            createElement(
                'span',
                'cosmic-eyebrow',
                'HUFLIT ENGLISH HUB · SECRET EXPERIENCE'
            ),
            createElement(
                'h2',
                'cosmic-title',
                scene.title
            ),
            createElement(
                'p',
                'cosmic-description',
                scene.description
            )
        );

        const hud = createElement(
            'div',
            'cosmic-hud'
        );

        hud.append(
            createElement(
                'span',
                'cosmic-scene-label',
                `DEEP SPACE / ${scene.id.toUpperCase()}`
            ),
            createElement(
                'span',
                'cosmic-scene-hint',
                'DRAG TO ROTATE · SCROLL TO ZOOM'
            )
        );

        const controls = createElement(
            'div',
            'cosmic-controls'
        );

        const speedLabel = createElement(
            'label',
            'cosmic-speed-control'
        );

        const speedText = createElement(
            'span',
            '',
            'SIMULATION SPEED'
        );

        const speedInput = createElement(
            'input',
            'cosmic-speed-slider'
        );

        speedInput.type = 'range';
        speedInput.min = '0';
        speedInput.max = '3';
        speedInput.step = '0.1';
        speedInput.value = '1';

        speedLabel.append(speedText, speedInput);

        const autoRotate = createElement(
            'button',
            'cosmic-control-button is-active',
            'AUTO ROTATE'
        );

        autoRotate.type = 'button';
        autoRotate.dataset.action = 'rotate';

        const orbitToggle = createElement(
            'button',
            'cosmic-control-button is-active',
            'ORBIT PATHS'
        );

        orbitToggle.type = 'button';
        orbitToggle.dataset.action = 'orbits';

        const fullscreen = createElement(
            'button',
            'cosmic-control-button',
            'FULLSCREEN'
        );

        fullscreen.type = 'button';
        fullscreen.dataset.action = 'fullscreen';

        const stormButton = createElement(
            'button',
            'cosmic-control-button cosmic-storm-button',
            'METEOR STORM'
        );

        stormButton.type = 'button';
        stormButton.dataset.action = 'storm';

        controls.append(
            speedLabel,
            autoRotate,
            orbitToggle,
            fullscreen
        );

        if (scene.id === 'meteor') {
            controls.append(stormButton);
        }

        const exit = createElement(
            'button',
            'cosmic-exit',
            'CLOSE EXPERIENCE'
        );

        exit.type = 'button';
        exit.addEventListener('click', closeExperience);

        overlay.append(
            stage,
            heading,
            hud,
            controls,
            exit
        );

        return {
            overlay,
            stage,
            exit,
            controls,
            speedInput,
            autoRotate,
            orbitToggle,
            fullscreen,
            stormButton
        };
    }

    /* =========================================
       PROCEDURAL PLANET TEXTURES
    ========================================= */

    function createPlanetTexture(THREE, type, baseColor) {
        const canvas = document.createElement('canvas');

        canvas.width = 1024;
        canvas.height = 512;

        const ctx = canvas.getContext('2d');

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (type === 'rocky' || type === 'mars') {
            for (let i = 0; i < 2200; i++) {
                const x = random(0, 1024);
                const y = random(0, 512);
                const radius = random(0.5, type === 'mars' ? 9 : 5);

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);

                ctx.fillStyle = Math.random() > 0.5
                    ? 'rgba(20,20,20,.18)'
                    : 'rgba(255,255,255,.12)';

                ctx.fill();
            }
        }

        if (type === 'earth') {
            ctx.fillStyle = '#174f91';
            ctx.fillRect(0, 0, 1024, 512);

            for (let i = 0; i < 260; i++) {
                const x = random(0, 1024);
                const y = random(0, 512);

                ctx.beginPath();

                ctx.ellipse(
                    x,
                    y,
                    random(5, 45),
                    random(4, 25),
                    random(0, Math.PI),
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = Math.random() > 0.35
                    ? '#4f8752'
                    : '#a3a16c';

                ctx.fill();
            }

            for (let i = 0; i < 10000; i++) {
                ctx.fillStyle = 'rgba(255,255,255,.12)';
                ctx.fillRect(
                    random(0, 1024),
                    random(0, 512),
                    random(1, 3),
                    random(1, 2)
                );
            }
        }

        if (
            type === 'gas' ||
            type === 'venus' ||
            type === 'ice'
        ) {
            for (let i = 0; i < 130; i++) {
                const y = random(0, 512);
                const height = random(2, 18);

                const gradient = ctx.createLinearGradient(
                    0,
                    y,
                    0,
                    y + height
                );

                gradient.addColorStop(
                    0,
                    'rgba(255,255,255,.02)'
                );

                gradient.addColorStop(
                    0.5,
                    'rgba(255,255,255,.25)'
                );

                gradient.addColorStop(
                    1,
                    'rgba(0,0,0,.12)'
                );

                ctx.fillStyle = gradient;
                ctx.fillRect(0, y, 1024, height);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;

        return texture;
    }

    function createCloudTexture(THREE) {
        const canvas = document.createElement('canvas');

        canvas.width = 1024;
        canvas.height = 512;

        const ctx = canvas.getContext('2d');

        for (let i = 0; i < 1600; i++) {
            const x = random(0, 1024);
            const y = random(0, 512);

            ctx.beginPath();

            ctx.ellipse(
                x,
                y,
                random(3, 18),
                random(2, 8),
                random(0, Math.PI),
                0,
                Math.PI * 2
            );

            ctx.fillStyle = `rgba(255,255,255,${random(.03, .18)})`;
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        return texture;
    }

    /* =========================================
       THREE.JS EXPERIENCE ENGINE
    ========================================= */

    async function createThreeExperience(
        THREE,
        host,
        sceneId,
        controls
    ) {
        const scene = new THREE.Scene();

        scene.background = new THREE.Color(0x02030a);

        scene.fog = new THREE.FogExp2(
            0x02030a,
            0.00045
        );

        const camera = new THREE.PerspectiveCamera(
            48,
            1,
            0.1,
            3000
        );

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                CONFIG.maxPixelRatio
            )
        );

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;

        renderer.domElement.className = 'cosmic-webgl';

        host.appendChild(renderer.domElement);

        const root = new THREE.Group();
        scene.add(root);

        const ambient = new THREE.AmbientLight(
            0x8797c5,
            0.7
        );

        scene.add(ambient);

        const mainLight = new THREE.PointLight(
            0xffd4a1,
            2200,
            900
        );

        mainLight.position.set(-20, 25, 30);
        scene.add(mainLight);

        const clock = new THREE.Clock();

        const resources = new Set();

        let frameId = null;
        let disposed = false;

        let simulationSpeed = 1;
        let autoRotate = true;
        let showOrbits = true;
        let stormRequested = false;

        let dragging = false;
        let previousX = 0;
        let previousY = 0;

        let cameraRotationX = -0.2;
        let cameraRotationY = 0;

        let targetRotationX = -0.2;
        let targetRotationY = 0;

        let zoom = 1;
        let targetZoom = 1;

        function track(resource) {
            if (resource) {
                resources.add(resource);
            }

            return resource;
        }

        /* =====================================
           STARFIELD
        ===================================== */

        function createStarfield(count, radius, size = 1.5) {
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                const theta = random(0, Math.PI * 2);
                const phi = Math.acos(random(-1, 1));
                const distance = radius * random(0.65, 1);

                positions[i * 3] =
                    distance * Math.sin(phi) * Math.cos(theta);

                positions[i * 3 + 1] =
                    distance * Math.cos(phi);

                positions[i * 3 + 2] =
                    distance * Math.sin(phi) * Math.sin(theta);

                const color = new THREE.Color(
                    Math.random() > 0.82
                        ? 0xffd8bd
                        : 0xbacbff
                );

                const brightness = random(0.4, 1);

                colors[i * 3] = color.r * brightness;
                colors[i * 3 + 1] = color.g * brightness;
                colors[i * 3 + 2] = color.b * brightness;
            }

            const geometry = track(
                new THREE.BufferGeometry()
            );

            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );

            geometry.setAttribute(
                'color',
                new THREE.BufferAttribute(colors, 3)
            );

            const material = track(
                new THREE.PointsMaterial({
                    size,
                    sizeAttenuation: true,
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.95,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                })
            );

            const stars = new THREE.Points(
                geometry,
                material
            );

            scene.add(stars);

            return stars;
        }

        const backgroundStars = createStarfield(
            sceneId === 'galaxy' ? 18000 : 9000,
            1500,
            1.4
        );

        /* =====================================
           GLOW SPRITE
        ===================================== */

        function createGlowTexture(color = '#ffffff') {
            const canvas = document.createElement('canvas');

            canvas.width = 256;
            canvas.height = 256;

            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(
                128,
                128,
                0,
                128,
                128,
                128
            );

            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.12, color);
            gradient.addColorStop(0.42, color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);

            return track(
                new THREE.CanvasTexture(canvas)
            );
        }

        const glowTextures = new Map();

        function createGlow(color, size, opacity = 1) {
            if (!glowTextures.has(color)) {
                glowTextures.set(
                    color,
                    createGlowTexture(color)
                );
            }

            const material = track(
                new THREE.SpriteMaterial({
                    map: glowTextures.get(color),
                    color: 0xffffff,
                    transparent: true,
                    opacity,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );

            const sprite = new THREE.Sprite(material);

            sprite.scale.set(size, size, 1);

            return sprite;
        }

        /* =====================================
           ORBIT PATHS
        ===================================== */

        const orbitObjects = [];

        function createOrbit(radius, opacity = 0.24) {
            const points = [];

            for (let i = 0; i <= 360; i++) {
                const angle = (i / 360) * Math.PI * 2;

                points.push(
                    new THREE.Vector3(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius * 0.72,
                        0
                    )
                );
            }

            const geometry = track(
                new THREE.BufferGeometry().setFromPoints(points)
            );

            const material = track(
                new THREE.LineBasicMaterial({
                    color: 0x8494bd,
                    transparent: true,
                    opacity
                })
            );

            const orbit = new THREE.LineLoop(
                geometry,
                material
            );

            root.add(orbit);
            orbitObjects.push(orbit);

            return orbit;
        }

        function setOrbitVisibility(visible) {
            orbitObjects.forEach(orbit => {
                orbit.visible = visible;
            });
        }

        /* =====================================
           SOLAR SYSTEM
        ===================================== */

        function createSun() {
            const geometry = track(
                new THREE.SphereGeometry(7.5, 96, 72)
            );

            const material = track(
                new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 }
                    },
                    vertexShader: `
                        varying vec3 vNormal;
                        varying vec3 vPosition;

                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            vPosition = position;

                            gl_Position = projectionMatrix *
                                modelViewMatrix *
                                vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float time;

                        varying vec3 vNormal;
                        varying vec3 vPosition;

                        void main() {
                            float wave = sin(
                                vPosition.x * 1.8 +
                                vPosition.y * 2.1 +
                                time * 1.7
                            );

                            float turbulence = sin(
                                vPosition.z * 2.4 +
                                vPosition.x * 1.3 -
                                time
                            );

                            float heat = wave * 0.12 +
                                turbulence * 0.12;

                            vec3 deepOrange = vec3(0.75, 0.12, 0.015);
                            vec3 orange = vec3(1.0, 0.34, 0.035);
                            vec3 yellow = vec3(1.0, 0.78, 0.22);

                            float facing = dot(
                                normalize(vNormal),
                                vec3(0.0, 0.0, 1.0)
                            );

                            vec3 color = mix(
                                deepOrange,
                                orange,
                                clamp(0.55 + heat, 0.0, 1.0)
                            );

                            color = mix(
                                color,
                                yellow,
                                pow(max(facing, 0.0), 2.0) * 0.65
                            );

                            gl_FragColor = vec4(color, 1.0);
                        }
                    `
                })
            );

            const sun = new THREE.Mesh(geometry, material);

            root.add(sun);

            const corona = new THREE.Mesh(
                track(
                    new THREE.SphereGeometry(8.3, 64, 48)
                ),
                track(
                    new THREE.MeshBasicMaterial({
                        color: 0xff8c2b,
                        transparent: true,
                        opacity: 0.13,
                        side: THREE.BackSide,
                        blending: THREE.AdditiveBlending
                    })
                )
            );

            sun.add(corona);

            const glow = createGlow(
                'rgba(255,145,35,1)',
                52,
                0.8
            );

            sun.add(glow);

            const outerGlow = createGlow(
                'rgba(255,95,20,1)',
                95,
                0.3
            );

            sun.add(outerGlow);

            return {
                sun,
                corona,
                material
            };
        }

        function createPlanet(data) {
            const geometry = track(
                new THREE.SphereGeometry(
                    data.radius,
                    72,
                    56
                )
            );

            const texture = track(
                createPlanetTexture(
                    THREE,
                    data.type,
                    data.color
                )
            );

            const material = track(
                new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.92,
                    metalness: 0.01
                })
            );

            const planet = new THREE.Mesh(
                geometry,
                material
            );

            planet.userData = {
                name: data.name,
                orbit: data.orbit,
                angle: random(0, Math.PI * 2),
                speed: data.speed
            };

            if (data.name === 'Earth') {
                const atmosphere = new THREE.Mesh(
                    track(
                        new THREE.SphereGeometry(
                            data.radius * 1.09,
                            64,
                            48
                        )
                    ),
                    track(
                        new THREE.MeshBasicMaterial({
                            color: 0x4da9ff,
                            transparent: true,
                            opacity: 0.12,
                            side: THREE.BackSide,
                            blending: THREE.AdditiveBlending
                        })
                    )
                );

                planet.add(atmosphere);

                const cloudTexture = track(
                    createCloudTexture(THREE)
                );

                const clouds = new THREE.Mesh(
                    track(
                        new THREE.SphereGeometry(
                            data.radius * 1.025,
                            64,
                            48
                        )
                    ),
                    track(
                        new THREE.MeshStandardMaterial({
                            map: cloudTexture,
                            transparent: true,
                            opacity: 0.32,
                            depthWrite: false
                        })
                    )
                );

                planet.add(clouds);
                planet.userData.clouds = clouds;
            }

            if (data.name === 'Saturn' || data.name === 'Uranus') {
                const ringGeometry = track(
                    new THREE.RingGeometry(
                        data.radius * 1.35,
                        data.radius * (data.name === 'Saturn' ? 2.3 : 1.8),
                        160
                    )
                );

                const ringMaterial = track(
                    new THREE.MeshStandardMaterial({
                        color: data.name === 'Saturn'
                            ? 0xcdbb9b
                            : 0x9ac6d0,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: data.name === 'Saturn' ? 0.78 : 0.38,
                        roughness: 1,
                        depthWrite: false
                    })
                );

                const ring = new THREE.Mesh(
                    ringGeometry,
                    ringMaterial
                );

                ring.rotation.x = Math.PI / 2.3;

                if (data.name === 'Uranus') {
                    ring.rotation.y = 0.25;
                }

                planet.add(ring);
            }

            root.add(planet);

            return planet;
        }

        function createAsteroidBelt() {
            const count = 5200;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                const angle = random(0, Math.PI * 2);
                const radius = random(39, 43);
                const height = random(-1.1, 1.1);

                positions[i * 3] = Math.cos(angle) * radius;
                positions[i * 3 + 1] = height;
                positions[i * 3 + 2] = Math.sin(angle) * radius;

                const shade = random(0.35, 0.85);

                colors[i * 3] = shade;
                colors[i * 3 + 1] = shade * 0.9;
                colors[i * 3 + 2] = shade * 0.75;
            }

            const geometry = track(
                new THREE.BufferGeometry()
            );

            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );

            geometry.setAttribute(
                'color',
                new THREE.BufferAttribute(colors, 3)
            );

            const material = track(
                new THREE.PointsMaterial({
                    size: 0.35,
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.8,
                    depthWrite: false
                })
            );

            const belt = new THREE.Points(
                geometry,
                material
            );

            root.add(belt);

            return belt;
        }

        function createSolarSystem() {
            root.rotation.x = -0.22;

            const sunData = createSun();

            const planets = PLANETS.map(data => {
                createOrbit(data.orbit);

                return createPlanet(data);
            });

            const asteroidBelt = createAsteroidBelt();

            camera.position.set(0, 36, 145);

            return {
                ...sunData,
                planets,
                asteroidBelt
            };
        }

        /* =====================================
           SPIRAL GALAXY
        ===================================== */

        function createGalaxy() {
            root.rotation.x = -0.48;

            const count = CONFIG.galaxyParticles;
            const arms = 4;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);

            const innerColor = new THREE.Color(0xffd7a1);
            const middleColor = new THREE.Color(0xb18aff);
            const outerColor = new THREE.Color(0x438dff);

            for (let i = 0; i < count; i++) {
                const arm = i % arms;
                const distance = Math.pow(Math.random(), 0.62) * 82;
                const angle =
                    arm * (Math.PI * 2 / arms) +
                    distance * 0.095 +
                    random(-0.24, 0.24);

                const spread = (1 - distance / 82) * 4.8;

                positions[i * 3] =
                    Math.cos(angle) * distance +
                    random(-spread, spread);

                positions[i * 3 + 1] =
                    random(-1.8, 1.8) *
                    (1 - distance / 100);

                positions[i * 3 + 2] =
                    Math.sin(angle) * distance +
                    random(-spread, spread);

                const color = new THREE.Color();

                if (distance < 22) {
                    color.copy(innerColor).lerp(
                        middleColor,
                        distance / 22
                    );
                } else {
                    color.copy(middleColor).lerp(
                        outerColor,
                        (distance - 22) / 60
                    );
                }

                const brightness = random(0.55, 1.25);

                colors[i * 3] = color.r * brightness;
                colors[i * 3 + 1] = color.g * brightness;
                colors[i * 3 + 2] = color.b * brightness;

                sizes[i] = random(0.5, 2.2);
            }

            const geometry = track(
                new THREE.BufferGeometry()
            );

            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );

            geometry.setAttribute(
                'color',
                new THREE.BufferAttribute(colors, 3)
            );

            const material = track(
                new THREE.PointsMaterial({
                    size: 1.25,
                    vertexColors: true,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 0.95,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );

            const galaxy = new THREE.Points(
                geometry,
                material
            );

            root.add(galaxy);

            const core = new THREE.Mesh(
                track(
                    new THREE.SphereGeometry(3.2, 64, 48)
                ),
                track(
                    new THREE.MeshBasicMaterial({
                        color: 0xffe7c1
                    })
                )
            );

            root.add(core);

            const coreGlow = createGlow(
                'rgba(255,205,155,1)',
                90,
                0.9
            );

            core.add(coreGlow);

            const nebulae = [];

            const nebulaColors = [
                'rgba(115,95,255,1)',
                'rgba(255,120,185,1)',
                'rgba(75,145,255,1)',
                'rgba(255,175,125,1)'
            ];

            for (let i = 0; i < 28; i++) {
                const nebula = createGlow(
                    nebulaColors[i % nebulaColors.length],
                    random(12, 30),
                    random(0.12, 0.35)
                );

                const angle = random(0, Math.PI * 2);
                const distance = random(12, 75);

                nebula.position.set(
                    Math.cos(angle) * distance,
                    random(-3, 3),
                    Math.sin(angle) * distance
                );

                root.add(nebula);
                nebulae.push(nebula);
            }

            const dust = createStarfield(
                9000,
                115,
                0.8
            );

            root.add(dust);

            camera.position.set(0, 82, 150);

            return {
                galaxy,
                core,
                nebulae,
                dust
            };
        }

        /* =====================================
           METEOR SHOWER
        ===================================== */

        function createMeteorShower() {
            camera.position.set(0, 0, 110);

            const meteorGroup = new THREE.Group();
            root.add(meteorGroup);

            const meteors = [];
            const bursts = [];

            const nebulaOne = createGlow(
                'rgba(80,105,220,1)',
                220,
                0.32
            );

            nebulaOne.position.set(-35, -20, -65);
            root.add(nebulaOne);

            const nebulaTwo = createGlow(
                'rgba(180,90,180,1)',
                180,
                0.25
            );

            nebulaTwo.position.set(42, 18, -85);
            root.add(nebulaTwo);

            function spawnMeteor() {
                if (meteors.length >= CONFIG.maxMeteors) {
                    return;
                }

                const start = new THREE.Vector3(
                    random(35, 95),
                    random(20, 70),
                    random(-45, 15)
                );

                const end = start.clone().add(
                    new THREE.Vector3(
                        random(-55, -28),
                        random(-42, -18),
                        random(-8, 8)
                    )
                );

                const geometry = track(
                    new THREE.BufferGeometry()
                );

                geometry.setFromPoints([
                    start,
                    start.clone()
                ]);

                const material = track(
                    new THREE.LineBasicMaterial({
                        color: 0xdceaff,
                        transparent: true,
                        opacity: 0.95,
                        blending: THREE.AdditiveBlending
                    })
                );

                const trail = new THREE.Line(
                    geometry,
                    material
                );

                const head = new THREE.Mesh(
                    track(
                        new THREE.SphereGeometry(
                            random(0.22, 0.42),
                            16,
                            12
                        )
                    ),
                    track(
                        new THREE.MeshBasicMaterial({
                            color: 0xffffff
                        })
                    )
                );

                head.position.copy(start);

                const glow = createGlow(
                    'rgba(150,205,255,1)',
                    random(5, 10),
                    0.9
                );

                head.add(glow);

                meteorGroup.add(trail, head);

                meteors.push({
                    start,
                    end,
                    trail,
                    head,
                    progress: 0,
                    speed: random(0.32, 0.72),
                    life: 1
                });
            }

            function createBurst(position) {
                const count = 36;
                const positions = new Float32Array(count * 3);
                const velocities = [];

                for (let i = 0; i < count; i++) {
                    positions[i * 3] = position.x;
                    positions[i * 3 + 1] = position.y;
                    positions[i * 3 + 2] = position.z;

                    velocities.push(
                        new THREE.Vector3(
                            random(-1.2, 1.2),
                            random(-1.2, 1.2),
                            random(-0.5, 0.5)
                        )
                    );
                }

                const geometry = track(
                    new THREE.BufferGeometry()
                );

                geometry.setAttribute(
                    'position',
                    new THREE.BufferAttribute(positions, 3)
                );

                const material = track(
                    new THREE.PointsMaterial({
                        color: 0xcce8ff,
                        size: 1.8,
                        transparent: true,
                        opacity: 1,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    })
                );

                const particles = new THREE.Points(
                    geometry,
                    material
                );

                meteorGroup.add(particles);

                bursts.push({
                    particles,
                    velocities,
                    life: 1
                });
            }

            for (let i = 0; i < 12; i++) {
                spawnMeteor();
            }

            return {
                meteors,
                bursts,
                spawnMeteor,
                createBurst,
                nebulaOne,
                nebulaTwo
            };
        }

        /* =====================================
           INITIALIZE SCENE
        ===================================== */

        let sceneData;

        if (sceneId === 'solar') {
            sceneData = createSolarSystem();
        } else if (sceneId === 'galaxy') {
            sceneData = createGalaxy();
        } else {
            sceneData = createMeteorShower();
        }

        camera.lookAt(0, 0, 0);

        /* =====================================
           CAMERA INTERACTION
        ===================================== */

        function onPointerDown(event) {
            if (event.button !== 0) return;

            dragging = true;

            previousX = event.clientX;
            previousY = event.clientY;

            renderer.domElement.setPointerCapture?.(
                event.pointerId
            );
        }

        function onPointerMove(event) {
            if (!dragging) return;

            const deltaX = event.clientX - previousX;
            const deltaY = event.clientY - previousY;

            targetRotationY += deltaX * 0.004;
            targetRotationX += deltaY * 0.003;

            targetRotationX = clamp(
                targetRotationX,
                -1.15,
                1.15
            );

            previousX = event.clientX;
            previousY = event.clientY;
        }

        function onPointerUp() {
            dragging = false;
        }

        function onWheel(event) {
            targetZoom = clamp(
                targetZoom + event.deltaY * 0.0008,
                0.62,
                1.8
            );
        }

        renderer.domElement.addEventListener(
            'pointerdown',
            onPointerDown
        );

        renderer.domElement.addEventListener(
            'pointermove',
            onPointerMove
        );

        window.addEventListener(
            'pointerup',
            onPointerUp
        );

        renderer.domElement.addEventListener(
            'wheel',
            onWheel,
            { passive: true }
        );

        /* =====================================
           CONTROL EVENTS
        ===================================== */

        function onSpeedChange() {
            simulationSpeed = Number(
                controls.speedInput.value
            );
        }

        function onRotateToggle() {
            autoRotate = !autoRotate;

            controls.autoRotate.classList.toggle(
                'is-active',
                autoRotate
            );
        }

        function onOrbitToggle() {
            showOrbits = !showOrbits;

            setOrbitVisibility(showOrbits);

            controls.orbitToggle.classList.toggle(
                'is-active',
                showOrbits
            );
        }

        async function onFullscreen() {
            try {
                if (!document.fullscreenElement) {
                    await activeExperience?.overlay.requestFullscreen?.();
                } else {
                    await document.exitFullscreen?.();
                }
            } catch (error) {
                console.warn(
                    '[Cosmic Easter Egg] Fullscreen unavailable:',
                    error
                );
            }
        }

        function onStorm() {
            stormRequested = true;

            for (let i = 0; i < 10; i++) {
                sceneData.spawnMeteor();
            }

            controls.stormButton.classList.add('is-active');

            window.setTimeout(() => {
                controls.stormButton?.classList.remove('is-active');
            }, 900);
        }

        controls.speedInput.addEventListener(
            'input',
            onSpeedChange
        );

        controls.autoRotate.addEventListener(
            'click',
            onRotateToggle
        );

        controls.orbitToggle.addEventListener(
            'click',
            onOrbitToggle
        );

        controls.fullscreen.addEventListener(
            'click',
            onFullscreen
        );

        controls.stormButton?.addEventListener(
            'click',
            onStorm
        );

        /* =====================================
           RESIZE
        ===================================== */

        function resize() {
            if (disposed) return;

            const width = Math.max(1, host.clientWidth);
            const height = Math.max(1, host.clientHeight);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height, false);
        }

        const resizeObserver = new ResizeObserver(resize);

        resizeObserver.observe(host);
        window.addEventListener('resize', resize, {
            passive: true
        });

        resize();

        /* =====================================
           ANIMATION LOOP
        ===================================== */

        let previousTime = 0;

        function animate() {
            if (disposed) return;

            frameId = requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            const delta = Math.min(
                elapsed - previousTime || 0.016,
                0.05
            );

            previousTime = elapsed;

            const scaledDelta = delta * simulationSpeed;

            if (!reducedMotion.matches) {
                if (autoRotate && !dragging) {
                    targetRotationY += scaledDelta * 0.045;
                }

                cameraRotationX +=
                    (targetRotationX - cameraRotationX) * 0.055;

                cameraRotationY +=
                    (targetRotationY - cameraRotationY) * 0.055;

                root.rotation.y = cameraRotationY;
                root.rotation.x +=
                    (cameraRotationX - root.rotation.x) * 0.035;

                backgroundStars.rotation.y +=
                    scaledDelta * 0.001;
            }

            zoom += (targetZoom - zoom) * 0.08;

            if (sceneId === 'solar') {
                sceneData.material.uniforms.time.value = elapsed;

                sceneData.sun.rotation.y +=
                    scaledDelta * 0.08;

                sceneData.corona.rotation.y -=
                    scaledDelta * 0.025;

                sceneData.planets.forEach(planet => {
                    const data = planet.userData;

                    data.angle +=
                        scaledDelta * data.speed * 0.12;

                    planet.position.set(
                        Math.cos(data.angle) * data.orbit,
                        Math.sin(data.angle) * data.orbit * 0.72,
                        0
                    );

                    planet.rotation.y += scaledDelta * 0.2;

                    if (data.clouds) {
                        data.clouds.rotation.y +=
                            scaledDelta * 0.24;
                    }
                });

                sceneData.asteroidBelt.rotation.y +=
                    scaledDelta * 0.025;
            }

            if (sceneId === 'galaxy') {
                sceneData.galaxy.rotation.z +=
                    scaledDelta * 0.018;

                sceneData.dust.rotation.z -=
                    scaledDelta * 0.008;

                sceneData.core.scale.setScalar(
                    1 + Math.sin(elapsed * 1.4) * 0.025
                );

                sceneData.nebulae.forEach((nebula, index) => {
                    nebula.material.rotation +=
                        scaledDelta * (index % 2 ? 0.012 : -0.012);
                });
            }

            if (sceneId === 'meteor') {
                sceneData.meteors.forEach(meteor => {
                    meteor.progress +=
                        scaledDelta * meteor.speed * 0.3;

                    const progress = meteor.progress;

                    meteor.head.position.lerpVectors(
                        meteor.start,
                        meteor.end,
                        progress
                    );

                    const tail = meteor.head.position.clone().lerp(
                        meteor.start,
                        0.28
                    );

                    meteor.trail.geometry.setFromPoints([
                        meteor.head.position,
                        tail
                    ]);

                    meteor.trail.material.opacity =
                        Math.max(0, 1 - progress);

                    if (progress >= 1) {
                        sceneData.createBurst(meteor.end);

                        meteor.progress = 0;

                        meteor.start.set(
                            random(35, 95),
                            random(20, 70),
                            random(-45, 15)
                        );

                        meteor.end.copy(meteor.start).add(
                            new THREE.Vector3(
                                random(-55, -28),
                                random(-42, -18),
                                random(-8, 8)
                            )
                        );
                    }
                });

                if (
                    Math.random() < 0.035 &&
                    sceneData.meteors.length < CONFIG.maxMeteors
                ) {
                    sceneData.spawnMeteor();
                }

                sceneData.bursts.forEach((burst, index) => {
                    const positions = burst.particles.geometry
                        .attributes.position.array;

                    for (let i = 0; i < burst.velocities.length; i++) {
                        const velocity = burst.velocities[i];

                        positions[i * 3] += velocity.x * scaledDelta;
                        positions[i * 3 + 1] += velocity.y * scaledDelta;
                        positions[i * 3 + 2] += velocity.z * scaledDelta;

                        velocity.multiplyScalar(0.985);
                    }

                    burst.particles.geometry.attributes.position
                        .needsUpdate = true;

                    burst.life -= scaledDelta * 0.7;

                    burst.particles.material.opacity =
                        Math.max(0, burst.life);

                    if (burst.life <= 0) {
                        meteorGroupRemove(burst.particles);
                        sceneData.bursts.splice(index, 1);
                    }
                });

                sceneData.nebulaOne.material.rotation +=
                    scaledDelta * 0.004;

                sceneData.nebulaTwo.material.rotation -=
                    scaledDelta * 0.003;
            }

            const baseDistance =
                sceneId === 'solar'
                    ? 145
                    : sceneId === 'galaxy'
                        ? 175
                        : 110;

            const distance = baseDistance / zoom;

            const spherical = new THREE.Spherical(
                distance,
                Math.PI / 2 - cameraRotationX,
                cameraRotationY
            );

            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        function meteorGroupRemove(object) {
            object.parent?.remove(object);
        }

        animate();

        /* =====================================
           RESOURCE CLEANUP
        ===================================== */

        return () => {
            if (disposed) return;

            disposed = true;

            if (frameId !== null) {
                cancelAnimationFrame(frameId);
            }

            resizeObserver.disconnect();

            window.removeEventListener('resize', resize);
            window.removeEventListener('pointerup', onPointerUp);

            renderer.domElement.removeEventListener(
                'pointerdown',
                onPointerDown
            );

            renderer.domElement.removeEventListener(
                'pointermove',
                onPointerMove
            );

            renderer.domElement.removeEventListener(
                'wheel',
                onWheel
            );

            controls.speedInput.removeEventListener(
                'input',
                onSpeedChange
            );

            controls.autoRotate.removeEventListener(
                'click',
                onRotateToggle
            );

            controls.orbitToggle.removeEventListener(
                'click',
                onOrbitToggle
            );

            controls.fullscreen.removeEventListener(
                'click',
                onFullscreen
            );

            controls.stormButton?.removeEventListener(
                'click',
                onStorm
            );

            scene.traverse(object => {
                if (object.geometry) {
                    object.geometry.dispose();
                }

                if (object.material) {
                    const materials = Array.isArray(object.material)
                        ? object.material
                        : [object.material];

                    materials.forEach(material => {
                        material.dispose();
                    });
                }
            });

            resources.forEach(resource => {
                resource.dispose?.();
            });

            renderer.dispose();
            renderer.forceContextLoss?.();
            renderer.domElement.remove();
        };
    }

    /* =========================================
       CLOSE EXPERIENCE
    ========================================= */

    function closeExperience() {
        if (!activeExperience) return;

        const experience = activeExperience;

        if (experience.closing) return;

        experience.closing = true;
        activeExperience = null;

        clearTimeout(experience.timer);

        experience.overlay.classList.add('is-leaving');

        const finishClose = () => {
            experience.dispose?.();

            if (document.fullscreenElement) {
                document.exitFullscreen?.().catch(() => {});
            }

            experience.overlay.remove();

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
        };

        window.setTimeout(
            finishClose,
            CONFIG.fadeDuration
        );
    }

    /* =========================================
       ACTIVATE EXPERIENCE
    ========================================= */

    async function activateExperience() {
        if (activeExperience) return;

        const scene = getRandomScene();
        const shell = createExperienceShell(scene);

        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        activeExperience = {
            ...shell,
            previousFocus,
            previousOverflow,
            timer: null,
            dispose: null,
            closing: false
        };

        document.body.appendChild(shell.overlay);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            if (
                activeExperience &&
                activeExperience.overlay === shell.overlay
            ) {
                shell.overlay.classList.add('is-visible');

                shell.overlay.focus({
                    preventScroll: true
                });
            }
        });

        shell.overlay.addEventListener(
            'keydown',
            event => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeExperience();
                }

                if (event.key === 'Tab') {
                    const focusable = shell.overlay.querySelectorAll(
                        'button, input, [tabindex]:not([tabindex="-1"])'
                    );

                    if (!focusable.length) return;

                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (
                        event.shiftKey &&
                        document.activeElement === first
                    ) {
                        event.preventDefault();
                        last.focus();
                    } else if (
                        !event.shiftKey &&
                        document.activeElement === last
                    ) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            }
        });

        try {
            const THREE = await loadThreeJS();

            if (
                !activeExperience ||
                activeExperience.overlay !== shell.overlay
            ) {
                return;
            }

            const dispose = await createThreeExperience(
                THREE,
                shell.stage,
                scene.id,
                shell
            );

            if (
                !activeExperience ||
                activeExperience.overlay !== shell.overlay
            ) {
                dispose();
                return;
            }

            activeExperience.dispose = dispose;

        } catch (error) {
            console.error(
                '[Cosmic Easter Egg] Three.js initialization failed:',
                error
            );

            shell.overlay.classList.add('is-fallback');

            shell.stage.appendChild(
                createElement(
                    'p',
                    'cosmic-fallback',
                    'Unable to load the cosmic experience. Please check your connection and try again.'
                )
            );
        }

        if (
            activeExperience &&
            activeExperience.overlay === shell.overlay
        ) {
            activeExperience.timer = window.setTimeout(
                closeExperience,
                CONFIG.duration
            );
        }
    }

    /* =========================================
       LOGO CLICK TRIGGER
    ========================================= */

    function handleLogoClick() {
        if (activeExperience) return;

        clickCount += 1;

        clearTimeout(clickResetTimer);

        clickResetTimer = window.setTimeout(() => {
            clickCount = 0;
        }, CONFIG.clickWindow);

        if (clickCount >= CONFIG.requiredClicks) {
            clickCount = 0;

            clearTimeout(clickResetTimer);

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
