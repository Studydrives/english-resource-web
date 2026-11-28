'use strict';

/**
 * HUFLIT English Hub
 * Immersive Cosmic Easter Eggs
 *
 * Engine: Three.js / WebGL
 * Scenes:
 * 1. Solar System
 * 2. Spiral Galaxy
 * 3. Meteor Shower
 */

(() => {
    const CONFIG = Object.freeze({
        requiredClicks: 5,
        clickWindow: 2500,
        duration: 10000,
        fadeDuration: 700,
        maxPixelRatio: 1.75
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
    let enginePromise = null;

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    /* =========================================
       UTILITIES
    ========================================= */

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
       EXPERIENCE UI
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
                'HUFLIT ENGLISH HUB • SECRET EXPERIENCE'
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
                'DEEP SPACE / ' + scene.id.toUpperCase()
            ),
            createElement(
                'span',
                'cosmic-scene-hint',
                'DRAG TO EXPLORE · SCROLL TO ZOOM'
            )
        );

        const exit = createElement(
            'button',
            'cosmic-exit',
            'SKIP EXPERIENCE'
        );

        exit.type = 'button';

        exit.addEventListener(
            'click',
            closeExperience
        );

        overlay.append(
            stage,
            heading,
            hud,
            exit
        );

        return {
            overlay,
            stage,
            exit
        };
    }

    /* =========================================
       PROCEDURAL TEXTURES
    ========================================= */

    function createTexture(THREE, type, baseColor) {
        const canvas = document.createElement('canvas');

        canvas.width = 1024;
        canvas.height = 512;

        const ctx = canvas.getContext('2d');

        const base = baseColor;

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 1024, 512);

        if (type === 'sun') {
            const gradient = ctx.createRadialGradient(
                512, 256, 40,
                512, 256, 500
            );

            gradient.addColorStop(0, '#fff8ba');
            gradient.addColorStop(.25, '#ffdd55');
            gradient.addColorStop(.55, '#ff9228');
            gradient.addColorStop(1, '#b92b0b');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1024, 512);

            for (let i = 0; i < 18000; i++) {
                const x = random(0, 1024);
                const y = random(0, 512);
                const size = random(.5, 3);

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);

                ctx.fillStyle = Math.random() > .5
                    ? 'rgba(255,255,180,.35)'
                    : 'rgba(150,35,0,.18)';

                ctx.fill();
            }
        }

        if (type === 'earth') {
            ctx.fillStyle = '#174f91';

            for (let i = 0; i < 180; i++) {
                ctx.beginPath();

                const x = random(0, 1024);
                const y = random(0, 512);

                ctx.ellipse(
                    x,
                    y,
                    random(5, 50),
                    random(4, 25),
                    random(0, Math.PI),
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = Math.random() > .5
                    ? '#548e55'
                    : '#a0a46c';

                ctx.fill();
            }

            ctx.globalAlpha = .2;

            for (let i = 0; i < 12000; i++) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(
                    random(0, 1024),
                    random(0, 512),
                    random(1, 3),
                    random(1, 2)
                );
            }

            ctx.globalAlpha = 1;
        }

        if (type === 'gas') {
            for (let i = 0; i < 80; i++) {
                const y = random(0, 512);

                ctx.fillStyle = Math.random() > .5
                    ? 'rgba(255,225,190,.45)'
                    : 'rgba(90,45,30,.25)';

                ctx.fillRect(
                    0,
                    y,
                    1024,
                    random(3, 18)
                );
            }
        }

        if (type === 'mars') {
            for (let i = 0; i < 500; i++) {
                ctx.beginPath();

                ctx.arc(
                    random(0, 1024),
                    random(0, 512),
                    random(1, 12),
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = 'rgba(70,20,10,.25)';
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);

        texture.colorSpace = THREE.SRGBColorSpace;

        return texture;
    }

    /* =========================================
       THREE.JS ENGINE
    ========================================= */

    async function createThreeExperience(
        THREE,
        host,
        sceneId
    ) {
        const scene = new THREE.Scene();

        scene.background = new THREE.Color(0x02030b);

        scene.fog = new THREE.FogExp2(
            0x030611,
            .0007
        );

        const camera = new THREE.PerspectiveCamera(
            48,
            1,
            .1,
            2500
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
        renderer.toneMappingExposure = 1.25;

        renderer.domElement.className = 'cosmic-webgl';

        host.appendChild(renderer.domElement);

        const root = new THREE.Group();

        scene.add(root);

        scene.add(
            new THREE.AmbientLight(
                0x8999c9,
                .65
            )
        );

        const light = new THREE.PointLight(
            0xffd29a,
            1800,
            700
        );

        light.position.set(-20, 30, 30);

        scene.add(light);

        const clock = new THREE.Clock();

        const resources = [];

        let frameId = null;
        let disposed = false;

        let dragging = false;
        let previousX = 0;
        let previousY = 0;

        let targetRotationX = -.2;
        let targetRotationY = 0;

        let zoom = 1;
        let targetZoom = 1;

        function track(resource) {
            resources.push(resource);
            return resource;
        }

        /* =====================================
           STARFIELD
        ===================================== */

        function createStars(count, radius) {
            const positions = new Float32Array(
                count * 3
            );

            const colors = new Float32Array(
                count * 3
            );

            for (let i = 0; i < count; i++) {
                const theta = random(0, Math.PI * 2);
                const phi = Math.acos(random(-1, 1));

                const r = radius * random(.7, 1);

                positions[i * 3] =
                    r * Math.sin(phi) * Math.cos(theta);

                positions[i * 3 + 1] =
                    r * Math.cos(phi);

                positions[i * 3 + 2] =
                    r * Math.sin(phi) * Math.sin(theta);

                const tint = new THREE.Color(
                    Math.random() > .8
                        ? 0xffd8bd
                        : 0xbacbff
                );

                const brightness = random(.45, 1);

                colors[i * 3] = tint.r * brightness;
                colors[i * 3 + 1] = tint.g * brightness;
                colors[i * 3 + 2] = tint.b * brightness;
            }

            const geometry = track(
                new THREE.BufferGeometry()
            );

            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(
                    positions,
                    3
                )
            );

            geometry.setAttribute(
                'color',
                new THREE.BufferAttribute(
                    colors,
                    3
                )
            );

            const material = track(
                new THREE.PointsMaterial({
                    size: 1.4,
                    sizeAttenuation: true,
                    vertexColors: true,
                    transparent: true,
                    opacity: .95,
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

        const stars = createStars(
            sceneId === 'galaxy' ? 10000 : 5000,
            1100
        );

        /* =====================================
           GLOW TEXTURE
        ===================================== */

        function createGlow(color, size) {
            const canvas = document.createElement('canvas');

            canvas.width = 128;
            canvas.height = 128;

            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(
                64, 64, 0,
                64, 64, 64
            );

            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(.12, color);
            gradient.addColorStop(.4, color.replace('1)', '.2)'));
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);

            const texture = track(
                new THREE.CanvasTexture(canvas)
            );

            const sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );

            sprite.scale.setScalar(size);

            return sprite;
        }

        /* =====================================
           ORBITAL SYSTEM
        ===================================== */

        function createOrbit(radius) {
            const points = [];

            for (let i = 0; i <= 240; i++) {
                const angle =
                    i / 240 * Math.PI * 2;

                points.push(
                    new THREE.Vector3(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius * .72,
                        0
                    )
                );
            }

            const geometry = track(
                new THREE.BufferGeometry()
                    .setFromPoints(points)
            );

            const material = track(
                new THREE.LineBasicMaterial({
                    color: 0x8290b4,
                    transparent: true,
                    opacity: .24
                })
            );

            const orbit = new THREE.LineLoop(
                geometry,
                material
            );

            root.add(orbit);

            return orbit;
        }

        const interactive = [];

        function createPlanet(data) {
            const geometry = track(
                new THREE.SphereGeometry(
                    data.radius,
                    64,
                    48
                )
            );

            const texture = track(
                createTexture(
                    THREE,
                    data.texture,
                    data.color
                )
            );

            const material = track(
                new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: .95,
                    metalness: .01
                })
            );

            const planet = new THREE.Mesh(
                geometry,
                material
            );

            planet.userData = {
                name: data.name,
                orbit: data.orbit,
                angle: data.angle,
                speed: data.speed
            };

            if (data.rings) {
                const ring = new THREE.Mesh(
                    track(
                        new THREE.RingGeometry(
                            data.radius * 1.35,
                            data.radius * 2.25,
                            128
                        )
                    ),
                    track(
                        new THREE.MeshStandardMaterial({
                            color: 0xd8c29a,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: .82,
                            roughness: .9
                        })
                    )
                );

                ring.rotation.x = Math.PI / 2.35;

                planet.add(ring);
            }

            root.add(planet);

            interactive.push(planet);

            return planet;
        }

        /* =====================================
           SCENE 1: SOLAR SYSTEM
        ===================================== */

        function createSolarSystem() {
            root.rotation.x = -.22;

            const sunGeometry = track(
                new THREE.SphereGeometry(
                    7.5,
                    96,
                    72
                )
            );

            const sunTexture = track(
                createTexture(
                    THREE,
                    'sun',
                    '#ff9a29'
                )
            );

            const sunMaterial = track(
                new THREE.MeshBasicMaterial({
                    map: sunTexture
                })
            );

            const sun = new THREE.Mesh(
                sunGeometry,
                sunMaterial
            );

            root.add(sun);

            const glow = createGlow(
                'rgba(255,155,45,1)',
                75
            );

            sun.add(glow);

            const corona = new THREE.Mesh(
                track(
                    new THREE.SphereGeometry(
                        8.1,
                        64,
                        48
                    )
                ),
                track(
                    new THREE.MeshBasicMaterial({
                        color: 0xff8c24,
                        transparent: true,
                        opacity: .1,
                        side: THREE.BackSide
                    })
                )
            );

            sun.add(corona);

            const planetData = [
                {
                    name: 'Mercury',
                    radius: .8,
                    orbit: 13,
                    speed: .9,
                    color: '#99938d',
                    texture: 'rock',
                    angle: .3
                },
                {
                    name: 'Venus',
                    radius: 1.4,
                    orbit: 20,
                    speed: .65,
                    color: '#dba46b',
                    texture: 'gas',
                    angle: 1.4
                },
                {
                    name: 'Earth',
                    radius: 1.65,
                    orbit: 28,
                    speed: .45,
                    color: '#2475bd',
                    texture: 'earth',
                    angle: 2.4
                },
                {
                    name: 'Mars',
                    radius: 1.2,
                    orbit: 36,
                    speed: .34,
                    color: '#b85e3c',
                    texture: 'mars',
                    angle: 3.1
                },
                {
                    name: 'Jupiter',
                    radius: 4,
                    orbit: 50,
                    speed: .2,
                    color: '#bd9675',
                    texture: 'gas',
                    angle: 4.1
                },
                {
                    name: 'Saturn',
                    radius: 3.3,
                    orbit: 67,
                    speed: .15,
                    color: '#d5bd8d',
                    texture: 'gas',
                    angle: 5,
                    rings: true
                }
            ];

            const planets = planetData.map(data => {
                createOrbit(data.orbit);

                return createPlanet(data);
            });

            return {
                sun,
                planets
            };
        }

        /* =====================================
           SCENE 2: SPIRAL GALAXY
        ===================================== */

        function createGalaxy() {
            root.rotation.x = -.45;

            const count = 26000;

            const positions = new Float32Array(
                count * 3
            );

            const colors = new Float32Array(
                count * 3
            );

            const palette = [
                new THREE.Color(0xffc9a5),
                new THREE.Color(0xa6bbff),
                new THREE.Color(0x9c83f5),
                new THREE.Color(0xffe5d6)
            ];

            for (let i = 0; i < count; i++) {
                const arm = i % 5;

                const radius =
                    Math.pow(Math.random(), .72) * 65 + 2;

                const angle =
                    arm / 5 * Math.PI * 2 +
                    radius * .105 +
                    random(-.18, .18);

                const spread = random(-2, 2) *
                    (1 + radius * .07);

                positions[i * 3] =
                    Math.cos(angle) * radius + spread;

                positions[i * 3 + 1] =
                    Math.sin(angle) * radius * .34 + spread * .2;

                positions[i * 3 + 2] =
                    random(-1, 1) * (2 + radius * .1);

                const color = palette[
                    Math.floor(Math.random() * palette.length)
                ];

                const brightness = random(.4, 1);

                colors[i * 3] = color.r * brightness;
                colors[i * 3 + 1] = color.g * brightness;
                colors[i * 3 + 2] = color.b * brightness;
            }

            const geometry = track(
                new THREE.BufferGeometry()
            );

            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(
                    positions,
                    3
                )
            );

            geometry.setAttribute(
                'color',
                new THREE.BufferAttribute(
                    colors,
                    3
                )
            );

            const material = track(
                new THREE.PointsMaterial({
                    size: .85,
                    vertexColors: true,
                    transparent: true,
                    opacity: .88,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                })
            );

            const galaxy = new THREE.Points(
                geometry,
                material
            );

            root.add(galaxy);

            const core = new THREE.Mesh(
                track(
                    new THREE.SphereGeometry(
                        3.2,
                        48,
                        32
                    )
                ),
                track(
                    new THREE.MeshBasicMaterial({
                        color: 0xffe8c4
                    })
                )
            );

            root.add(core);

            const coreGlow = createGlow(
                'rgba(255,205,155,1)',
                90
            );

            core.add(coreGlow);

            const clouds = [];

            for (let i = 0; i < 22; i++) {
                const cloud = createGlow(
                    i % 2
                        ? 'rgba(115,145,255,1)'
                        : 'rgba(255,168,140,1)',
                    random(12, 26)
                );

                const angle = random(0, Math.PI * 2);
                const radius = random(15, 55);

                cloud.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius * .32,
                    random(-5, 5)
                );

                root.add(cloud);

                clouds.push(cloud);
            }

            return {
                galaxy,
                core,
                clouds
            };
        }

        /* =====================================
           SCENE 3: METEOR SHOWER
        ===================================== */

        function createMeteorShower() {
            camera.position.set(0, 0, 110);

            const meteors = [];

            const meteorGroup = new THREE.Group();

            root.add(meteorGroup);

            function spawnMeteor() {
                const start = new THREE.Vector3(
                    random(35, 90),
                    random(20, 65),
                    random(-50, -10)
                );

                const end = start.clone().add(
                    new THREE.Vector3(
                        random(-45, -25),
                        random(-35, -15),
                        0
                    )
                );

                const geometry = track(
                    new THREE.BufferGeometry()
                );

                geometry.setFromPoints([
                    start,
                    end
                ]);

                const material = track(
                    new THREE.LineBasicMaterial({
                        color: 0xeaf1ff,
                        transparent: true,
                        opacity: .9,
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
                            random(.25, .5),
                            12,
                            8
                        )
                    ),
                    track(
                        new THREE.MeshBasicMaterial({
                            color: 0xffffff
                        })
                    )
                );

                head.position.copy(start);

                meteorGroup.add(trail, head);

                meteors.push({
                    trail,
                    head,
                    start,
                    end,
                    progress: 0,
                    speed: random(.12, .23)
                });
            }

            for (let i = 0; i < 9; i++) {
                spawnMeteor();
            }

            const nebula = createGlow(
                'rgba(88,115,210,1)',
                190
            );

            nebula.position.set(-25, -15, -50);

            root.add(nebula);

            const secondNebula = createGlow(
                'rgba(170,100,175,1)',
                145
            );

            secondNebula.position.set(35, 20, -70);

            root.add(secondNebula);

            return {
                meteors,
                spawnMeteor,
                nebula,
                secondNebula
            };
        }

        /* =====================================
           INITIALIZE SELECTED SCENE
        ===================================== */

        let sceneData;

        switch (sceneId) {
            case 'solar':
                camera.position.set(0, 35, 135);
                sceneData = createSolarSystem();
                break;

            case 'galaxy':
                camera.position.set(0, 78, 140);
                sceneData = createGalaxy();
                break;

            case 'meteor':
            default:
                sceneData = createMeteorShower();
                break;
        }

        camera.lookAt(0, 0, 0);

        /* =====================================
           USER INTERACTION
        ===================================== */

        function onPointerDown(event) {
            dragging = true;

            previousX = event.clientX;
            previousY = event.clientY;
        }

        function onPointerMove(event) {
            if (!dragging) return;

            targetRotationY +=
                (event.clientX - previousX) * .004;

            targetRotationX +=
                (event.clientY - previousY) * .003;

            targetRotationX = THREE.MathUtils.clamp(
                targetRotationX,
                -.9,
                .9
            );

            previousX = event.clientX;
            previousY = event.clientY;
        }

        function onPointerUp() {
            dragging = false;
        }

        function onWheel(event) {
            targetZoom = THREE.MathUtils.clamp(
                targetZoom + event.deltaY * .0008,
                .7,
                1.5
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
           RESPONSIVE
        ===================================== */

        function resize() {
            if (disposed) return;

            const width = Math.max(
                1,
                host.clientWidth
            );

            const height = Math.max(
                1,
                host.clientHeight
            );

            camera.aspect = width / height;

            camera.updateProjectionMatrix();

            renderer.setSize(
                width,
                height,
                false
            );
        }

        window.addEventListener(
            'resize',
            resize,
            { passive: true }
        );

        resize();

        /* =====================================
           ANIMATION LOOP
        ===================================== */

        let lastTime = 0;

        function animate() {
            if (disposed) return;

            frameId = requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            const delta = Math.min(
                elapsed - lastTime || .016,
                .05
            );

            lastTime = elapsed;

            if (!reducedMotion.matches) {
                root.rotation.y +=
                    (targetRotationY - root.rotation.y) * .035;

                root.rotation.x +=
                    (targetRotationX - root.rotation.x) * .035;

                if (sceneId === 'solar') {
                    sceneData.sun.rotation.y += delta * .12;

                    sceneData.planets.forEach(planet => {
                        planet.userData.angle +=
                            delta * planet.userData.speed * .12;

                        const orbit = planet.userData.orbit;

                        planet.position.set(
                            Math.cos(planet.userData.angle) * orbit,
                            Math.sin(planet.userData.angle) * orbit * .72,
                            0
                        );

                        planet.rotation.y += delta * .2;
                    });
                }

                if (sceneId === 'galaxy') {
                    sceneData.galaxy.rotation.z += delta * .018;

                    sceneData.clouds.forEach((cloud, index) => {
                        cloud.material.rotation +=
                            delta * (index % 2 ? .02 : -.02);
                    });

                    sceneData.core.scale.setScalar(
                        1 + Math.sin(elapsed * 1.4) * .025
                    );
                }

                if (sceneId === 'meteor') {
                    sceneData.meteors.forEach(meteor => {
                        meteor.progress +=
                            delta * meteor.speed;

                        const progress = meteor.progress;

                        meteor.head.position.lerpVectors(
                            meteor.start,
                            meteor.end,
                            progress
                        );

                        const tail = meteor.head.position.clone()
                            .lerp(meteor.start, .28);

                        meteor.trail.geometry.setFromPoints([
                            meteor.head.position,
                            tail
                        ]);

                        meteor.trail.material.opacity =
                            Math.max(0, 1 - progress);

                        if (progress >= 1) {
                            meteor.progress = 0;

                            meteor.start.set(
                                random(35, 90),
                                random(20, 65),
                                random(-50, -10)
                            );

                            meteor.end.copy(
                                meteor.start
                            ).add(
                                new THREE.Vector3(
                                    random(-45, -25),
                                    random(-35, -15),
                                    0
                                )
                            );
                        }
                    });

                    if (
                        Math.random() < .02 &&
                        sceneData.meteors.length < 14
                    ) {
                        sceneData.spawnMeteor();
                    }

                    sceneData.nebula.material.rotation +=
                        delta * .006;
                }

                stars.rotation.y += delta * .001;
            }

            zoom += (targetZoom - zoom) * .08;

            const distance =
                (sceneId === 'solar'
                    ? 135
                    : sceneId === 'galaxy'
                        ? 160
                        : 110) / zoom;

            camera.position.setLength(distance);

            renderer.render(scene, camera);
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
                if (resource && resource.dispose) {
                    resource.dispose();
                }
            });

            renderer.dispose();
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

        setTimeout(() => {
            if (experience.dispose) {
                experience.dispose();
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
        }, CONFIG.fadeDuration);
    }

    /* =========================================
       ACTIVATE EXPERIENCE
    ========================================= */

    async function activateExperience() {
        if (activeExperience) return;

        const scene = getRandomScene();

        const shell = createExperienceShell(scene);

        const previousFocus = document.activeElement;

        const previousOverflow =
            document.body.style.overflow;

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
                    event.preventDefault();
                    shell.exit.focus();
                }
            }
        );

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
                scene.id
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
            activeExperience.timer = setTimeout(
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

        clickResetTimer = setTimeout(() => {
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
