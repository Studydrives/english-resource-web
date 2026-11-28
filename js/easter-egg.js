'use strict';

/**
 * HUFLIT English Hub
 * Immersive 3D Cosmic Easter Eggs
 *
 * Experiences:
 * - Solar System
 * - Spiral Galaxy
 * - Meteor Shower
 *
 * Three.js: 0.180.0
 */

(() => {
    const CONFIG = {
        threeUrl: 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js',
        triggerSelector: '[data-easter-egg-trigger]',
        activationClicks: 5,
        activationWindow: 2500,
        experienceDuration: 18000,
        maxPixelRatio: 1.8,
        maxDelta: 0.05,
        maxBursts: 12,
        maxMeteors: 24,
        galaxyParticles: 55000
    };

    const COLORS = {
        white: 0xffffff,
        cyan: 0x75dfff,
        blue: 0x428bff,
        violet: 0x9b72ff,
        gold: 0xffd27a,
        orange: 0xff8c42
    };

    const state = {
        clicks: [],
        active: null,
        threePromise: null,
        experienceId: 0
    };

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const randomColor = (colors) =>
        colors[Math.floor(Math.random() * colors.length)];

    function loadThree() {
        if (!state.threePromise) {
            state.threePromise = import(CONFIG.threeUrl).catch((error) => {
                state.threePromise = null;
                throw error;
            });
        }

        return state.threePromise;
    }

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

    function createExperienceShell() {
        const overlay = createElement('section', 'cosmic-experience');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Immersive cosmic experience');

        const canvasHost = createElement('div', 'cosmic-scene');

        const heading = createElement('header', 'cosmic-heading');
        const eyebrow = createElement(
            'p',
            'cosmic-eyebrow',
            'HUFLIT ENGLISH HUB · SPECIAL EXPERIENCE'
        );
        const title = createElement('h2', 'cosmic-title');
        const description = createElement('p', 'cosmic-description');

        heading.append(eyebrow, title, description);

        const hud = createElement('div', 'cosmic-hud');
        const sceneLabel = createElement('span', 'cosmic-scene-label');
        const sceneHint = createElement('span', 'cosmic-scene-hint');

        hud.append(sceneLabel, sceneHint);

        const controls = createElement('div', 'cosmic-controls');

        const speedWrapper = createElement(
            'label',
            'cosmic-speed-control'
        );

        const speedLabel = createElement('span', '', 'SPEED');

        const speedSlider = createElement(
            'input',
            'cosmic-speed-slider'
        );

        speedSlider.type = 'range';
        speedSlider.min = '0';
        speedSlider.max = '2';
        speedSlider.step = '0.05';
        speedSlider.value = '1';
        speedSlider.setAttribute('aria-label', 'Animation speed');

        speedWrapper.append(speedLabel, speedSlider);

        const orbitButton = createElement(
            'button',
            'cosmic-control-button',
            'Hide orbits'
        );

        orbitButton.type = 'button';
        orbitButton.setAttribute('aria-pressed', 'true');

        const stormButton = createElement(
            'button',
            'cosmic-control-button cosmic-storm-button',
            'Meteor storm'
        );

        stormButton.type = 'button';
        stormButton.hidden = true;

        const fullscreenButton = createElement(
            'button',
            'cosmic-control-button',
            'Fullscreen'
        );

        fullscreenButton.type = 'button';

        const exitButton = createElement(
            'button',
            'cosmic-exit',
            '×'
        );

        exitButton.type = 'button';
        exitButton.setAttribute('aria-label', 'Close experience');

        controls.append(
            speedWrapper,
            orbitButton,
            stormButton,
            fullscreenButton
        );

        overlay.append(
            canvasHost,
            heading,
            hud,
            controls,
            exitButton
        );

        return {
            overlay,
            canvasHost,
            title,
            description,
            sceneLabel,
            sceneHint,
            speedSlider,
            orbitButton,
            stormButton,
            fullscreenButton,
            exitButton
        };
    }

    function createResourceManager() {
        const resources = new Set();
        let disposed = false;

        return {
            track(resource) {
                if (resource && !disposed) {
                    resources.add(resource);
                }

                return resource;
            },

            dispose(resource) {
                if (!resource || !resources.has(resource)) {
                    return;
                }

                resources.delete(resource);

                try {
                    resource.dispose?.();
                } catch (error) {
                    console.warn('[Cosmic] Resource disposal failed:', error);
                }
            },

            disposeAll() {
                if (disposed) {
                    return;
                }

                disposed = true;

                for (const resource of resources) {
                    try {
                        resource.dispose?.();
                    } catch (error) {
                        console.warn(
                            '[Cosmic] Resource disposal failed:',
                            error
                        );
                    }
                }

                resources.clear();
            }
        };
    }

    function createGeometry(THREE, manager, geometry) {
        return manager.track(geometry);
    }

    function createMaterial(manager, material) {
        return manager.track(material);
    }

    function createTexture(THREE, manager, canvas) {
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        return manager.track(texture);
    }

    function createCanvasTexture(THREE, manager, painter, width = 1024, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Canvas 2D context is unavailable.');
        }

        painter(context, width, height);

        return createTexture(THREE, manager, canvas);
    }

    function createNoiseTexture(THREE, manager, options = {}) {
        const {
            base = '#182c55',
            colors = ['#4b8cbd', '#73b9d8', '#d0e8e8'],
            width = 1024,
            height = 512,
            density = 1500
        } = options;

        return createCanvasTexture(
            THREE,
            manager,
            (context, canvasWidth, canvasHeight) => {
                context.fillStyle = base;
                context.fillRect(0, 0, canvasWidth, canvasHeight);

                for (let i = 0; i < density; i += 1) {
                    const x = Math.random() * canvasWidth;
                    const y = Math.random() * canvasHeight;
                    const radius = random(2, 22);

                    context.globalAlpha = random(0.025, 0.2);
                    context.fillStyle = randomColor(colors);
                    context.beginPath();
                    context.ellipse(
                        x,
                        y,
                        radius * random(0.8, 2.4),
                        radius,
                        random(0, Math.PI),
                        0,
                        Math.PI * 2
                    );
                    context.fill();
                }

                context.globalAlpha = 1;

                for (let i = 0; i < density / 3; i += 1) {
                    const x = Math.random() * canvasWidth;
                    const y = Math.random() * canvasHeight;

                    context.fillStyle = `rgba(255,255,255,${random(0.02, 0.13)})`;
                    context.fillRect(x, y, random(1, 3), random(1, 3));
                }
            },
            width,
            height
        );
    }

    function createPlanetTexture(THREE, manager, type) {
        const palettes = {
            mercury: {
                base: '#514d49',
                colors: ['#827b70', '#aaa092', '#292a2b']
            },
            venus: {
                base: '#a66c36',
                colors: ['#e9bd79', '#f2d39a', '#9d522c']
            },
            earth: {
                base: '#174a83',
                colors: ['#2c8c56', '#8cbf70', '#d4e6d1']
            },
            mars: {
                base: '#a7472d',
                colors: ['#d77a4a', '#6d2c21', '#e9a06c']
            },
            jupiter: {
                base: '#b58a65',
                colors: ['#e5c6a1', '#8b5139', '#f0d8b8']
            },
            saturn: {
                base: '#b49a69',
                colors: ['#ead6a4', '#917a51', '#d7bd87']
            },
            uranus: {
                base: '#5b9ca8',
                colors: ['#8bd0d6', '#b0e2dc', '#477b96']
            },
            neptune: {
                base: '#174b9b',
                colors: ['#3677d1', '#75a6e5', '#102d75']
            }
        };

        const palette = palettes[type] || palettes.earth;

        return createNoiseTexture(THREE, manager, {
            ...palette,
            density: type === 'earth' ? 2800 : 1800
        });
    }

    function createGlowTexture(THREE, manager, color = '#ffffff') {
        return createCanvasTexture(
            THREE,
            manager,
            (context, width, height) => {
                const gradient = context.createRadialGradient(
                    width / 2,
                    height / 2,
                    0,
                    width / 2,
                    height / 2,
                    width / 2
                );

                gradient.addColorStop(0, color);
                gradient.addColorStop(0.12, color);
                gradient.addColorStop(0.35, 'rgba(255,255,255,0.25)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');

                context.fillStyle = gradient;
                context.fillRect(0, 0, width, height);
            },
            256,
            256
        );
    }

    function createGlow(THREE, manager, color, size, opacity = 0.5) {
        const material = createMaterial(
            manager,
            new THREE.SpriteMaterial({
                map: createGlowTexture(THREE, manager, color),
                color: COLORS.white,
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

    function createStarfield(THREE, manager, scene, count = 9000, radius = 180) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const colorPalette = [
            new THREE.Color('#ffffff'),
            new THREE.Color('#b9d9ff'),
            new THREE.Color('#ffe2c0'),
            new THREE.Color('#a7baff')
        ];

        for (let i = 0; i < count; i += 1) {
            const index = i * 3;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(random(-1, 1));

            positions[index] = radius * Math.sin(phi) * Math.cos(theta);
            positions[index + 1] = radius * Math.cos(phi);
            positions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);

            const color = randomColor(colorPalette);

            colors[index] = color.r;
            colors[index + 1] = color.g;
            colors[index + 2] = color.b;
        }

        const geometry = createGeometry(
            THREE,
            manager,
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

        const material = createMaterial(
            manager,
            new THREE.PointsMaterial({
                size: 0.42,
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                sizeAttenuation: true,
                depthWrite: false
            })
        );

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);

        return stars;
    }

    function createOrbit(THREE, manager, radius, color = 0x526b91) {
        const geometry = createGeometry(
            THREE,
            manager,
            new THREE.BufferGeometry().setFromPoints(
                Array.from({ length: 181 }, (_, index) => {
                    const angle = (index / 180) * Math.PI * 2;

                    return new THREE.Vector3(
                        Math.cos(angle) * radius,
                        0,
                        Math.sin(angle) * radius
                    );
                })
            )
        );

        const material = createMaterial(
            manager,
            new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity: 0.28
            })
        );

        return new THREE.LineLoop(geometry, material);
    }

    function createSun(THREE, manager, scene) {
        const group = new THREE.Group();

        const geometry = createGeometry(
            THREE,
            manager,
            new THREE.SphereGeometry(3.8, 96, 96)
        );

        const material = createMaterial(
            manager,
            new THREE.MeshBasicMaterial({
                color: 0xffb347
            })
        );

        const sun = new THREE.Mesh(geometry, material);
        group.add(sun);

        const corona = createGlow(
            THREE,
            manager,
            '#ff9a37',
            18,
            0.75
        );

        group.add(corona);

        const innerGlow = createGlow(
            THREE,
            manager,
            '#ffe2a0',
            10,
            0.7
        );

        group.add(innerGlow);

        const pointLight = new THREE.PointLight(0xffd39b, 170, 180, 1.4);
        group.add(pointLight);

        scene.add(group);

        return {
            group,
            sun,
            corona,
            innerGlow,
            pointLight
        };
    }

    function createRing(THREE, manager, innerRadius, outerRadius, color, opacity) {
        const geometry = createGeometry(
            THREE,
            manager,
            new THREE.RingGeometry(innerRadius, outerRadius, 160)
        );

        const material = createMaterial(
            manager,
            new THREE.MeshBasicMaterial({
                color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity,
                depthWrite: false
            })
        );

        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2.2;

        return ring;
    }

    function createAsteroidBelt(THREE, manager, scene) {
        const count = 3200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const colorPalette = [
            new THREE.Color('#a99a85'),
            new THREE.Color('#d0b99b'),
            new THREE.Color('#777b87')
        ];

        for (let i = 0; i < count; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const radius = random(19, 25);
            const index = i * 3;

            positions[index] = Math.cos(angle) * radius;
            positions[index + 1] = random(-0.5, 0.5);
            positions[index + 2] = Math.sin(angle) * radius;

            const color = randomColor(colorPalette);

            colors[index] = color.r;
            colors[index + 1] = color.g;
            colors[index + 2] = color.b;
        }

        const geometry = createGeometry(
            THREE,
            manager,
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

        const material = createMaterial(
            manager,
            new THREE.PointsMaterial({
                size: 0.11,
                vertexColors: true,
                transparent: true,
                opacity: 0.78,
                sizeAttenuation: true
            })
        );

        const belt = new THREE.Points(geometry, material);
        scene.add(belt);

        return belt;
    }

    function createSolarSystem(THREE, manager, scene, world) {
        const solar = {
            planets: [],
            orbits: [],
            asteroidBelt: null,
            sun: null
        };

        solar.sun = createSun(THREE, manager, world);

        const planetData = [
            {
                name: 'Mercury',
                type: 'mercury',
                radius: 0.42,
                orbit: 7,
                speed: 0.75,
                rotation: 0.35
            },
            {
                name: 'Venus',
                type: 'venus',
                radius: 0.72,
                orbit: 10,
                speed: 0.48,
                rotation: 0.16
            },
            {
                name: 'Earth',
                type: 'earth',
                radius: 0.82,
                orbit: 14,
                speed: 0.34,
                rotation: 0.75,
                atmosphere: true
            },
            {
                name: 'Mars',
                type: 'mars',
                radius: 0.62,
                orbit: 18,
                speed: 0.26,
                rotation: 0.65
            },
            {
                name: 'Jupiter',
                type: 'jupiter',
                radius: 2.2,
                orbit: 29,
                speed: 0.13,
                rotation: 0.9
            },
            {
                name: 'Saturn',
                type: 'saturn',
                radius: 1.85,
                orbit: 39,
                speed: 0.095,
                rotation: 0.7,
                ring: true
            },
            {
                name: 'Uranus',
                type: 'uranus',
                radius: 1.15,
                orbit: 48,
                speed: 0.065,
                rotation: 0.5,
                ring: true
            },
            {
                name: 'Neptune',
                type: 'neptune',
                radius: 1.1,
                orbit: 56,
                speed: 0.05,
                rotation: 0.6
            }
        ];

        planetData.forEach((data, index) => {
            const orbitGroup = new THREE.Group();
            world.add(orbitGroup);

            const geometry = createGeometry(
                THREE,
                manager,
                new THREE.SphereGeometry(data.radius, 64, 64)
            );

            const texture = createPlanetTexture(
                THREE,
                manager,
                data.type
            );

            const material = createMaterial(
                manager,
                new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.92,
                    metalness: 0.02
                })
            );

            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = data.orbit;

            orbitGroup.add(planet);

            if (data.atmosphere) {
                const atmosphereGeometry = createGeometry(
                    THREE,
                    manager,
                    new THREE.SphereGeometry(
                        data.radius * 1.09,
                        48,
                        48
                    )
                );

                const atmosphereMaterial = createMaterial(
                    manager,
                    new THREE.MeshBasicMaterial({
                        color: 0x5bbdff,
                        transparent: true,
                        opacity: 0.12,
                        side: THREE.BackSide,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    })
                );

                planet.add(
                    new THREE.Mesh(
                        atmosphereGeometry,
                        atmosphereMaterial
                    )
                );

                const cloudMaterial = createMaterial(
                    manager,
                    new THREE.MeshBasicMaterial({
                        color: 0xeaf8ff,
                        transparent: true,
                        opacity: 0.16,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    })
                );

                const cloudGeometry = createGeometry(
                    THREE,
                    manager,
                    new THREE.SphereGeometry(
                        data.radius * 1.025,
                        48,
                        48
                    )
                );

                const clouds = new THREE.Mesh(
                    cloudGeometry,
                    cloudMaterial
                );

                planet.add(clouds);
                planet.userData.clouds = clouds;
            }

            if (data.ring) {
                const ring = createRing(
                    THREE,
                    manager,
                    data.radius * 1.35,
                    data.radius * 2.15,
                    index === 5 ? 0xcbb58a : 0x8fc4cc,
                    index === 5 ? 0.72 : 0.32
                );

                planet.add(ring);

                if (index === 5) {
                    const secondRing = createRing(
                        THREE,
                        manager,
                        data.radius * 1.55,
                        data.radius * 1.8,
                        0xf1dfbd,
                        0.5
                    );

                    planet.add(secondRing);
                }
            }

            const orbit = createOrbit(
                THREE,
                manager,
                data.orbit,
                index % 2 === 0 ? 0x637ca4 : 0x425c85
            );

            world.add(orbit);
            solar.orbits.push(orbit);

            solar.planets.push({
                mesh: planet,
                orbitGroup,
                data,
                angle: random(0, Math.PI * 2)
            });
        });

        solar.asteroidBelt = createAsteroidBelt(
            THREE,
            manager,
            world
        );

        const ambient = new THREE.AmbientLight(0x7186b5, 1.3);
        world.add(ambient);

        return solar;
    }

    function createGalaxy(THREE, manager, scene, world) {
        const count = CONFIG.galaxyParticles;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const palette = [
            new THREE.Color('#83b9ff'),
            new THREE.Color('#a68aff'),
            new THREE.Color('#e5b9ff'),
            new THREE.Color('#ffffff'),
            new THREE.Color('#ffb7d8')
        ];

        const arms = 4;

        for (let i = 0; i < count; i += 1) {
            const arm = i % arms;
            const distance = Math.pow(Math.random(), 0.65) * 34;
            const angle =
                (arm / arms) * Math.PI * 2 +
                distance * 0.21 +
                random(-0.32, 0.32);

            const spread = Math.pow(distance / 34, 0.8);

            const index = i * 3;

            positions[index] =
                Math.cos(angle) * distance +
                random(-1.8, 1.8) * spread;

            positions[index + 1] =
                random(-1.2, 1.2) * spread;

            positions[index + 2] =
                Math.sin(angle) * distance +
                random(-1.8, 1.8) * spread;

            const color = randomColor(palette);

            const distanceFactor = 1 - distance / 50;

            colors[index] = color.r * distanceFactor;
            colors[index + 1] = color.g * distanceFactor;
            colors[index + 2] = color.b * distanceFactor;

            sizes[i] = random(0.35, 1.8);
        }

        const geometry = createGeometry(
            THREE,
            manager,
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

        geometry.setAttribute(
            'aSize',
            new THREE.BufferAttribute(sizes, 1)
        );

        const material = createMaterial(
            manager,
            new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexShader: `
                    attribute float aSize;
                    varying vec3 vColor;

                    void main() {
                        vColor = color;

                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                        gl_PointSize = clamp(
                            aSize * (240.0 / -mvPosition.z),
                            1.0,
                            8.0
                        );

                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;

                    void main() {
                        vec2 centered = gl_PointCoord - vec2(0.5);
                        float distanceFromCenter = length(centered);

                        if (distanceFromCenter > 0.5) {
                            discard;
                        }

                        float glow = smoothstep(
                            0.5,
                            0.05,
                            distanceFromCenter
                        );

                        gl_FragColor = vec4(
                            vColor,
                            glow * 0.95
                        );
                    }
                `,
                vertexColors: true
            })
        );

        const particles = new THREE.Points(geometry, material);
        world.add(particles);

        const coreGeometry = createGeometry(
            THREE,
            manager,
            new THREE.SphereGeometry(2.2, 64, 64)
        );

        const coreMaterial = createMaterial(
            manager,
            new THREE.MeshBasicMaterial({
                color: 0xffd7f2
            })
        );

        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        world.add(core);

        const coreGlow = createGlow(
            THREE,
            manager,
            '#b98cff',
            22,
            0.95
        );

        world.add(coreGlow);

        const innerGlow = createGlow(
            THREE,
            manager,
            '#fff0ff',
            9,
            0.85
        );

        world.add(innerGlow);

        const nebulaColors = [
            '#563caa',
            '#7b3b9f',
            '#315fba',
            '#c05caa'
        ];

        const nebulae = [];

        for (let i = 0; i < 14; i += 1) {
            const glow = createGlow(
                THREE,
                manager,
                randomColor(nebulaColors),
                random(9, 19),
                random(0.08, 0.22)
            );

            const angle = random(0, Math.PI * 2);
            const distance = random(10, 32);

            glow.position.set(
                Math.cos(angle) * distance,
                random(-2, 2),
                Math.sin(angle) * distance
            );

            world.add(glow);
            nebulae.push(glow);
        }

        const dustCount = 12000;
        const dustPositions = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount; i += 1) {
            const index = i * 3;

            dustPositions[index] = random(-48, 48);
            dustPositions[index + 1] = random(-10, 10);
            dustPositions[index + 2] = random(-48, 48);
        }

        const dustGeometry = createGeometry(
            THREE,
            manager,
            new THREE.BufferGeometry()
        );

        dustGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(dustPositions, 3)
        );

        const dustMaterial = createMaterial(
            manager,
            new THREE.PointsMaterial({
                color: 0x9c9acb,
                size: 0.08,
                transparent: true,
                opacity: 0.38,
                depthWrite: false
            })
        );

        const dust = new THREE.Points(dustGeometry, dustMaterial);
        world.add(dust);

        return {
            particles,
            core,
            coreGlow,
            innerGlow,
            nebulae,
            dust
        };
    }

    function createMeteorTrail(THREE, manager) {
        const positions = new Float32Array(6);

        const geometry = createGeometry(
            THREE,
            manager,
            new THREE.BufferGeometry()
        );

        const positionAttribute = new THREE.BufferAttribute(
            positions,
            3
        );

        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        geometry.setAttribute('position', positionAttribute);

        const material = createMaterial(
            manager,
            new THREE.LineBasicMaterial({
                color: 0xb8e6ff,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );

        const line = new THREE.Line(geometry, material);

        return {
            line,
            positions,
            positionAttribute
        };
    }

    function createMeteor(THREE, manager, scene, options = {}) {
        const group = new THREE.Group();

        const length = options.length || random(5, 10);
        const speed = options.speed || random(0.16, 0.34);

        const headGeometry = createGeometry(
            THREE,
            manager,
            new THREE.SphereGeometry(
                options.size || random(0.09, 0.17),
                16,
                16
            )
        );

        const headMaterial = createMaterial(
            manager,
            new THREE.MeshBasicMaterial({
                color: options.color || 0xd8f2ff
            })
        );

        const head = new THREE.Mesh(headGeometry, headMaterial);
        group.add(head);

        const glow = createGlow(
            THREE,
            manager,
            '#8bd8ff',
            length * 1.8,
            0.65
        );

        group.add(glow);

        const trail = createMeteorTrail(THREE, manager);
        group.add(trail.line);

        const start = new THREE.Vector3(
            random(24, 52),
            random(8, 28),
            random(-24, 24)
        );

        const direction = new THREE.Vector3(
            -random(0.7, 1.2),
            -random(0.4, 0.9),
            random(-0.25, 0.25)
        ).normalize();

        const end = start.clone().addScaledVector(
            direction,
            length * 2
        );

        group.position.copy(start);

        scene.add(group);

        return {
            group,
            head,
            glow,
            trail,
            start,
            end,
            direction,
            speed,
            progress: 0,
            length,
            active: true
        };
    }

    function updateMeteorTrail(THREE, meteor) {
        const headPosition = meteor.head.position;

        meteor.trail.positions[0] = headPosition.x;
        meteor.trail.positions[1] = headPosition.y;
        meteor.trail.positions[2] = headPosition.z;

        meteor.trail.positions[3] =
            headPosition.x - meteor.direction.x * meteor.length;

        meteor.trail.positions[4] =
            headPosition.y - meteor.direction.y * meteor.length;

        meteor.trail.positions[5] =
            headPosition.z - meteor.direction.z * meteor.length;

        meteor.trail.positionAttribute.needsUpdate = true;
    }

    function createMeteorShower(THREE, manager, scene) {
        const meteors = [];
        const bursts = [];


        const ambient = new THREE.AmbientLight(0x8099c7, 1.1);
        scene.add(ambient);

        for (let i = 0; i < 14; i += 1) {
            meteors.push(
                createMeteor(THREE, manager, scene)
            );
        }

        function spawnMeteor(options = {}) {
            if (meteors.length >= CONFIG.maxMeteors) {
                return;
            }

            meteors.push(
                createMeteor(THREE, manager, scene, options)
            );
        }

        function createBurst(position) {
if (bursts.length >= CONFIG.maxBursts) {
    const oldest = bursts.shift();

    if (oldest) {
        scene.remove(oldest.points);

        manager.dispose(oldest.points.geometry);
        manager.dispose(oldest.points.material);
    }
}

            const count = 28;
            const positions = new Float32Array(count * 3);
            const velocities = [];

            for (let i = 0; i < count; i += 1) {
                const index = i * 3;

                positions[index] = position.x;
                positions[index + 1] = position.y;
                positions[index + 2] = position.z;

                velocities.push(
                    new THREE.Vector3(
                        random(-1, 1),
                        random(-1, 1),
                        random(-1, 1)
                    ).normalize().multiplyScalar(random(0.04, 0.16))
                );
            }

            const geometry = createGeometry(
                THREE,
                manager,
                new THREE.BufferGeometry()
            );

            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );

            const material = createMaterial(
                manager,
                new THREE.PointsMaterial({
                    color: randomColor([
                        0xffd5a1,
                        0xa7dfff,
                        0xffffff
                    ]),
                    size: 0.16,
                    transparent: true,
                    opacity: 1,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );

            const points = new THREE.Points(geometry, material);
            scene.add(points);

            bursts.push({
                points,
                velocities,
                age: 0,
                lifetime: 1.2
            });
        }

        function removeMeteor(index) {
            const meteor = meteors[index];

            if (!meteor) {
                return;
            }

            scene.remove(meteor.group);
            manager.dispose(meteor.head.geometry);
            manager.dispose(meteor.head.material);
            
            manager.dispose(meteor.glow.material.map);
            manager.dispose(meteor.glow.material);
            
            manager.dispose(meteor.trail.line.geometry);
            manager.dispose(meteor.trail.line.material);
            meteors.splice(index, 1);
        }

        function update(delta, elapsed) {
            for (let i = meteors.length - 1; i >= 0; i -= 1) {
                const meteor = meteors[i];

                meteor.progress += meteor.speed * delta;

                const progress = clamp(meteor.progress, 0, 1);

                meteor.group.position.lerpVectors(
                    meteor.start,
                    meteor.end,
                    progress
                );

                meteor.head.position.set(0, 0, 0);

                updateMeteorTrail(THREE, meteor);

                const fadeIn = clamp(progress * 8, 0, 1);
                const fadeOut = clamp((1 - progress) * 7, 0, 1);

                meteor.trail.line.material.opacity =
                    Math.min(fadeIn, fadeOut) * 0.9;

                if (progress >= 1) {
                    createBurst(meteor.group.position);
                    removeMeteor(i);
                }
            }

            if (meteors.length < 18 && Math.random() < delta * 2.2) {
                spawnMeteor();
            }

            for (let i = bursts.length - 1; i >= 0; i -= 1) {
                const burst = bursts[i];

                burst.age += delta;

                const positionAttribute =
                    burst.points.geometry.getAttribute('position');

                const positions = positionAttribute.array;

                for (let particle = 0; particle < burst.velocities.length; particle += 1) {
                    const index = particle * 3;
                    const velocity = burst.velocities[particle];

                    positions[index] += velocity.x;
                    positions[index + 1] += velocity.y;
                    positions[index + 2] += velocity.z;

                    velocity.multiplyScalar(0.985);
                }

                positionAttribute.needsUpdate = true;

                burst.points.material.opacity =
                    clamp(1 - burst.age / burst.lifetime, 0, 1);

                if (burst.age >= burst.lifetime) {
                    scene.remove(burst.points);
                    manager.dispose(burst.points.geometry);
                    manager.dispose(burst.points.material);
                    bursts.splice(i, 1);
                }
            }
        }

        function dispose() {
            for (let i = meteors.length - 1; i >= 0; i -= 1) {
                scene.remove(meteors[i].group);
            }

            meteors.length = 0;

            for (let i = bursts.length - 1; i >= 0; i -= 1) {
                scene.remove(bursts[i].points);
            }

            bursts.length = 0;
        }

        return {
            meteors,
            bursts,
            spawnMeteor,
            update,
            dispose
        };
    }

    function createSceneExperience(THREE, type, manager) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030611);

        const world = new THREE.Group();
        scene.add(world);

        const camera = new THREE.PerspectiveCamera(
            55,
            1,
            0.1,
            500
        );

        camera.position.set(0, 18, 72);
        camera.lookAt(0, 0, 0);

        const starfield = createStarfield(
            THREE,
            manager,
            scene,
            type === 'galaxy' ? 6500 : 9000,
            190
        );

        let solar = null;
        let galaxy = null;
        let meteorShower = null;

        if (type === 'solar-system') {
            world.rotation.x = -0.18;
            solar = createSolarSystem(
                THREE,
                manager,
                scene,
                world
            );
        }

        if (type === 'galaxy') {
            world.rotation.x = -0.32;
            galaxy = createGalaxy(
                THREE,
                manager,
                scene,
                world
            );
        }

        if (type === 'meteor-shower') {
            world.rotation.x = -0.08;
            meteorShower = createMeteorShower(
                THREE,
                manager,
                scene
            );
        }

        return {
            scene,
            world,
            camera,
            starfield,
            solar,
            galaxy,
            meteorShower,
            type
        };
    }

    function createRenderer(THREE, canvasHost) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio)
        );

        renderer.setSize(
            canvasHost.clientWidth || window.innerWidth,
            canvasHost.clientHeight || window.innerHeight
        );

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        canvasHost.appendChild(renderer.domElement);

        return renderer;
    }

    function createThreeExperience(THREE, shell, type, experienceId) {
const manager = createResourceManager();
let experience;

try {
    experience = createSceneExperience(
        THREE,
        type,
        manager
    );
} catch (error) {
    manager.disposeAll();
    throw error;
}

        let renderer = null;
        let frameId = 0;
        let disposed = false;
        let paused = false;
        let speed = 1;
        let showOrbits = true;
        let stormTimeout = null;

        const listeners = [];
        const pointer = {
            active: false,
            x: 0,
            y: 0,
            previousX: 0,
            previousY: 0,
            rotationX: 0,
            rotationY: 0
        };

        const clock = new THREE.Clock();

        const reducedMotion = window.matchMedia?.(
            '(prefers-reduced-motion: reduce)'
        );

        function addListener(target, event, callback, options) {
            target.addEventListener(event, callback, options);

            listeners.push(() => {
                target.removeEventListener(event, callback, options);
            });
        }

        function resize() {
            if (disposed || !renderer) {
                return;
            }

            const width = Math.max(
                1,
                shell.canvasHost.clientWidth || window.innerWidth
            );

            const height = Math.max(
                1,
                shell.canvasHost.clientHeight || window.innerHeight
            );

            experience.camera.aspect = width / height;
            experience.camera.updateProjectionMatrix();

            renderer.setSize(width, height, false);

            renderer.setPixelRatio(
                Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio)
            );
        }

        function updateSolar(delta, elapsed) {
            if (!experience.solar) {
                return;
            }

            const solar = experience.solar;

            solar.sun.sun.rotation.y += delta * 0.12;
            solar.sun.corona.material.rotation += delta * 0.025;
            solar.sun.innerGlow.material.rotation -= delta * 0.018;

            solar.asteroidBelt.rotation.y += delta * 0.025;

            solar.planets.forEach((planet) => {
                planet.angle +=
                    planet.data.speed * delta * 0.18 * speed;

                planet.orbitGroup.rotation.y = planet.angle;
                planet.mesh.rotation.y +=
                    planet.data.rotation * delta * 0.18 * speed;

                if (planet.mesh.userData.clouds) {
                    planet.mesh.userData.clouds.rotation.y +=
                        delta * 0.08 * speed;
                }
            });

            solar.orbits.forEach((orbit) => {
                orbit.visible = showOrbits;
            });
        }

        function updateGalaxy(delta, elapsed) {
            if (!experience.galaxy) {
                return;
            }

            const galaxy = experience.galaxy;

            galaxy.particles.rotation.y += delta * 0.018 * speed;
            galaxy.core.rotation.y += delta * 0.09 * speed;
            galaxy.coreGlow.material.rotation += delta * 0.025;
            galaxy.innerGlow.material.rotation -= delta * 0.02;

            galaxy.dust.rotation.y -= delta * 0.012 * speed;

            galaxy.nebulae.forEach((nebula, index) => {
                nebula.material.opacity =
                    0.12 + Math.sin(elapsed * 0.6 + index) * 0.07;
            });
        }

        function updateMeteorShower(delta, elapsed) {
            if (!experience.meteorShower) {
                return;
            }

            experience.meteorShower.update(delta, elapsed);
        }

        function animate() {
            if (disposed || paused) {
                return;
            }

            frameId = requestAnimationFrame(animate);

            const delta = Math.min(
                clock.getDelta(),
                CONFIG.maxDelta
            );

            const elapsed = clock.elapsedTime;

            if (!reducedMotion?.matches) {
                experience.world.rotation.y += delta * 0.012 * speed;
                experience.starfield.rotation.y += delta * 0.002;
            }

            if (experience.type === 'solar-system') {
                updateSolar(delta, elapsed);
            }

            if (experience.type === 'galaxy') {
                updateGalaxy(delta, elapsed);
            }

            if (experience.type === 'meteor-shower') {
                updateMeteorShower(
                    reducedMotion?.matches ? 0 : delta,
                    elapsed
                );
            }

            experience.camera.position.x +=
                (pointer.rotationY * 5 - experience.camera.position.x) *
                Math.min(1, delta * 2);

            experience.camera.position.y +=
                (18 + pointer.rotationX * 4 - experience.camera.position.y) *
                Math.min(1, delta * 2);

            experience.camera.lookAt(0, 0, 0);

            renderer.render(
                experience.scene,
                experience.camera
            );
        }

        function start() {
            if (disposed || paused) {
                return;
            }

            clock.start();
            frameId = requestAnimationFrame(animate);
        }

        function pause() {
            if (disposed || paused) {
                return;
            }

            paused = true;

            cancelAnimationFrame(frameId);
            frameId = 0;
        }

        function resume() {
            if (disposed || !paused) {
                return;
            }

            paused = false;
            clock.start();
            start();
        }

        function handlePointerDown(event) {
            if (event.button !== 0) {
                return;
            }

            pointer.active = true;
            pointer.previousX = event.clientX;
            pointer.previousY = event.clientY;

            shell.canvasHost.setPointerCapture?.(event.pointerId);
        }

        function handlePointerMove(event) {
            if (!pointer.active) {
                return;
            }

            const deltaX = event.clientX - pointer.previousX;
            const deltaY = event.clientY - pointer.previousY;

            pointer.previousX = event.clientX;
            pointer.previousY = event.clientY;

            pointer.rotationY = clamp(
                pointer.rotationY + deltaX * 0.002,
                -1.4,
                1.4
            );

            pointer.rotationX = clamp(
                pointer.rotationX + deltaY * 0.002,
                -1,
                1
            );
        }

        function handlePointerUp() {
            pointer.active = false;
        }

        function handleWheel(event) {
            if (disposed) {
                return;
            }

            const current = experience.camera.position.length();
            const next = clamp(
                current + event.deltaY * 0.025,
                22,
                110
            );

            experience.camera.position.setLength(next);
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                pause();
            } else {
                resume();
            }
        }

        function handleContextLost(event) {
            event.preventDefault();
            pause();
        }

        function handleContextRestored() {
            if (disposed) {
                return;
            }

            resize();
            resume();
        }

        addListener(
            shell.canvasHost,
            'pointerdown',
            handlePointerDown
        );

        addListener(
            shell.canvasHost,
            'pointermove',
            handlePointerMove
        );

        addListener(
            shell.canvasHost,
            'pointerup',
            handlePointerUp
        );

        addListener(
            shell.canvasHost,
            'pointercancel',
            handlePointerUp
        );

        addListener(
            shell.canvasHost,
            'lostpointercapture',
            handlePointerUp
        );

        addListener(
            shell.canvasHost,
            'wheel',
            handleWheel,
            { passive: true }
        );

        addListener(
            document,
            'visibilitychange',
            handleVisibilityChange
        );

        if (window.ResizeObserver) {
            const observer = new ResizeObserver(resize);

            observer.observe(shell.canvasHost);

            listeners.push(() => observer.disconnect());
        } else {
            addListener(window, 'resize', resize);
        }

        try {
            renderer = createRenderer(
                THREE,
                shell.canvasHost
            );

            addListener(
                renderer.domElement,
                'webglcontextlost',
                handleContextLost
            );

            addListener(
                renderer.domElement,
                'webglcontextrestored',
                handleContextRestored
            );

            shell.speedSlider.addEventListener('input', () => {
                speed = Number(shell.speedSlider.value);
            });

            shell.orbitButton.addEventListener('click', () => {
                showOrbits = !showOrbits;

                shell.orbitButton.textContent = showOrbits
                    ? 'Hide orbits'
                    : 'Show orbits';

                shell.orbitButton.setAttribute(
                    'aria-pressed',
                    String(showOrbits)
                );
            });

            shell.stormButton.addEventListener('click', () => {
                if (!experience.meteorShower || disposed) {
                    return;
                }

                for (let i = 0; i < 10; i += 1) {
                    experience.meteorShower.spawnMeteor({
                        speed: random(0.22, 0.48),
                        length: random(7, 13),
                        size: random(0.1, 0.2)
                    });
                }

                shell.stormButton.classList.add('is-active');

                if (stormTimeout) {
                    clearTimeout(stormTimeout);
                }

                stormTimeout = window.setTimeout(() => {
                    if (!disposed) {
                        shell.stormButton.classList.remove('is-active');
                    }
                }, 700);
            });

            start();
            resize();
        } catch (error) {
            dispose();
            throw error;
        }

        function dispose() {
            if (disposed) {
                return;
            }

            disposed = true;

            cancelAnimationFrame(frameId);
            frameId = 0;

            if (stormTimeout) {
                clearTimeout(stormTimeout);
                stormTimeout = null;
            }

            listeners.forEach((removeListener) => {
                try {
                    removeListener();
                } catch (error) {
                    console.warn('[Cosmic] Listener cleanup failed:', error);
                }
            });

            listeners.length = 0;

            experience.meteorShower?.dispose();

            if (renderer) {
                try {
                    renderer.renderLists?.dispose();
                    renderer.dispose();
                    renderer.forceContextLoss();
                } catch (error) {
                    console.warn('[Cosmic] Renderer cleanup failed:', error);
                }

                renderer.domElement.remove();
                renderer = null;
            }

            manager.disposeAll();

            shell.canvasHost.replaceChildren();
        }

        return {
            dispose,
            pause,
            resume,
            resize,
            get disposed() {
                return disposed;
            },
            get id() {
                return experienceId;
            }
        };
    }

    const EXPERIENCE_DATA = {
        'solar-system': {
            title: 'The Solar System',
            description: 'A journey through eight planets and the light of our star.',
            label: '01 / SOLAR SYSTEM',
            hint: 'Drag to explore · Scroll to zoom',
            heading: 'Explore our cosmic neighborhood'
        },
        galaxy: {
            title: 'The Spiral Galaxy',
            description: '55,000 stars forming a luminous spiral across deep space.',
            label: '02 / SPIRAL GALAXY',
            hint: 'Drag to rotate · Scroll to zoom',
            heading: 'A universe of billions of stars'
        },
        'meteor-shower': {
            title: 'Meteor Shower',
            description: 'Watch brilliant meteors cross the darkness in a celestial storm.',
            label: '03 / METEOR SHOWER',
            hint: 'Drag to explore · Trigger a meteor storm',
            heading: 'A spectacular celestial event'
        }
    };

    function chooseExperience() {
        const types = [
            'solar-system',
            'galaxy',
            'meteor-shower'
        ];

        return types[Math.floor(Math.random() * types.length)];
    }

    function closeExperience(experienceId) {
        const active = state.active;

        if (!active) {
            return;
        }

        if (
            experienceId !== undefined &&
            active.id !== experienceId
        ) {
            return;
        }

        state.active = null;

        active.dispose?.();

        if (document.fullscreenElement === active.shell.overlay) {
            document.exitFullscreen?.().catch?.(() => {});
        }

        active.shell.overlay.classList.remove('is-visible');

        document.body.classList.remove('cosmic-experience-open');

        window.setTimeout(() => {
            active.shell.overlay.remove();
        }, 250);
    }

    async function openExperience(type) {
        if (state.active) {
            closeExperience(state.active.id);
        }

        const experienceId = ++state.experienceId;
        const shell = createExperienceShell();
        const data = EXPERIENCE_DATA[type];

        if (!data) {
            return;
        }

        shell.title.textContent = data.title;
        shell.description.textContent = data.description;
        shell.sceneLabel.textContent = data.label;
        shell.sceneHint.textContent = data.hint;

        shell.overlay.classList.add(`cosmic-${type}`);
        shell.overlay.dataset.scene = type;

        document.body.appendChild(shell.overlay);
        document.body.classList.add('cosmic-experience-open');

        requestAnimationFrame(() => {
            shell.overlay.classList.add('is-visible');
        });

        let experience = null;
        let closed = false;
        let timer = null;

        function dispose() {
            if (closed) {
                return;
            }

            closed = true;

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            experience?.dispose();
            experience = null;
        }

        state.active = {
            id: experienceId,
            shell,
            dispose
        };

        shell.exitButton.addEventListener('click', () => {
            closeExperience(experienceId);
        });

        shell.fullscreenButton.addEventListener('click', async () => {
            if (closed) {
                return;
            }

            try {
                if (document.fullscreenElement === shell.overlay) {
                    await document.exitFullscreen();
                } else {
                    await shell.overlay.requestFullscreen?.();
                }
            } catch (error) {
                console.warn('[Cosmic] Fullscreen unavailable:', error);
            }
        });

        shell.overlay.addEventListener('click', (event) => {
            if (event.target === shell.overlay) {
                closeExperience(experienceId);
            }
        });

        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
                closeExperience(experienceId);
            }
        };

        document.addEventListener('keydown', handleKeydown);

        const removeKeydown = () => {
            document.removeEventListener('keydown', handleKeydown);
        };

        const originalDispose = dispose;

        function finalDispose() {
            removeKeydown();
            originalDispose();
        }

        state.active.dispose = finalDispose;

        try {
            const THREE = await loadThree();

            if (
                closed ||
                state.active?.id !== experienceId
            ) {
                return;
            }

            experience = createThreeExperience(
                THREE,
                shell,
                type,
                experienceId
            );

            if (
                closed ||
                state.active?.id !== experienceId
            ) {
                experience.dispose();
                experience = null;
                return;
            }

            if (type === 'meteor-shower') {
                shell.stormButton.hidden = false;
            }

            timer = window.setTimeout(() => {
                closeExperience(experienceId);
            }, CONFIG.experienceDuration);
        } catch (error) {
            console.error('[Cosmic] Unable to start experience:', error);

            if (closed || state.active?.id !== experienceId) {
                return;
            }

            shell.title.textContent = 'Unable to load the experience';
            shell.description.textContent =
                'Your browser may not support WebGL, or the 3D library could not be loaded. Please try again.';

            shell.sceneHint.textContent = 'Close this window to continue';

            shell.canvasHost.replaceChildren();

            const fallback = createElement(
                'div',
                'cosmic-loading-error',
                '3D experience unavailable'
            );

            shell.canvasHost.appendChild(fallback);
        }
    }

    function handleTriggerClick() {
        const now = Date.now();

        state.clicks = state.clicks.filter(
            (timestamp) => now - timestamp <= CONFIG.activationWindow
        );

        state.clicks.push(now);

        if (state.clicks.length < CONFIG.activationClicks) {
            return;
        }

        state.clicks.length = 0;

        openExperience(chooseExperience());
    }

    function initialize() {
        const triggers = document.querySelectorAll(
            CONFIG.triggerSelector
        );

        if (!triggers.length) {
            return;
        }

        triggers.forEach((trigger) => {
            trigger.addEventListener(
                'click',
                handleTriggerClick
            );
        });
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
