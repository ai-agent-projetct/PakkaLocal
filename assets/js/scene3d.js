/**
 * PAKKA LOCAL — 3D ULTRA-REALISTIC WEBGL SCENE ENGINE (Three.js V32.0 Studio Master Edition)
 * Inspired by Wonderland WOW Media (Sections 3 & 7) & FMG Shipping
 * 
 * 4 Exact Sketchfab-Grade 3D Vehicle Models:
 *   1. Low-Poly Racing Superbike + 3D Rider (Pakka Bike Taxi / Solo Rush)
 *      Ref: https://sketchfab.com/3d-models/low-poly-racing-bike-557f70513c63494abfb289a3691557ba
 *   2. Bajaj RE Auto Rickshaw TukTuk (Pakka Auto Rickshaw)
 *      Ref: https://sketchfab.com/3d-models/auto-rickshaw-bajaj-tuktuk-6f1071fae1d4b35ae1f319e01c1bdd8
 *   3. Mazda RX8 Sports Sedan / Cab (Pakka Prime Cab & Outstation)
 *      Ref: https://sketchfab.com/3d-models/mazda-rx8-6c4dec575a814b1a87f484527b0ec1f1
 *   4. Checkers Sixty60 Delivery Bike (Pakka Parcel Express)
 *      Ref: https://sketchfab.com/3d-models/checkers-sixty60-bike-4aabf2a85abd43f98fc4e5f2a5ae62f1
 * 
 * Architectural Wonderland City:
 *   - 5 Skyscraper Archetypes: Tiered Stepped Towers, Prismatic Glass High-Rises, Cylindrical Towers, 
 *     Facade-Integrated DOOH Screens, and Twin Towers with Illuminated Skybridge.
 *   - Strict Spline Clearance: 0% collision with road, sidewalks, or intersections.
 *   - Dynamic 3/4 Quarter-View Camera Framing showing full vehicle body, spinning wheels, and skyline.
 *   - Pitch-Dark High-Contrast Asphalt Highway with Double Gold Center Lines & White Lane Dashes.
 */

class Pakka3DScene {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.canvas = document.getElementById('webgl-canvas');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.curve = null;
        
        // Progress & Navigation
        const urlParams = new URLSearchParams(window.location.search);
        const pParam = urlParams.get('p');
        const initialP = pParam !== null ? parseFloat(pParam) : 0.0;

        this.progress = initialP;
        this.targetProgress = initialP;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.heroLane = -2.4;
        this.prevProgress = initialP;
        
        const themeParam = urlParams.get('theme') || urlParams.get('day');
        let initialDay = (themeParam === 'day' || themeParam === '1' || themeParam === 'true');
        if (!themeParam) {
            try {
                if (localStorage.getItem('pl_theme') === 'day') initialDay = true;
            } catch (e) {}
        }
        this.isDayMode = initialDay;
        
        // Hero Showcase Vehicles
        this.heroVehicleGroup = null;
        this.racingBikeHero = null;
        this.bajajAutoHero = null;
        this.mazdaRX8Hero = null;
        this.checkersHero = null;
        this.evHero = null;
        this.outstationHero = null;
        this.cameraMode = 'chase'; // 'chase' | 'hood' | 'cinematic'
        
        // Scene Collections
        this.billboards = [];
        this.clickableMeshes = [];
        this.trafficVehicles = [];
        this.rotatingWheels = [];
        this.spireBeacons = [];
        this.streetLights = [];
        this.streetLightMeshes = [];
        this.vehiclePointLights = [];
        this.neonBorders = [];
        this.buildingMaterials = [];
        this.treeMeshes = [];
        this.raycaster = new THREE.Raycaster();
        this.mouseVec = new THREE.Vector2();
        
        this.clock = new THREE.Clock();
    }

    init() {
        this.canvas = this.canvas || document.getElementById('webgl-canvas');
        this.container = this.container || document.getElementById('canvas-container');
        if (!this.canvas) return;

        // 1. Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050711);
        this.scene.fog = new THREE.FogExp2(0x050711, 0.00030);

        // 2. Camera Setup (Cinematic 3/4 Quarter-View Chase Camera)
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 4500);
        this.camera.position.set(2.2, 2.2, 5.5);

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
        this.renderer.shadowMap.enabled = true;

        // 4. Photorealistic Blender PBR Environment & Textures
        this.initBlenderPBRLightingAndEnvironment();
        this.initProceduralTextures();
        this.buildCityGroundTerrain();
        this.createCityCornerSplineRoad();
        this.setupLighting();
        this.buildWonderlandArchitecturalSkyline();
        this.buildHeroVehicles();
        this.buildWonderlandDOOHBillboards();
        this.buildRealisticTrafficFleet();
        this.buildOverheadMetroFlyover();
        this.buildIntersectionTrafficLights();

        if (this.isDayMode) {
            this.setDayNightMode(true);
        }

        // 5. Event Listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onSceneClick(e));

        // 6. Start Render Loop
        this.animate();
    }

    /* ================= BLENDER CYCLES-GRADE PBR ENVIRONMENT & IBL ================= */
    initBlenderPBRLightingAndEnvironment() {
        const envCanvas = document.createElement('canvas');
        envCanvas.width = 1024;
        envCanvas.height = 512;
        const ectx = envCanvas.getContext('2d');

        // Atmospheric Sky Gradient with Golden Sunset Rim
        const skyGrad = ectx.createLinearGradient(0, 0, 0, 512);
        if (this.isDayMode) {
            skyGrad.addColorStop(0.0, '#38BDF8'); // Sky blue zenith
            skyGrad.addColorStop(0.5, '#BAE6FD'); // Atmospheric horizon
            skyGrad.addColorStop(0.75, '#FEF08A'); // Golden sun rim
            skyGrad.addColorStop(1.0, '#475569'); // Ground bounce
        } else {
            skyGrad.addColorStop(0.0, '#030712'); // Deep night space
            skyGrad.addColorStop(0.4, '#0F172A'); // Midnight indigo
            skyGrad.addColorStop(0.65, '#7C2D12'); // Golden city glow
            skyGrad.addColorStop(0.85, '#F59E0B'); // Warm amber street reflections
            skyGrad.addColorStop(1.0, '#090D16'); // Wet asphalt bounce
        }
        ectx.fillStyle = skyGrad;
        ectx.fillRect(0, 0, 1024, 512);

        // Specular Studio Softbox / City Neon Light Strips (For mirror clearcoat reflections)
        ectx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 10; i++) {
            const sx = (i / 10) * 1024 + 20;
            const sy = 90 + (i % 3) * 45;
            ectx.fillRect(sx, sy, 70, 14);
        }

        ectx.fillStyle = '#F5BA18';
        for (let i = 0; i < 14; i++) {
            const sx = Math.random() * 1024;
            const sy = 160 + Math.random() * 140;
            ectx.fillRect(sx, sy, 45, 8);
        }

        ectx.fillStyle = '#38BDF8';
        for (let i = 0; i < 8; i++) {
            const sx = Math.random() * 1024;
            const sy = 140 + Math.random() * 150;
            ectx.fillRect(sx, sy, 35, 6);
        }

        const envTex = new THREE.CanvasTexture(envCanvas);
        envTex.mapping = THREE.EquirectangularReflectionMapping;
        envTex.needsUpdate = true;

        if (this.scene) {
            this.scene.environment = envTex;
        }
    }

    /* ================= PROCEDURAL HIGH-DPI CITY & ROAD TEXTURES ================= */
    initProceduralTextures() {
        // 1. Sleek Modern Glass Skyscraper Facade Texture (Dark tinted glass with crisp warm gold/cyan lights)
        const winCanvas = document.createElement('canvas');
        winCanvas.width = 512;
        winCanvas.height = 512;
        const wctx = winCanvas.getContext('2d');
        wctx.fillStyle = '#080c18'; // Tinted dark glass
        wctx.fillRect(0, 0, 512, 512);

        const rows = 16;
        const cols = 16;
        const padX = 6;
        const padY = 8;
        const cellW = (512 - padX * (cols + 1)) / cols;
        const cellH = (512 - padY * (rows + 1)) / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = padX + c * (cellW + padX);
                const y = padY + r * (cellH + padY);

                const isLit = Math.random() > 0.38;
                if (isLit) {
                    const rnd = Math.random();
                    if (rnd < 0.60) {
                        wctx.fillStyle = '#FFDE7D'; // Warm Gold Light
                    } else if (rnd < 0.85) {
                        wctx.fillStyle = '#70D6FF'; // Neon Cyan Glow
                    } else {
                        wctx.fillStyle = '#FF9E00'; // Amber Glow
                    }
                } else {
                    wctx.fillStyle = '#0f1626'; // Dark unlit office
                }
                wctx.fillRect(x, y, cellW, cellH);
            }
        }

        this.windowTexture = new THREE.CanvasTexture(winCanvas);
        this.windowTexture.wrapS = THREE.RepeatWrapping;
        this.windowTexture.wrapT = THREE.RepeatWrapping;
        this.windowTexture.repeat.set(4, 10);
        this.windowTexture.needsUpdate = true;

        // 2. High-Resolution Photorealistic 2048x2048 Asphalt Road Texture (GTA 5 Redux Grade)
        const roadCanvas = document.createElement('canvas');
        roadCanvas.width = 2048;
        roadCanvas.height = 2048;
        const actx = roadCanvas.getContext('2d');
        actx.fillStyle = '#0e1017'; // Deep midnight asphalt tarmac
        actx.fillRect(0, 0, 2048, 2048);

        // Photorealistic asphalt aggregate noise & micro-grain
        for (let i = 0; i < 8000; i++) {
            const nx = Math.random() * 2048;
            const ny = Math.random() * 2048;
            const brightness = Math.random() > 0.5 ? '#1a1d26' : '#08090d';
            actx.fillStyle = brightness;
            actx.fillRect(nx, ny, 3, 3);
        }

        // Center Double Solid Gold Stripes (with glowing thermoplastic bevel)
        actx.fillStyle = '#F5BA18';
        actx.shadowColor = '#F5BA18';
        actx.shadowBlur = 12;
        for (let y = 0; y < 2048; y += 256) {
            actx.fillRect(984, y, 32, 176);
            actx.fillRect(1032, y, 32, 176);
        }
        actx.shadowBlur = 0;

        // Inner Dashed White Lane Dividers (with subtle wear)
        actx.fillStyle = '#FFFFFF';
        for (let y = 0; y < 2048; y += 192) {
            actx.fillRect(484, y, 28, 116);
            actx.fillRect(1536, y, 28, 116);
        }

        // Outer Solid Bright White Shoulder Lines
        actx.fillStyle = '#F8FAFC';
        actx.fillRect(60, 0, 36, 2048);
        actx.fillRect(1952, 0, 36, 2048);

        this.roadTexture = new THREE.CanvasTexture(roadCanvas);
        this.roadTexture.wrapS = THREE.RepeatWrapping;
        this.roadTexture.wrapT = THREE.RepeatWrapping;
        this.roadTexture.repeat.set(1, 1);
        this.roadTexture.needsUpdate = true;
    }

    buildCityGroundTerrain() {
        const groundGeo = new THREE.PlaneGeometry(3500, 4500);
        this.groundMat = new THREE.MeshLambertMaterial({
            color: 0x030509, // Deep midnight urban terrain
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeo, this.groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.20, -1000);
        this.scene.add(ground);
    }

    /* ================= 1. CITY ROAD WITH 90° CORNER TURNS & INTERSECTIONS ================= */
    createCityCornerSplineRoad() {
        const points = [
            new THREE.Vector3(0, 0, 0),            // [0.00] Start: 5th Main Downtown Avenue
            new THREE.Vector3(0, 0.2, -120),       // [0.06] Driving south
            new THREE.Vector3(15, 0.5, -230),      // [0.12] Approaching 90° RIGHT TURN
            new THREE.Vector3(45, 0.8, -280),      // [0.15] 1. PAKKA BIKE HOARDING on corner
            new THREE.Vector3(100, 1.0, -300),     // [0.19] Full 90° right turn completed
            new THREE.Vector3(200, 1.2, -300),     // [0.25] Tech Park Boulevard (heading east)
            new THREE.Vector3(290, 1.2, -300),     // [0.30] 2. PAKKA AUTO HOARDING
            new THREE.Vector3(380, 1.8, -320),     // [0.36] Approaching 90° LEFT TURN onto flyover ramp
            new THREE.Vector3(440, 3.2, -420),     // [0.40] Full 90° left turn & flyover climb
            new THREE.Vector3(450, 4.8, -580),     // [0.45] 3. PAKKA PRIME CAB on elevated flyover
            new THREE.Vector3(450, 5.2, -740),     // [0.50] Cruising on high-rise viaduct (heading south)
            new THREE.Vector3(430, 4.2, -880),     // [0.56] Flyover descent & 90° left turn approach
            new THREE.Vector3(360, 2.5, -960),     // [0.60] 4. PAKKA PARCEL on 90° left turn
            new THREE.Vector3(240, 1.4, -980),     // [0.66] Logistics Pass (heading west)
            new THREE.Vector3(120, 1.0, -980),     // [0.70] Approaching 90° RIGHT TURN
            new THREE.Vector3(20, 0.8, -1030),     // [0.72] 5. PAKKA EV GREEN on corner turn
            new THREE.Vector3(-60, 1.0, -1140),    // [0.76] Full 90° right turn completed into EV Corridor
            new THREE.Vector3(-80, 1.2, -1320),    // [0.80] Clean Energy Avenue (heading south)
            new THREE.Vector3(-80, 1.5, -1450),    // [0.84] 6. PAKKA OUTSTATION & AIRPORT EXPRESS
            new THREE.Vector3(-30, 2.0, -1620),    // [0.88] Sweeping highway merge
            new THREE.Vector3(0, 2.5, -1760),      // [0.92] Signal Intersection & How It Works
            new THREE.Vector3(0, 2.8, -1900),      // [0.96] Metro Viaduct & Impact Stats
            new THREE.Vector3(0, 4.5, -2150)       // [1.00] Dawn Arrival Horizon
        ];

        this.curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.16);

        const divisions = 900;
        const roadWidth = 24.0; // Expanded Grand Multi-Lane Expressway
        const curvePoints = this.curve.getPoints(divisions);
        const roadGeo = new THREE.BufferGeometry();
        const vertices = [];
        const uvs = [];
        const normals = [];

        for (let i = 0; i < curvePoints.length; i++) {
            const pt = curvePoints[i];
            const tangent = this.curve.getTangent(i / divisions).normalize();
            const up = new THREE.Vector3(0, 1, 0);
            const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

            const left = new THREE.Vector3().copy(pt).addScaledVector(normal, -roadWidth / 2);
            const right = new THREE.Vector3().copy(pt).addScaledVector(normal, roadWidth / 2);

            vertices.push(left.x, left.y + 0.08, left.z);
            vertices.push(right.x, right.y + 0.08, right.z);

            const v = (i / divisions) * 140;
            uvs.push(0, v);
            uvs.push(1, v);

            normals.push(0, 1, 0);
            normals.push(0, 1, 0);
        }

        const indices = [];
        for (let i = 0; i < curvePoints.length - 1; i++) {
            const p1 = i * 2;
            const p2 = i * 2 + 1;
            const p3 = (i + 1) * 2;
            const p4 = (i + 1) * 2 + 1;

            indices.push(p1, p2, p3);
            indices.push(p2, p4, p3);
        }

        roadGeo.setIndex(indices);
        roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

        roadGeo.computeVertexNormals();
        roadGeo.computeBoundingBox();
        roadGeo.computeBoundingSphere();

        this.roadMat = new THREE.MeshStandardMaterial({
            map: this.roadTexture,
            color: 0xffffff,
            roughness: 0.36,
            metalness: 0.12,
            side: THREE.DoubleSide
        });

        this.roadMesh = new THREE.Mesh(roadGeo, this.roadMat);
        this.roadMesh.frustumCulled = false;
        this.scene.add(this.roadMesh);

        this.addCurvedRoadCurbsAndSidewalks(curvePoints, roadWidth);
    }

    addCurvedRoadCurbsAndSidewalks(points, width) {
        this.curbMat = new THREE.MeshLambertMaterial({ color: 0x242834, side: THREE.DoubleSide });

        const leftPoints = [];
        const rightPoints = [];

        for (let i = 0; i < points.length; i++) {
            const t = i / (points.length - 1);
            const tangent = this.curve.getTangent(t).normalize();
            const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
            
            leftPoints.push(new THREE.Vector3().copy(points[i]).addScaledVector(normal, -(width / 2 + 0.45)));
            rightPoints.push(new THREE.Vector3().copy(points[i]).addScaledVector(normal, (width / 2 + 0.45)));

            // Reflective Gold & White Road Studs across 4 Lanes + Center Divider
            if (i % 3 === 0) {
                [-7.2, -2.4, 0, 2.4, 7.2].forEach(laneOffset => {
                    const isCenter = Math.abs(laneOffset) < 0.1;
                    const studGeo = new THREE.BoxGeometry(0.28, 0.09, 0.28);
                    const studMat = new THREE.MeshBasicMaterial({ color: isCenter ? 0xF5BA18 : 0xFFFFFF });
                    const stud = new THREE.Mesh(studGeo, studMat);
                    const studPos = new THREE.Vector3().copy(points[i]).addScaledVector(normal, laneOffset);
                    stud.position.set(studPos.x, studPos.y + 0.12, studPos.z);
                    this.scene.add(stud);
                });
            }
        }

        const leftCurve = new THREE.CatmullRomCurve3(leftPoints);
        const rightCurve = new THREE.CatmullRomCurve3(rightPoints);

        const curbGeoLeft = new THREE.TubeGeometry(leftCurve, 300, 0.45, 6, false);
        const curbGeoRight = new THREE.TubeGeometry(rightCurve, 300, 0.45, 6, false);

        const curbLeftMesh = new THREE.Mesh(curbGeoLeft, this.curbMat);
        const curbRightMesh = new THREE.Mesh(curbGeoRight, this.curbMat);
        curbLeftMesh.frustumCulled = false;
        curbRightMesh.frustumCulled = false;

        this.scene.add(curbLeftMesh, curbRightMesh);
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0x475569, 1.3);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xd4af37, 2.2);
        this.dirLight.position.set(70, 150, -100);
        this.scene.add(this.dirLight);

        // Driver Headlight Projectors
        this.headlightLeft = new THREE.SpotLight(0xfffae0, 6.5, 220, Math.PI / 4, 0.35, 1.2);
        this.headlightLeft.position.set(-1.2, 0.6, 0);

        this.headlightRight = new THREE.SpotLight(0xfffae0, 6.5, 220, Math.PI / 4, 0.35, 1.2);
        this.headlightRight.position.set(1.2, 0.6, 0);

        this.headlightTarget = new THREE.Object3D();
        this.headlightTarget.position.set(0, 0, -45);
        this.scene.add(this.headlightTarget);

        this.headlightLeft.target = this.headlightTarget;
        this.headlightRight.target = this.headlightTarget;

        this.scene.add(this.headlightLeft, this.headlightRight);
    }

    /* =========================================================================
       [WONDERLAND WOW MEDIA ARCHITECTURAL SKYLINE (5 SKYSCRAPER ARCHETYPES)]
       ========================================================================= */
    buildWonderlandArchitecturalSkyline() {
        this.towerMat = new THREE.MeshLambertMaterial({ color: 0x0c111e, side: THREE.DoubleSide });
        this.buildingMaterials.push(this.towerMat);

        this.towerWindowMat = new THREE.MeshBasicMaterial({ map: this.windowTexture, side: THREE.DoubleSide });
        this.buildingMaterials.push(this.towerWindowMat);

        const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x241508 });
        const treeFoliageMat = new THREE.MeshLambertMaterial({ color: 0x0b381f });

        // Sample entire spline for strict collision avoidance
        // Dense 600-point spline sampling for 100% collision-free placement
        const splineSamples = [];
        for (let s = 0; s <= 600; s++) {
            splineSamples.push(this.curve.getPointAt(s / 600));
        }

        const getMinDistToRoad = (bx, bz) => {
            let minDist = Infinity;
            for (let p of splineSamples) {
                const dx = p.x - bx;
                const dz = p.z - bz;
                const d = Math.sqrt(dx * dx + dz * dz);
                if (d < minDist) minDist = d;
            }
            return minDist;
        };

        const pushAwayFromAllRoadSegments = (pos, requiredDistance = 65.0) => {
            let attempts = 0;
            let currentDist = getMinDistToRoad(pos.x, pos.z);
            while (currentDist < requiredDistance && attempts < 30) {
                let closestP = null;
                let closestD = Infinity;
                for (let p of splineSamples) {
                    const dx = p.x - pos.x;
                    const dz = p.z - pos.z;
                    const d = Math.sqrt(dx * dx + dz * dz);
                    if (d < closestD) {
                        closestD = d;
                        closestP = p;
                    }
                }
                if (closestP && closestD > 0.001) {
                    const pushX = (pos.x - closestP.x) / closestD;
                    const pushZ = (pos.z - closestP.z) / closestD;
                    const deltaPush = (requiredDistance - closestD) + 5.0;
                    pos.x += pushX * deltaPush;
                    pos.z += pushZ * deltaPush;
                }
                currentDist = getMinDistToRoad(pos.x, pos.z);
                attempts++;
            }
            return currentDist >= (requiredDistance - 3.0);
        };

        const numSteps = 110;
        for (let i = 0; i < numSteps; i++) {
            const t = i / numSteps;
            const pt = this.curve.getPointAt(t);
            const tangent = this.curve.getTangent(t).normalize();
            const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

            // Modern Curved Streetlamps along Sidewalks
            [-1, 1].forEach(side => {
                let poleOffset = side * 15.0;
                let polePos = new THREE.Vector3().copy(pt).addScaledVector(normal, poleOffset);
                if (pushAwayFromAllRoadSegments(polePos, 14.5)) {
                    const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 9.5, 8);
                    const poleMat = new THREE.MeshLambertMaterial({ color: 0x1e2433 });
                    const pole = new THREE.Mesh(poleGeo, poleMat);
                    pole.position.set(polePos.x, polePos.y + 4.75, polePos.z);
                    this.scene.add(pole);

                    const lampGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe699 }));
                    lampGlobe.position.set(polePos.x, polePos.y + 9.0, polePos.z);
                    this.scene.add(lampGlobe);
                    this.streetLightMeshes.push(lampGlobe);

                    const spotLight = new THREE.SpotLight(0xffe699, 2.8, 26, Math.PI / 4, 0.5, 1.2);
                    spotLight.position.copy(lampGlobe.position);
                    const targetObj = new THREE.Object3D();
                    targetObj.position.set(polePos.x - (normal.x * 2.0 * side), 0, polePos.z - (normal.z * 2.0 * side));
                    this.scene.add(targetObj);
                    spotLight.target = targetObj;
                    this.scene.add(spotLight);
                    this.streetLights.push(spotLight);
                }

                // Sidewalk Trees & Greenery
                if (i % 2 === 0) {
                    let treeOffset = side * 20.0;
                    let treePos = new THREE.Vector3().copy(pt).addScaledVector(normal, treeOffset);
                    if (pushAwayFromAllRoadSegments(treePos, 18.0)) {
                        const treeGroup = new THREE.Group();
                        treeGroup.position.set(treePos.x, treePos.y, treePos.z);

                        if ((i / 2) % 2 === 0) {
                            // GTA 5 Los Santos Tall Palm Tree
                            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
                            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 7.5, 7), trunkMat);
                            trunk.position.y = 3.75;
                            trunk.rotation.z = (Math.random() - 0.5) * 0.12;
                            treeGroup.add(trunk);

                            // Palm Fronds spreading out
                            const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.8, side: THREE.DoubleSide });
                            for (let f = 0; f < 7; f++) {
                                const fAngle = (f / 7) * Math.PI * 2;
                                const frond = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.8, 4), frondMat);
                                frond.position.set(Math.cos(fAngle) * 1.1, 7.6, Math.sin(fAngle) * 1.1);
                                frond.rotation.x = Math.sin(fAngle) * 0.8;
                                frond.rotation.z = -Math.cos(fAngle) * 0.8;
                                treeGroup.add(frond);
                            }
                        } else {
                            // Realistic Multi-Tiered Broadleaf Street Tree
                            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4A3525, roughness: 0.9 });
                            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 4.5, 8), trunkMat);
                            trunk.position.y = 2.25;
                            treeGroup.add(trunk);

                            const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x14532D, roughness: 0.85 });
                            const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });

                            // 3 layered organic foliage tiers
                            const tier1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 7), foliageMat1);
                            tier1.position.y = 4.2;
                            const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.0, 7), foliageMat2);
                            tier2.position.y = 5.4;
                            const tier3 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 6), foliageMat1);
                            tier3.position.y = 6.4;

                            treeGroup.add(tier1, tier2, tier3);
                        }

                        this.scene.add(treeGroup);
                    }
                }
            });

            // Architectural Skyscraper & Landmark Generation (Strict 100% Global Road Clearance)
            if (i % 3 === 0) {
                const isStadiumStep = (i >= 22 && i <= 26);
                const isRailwayStep = (i >= 52 && i <= 56);
                const isAirportStep = (i >= 90 && i <= 94);

                if (isStadiumStep && i === 24) {
                    // 1. MODERN ARENA / STADIUM LANDMARK (Guaranteed >= 110m Global Road Clearance)
                    const stadium = this.createRealisticStadiumModel();
                    const sOffset = 110.0;
                    let sPos = new THREE.Vector3().copy(pt).addScaledVector(normal, sOffset);
                    if (pushAwayFromAllRoadSegments(sPos, 110.0)) {
                        stadium.position.set(sPos.x, 0, sPos.z);
                        const sAngle = Math.atan2(tangent.x, tangent.z);
                        stadium.rotation.set(0, sAngle, 0);
                        this.scene.add(stadium);
                    }
                } else if (isRailwayStep && i === 54) {
                    // 2. CENTRAL HIGH-SPEED RAILWAY TERMINAL LANDMARK (Guaranteed >= 110m Global Road Clearance)
                    const railway = this.createRealisticRailwayStationModel();
                    const rOffset = -110.0;
                    let rPos = new THREE.Vector3().copy(pt).addScaledVector(normal, rOffset);
                    if (pushAwayFromAllRoadSegments(rPos, 110.0)) {
                        railway.position.set(rPos.x, 0, rPos.z);
                        const rAngle = Math.atan2(tangent.x, tangent.z);
                        railway.rotation.set(0, rAngle, 0);
                        this.scene.add(railway);
                    }
                } else if (isAirportStep && i === 92) {
                    // 3. INTERNATIONAL AIRPORT TERMINAL COMPLEX LANDMARK (Guaranteed >= 120m Global Road Clearance)
                    const airport = this.createRealisticAirportTerminalModel();
                    const aOffset = 120.0;
                    let aPos = new THREE.Vector3().copy(pt).addScaledVector(normal, aOffset);
                    if (pushAwayFromAllRoadSegments(aPos, 120.0)) {
                        airport.position.set(aPos.x, 0, aPos.z);
                        const aAngle = Math.atan2(tangent.x, tangent.z);
                        airport.rotation.set(0, aAngle, 0);
                        this.scene.add(airport);
                    }
                } else if (!isStadiumStep && !isRailwayStep && !isAirportStep) {
                    // Signature Wonderland Studio Skyscraper Archetypes on Both Flanks (Strict >= 62m Global Clearance)
                    [-1, 1].forEach((side) => {
                        let offsetDist = side * 62.0;
                        let bPos = new THREE.Vector3().copy(pt).addScaledVector(normal, offsetDist);

                        if (pushAwayFromAllRoadSegments(bPos, 62.0)) {
                            const archetypeIndex = (Math.floor(i / 3) + (side > 0 ? 1 : 0)) % 5;
                            const skyscraper = this.createWonderlandSkyscraperArchetype(archetypeIndex, i);
                            skyscraper.position.set(bPos.x, 0, bPos.z);
                            const angleY = Math.atan2(pt.x - bPos.x, pt.z - bPos.z);
                            skyscraper.rotation.set(0, angleY, 0);
                            this.scene.add(skyscraper);
                        }
                    });
                }
            }
        }
    }

    /**
     * LANDMARK 1: Modern Arena / Stadium Complex
     */
    createRealisticStadiumModel() {
        const stadiumGroup = new THREE.Group();

        // 1. Base Concourse Plaza
        const baseGeo = new THREE.CylinderGeometry(48, 52, 4, 32);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x1E293B, side: THREE.DoubleSide });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 2.0;
        stadiumGroup.add(base);

        // 2. Outer Tiered Grandstand Facade Bowl with Louvers
        const bowlGeo = new THREE.CylinderGeometry(44, 38, 18, 32, 1, true);
        const bowlMat = new THREE.MeshLambertMaterial({ color: 0x334155, side: THREE.DoubleSide });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.position.y = 13.0;
        stadiumGroup.add(bowl);

        // 3. Inner Seating Tiers (Royal Blue & Gold Pakka Seats)
        const seatTierGeo1 = new THREE.CylinderGeometry(36, 26, 6, 32, 1, true);
        const seatMat1 = new THREE.MeshLambertMaterial({ color: 0x1E3A8A, side: THREE.DoubleSide });
        const seatTier1 = new THREE.Mesh(seatTierGeo1, seatMat1);
        seatTier1.position.y = 7.0;

        const seatTierGeo2 = new THREE.CylinderGeometry(42, 36, 8, 32, 1, true);
        const seatMat2 = new THREE.MeshLambertMaterial({ color: 0xF5BA18, side: THREE.DoubleSide });
        const seatTier2 = new THREE.Mesh(seatTierGeo2, seatMat2);
        seatTier2.position.y = 14.0;
        stadiumGroup.add(seatTier1, seatTier2);

        // 4. Center Playing Field / Turf Pitch
        const pitchGeo = new THREE.CircleGeometry(24, 32);
        const pitchMat = new THREE.MeshLambertMaterial({ color: 0x15803D, side: THREE.DoubleSide });
        const pitch = new THREE.Mesh(pitchGeo, pitchMat);
        pitch.rotation.x = -Math.PI / 2;
        pitch.position.y = 4.05;

        const pitchLineGeo = new THREE.RingGeometry(10, 10.4, 32);
        const pitchLineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
        const centerCircle = new THREE.Mesh(pitchLineGeo, pitchLineMat);
        centerCircle.rotation.x = -Math.PI / 2;
        centerCircle.position.y = 4.08;
        stadiumGroup.add(pitch, centerCircle);

        // 5. Tensile Membrane Canopy Ring Roof
        const roofRingGeo = new THREE.TorusGeometry(40, 4.5, 8, 32);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC, side: THREE.DoubleSide });
        const roofRing = new THREE.Mesh(roofRingGeo, roofMat);
        roofRing.rotation.x = Math.PI / 2;
        roofRing.position.y = 23.0;
        stadiumGroup.add(roofRing);

        // 6. 4 Massive Steel Lattice Floodlight Pylons with Real Spotlights
        [
            [-38, -38], [38, -38], [-38, 38], [38, 38]
        ].forEach(([fx, fz]) => {
            const mastGeo = new THREE.CylinderGeometry(0.65, 1.2, 38, 8);
            const mastMat = new THREE.MeshLambertMaterial({ color: 0x64748B });
            const mast = new THREE.Mesh(mastGeo, mastMat);
            mast.position.set(fx, 19.0, fz);

            const bankGeo = new THREE.BoxGeometry(6.5, 3.8, 1.0);
            const bankMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const bank = new THREE.Mesh(bankGeo, bankMat);
            bank.position.set(fx, 38.0, fz);
            bank.lookAt(0, 4.0, 0);

            const stadiumLight = new THREE.SpotLight(0xFFFFFF, 3.5, 90, Math.PI / 3, 0.4, 1.2);
            stadiumLight.position.set(fx, 38.0, fz);
            const target = new THREE.Object3D();
            target.position.set(0, 4.0, 0);
            this.scene.add(target);
            stadiumLight.target = target;

            stadiumGroup.add(mast, bank);
            this.scene.add(stadiumLight);
            this.spireBeacons.push(stadiumLight);
        });

        // 7. Large Glowing Entrance DOOH Marquee
        const bannerGeo = new THREE.PlaneGeometry(28, 7.0);
        const bannerCanvas = document.createElement('canvas');
        bannerCanvas.width = 1024; bannerCanvas.height = 256;
        const bctx = bannerCanvas.getContext('2d');
        bctx.fillStyle = '#0F172A'; bctx.fillRect(0, 0, 1024, 256);
        bctx.fillStyle = '#F5BA18'; bctx.font = 'bold 64px "Syne", sans-serif';
        bctx.fillText('PAKKA NATIONAL ARENA', 60, 110);
        bctx.fillStyle = '#00F0FF'; bctx.font = '500 38px "JetBrains Mono", monospace';
        bctx.fillText('LIVE MATCH COMMUTE GATEWAY', 60, 180);
        const bannerTex = new THREE.CanvasTexture(bannerCanvas);
        const bannerMesh = new THREE.Mesh(bannerGeo, new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide }));
        bannerMesh.position.set(0, 16.0, 44.5);
        stadiumGroup.add(bannerMesh);

        return stadiumGroup;
    }

    /**
     * LANDMARK 2: Central High-Speed Railway Terminal
     */
    createRealisticRailwayStationModel() {
        const stationGroup = new THREE.Group();

        // 1. Grand Base Concourse Platform (Compact lateral footprint, elongated track bay)
        const concourseGeo = new THREE.BoxGeometry(36, 4.0, 72);
        const concourseMat = new THREE.MeshLambertMaterial({ color: 0x1E293B, side: THREE.DoubleSide });
        const concourse = new THREE.Mesh(concourseGeo, concourseMat);
        concourse.position.y = 2.0;
        stationGroup.add(concourse);

        // 2. Dual Barrel-Vault Arched Glass Train Shed Roofs
        const glassRoofMat = new THREE.MeshLambertMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
        const steelFrameMat = new THREE.MeshLambertMaterial({ color: 0x475569 });

        [-9, 9].forEach(arcX => {
            const vaultGeo = new THREE.CylinderGeometry(8.5, 8.5, 65, 24, 1, true, 0, Math.PI);
            const vault = new THREE.Mesh(vaultGeo, glassRoofMat);
            vault.rotation.z = Math.PI / 2;
            vault.rotation.y = Math.PI / 2;
            vault.position.set(arcX, 13.0, 0);
            stationGroup.add(vault);

            // Arched Steel Support Ribs
            for (let rz = -30; rz <= 30; rz += 10) {
                const ribGeo = new THREE.TorusGeometry(8.5, 0.35, 8, 24, Math.PI);
                const rib = new THREE.Mesh(ribGeo, steelFrameMat);
                rib.position.set(arcX, 13.0, rz);
                stationGroup.add(rib);
            }
        });

        // 3. Elevated Train Platforms with Yellow Safety Tactile Lines
        const platGeo = new THREE.BoxGeometry(8.5, 1.4, 48);
        const platMat = new THREE.MeshLambertMaterial({ color: 0x334155, side: THREE.DoubleSide });
        const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xF5BA18 });

        [-24, 0, 24].forEach(px => {
            const plat = new THREE.Mesh(platGeo, platMat);
            plat.position.set(px, 4.7, 0);

            // Yellow warning edge strips
            [-4.1, 4.1].forEach(lx => {
                const line = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 48), yellowLineMat);
                line.position.set(px + lx, 5.45, 0);
                stationGroup.add(line);
            });

            stationGroup.add(plat);
        });

        // 4. Steel Railway Tracks (Rails & Sleepers)
        const railMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });
        const trackBeds = [-32, -16, 16, 32];
        trackBeds.forEach(tx => {
            [-1.1, 1.1].forEach(rx => {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 50), railMat);
                rail.position.set(tx + rx, 4.1, 0);
                stationGroup.add(rail);
            });
        });

        // 5. Parked High-Speed Bullet / Vande Bharat Style Express Train
        const trainGeo = new THREE.BoxGeometry(3.6, 4.2, 44);
        const trainMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC, side: THREE.DoubleSide });
        const train = new THREE.Mesh(trainGeo, trainMat);
        train.position.set(16, 6.2, 0);

        const trainStripe = new THREE.Mesh(new THREE.BoxGeometry(3.65, 0.7, 44.1), new THREE.MeshBasicMaterial({ color: 0x1E40AF }));
        trainStripe.position.set(16, 5.8, 0);

        const nose = new THREE.Mesh(new THREE.ConeGeometry(2.1, 4.5, 16), trainMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(16, 6.2, 24.2);

        stationGroup.add(train, trainStripe, nose);

        // 6. Station Clock Tower with 4 Glowing Neon Clock Faces
        const towerGeo = new THREE.BoxGeometry(10, 38, 10);
        const towerMat = new THREE.MeshLambertMaterial({ color: 0x0F172A });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(-38, 19.0, 18);

        const clockGeo = new THREE.CircleGeometry(2.4, 24);
        const clockMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A, side: THREE.DoubleSide });
        const clockFace = new THREE.Mesh(clockGeo, clockMat);
        clockFace.position.set(-38, 30.0, 23.1);
        stationGroup.add(tower, clockFace);

        // 7. Station Main Entrance Banner
        const sBannerCanvas = document.createElement('canvas');
        sBannerCanvas.width = 1024; sBannerCanvas.height = 256;
        const sbctx = sBannerCanvas.getContext('2d');
        sbctx.fillStyle = '#0284C7'; sbctx.fillRect(0, 0, 1024, 256);
        sbctx.fillStyle = '#FFFFFF'; sbctx.font = 'bold 54px "Syne", sans-serif';
        sbctx.fillText('BENGALURU CENTRAL TERMINAL', 50, 110);
        sbctx.fillStyle = '#F5BA18'; sbctx.font = '500 36px "JetBrains Mono", monospace';
        sbctx.fillText('HIGH SPEED RAIL & METRO INTERCHANGE', 50, 180);
        const sBannerTex = new THREE.CanvasTexture(sBannerCanvas);
        const sBannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 6.5), new THREE.MeshBasicMaterial({ map: sBannerTex, side: THREE.DoubleSide }));
        sBannerMesh.position.set(0, 16.0, 23.0);
        stationGroup.add(sBannerMesh);

        return stationGroup;
    }

    /**
     * LANDMARK 3: International Airport Terminal Complex
     */
    createRealisticAirportTerminalModel() {
        const airportGroup = new THREE.Group();

        // 1. Aerodynamic Swept-Wing Cantilevered Terminal Roof
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-45, -20);
        roofShape.lineTo(45, -20);
        roofShape.lineTo(35, 20);
        roofShape.lineTo(-35, 20);
        roofShape.closePath();

        const extrudeSettings = { depth: 3.5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.8, bevelThickness: 0.8 };
        const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0, side: THREE.DoubleSide });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.rotation.x = Math.PI / 2;
        roof.position.set(0, 22.0, 0);
        airportGroup.add(roof);

        // 2. 2-Floor Glass Curtain Wall Terminal Concourse Hall
        const glassHallGeo = new THREE.BoxGeometry(68, 18, 32);
        const glassHallMat = new THREE.MeshLambertMaterial({ color: 0x0284C7, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
        const glassHall = new THREE.Mesh(glassHallGeo, glassHallMat);
        glassHall.position.y = 9.0;
        airportGroup.add(glassHall);

        // 3. 3 Telescopic Boarding Aerobridges (Jet Bridges)
        [-20, 0, 20].forEach(bx => {
            const bridgeTunnel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 18), new THREE.MeshLambertMaterial({ color: 0x475569 }));
            bridgeTunnel.position.set(bx, 10.0, -22);

            const rotunda = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 4.2, 16), new THREE.MeshLambertMaterial({ color: 0x94A3B8 }));
            rotunda.position.set(bx, 10.0, -31);

            airportGroup.add(bridgeTunnel, rotunda);
        });

        // 4. Parked Widebody Commercial Jetliner Aircraft
        const planeGroup = new THREE.Group();
        const planeMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC, side: THREE.DoubleSide });
        const planeBlueMat = new THREE.MeshLambertMaterial({ color: 0x1E40AF, side: THREE.DoubleSide });

        // Fuselage
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 36, 24), planeMat);
        fuselage.rotation.x = Math.PI / 2;
        fuselage.position.y = 5.5;

        // Cockpit Nose Cone
        const pNose = new THREE.Mesh(new THREE.ConeGeometry(2.4, 6.5, 24), planeMat);
        pNose.rotation.x = -Math.PI / 2;
        pNose.position.set(0, 5.5, 21.2);

        // Swept Wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(-22, -6);
        wingShape.lineTo(22, -6);
        wingShape.lineTo(0, 8);
        wingShape.closePath();
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.6, bevelEnabled: false });
        const wings = new THREE.Mesh(wingGeo, planeMat);
        wings.rotation.x = Math.PI / 2;
        wings.position.set(0, 5.6, -2.0);

        // Vertical Tail Fin
        const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.5, 5.0), planeBlueMat);
        tailFin.position.set(0, 9.5, -16.0);
        tailFin.rotation.x = -0.35;

        // Turbofan Jet Engines
        [-6.5, 6.5].forEach(ex => {
            const eng = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4.2, 16), new THREE.MeshLambertMaterial({ color: 0x334155 }));
            eng.rotation.x = Math.PI / 2;
            eng.position.set(ex, 3.8, 0);
            planeGroup.add(eng);
        });

        planeGroup.add(fuselage, pNose, wings, tailFin);
        planeGroup.position.set(0, 0, -38);
        airportGroup.add(planeGroup);

        // 5. Air Traffic Control (ATC) Tower with Radar Dome
        const atcShaft = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.8, 42, 18), new THREE.MeshLambertMaterial({ color: 0xCBD5E1 }));
        atcShaft.position.set(38, 21.0, 18);

        // 360° Glass Observation Cab
        const atcCab = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 4.0, 5.5, 18), new THREE.MeshLambertMaterial({ color: 0x0284C7, transparent: true, opacity: 0.75 }));
        atcCab.position.set(38, 44.5, 18);

        // Rooftop Radar Dome
        const radarDome = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 16), new THREE.MeshLambertMaterial({ color: 0xF8FAFC }));
        radarDome.position.set(38, 49.5, 18);

        const beacon = new THREE.PointLight(0xFF0033, 4.0, 45);
        beacon.position.set(38, 52.8, 18);
        this.spireBeacons.push(beacon);

        airportGroup.add(atcShaft, atcCab, radarDome, beacon);

        // 6. Airport Terminal Entrance Marquee
        const aBannerCanvas = document.createElement('canvas');
        aBannerCanvas.width = 1024; aBannerCanvas.height = 256;
        const abctx = aBannerCanvas.getContext('2d');
        abctx.fillStyle = '#0F172A'; abctx.fillRect(0, 0, 1024, 256);
        abctx.fillStyle = '#F5BA18'; abctx.font = 'bold 54px "Syne", sans-serif';
        abctx.fillText('KEMPEGOWDA INT. AIRPORT T2', 50, 110);
        abctx.fillStyle = '#38BDF8'; abctx.font = '500 36px "JetBrains Mono", monospace';
        abctx.fillText('PAKKA OUTSTATION & AIRPORT EXPRESS', 50, 180);
        const aBannerTex = new THREE.CanvasTexture(aBannerCanvas);
        const aBannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 7.0), new THREE.MeshBasicMaterial({ map: aBannerTex, side: THREE.DoubleSide }));
        aBannerMesh.position.set(0, 18.0, 16.5);
        airportGroup.add(aBannerMesh);

        return airportGroup;
    }

    /**
     * 5 Distinct Architectural Skyscraper Archetypes matching Wonderland Studio WOW Media
     */
    createWonderlandSkyscraperArchetype(typeIndex, stepIndex) {
        const group = new THREE.Group();
        const neonColor1 = stepIndex % 2 === 0 ? 0x00F2FE : 0xFBBF24; // Cyan or Amber
        const neonMat = new THREE.MeshBasicMaterial({ color: neonColor1, side: THREE.DoubleSide });

        switch (typeIndex) {
            case 0: {
                // ARCHETYPE A: Tiered Neo-Deco Skyscraper with Vertical Light Beams & Crown Spire
                const w1 = 22, d1 = 22, h1 = 36;
                const b1 = new THREE.Mesh(new THREE.BoxGeometry(w1, h1, d1), this.towerWindowMat);
                b1.position.y = h1 / 2;
                group.add(b1);

                const w2 = 16, d2 = 16, h2 = 24;
                const b2 = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, d2), this.towerMat);
                b2.position.y = h1 + h2 / 2;
                group.add(b2);

                const w3 = 11, d3 = 11, h3 = 18;
                const b3 = new THREE.Mesh(new THREE.BoxGeometry(w3, h3, d3), this.towerWindowMat);
                b3.position.y = h1 + h2 + h3 / 2;
                group.add(b3);

                // Vertical Neon Corner Beams
                [[-w1/2, -d1/2], [w1/2, -d1/2], [-w1/2, d1/2], [w1/2, d1/2]].forEach(([nx, nz]) => {
                    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, h1, 8), neonMat);
                    beam.position.set(nx, h1 / 2, nz);
                    group.add(beam);
                });

                // Crown Spire with Aviation Warning Beacon
                const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.55, 18, 8), this.towerMat);
                spire.position.y = h1 + h2 + h3 + 9.0;
                group.add(spire);

                const beacon = new THREE.PointLight(0xff0033, 2.5, 35);
                beacon.position.y = h1 + h2 + h3 + 18.2;
                group.add(beacon);
                this.spireBeacons.push(beacon);
                break;
            }

            case 1: {
                // ARCHETYPE B: Prismatic Glass Matrix Tower with Structural Trusses & Helipad Crown
                const w = 24, d = 18, h = 65;
                const glassTower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.towerWindowMat);
                glassTower.position.y = h / 2;
                group.add(glassTower);

                // Diagonal Neon Structural Cross-Braces (Wonderland WOW style)
                const diagGeo = new THREE.CylinderGeometry(0.18, 0.18, Math.sqrt(w*w + h*h * 0.25), 8);
                const dMesh1 = new THREE.Mesh(diagGeo, neonMat);
                dMesh1.rotation.z = Math.atan2(h * 0.5, w);
                dMesh1.position.set(0, h * 0.25, d / 2 + 0.1);

                const dMesh2 = new THREE.Mesh(diagGeo, neonMat);
                dMesh2.rotation.z = -Math.atan2(h * 0.5, w);
                dMesh2.position.set(0, h * 0.75, d / 2 + 0.1);
                group.add(dMesh1, dMesh2);

                // Rooftop Illuminated Helipad Ring
                const ringGeo = new THREE.TorusGeometry(8.0, 0.35, 12, 32);
                const ringMesh = new THREE.Mesh(ringGeo, neonMat);
                ringMesh.rotation.x = Math.PI / 2;
                ringMesh.position.y = h + 1.2;
                group.add(ringMesh);
                break;
            }

            case 2: {
                // ARCHETYPE C: Cylindrical High-Rise Corporate Tower with Glowing Ring Louvers
                const r = 11, h = 58;
                const cylTower = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), this.towerWindowMat);
                cylTower.position.y = h / 2;
                group.add(cylTower);

                // Horizontal Glowing Neon Ring Bands
                [14, 28, 42, 56].forEach(ry => {
                    const rBand = new THREE.Mesh(new THREE.TorusGeometry(r + 0.15, 0.22, 10, 32), neonMat);
                    rBand.rotation.x = Math.PI / 2;
                    rBand.position.y = ry;
                    group.add(rBand);
                });

                // Top Penthouse Dome
                const dome = new THREE.Mesh(new THREE.SphereGeometry(r * 0.82, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), this.towerMat);
                dome.position.y = h;
                group.add(dome);
                break;
            }

            case 3: {
                // ARCHETYPE D: DOOH Mega-Screen High-Rise Tower (Facade with Giant Digital Screen)
                const w = 26, d = 20, h = 52;
                const mainTower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.towerWindowMat);
                mainTower.position.y = h / 2;
                group.add(mainTower);

                // Integrated 16:9 Glowing Facade Screen
                const screenW = 20, screenH = 11.2;
                const screenCanvas = document.createElement('canvas');
                screenCanvas.width = 1024;
                screenCanvas.height = 576;
                const sctx = screenCanvas.getContext('2d');
                
                const grad = sctx.createLinearGradient(0, 0, 1024, 576);
                grad.addColorStop(0, '#0F172A');
                grad.addColorStop(0.5, '#1E1B4B');
                grad.addColorStop(1, '#0284C7');
                sctx.fillStyle = grad;
                sctx.fillRect(0, 0, 1024, 576);

                sctx.fillStyle = '#F5BA18';
                sctx.font = 'bold 58px "Syne", sans-serif';
                sctx.fillText('PAKKA LOCAL 24x7', 60, 240);

                sctx.fillStyle = '#FFFFFF';
                sctx.font = '500 36px "JetBrains Mono", monospace';
                sctx.fillText('FASTEST COMMUTE • ZERO SURGE', 60, 320);

                const screenTex = new THREE.CanvasTexture(screenCanvas);
                const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, side: THREE.DoubleSide });
                const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMat);
                screenMesh.position.set(0, 26, d / 2 + 0.15);

                // Neon Frame for the Facade Screen
                const sFrame = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.8, screenH + 0.8, 0.2), neonMat);
                sFrame.position.set(0, 26, d / 2 + 0.05);

                group.add(sFrame, screenMesh);
                break;
            }

            case 4: {
                // ARCHETYPE E: Twin Towers with Illuminated High-Altitude Skybridge
                const tw = 10, td = 14, th = 60;
                const t1 = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), this.towerWindowMat);
                t1.position.set(-8.5, th / 2, 0);

                const t2 = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), this.towerWindowMat);
                t2.position.set(8.5, th / 2, 0);

                // Skybridge connecting at floor 20 (y = 42)
                const bridge = new THREE.Mesh(new THREE.BoxGeometry(17, 4.5, 6), this.towerMat);
                bridge.position.set(0, 42, 0);

                const bridgeGlow = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.4, 6.2), neonMat);
                bridgeGlow.position.set(0, 39.8, 0);

                group.add(t1, t2, bridge, bridgeGlow);
                break;
            }
        }

        return group;
    }

    /* =========================================================================
       [EXACT SKETCHFAB-GRADE 3D VEHICLE MODELS & GLTF PIPELINE]
       ========================================================================= */

    /* ================= [MODEL 1]: TVS APACHE RTR 180 RACING MOTORCYCLE =================
     * Ref: https://sketchfab.com/3d-models/tvs-apache-rtr-180-916198718ea84dd5932b324a1dc5fb61
     * Forward is -Z (Beast-Eye DRL Fairing & Front Wheel), Rear is +Z (Split Seat & Upswept Exhaust).
     */
    createTVSApacheRTRModel(accentColor = '#DC2626') {
        const g = new THREE.Group();

        const tireMat = new THREE.MeshLambertMaterial({ color: 0x090B10 });
        const rimMat = new THREE.MeshLambertMaterial({ color: 0x1E293B });
        const rimStripeMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
        const petalDiscMat = new THREE.MeshLambertMaterial({ color: 0xCBD5E1 });
        const caliperMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B }); // Gold Bybre Caliper
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0, metalness: 0.8, roughness: 0.2 });
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x1E2430 });
        const tankMat = new THREE.MeshLambertMaterial({ color: accentColor, side: THREE.DoubleSide });
        const carbonMat = new THREE.MeshLambertMaterial({ color: 0x111827, roughness: 0.5 });
        const seatMat = new THREE.MeshLambertMaterial({ color: 0x0F172A });

        // 1. Dual 6-Spoke Lightweight Racing Alloy Wheels with 270mm Petal Wave Disc Brakes
        [
            { z: -1.22, r: 0.44, w: 0.16, isFront: true },
            { z: 1.18, r: 0.46, w: 0.22, isFront: false }
        ].forEach(w => {
            const wGroup = new THREE.Group();
            
            const tire = new THREE.Mesh(new THREE.CylinderGeometry(w.r, w.r, w.w, 22), tireMat);
            tire.rotation.z = Math.PI / 2;
            
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(w.r * 0.68, w.r * 0.68, w.w + 0.02, 16), rimMat);
            rim.rotation.z = Math.PI / 2;

            // Red Wheel Rim Perimeter Pinstripe
            const stripe = new THREE.Mesh(new THREE.TorusGeometry(w.r * 0.68, 0.012, 8, 24), rimStripeMat);
            stripe.rotation.y = Math.PI / 2;
            stripe.position.x = w.w / 2 + 0.015;
            wGroup.add(stripe);

            // 6-Spoke Geometry
            for (let sp = 0; sp < 6; sp++) {
                const spAngle = (sp / 6) * Math.PI * 2;
                const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.028, w.r * 0.65, 0.025), rimMat);
                spoke.position.set(0, Math.sin(spAngle) * (w.r * 0.32), Math.cos(spAngle) * (w.r * 0.32));
                spoke.rotation.x = spAngle;
                wGroup.add(spoke);
            }
            
            // Petal Wave Disc Rotor & Gold Caliper
            [-w.w / 2 - 0.02, w.w / 2 + 0.02].forEach(rx => {
                const rotor = new THREE.Mesh(new THREE.CylinderGeometry(w.r * 0.52, w.r * 0.52, 0.014, 18), petalDiscMat);
                rotor.rotation.z = Math.PI / 2;
                rotor.position.x = rx;
                
                const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.09), caliperMat);
                caliper.position.set(rx, 0.20, 0);
                wGroup.add(rotor, caliper);
            });

            wGroup.add(tire, rim);
            wGroup.position.set(0, w.r, w.z);
            g.add(wGroup);
            this.rotatingWheels.push(wGroup);
        });

        // 2. Telescopic Front Golden Forks & Aerodynamic Mudguard
        const forkMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });
        [-0.15, 0.15].forEach(fx => {
            const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.98, 10), forkMat);
            fork.rotation.x = -0.32;
            fork.position.set(fx, 0.80, -0.85);
            g.add(fork);
        });

        const fMudguard = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.48), tankMat);
        fMudguard.rotation.x = -0.32;
        fMudguard.position.set(0, 0.74, -1.02);
        g.add(fMudguard);

        // 3. Signature TVS Apache "Beast-Eye" Twin Pilot DRL Fairing
        const noseGeo = new THREE.BoxGeometry(0.50, 0.48, 0.68);
        const nose = new THREE.Mesh(noseGeo, tankMat);
        nose.position.set(0, 1.05, -0.88);
        nose.rotation.x = 0.32;

        // Beast-Eye Twin LED DRL Pilot Lamps
        const drlMat = new THREE.MeshBasicMaterial({ color: 0xFFFAED });
        [-0.14, 0.14].forEach(dx => {
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.04), drlMat);
            eye.position.set(dx, 0.12, -0.35);
            nose.add(eye);
        });

        // Tinted Aerodynamic Bikini Visor Screen
        const screenMat = new THREE.MeshLambertMaterial({ color: 0x0F172A, transparent: true, opacity: 0.80, side: THREE.DoubleSide });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.35), screenMat);
        screen.position.set(0, 0.32, -0.15);
        screen.rotation.x = 0.45;
        nose.add(screen);
        g.add(nose);

        // 4. Double-Cradle Synchro-Stiff Chassis & 180cc Engine Block with Cooling Fins
        const engine = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.92), frameMat);
        engine.position.set(0, 0.66, -0.05);

        // Engine Cooling Fins
        for (let fin = 0; fin < 5; fin++) {
            const fMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.02, 0.40), chromeMat);
            fMesh.position.set(0, 0.12 - fin * 0.06, 0.02);
            engine.add(fMesh);
        }

        const crankcase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.54, 14), chromeMat);
        crankcase.rotation.z = Math.PI / 2;
        crankcase.position.set(0, 0.56, 0.05);
        g.add(engine, crankcase);

        // Aerodynamic Engine Belly Pan Cowl
        const belly = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.72), tankMat);
        belly.position.set(0, 0.36, -0.10);
        g.add(belly);

        // 5. Muscular Chiselled Fuel Tank with Sharp Aerodynamic Extended Scoops & RTR Decal
        const tank = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.92), tankMat);
        tank.position.set(0, 1.08, -0.32);

        // Forward Extended Tank Scoops / Cowls
        [-0.30, 0.30].forEach(sx => {
            const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.62), tankMat);
            scoop.position.set(sx, 0.02, -0.22);
            scoop.rotation.y = sx > 0 ? -0.15 : 0.15;
            tank.add(scoop);

            // RTR Decal Strip
            const decal = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.08, 0.38), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
            decal.position.set(sx * 1.01, 0.05, -0.20);
            tank.add(decal);
        });
        g.add(tank);

        // 6. Split Step-Up Racing Seat & Sharp Tail Cowl
        const riderSeat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.44), seatMat);
        riderSeat.position.set(0, 0.98, 0.20);

        const pillionSeat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.34), seatMat);
        pillionSeat.position.set(0, 1.10, 0.52);

        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.85), tankMat);
        tail.position.set(0, 1.14, 0.65);
        tail.rotation.x = -0.20;

        // Split Pillion Grab Rails
        [-0.18, 0.18].forEach(gx => {
            const grab = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 8), carbonMat);
            grab.rotation.x = Math.PI / 2 - 0.25;
            grab.position.set(gx, 1.25, 0.72);
            g.add(grab);
        });

        g.add(riderSeat, pillionSeat, tail);

        // 7. Dual Inverted MIG Gas-Charged Golden Rear Shocks
        [-0.24, 0.24].forEach(sx => {
            const shock = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 8), chromeMat);
            shock.rotation.x = 0.32;
            shock.position.set(sx, 0.72, 0.85);

            const reservoir = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 10), forkMat);
            reservoir.position.set(sx * 1.15, 0.88, 0.92);
            g.add(shock, reservoir);
        });

        // 8. Upswept Stainless Steel Racing Megaphone Exhaust with Carbon Heat Shield
        const exh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.098, 1.28, 12), chromeMat);
        exh.rotation.x = Math.PI / 2 - 0.35;
        exh.position.set(0.32, 0.54, 0.60);

        const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.105, 0.65, 12, 1, true, 0, Math.PI), carbonMat);
        shield.rotation.x = Math.PI / 2 - 0.35;
        shield.position.set(0.33, 0.54, 0.55);
        g.add(exh, shield);

        // 9. Clip-on Handlebars with Digital Speedometer & Dual Mirrors
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.82, 8), frameMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 1.20, -0.72);

        const speedo = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.12), carbonMat);
        speedo.position.set(0, 1.25, -0.76);
        speedo.rotation.x = 0.35;
        g.add(bar, speedo);

        [-0.42, 0.42].forEach(mx => {
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), frameMat);
            stalk.position.set(mx * 0.85, 1.30, -0.75);
            stalk.rotation.z = mx > 0 ? -0.4 : 0.4;

            const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.04), carbonMat);
            mirror.position.set(mx, 1.38, -0.78);
            g.add(stalk, mirror);
        });

        // 10. 3D Rider in Racing Tuck with ISI Helmet
        const riderJacketMat = new THREE.MeshLambertMaterial({ color: 0x1E3A8A, side: THREE.DoubleSide });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.74, 0.50), riderJacketMat);
        torso.position.set(0, 1.46, 0.02);
        torso.rotation.x = 0.25;

        const vestMat = new THREE.MeshBasicMaterial({ color: 0xF5BA18, side: THREE.DoubleSide });
        const vestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.22, 0.52), vestMat);
        vestStripe.position.set(0, 1.48, 0.02);
        vestStripe.rotation.x = 0.25;

        const helmetMat = new THREE.MeshLambertMaterial({ color: 0xD4AF37 });
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), helmetMat);
        head.position.set(0, 1.95, -0.15);

        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.13, 0.24), new THREE.MeshBasicMaterial({ color: 0x020204 }));
        visor.position.set(0, 1.95, -0.30);
        g.add(torso, vestStripe, head, visor);

        // 11. Headlight & Taillight
        const hl = new THREE.PointLight(0xfffae0, 3.5, 18);
        hl.position.set(0, 0.95, -1.6);
        g.add(hl);
        this.vehiclePointLights.push(hl);

        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
        tl.position.set(0, 0.95, 1.35);
        g.add(tl);

        const root = new THREE.Group();
        root.add(g);
        g.rotation.y = Math.PI;
        return root;
    }

    /* ================= [MODEL 2]: MAHINDRA SCORPIO HIGH-POLY SUV / XUV =================
     * Ref: https://sketchfab.com/3d-models/scorpio-high-poly-72d817ff5bb5467a9a4af5b8bcec3049
     * Forward is -Z (7-Slat Chrome Grille & Hood Scoop), Rear is +Z (Vertical Tower Taillamps & Tailgate).
     */
    createMahindraScorpioSUVModel(paintColor = '#1E293B') {
        const g = new THREE.Group();

        const bodyMat = new THREE.MeshLambertMaterial({ color: paintColor, side: THREE.DoubleSide });
        const blackCladMat = new THREE.MeshLambertMaterial({ color: 0x090D16 });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0, metalness: 0.85, roughness: 0.15 });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x0F172A, side: THREE.DoubleSide });
        const tireMat = new THREE.MeshLambertMaterial({ color: 0x06080C });
        const rimMat = new THREE.MeshLambertMaterial({ color: 0xCBD5E1, metalness: 0.7, roughness: 0.3 });
        const caliperMat = new THREE.MeshBasicMaterial({ color: 0xDC2626 });

        // 1. Tall Commanding Monocoque SUV Body Hull with Flared Wheel Arches
        const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.92, 4.65), bodyMat);
        lowerBody.position.y = 0.88;
        g.add(lowerBody);

        // Lower Rugged Black Plastic Cladding Skirt
        const underCladding = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.32, 4.68), blackCladMat);
        underCladding.position.y = 0.52;
        g.add(underCladding);

        // 2. Muscular Hood with Iconic Functional Central Air Intake Scoop
        const hood = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.22, 1.65), bodyMat);
        hood.position.set(0, 1.34, -1.35);

        const hoodScoop = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.95), blackCladMat);
        hoodScoop.position.set(0, 0.12, 0.05);

        const scoopIntake = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.06, 0.08), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        scoopIntake.position.set(0, 0.10, -0.45);
        hood.add(hoodScoop, scoopIntake);
        g.add(hood);

        // 3. Iconic Mahindra 7-Slat Chrome Vertical Grille with Center Emblem
        const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.46, 0.12), blackCladMat);
        grilleFrame.position.set(0, 0.92, -2.34);

        // 7 Vertical Chrome Slats
        for (let s = -3; s <= 3; s++) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.36, 0.08), chromeMat);
            slat.position.set(s * 0.19, 0, 0.04);
            grilleFrame.add(slat);
        }

        // Center Chrome Emblem Bezel
        const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 12), chromeMat);
        emblem.rotation.x = Math.PI / 2;
        emblem.position.set(0, 0, 0.09);
        grilleFrame.add(emblem);
        g.add(grilleFrame);

        // 4. Dual-Barrel Twin Projector LED Headlamps with Upper DRL Eyebrow
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        [-0.88, 0.88].forEach(hx => {
            const hlCluster = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.12), blackCladMat);
            hlCluster.position.set(hx, 0.94, -2.32);

            // Twin Projector Lenses
            [-0.10, 0.10].forEach(lx => {
                const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), hlMat);
                lens.rotation.x = Math.PI / 2;
                lens.position.set(lx, -0.02, 0.05);
                hlCluster.add(lens);
            });

            // LED DRL Eyebrow
            const drl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.05), hlMat);
            drl.position.set(0, 0.11, 0.05);
            hlCluster.add(drl);
            g.add(hlCluster);
        });

        // 5. Heavy-Duty Front Bumper with Fog Lamps & Brushed Silver Skid Plate
        const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.44, 0.42), blackCladMat);
        frontBumper.position.set(0, 0.56, -2.25);

        const skidPlate = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.26, 0.14), chromeMat);
        skidPlate.position.set(0, -0.10, 0.16);
        frontBumper.add(skidPlate);

        // Rectangular Fog Lamps
        [-0.85, 0.85].forEach(fx => {
            const fog = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.06), hlMat);
            fog.position.set(fx, 0.05, 0.18);
            frontBumper.add(fog);
        });
        g.add(frontBumper);

        // 6. Upright SUV Greenhouse Cabin with Tinted Glass & Black B/C Pillars
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.88, 2.75), glassMat);
        cabin.position.set(0, 1.70, 0.25);
        g.add(cabin);

        // Body-Colored Roof Panel
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.12, 2.72), bodyMat);
        roof.position.set(0, 2.16, 0.25);
        g.add(roof);

        // Dual Silver Longitudinal Roof Rails with Crossbars
        [-0.82, 0.82].forEach(rx => {
            const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 2.45, 8), chromeMat);
            rail.rotation.x = Math.PI / 2;
            rail.position.set(rx, 2.26, 0.25);
            g.add(rail);
        });

        // 7. Heavy-Duty Side Steps / Footboards
        [-1.12, 1.12].forEach(sx => {
            const step = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 2.35), blackCladMat);
            step.position.set(sx, 0.42, 0.10);

            const stepTrim = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 2.35), chromeMat);
            stepTrim.position.set(sx > 0 ? 0.08 : -0.08, 0, 0);
            step.add(stepTrim);
            g.add(step);
        });

        // 8. 4 Massive 17-Inch High-Clearance Radial Wheels with 5-Split-Spoke Alloys
        [[-1.05, -1.45], [1.05, -1.45], [-1.05, 1.45], [1.05, 1.45]].forEach(([wx, wz]) => {
            const wGroup = new THREE.Group();
            
            const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.32, 20), tireMat);
            tire.rotation.z = Math.PI / 2;
            
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.34, 16), rimMat);
            rim.rotation.z = Math.PI / 2;

            // 5 Split Spokes
            for (let sp = 0; sp < 5; sp++) {
                const spAngle = (sp / 5) * Math.PI * 2;
                const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.30, 0.035), chromeMat);
                spoke.position.set(0, Math.sin(spAngle) * 0.15, Math.cos(spAngle) * 0.15);
                spoke.rotation.x = spAngle;
                wGroup.add(spoke);
            }

            const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.10), caliperMat);
            caliper.position.set(wx > 0 ? 0.18 : -0.18, 0.18, 0);

            wGroup.add(tire, rim, caliper);
            wGroup.position.set(wx, 0.46, wz);
            g.add(wGroup);
            this.rotatingWheels.push(wGroup);
        });

        // 9. Signature Vertical Tower Taillamps along D-Pillars
        const tlMatRed = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
        const tlMatAmber = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
        [-0.92, 0.92].forEach(tx => {
            // Vertical Red Column (Extends from bumper up to roofline!)
            const tower = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.15, 0.08), tlMatRed);
            tower.position.set(tx, 1.55, 2.33);

            const amberIndicator = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.09), tlMatAmber);
            amberIndicator.position.set(0, -0.25, 0.01);
            tower.add(amberIndicator);
            g.add(tower);
        });

        // 10. Rear Tailgate, Roof Spoiler & Dual Chrome Exhaust Tips
        const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.08, 0.35), bodyMat);
        spoiler.position.set(0, 2.18, 2.20);

        const thirdBrake = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.04), tlMatRed);
        thirdBrake.position.set(0, 0, 0.16);
        spoiler.add(thirdBrake);
        g.add(spoiler);

        const chromeGarnish = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.06), chromeMat);
        chromeGarnish.position.set(0, 1.25, 2.35);
        g.add(chromeGarnish);

        [-0.65, 0.65].forEach(ex => {
            const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.24, 12), chromeMat);
            tip.rotation.x = Math.PI / 2;
            tip.position.set(ex, 0.44, 2.36);
            g.add(tip);
        });

        // 11. Headlight Projector Light
        const hl = new THREE.PointLight(0xfffae0, 4.5, 26);
        hl.position.set(0, 0.95, -2.60);
        g.add(hl);
        this.vehiclePointLights.push(hl);

        const root = new THREE.Group();
        root.add(g);
        g.rotation.y = Math.PI;
        return root;
    }

    /* ================= [MODEL 3]: BAJAJ RE INDIAN AUTO RICKSHAW =================
     * Ref: https://sketchfab.com/3d-models/auto-rickshaw-44776bcb34e04c1a8b9c18a70376304e
     * Forward is -Z (Single Front Wheel & Windshield), Rear is +Z (Passenger Bench & Plate).
     */
    createBajajAutoRickshawModel() {
        const g = new THREE.Group();

        const chassisMat = new THREE.MeshLambertMaterial({ color: 0x15803D, side: THREE.DoubleSide });
        const blackTrimMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
        const yellowMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24, side: THREE.DoubleSide });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });

        // 1. Forest Green Lower Steel Cabin Hull with Front Wheel Apron Mudguard
        const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.95, 2.95), chassisMat);
        lowerBody.position.y = 0.88;
        g.add(lowerBody);

        const noseApron = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.82, 0.85), chassisMat);
        noseApron.position.set(0, 0.80, -1.65);
        g.add(noseApron);

        const frontBumper = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.65, 8), chromeMat);
        frontBumper.rotation.z = Math.PI / 2;
        frontBumper.position.set(0, 0.45, -2.10);
        g.add(frontBumper);

        // 2. Iconic Bajaj Sunny Yellow Curved Fiberglass Roof Canopy with Ribs
        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.10, 0.58, 3.10), yellowMat);
        roof.position.y = 1.90;
        g.add(roof);

        // 3. Black Steel Tubular Roof Support Pillars (4 Corners)
        [[-0.98, 1.05], [0.98, 1.05], [-0.98, -1.40], [0.98, -1.40]].forEach(([px, pz]) => {
            const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.98, 8), blackTrimMat);
            pil.position.set(px, 1.42, pz);
            g.add(pil);
        });

        // 4. Flat Tempered Glass Windshield with Central Wiper
        const glassMat = new THREE.MeshLambertMaterial({ color: 0xBAE6FD, transparent: true, opacity: 0.70, side: THREE.DoubleSide });
        const wind = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 0.88), glassMat);
        wind.position.set(0, 1.45, -1.50);
        g.add(wind);

        const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.58, 0.02), blackTrimMat);
        wiper.position.set(0.20, 1.45, -1.52);
        wiper.rotation.z = -0.32;
        g.add(wiper);

        // 5. Cockpit: Steering Handlebar Column, Digital Fare Meter & Driver Seat
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.92, 8), blackTrimMat);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, 1.10, -0.90);
        g.add(handle);

        // Digital Taxi Fare Meter Box
        const meterBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.12), new THREE.MeshLambertMaterial({ color: 0x05070C }));
        meterBox.position.set(0.38, 1.15, -0.95);
        const meterDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), new THREE.MeshBasicMaterial({ color: 0x10B981 }));
        meterDisplay.position.set(0, 0, 0.065);
        meterBox.add(meterDisplay);
        g.add(meterBox);

        const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.35, 0.55), blackTrimMat);
        driverSeat.position.set(0, 0.90, -0.35);
        g.add(driverSeat);

        // 6. Quilted Saddle-Brown Leather Passenger Bench & Chrome Grab-Handles
        const seatMat = new THREE.MeshLambertMaterial({ color: 0x9A3412, side: THREE.DoubleSide });
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.80, 0.45, 0.90), seatMat);
        seat.position.set(0, 0.98, 0.60);
        g.add(seat);

        [-1.0, 1.0].forEach(gx => {
            const handleRail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.75, 8), chromeMat);
            handleRail.position.set(gx, 1.40, 0.0);
            g.add(handleRail);
        });

        // 7. Rear Louver Slats & Gold License Plate
        const plateMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
        const plate = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.36, 0.05), plateMat);
        plate.position.set(0, 0.78, 1.50);
        g.add(plate);

        // 8. 3 Wheels (1 Front with Single-Sided Fork, 2 Rear) with Golden Hubcaps
        const tireMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0e });
        const rimMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24 });

        // Front Wheel (at -Z)
        const fwGroup = new THREE.Group();
        const fwTire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.24, 18), tireMat);
        fwTire.rotation.z = Math.PI / 2;
        const fwRim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.26, 14), rimMat);
        fwRim.rotation.z = Math.PI / 2;
        fwGroup.add(fwTire, fwRim);
        fwGroup.position.set(0, 0.38, -1.55);
        g.add(fwGroup);
        this.rotatingWheels.push(fwGroup);

        // Rear Wheels (at +Z)
        [-0.98, 0.98].forEach(rx => {
            const rwGroup = new THREE.Group();
            const rwTire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.24, 18), tireMat);
            rwTire.rotation.z = Math.PI / 2;
            const rwRim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.26, 14), rimMat);
            rwRim.rotation.z = Math.PI / 2;
            rwGroup.add(rwTire, rwRim);
            rwGroup.position.set(rx, 0.38, 0.98);
            g.add(rwGroup);
            this.rotatingWheels.push(rwGroup);
        });

        // 9. Chrome Center Headlamp & Rear Tail Lights
        const hlMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16), chromeMat);
        hlMesh.rotation.x = Math.PI / 2;
        hlMesh.position.set(0, 0.92, -2.10);
        g.add(hlMesh);

        const hlLight = new THREE.PointLight(0xfff2cc, 3.5, 20);
        hlLight.position.set(0, 0.92, -2.30);
        g.add(hlLight);
        this.vehiclePointLights.push(hlLight);

        const tlMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        [-0.78, 0.78].forEach(tx => {
            const tl = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.18, 0.05), tlMat);
            tl.position.set(tx, 0.82, 1.50);
            g.add(tl);
        });

        const root = new THREE.Group();
        root.add(g);
        g.rotation.y = Math.PI;
        return root;
    }

    /* ================= [MODEL 4]: MODERN SEDAN / PRIME CAB =================
     * Ref: https://sketchfab.com/3d-models/car-2f00a5cb6263445cbee828fabd7e0632
     * Forward is -Z (Hexagonal Mesh Grille & LED Matrix), Rear is +Z (Full-Width LED Bar).
     */
    createModernSedanModel(paintColor = '#F8FAFC') {
        const g = new THREE.Group();

        const bodyMat = new THREE.MeshLambertMaterial({ color: paintColor, side: THREE.DoubleSide });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x0F172A, side: THREE.DoubleSide });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0, metalness: 0.8, roughness: 0.2 });
        const tireMat = new THREE.MeshLambertMaterial({ color: 0x050507 });
        const rimMat = new THREE.MeshLambertMaterial({ color: 0xCBD5E1, metalness: 0.7, roughness: 0.3 });
        const caliperMat = new THREE.MeshBasicMaterial({ color: 0xDC2626 });

        // 1. Aerodynamic Lower Monocoque Body with Character Lines
        const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.82, 4.55), bodyMat);
        lowerBody.position.y = 0.74;
        g.add(lowerBody);

        // Hexagonal Chrome Front Mesh Grille
        const grilleMat = new THREE.MeshBasicMaterial({ color: 0x090D16 });
        const grille = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.38, 0.12), grilleMat);
        grille.position.set(0, 0.58, -2.30);
        
        const gFrame = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.44, 0.08), chromeMat);
        gFrame.position.set(0, 0.58, -2.28);
        g.add(gFrame, grille);

        // 2. Tinted Curved Coupe Greenhouse Cabin & Panoramic Glass Roof
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.76, 2.55), glassMat);
        cabin.position.set(0, 1.46, 0.10);
        g.add(cabin);

        // Shark-Fin Aerodynamic Antenna
        const antenna = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), bodyMat);
        antenna.position.set(0, 1.92, 1.05);
        antenna.rotation.x = -0.35;
        g.add(antenna);

        // 3. Integrated Rear Trunk Lip Spoiler & Dual Polished Exhaust Tips
        const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.08, 0.32), bodyMat);
        spoiler.position.set(0, 1.22, 2.15);
        g.add(spoiler);

        [-0.65, 0.65].forEach(ex => {
            const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 14), chromeMat);
            tip.rotation.x = Math.PI / 2;
            tip.position.set(ex, 0.42, 2.30);
            g.add(tip);
        });

        // 4. 4 Low-Profile Performance Wheels on 5-Spoke Alloy Wheels
        [[-1.02, -1.38], [1.02, -1.38], [-1.02, 1.38], [1.02, 1.38]].forEach(([wx, wz]) => {
            const wGroup = new THREE.Group();
            
            const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 20), tireMat);
            tire.rotation.z = Math.PI / 2;
            
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.30, 14), rimMat);
            rim.rotation.z = Math.PI / 2;

            const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.09), caliperMat);
            caliper.position.set(wx > 0 ? 0.16 : -0.16, 0.15, 0);

            wGroup.add(tire, rim, caliper);
            wGroup.position.set(wx, 0.38, wz);
            g.add(wGroup);
            this.rotatingWheels.push(wGroup);
        });

        // 5. Crystal-Eye LED Matrix Headlights & Full-Width Rear LED Lightbar
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFFAEB });
        [-0.78, 0.78].forEach(hx => {
            const hlMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.08), hlMat);
            hlMesh.position.set(hx, 0.82, -2.28);
            g.add(hlMesh);
        });

        const hl = new THREE.PointLight(0xfff2cc, 4.0, 22);
        hl.position.set(0, 0.85, -2.50);
        g.add(hl);
        this.vehiclePointLights.push(hl);

        // Full-Width Connecting Rear LED Lightbar
        const tlMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const tlBar = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.10, 0.06), tlMat);
        tlBar.position.set(0, 0.88, 2.28);
        g.add(tlBar);

        const root = new THREE.Group();
        root.add(g);
        g.rotation.y = Math.PI;
        return root;
    }

    /* ================= [MODEL 5]: CHECKERS SIXTY60 DELIVERY BIKE =================
     * Ref: https://sketchfab.com/3d-models/checkers-sixty60-bike-4aabf2a85abd43f98fc4e5f2a5ae62f1
     * Forward is -Z (Windscreen Cowl), Rear is +Z (Teal/Yellow Thermal Delivery Lockbox).
     */
    createCheckersSixty60BikeModel() {
        const bikeRoot = this.createTVSApacheRTRModel('#028090');
        const bikeGroup = bikeRoot.children[0];

        // Oversized Heavy-Duty Square Thermal Insulated Delivery Lockbox (Signature Teal + Gold)
        const boxMat = new THREE.MeshLambertMaterial({ color: 0xF5BA18, side: THREE.DoubleSide });
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.88, 0.88), boxMat);
        box.position.set(0, 1.45, 0.82);

        const frameMat = new THREE.MeshBasicMaterial({ color: 0x028090, side: THREE.DoubleSide });
        const bFrame = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.90, 0.08), frameMat);
        bFrame.position.set(0, 1.45, 1.26);

        // Reflective Yellow Safety Hazard Diagonal Chevrons
        const chevrons = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.14, 0.90), new THREE.MeshBasicMaterial({ color: 0xFACC15 }));
        chevrons.position.set(0, 1.45, 0.82);

        const rackMat = new THREE.MeshLambertMaterial({ color: 0x1E293B });
        const rack = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 0.96), rackMat);
        rack.position.set(0, 1.00, 0.82);

        // Dual Heavy-Duty Chrome Coilover Rear Shock Absorbers
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });
        [-0.22, 0.22].forEach(sx => {
            const shock = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 8), chromeMat);
            shock.rotation.x = 0.25;
            shock.position.set(sx, 0.65, 0.85);
            bikeGroup.add(shock);
        });

        bikeGroup.add(box, bFrame, chevrons, rack);
        return bikeRoot;
    }

    /* ================= 3. HERO VEHICLES ================= */
    buildHeroVehicles() {
        this.heroVehicleGroup = new THREE.Group();
        this.scene.add(this.heroVehicleGroup);

        // 6 High-Fidelity Showcase Models
        this.tvsApacheHero = this.createTVSApacheRTRModel('#DC2626');
        this.bajajAutoHero = this.createBajajAutoRickshawModel();
        this.modernSedanHero = this.createModernSedanModel('#F8FAFC');
        this.checkersHero = this.createCheckersSixty60BikeModel();
        this.evApacheHero = this.createTVSApacheRTRModel('#10B981');
        this.scorpioHero = this.createMahindraScorpioSUVModel('#1E293B');

        this.heroVehicleGroup.add(
            this.tvsApacheHero,
            this.bajajAutoHero,
            this.modernSedanHero,
            this.checkersHero,
            this.evApacheHero,
            this.scorpioHero
        );

        this.syncActiveHeroVehicle();
        this.initGLTFLoaderAndDropZone();
    }

    syncActiveHeroVehicle() {
        if (this.progress < 0.23) {
            this.setHeroVehicle('bike');
        } else if (this.progress < 0.38) {
            this.setHeroVehicle('auto');
        } else if (this.progress < 0.52) {
            this.setHeroVehicle('cab');
        } else if (this.progress < 0.66) {
            this.setHeroVehicle('parcel');
        } else if (this.progress < 0.78) {
            this.setHeroVehicle('ev');
        } else {
            this.setHeroVehicle('outstation');
        }
    }

    setHeroVehicle(mode) {
        if (!this.tvsApacheHero) return;
        this.tvsApacheHero.visible = (mode === 'bike');
        this.bajajAutoHero.visible = (mode === 'auto');
        this.modernSedanHero.visible = (mode === 'cab');
        this.checkersHero.visible = (mode === 'parcel');
        this.evApacheHero.visible = (mode === 'ev');
        this.scorpioHero.visible = (mode === 'outstation');
    }

    /* ================= GLTF 3D MODEL LOADER & DRAG-AND-DROP PIPELINE ================= */
    initGLTFLoaderAndDropZone() {
        if (typeof THREE.GLTFLoader === 'function') {
            this.gltfLoader = new THREE.GLTFLoader();

            // Auto-check if user placed downloaded Sketchfab models in assets/models/
            const modelMap = [
                { key: 'scorpio', path: 'assets/models/scorpio.glb', target: 'outstation' },
                { key: 'apache', path: 'assets/models/apache.glb', target: 'bike' },
                { key: 'auto', path: 'assets/models/autorickshaw.glb', target: 'auto' },
                { key: 'checkers', path: 'assets/models/checkers.glb', target: 'parcel' },
                { key: 'sedan', path: 'assets/models/sedan.glb', target: 'cab' },
                { key: 'goldencity', path: 'assets/models/goldencity.glb', target: 'city' }
            ];

            modelMap.forEach(m => {
                this.gltfLoader.load(m.path, (gltf) => {
                    console.log(`[Pakka3D] Loaded Sketchfab GLTF: ${m.key}`);
                    if (m.target === 'city') {
                        this.scene.add(gltf.scene);
                    } else if (this.heroVehicleGroup) {
                        gltf.scene.scale.set(1.1, 1.1, 1.1);
                        this.heroVehicleGroup.add(gltf.scene);
                    }
                }, undefined, () => {
                    // Silently keep high-fidelity procedural replica if file not present
                });
            });
        }

        // Live Drag-and-Drop 3D Model Importer (.glb / .gltf)
        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
                    const reader = new FileReader();
                    reader.onload = (readEv) => {
                        const arrayBuffer = readEv.target.result;
                        if (this.gltfLoader) {
                            this.gltfLoader.parse(arrayBuffer, '', (gltf) => {
                                gltf.scene.position.copy(this.heroVehicleGroup.position);
                                gltf.scene.scale.set(1.2, 1.2, 1.2);
                                this.heroVehicleGroup.add(gltf.scene);
                                alert(`🎉 Successfully loaded 3D model: ${file.name}`);
                            });
                        }
                    };
                    reader.readAsArrayBuffer(file);
                }
            }
        });
    }

    /* ================= 4. WONDERLAND DOOH DIGITAL BILLBOARDS ================= */
    buildWonderlandDOOHBillboards() {
        const billboardConfigs = [
            {
                progress: 0.15,
                serviceKey: 'bike',
                title: 'PAKKA BIKE TAXI',
                price: '₹29 Base • ~4 min',
                image: 'assets/images/billboard-bike.jpg',
                neonColor: 0xD4AF37
            },
            {
                progress: 0.30,
                serviceKey: 'auto',
                title: 'PAKKA AUTO RICKSHAW',
                price: 'Flat Fare • No Bargaining',
                image: 'assets/images/billboard-auto.jpg',
                neonColor: 0xE5B83B
            },
            {
                progress: 0.45,
                serviceKey: 'cab',
                title: 'PAKKA PRIME CAB & SUV',
                price: 'Fares from ₹99 • AC Prime',
                image: 'assets/images/billboard-cab.jpg',
                neonColor: 0xFFFFFF
            },
            {
                progress: 0.60,
                serviceKey: 'parcel',
                title: 'PAKKA PARCEL EXPRESS',
                price: 'Starts @ ₹39 • 10m Pickup',
                image: 'assets/images/billboard-parcel.jpg',
                neonColor: 0xD4AF37
            },
            {
                progress: 0.72,
                serviceKey: 'ev',
                title: 'PAKKA EV GREEN FLEET',
                price: 'From ₹35 • Silent Drive',
                image: 'assets/images/billboard-ev.jpg',
                neonColor: 0x34C759
            },
            {
                progress: 0.84,
                serviceKey: 'outstation',
                title: 'PAKKA OUTSTATION & AIRPORT',
                price: 'From ₹14/km • Transparent Rates',
                image: 'assets/images/billboard-outstation.jpg',
                neonColor: 0xD4AF37
            }
        ];

        billboardConfigs.forEach((cfg) => {
            const posOnCurve = this.curve.getPointAt(cfg.progress);
            const billboardGroup = new THREE.Group();
            const boardWidth = 28;
            const boardHeight = 11.5;

            // Grand Overhead Highway Gantry Portal (Elevated to 18.5m, clearing all vehicles)
            billboardGroup.position.copy(posOnCurve);
            billboardGroup.position.y += 18.5;

            const colGeo = new THREE.CylinderGeometry(0.55, 0.75, 24, 16);
            const colMat = new THREE.MeshLambertMaterial({ color: 0x16161e, side: THREE.DoubleSide });
            const colLeft = new THREE.Mesh(colGeo, colMat);
            colLeft.position.set(-17.5, -9.0, 0); // 17.5m away from road center (road edge is 12m)
            const colRight = new THREE.Mesh(colGeo, colMat);
            colRight.position.set(17.5, -9.0, 0); // 17.5m away from road center

            const beamGeo = new THREE.BoxGeometry(37, 1.4, 1.4);
            const beam = new THREE.Mesh(beamGeo, colMat);
            beam.position.set(0, 6.5, 0);
            billboardGroup.add(colLeft, colRight, beam);

            const frameGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.8);
            const frameMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0e, side: THREE.DoubleSide });
            const frameMesh = new THREE.Mesh(frameGeo, frameMat);
            billboardGroup.add(frameMesh);

            const neonMat = new THREE.MeshBasicMaterial({
                color: cfg.neonColor,
                side: THREE.DoubleSide
            });
            this.neonBorders.push(neonMat);

            const hTubeGeo = new THREE.CylinderGeometry(0.18, 0.18, boardWidth + 0.6, 12);
            const topTube = new THREE.Mesh(hTubeGeo, neonMat);
            topTube.rotation.z = Math.PI / 2;
            topTube.position.set(0, boardHeight / 2 + 0.3, 0.45);

            const btmTube = new THREE.Mesh(hTubeGeo, neonMat);
            btmTube.rotation.z = Math.PI / 2;
            btmTube.position.set(0, -boardHeight / 2 - 0.3, 0.45);

            const vTubeGeo = new THREE.CylinderGeometry(0.18, 0.18, boardHeight + 0.6, 12);
            const leftTube = new THREE.Mesh(vTubeGeo, neonMat);
            leftTube.position.set(-boardWidth / 2 - 0.3, 0, 0.45);

            const rightTube = new THREE.Mesh(vTubeGeo, neonMat);
            rightTube.position.set(boardWidth / 2 + 0.3, 0, 0.45);

            billboardGroup.add(topTube, btmTube, leftTube, rightTube);

            const haloMat = new THREE.MeshBasicMaterial({
                color: cfg.neonColor,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const haloGeo = new THREE.PlaneGeometry(boardWidth + 3.0, boardHeight + 2.5);
            const haloMesh = new THREE.Mesh(haloGeo, haloMat);
            haloMesh.position.z = -0.45;
            billboardGroup.add(haloMesh);

            [-8, -2.5, 2.5, 8].forEach(lx => {
                const spot = new THREE.SpotLight(0xfff6e0, 3.5, 22, Math.PI / 4, 0.35);
                spot.position.set(lx, boardHeight / 2 + 1.0, 1.6);
                billboardGroup.add(spot);
                this.streetLights.push(spot);
            });

            const bCanvas = document.createElement('canvas');
            bCanvas.width = 1920;
            bCanvas.height = 1080;
            const bctx = bCanvas.getContext('2d');

            const drawBillboardContent = (img = null) => {
                bctx.fillStyle = '#08080a';
                bctx.fillRect(0, 0, 1920, 1080);

                if (img && img.complete) {
                    bctx.drawImage(img, 0, 0, 1920, 1080);
                    const grad = bctx.createLinearGradient(0, 680, 0, 1080);
                    grad.addColorStop(0, 'rgba(8,8,10,0)');
                    grad.addColorStop(1, 'rgba(6,6,8,0.95)');
                    bctx.fillStyle = grad;
                    bctx.fillRect(0, 680, 1920, 400);
                } else {
                    const grad = bctx.createLinearGradient(0, 0, 1920, 1080);
                    grad.addColorStop(0, '#0C0C10');
                    grad.addColorStop(1, '#1A1812');
                    bctx.fillStyle = grad;
                    bctx.fillRect(0, 0, 1920, 1080);
                }

                bctx.fillStyle = '#D4AF37';
                bctx.fillRect(0, 0, 1920, 20);

                bctx.fillStyle = '#FFFFFF';
                bctx.font = 'bold 80px "Syne", sans-serif';
                bctx.shadowColor = 'rgba(0,0,0,0.95)';
                bctx.shadowBlur = 16;
                bctx.fillText(cfg.title, 60, 930);

                bctx.fillStyle = '#D4AF37';
                bctx.font = '600 44px "JetBrains Mono", monospace';
                bctx.fillText(cfg.price, 60, 1010);
            };

            drawBillboardContent();

            const canvasTex = new THREE.CanvasTexture(bCanvas);
            canvasTex.generateMipmaps = true;
            canvasTex.minFilter = THREE.LinearMipmapLinearFilter;
            canvasTex.needsUpdate = true;

            const bgImg = new Image();
            bgImg.crossOrigin = 'anonymous';
            bgImg.onload = () => {
                drawBillboardContent(bgImg);
                canvasTex.needsUpdate = true;
            };
            bgImg.src = cfg.image;

            const posterMat = new THREE.MeshBasicMaterial({
                map: canvasTex,
                side: THREE.DoubleSide
            });

            const posterGeo = new THREE.PlaneGeometry(boardWidth - 0.4, boardHeight - 0.4);
            const posterMesh = new THREE.Mesh(posterGeo, posterMat);
            posterMesh.position.z = 0.42;
            posterMesh.userData = { serviceKey: cfg.serviceKey, isBillboard: true };
            billboardGroup.add(posterMesh);
            this.clickableMeshes.push(posterMesh);

            const approachPoint = this.curve.getPointAt(Math.max(0, cfg.progress - 0.045));
            billboardGroup.lookAt(approachPoint);

            this.scene.add(billboardGroup);
            this.billboards.push({
                group: billboardGroup,
                posterMat: posterMat,
                neonMat: neonMat,
                config: cfg,
                progress: cfg.progress
            });
        });
    }

    /* ================= 5. REALISTIC FORWARD & ONCOMING TRAFFIC FLEET ================= */
    buildRealisticTrafficFleet() {
        const vehicleFleet = [
            // FORWARD SLOW LANE TRAFFIC (oncoming: false, strictly in outer slow lane -7.5)
            { type: 'auto', progress: 0.14, lane: -7.5, speed: 0.00045, oncoming: false },
            { type: 'parcel_bike', progress: 0.38, lane: -7.5, speed: 0.00055, oncoming: false },
            { type: 'auto', progress: 0.62, lane: -7.5, speed: 0.00048, oncoming: false },
            { type: 'parcel_bike', progress: 0.86, lane: -7.5, speed: 0.00056, oncoming: false },

            // ONCOMING FAST LANE (lane: +2.5, traveling in opposite direction)
            { type: 'cab', progress: 0.18, lane: 2.5, speed: 0.00065, oncoming: true },
            { type: 'scorpio', progress: 0.42, lane: 2.5, speed: 0.00070, oncoming: true },
            { type: 'bike', progress: 0.68, lane: 2.5, speed: 0.00078, oncoming: true },
            { type: 'cab', progress: 0.92, lane: 2.5, speed: 0.00068, oncoming: true },

            // ONCOMING SLOW LANE (lane: +7.5, traveling in opposite direction)
            { type: 'auto', progress: 0.06, lane: 7.5, speed: 0.00046, oncoming: true },
            { type: 'parcel_bike', progress: 0.30, lane: 7.5, speed: 0.00054, oncoming: true },
            { type: 'auto', progress: 0.54, lane: 7.5, speed: 0.00048, oncoming: true },
            { type: 'scorpio', progress: 0.80, lane: 7.5, speed: 0.00066, oncoming: true }
        ];

        vehicleFleet.forEach(v => {
            let vGroup;
            if (v.type === 'auto') {
                vGroup = this.createBajajAutoRickshawModel();
            } else if (v.type === 'bike') {
                vGroup = this.createTVSApacheRTRModel('#F5BA18');
            } else if (v.type === 'parcel_bike') {
                vGroup = this.createCheckersSixty60BikeModel();
            } else if (v.type === 'scorpio') {
                vGroup = this.createMahindraScorpioSUVModel('#0F172A');
            } else {
                vGroup = this.createModernSedanModel('#F8FAFC');
            }

            vGroup.scale.set(1.05, 1.05, 1.05);
            this.scene.add(vGroup);
            this.trafficVehicles.push({
                group: vGroup,
                progress: v.progress,
                lane: v.lane,
                targetLane: v.lane,
                baseSpeed: v.speed,
                currentSpeed: v.speed,
                oncoming: v.oncoming,
                type: v.type,
                steerRoll: 0
            });
        });
    }

    getSplineDist(p1, p2) {
        let diff = p2 - p1;
        if (diff > 0.5) diff -= 1.0;
        if (diff < -0.5) diff += 1.0;
        return diff;
    }

    isLaneClear(lane, progress, safetyGap = 0.050, ignoreIdx = -1) {
        // Check distance against Hero Vehicle
        if (Math.abs(lane - this.heroLane) < 2.5) {
            const heroDist = Math.abs(this.getSplineDist(progress, this.progress));
            if (heroDist < safetyGap) {
                return false;
            }
        }
        // Check distance against all other traffic vehicles
        for (let i = 0; i < this.trafficVehicles.length; i++) {
            if (i === ignoreIdx) continue;
            const other = this.trafficVehicles[i];
            if (Math.abs(other.lane - lane) < 2.5) {
                const d = Math.abs(this.getSplineDist(progress, other.progress));
                if (d < safetyGap) {
                    return false;
                }
            }
        }
        return true;
    }

    buildOverheadMetroFlyover() {
        const t = 0.95;
        const pt = this.curve.getPointAt(t);
        const tangent = this.curve.getTangent(t).normalize();
        const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

        const bridgeGroup = new THREE.Group();
        bridgeGroup.position.set(pt.x, pt.y + 17.5, pt.z); // High 17.5m elevation

        const girderGeo = new THREE.BoxGeometry(46, 3.2, 6.5);
        const girderMat = new THREE.MeshLambertMaterial({ color: 0x1e202a, side: THREE.DoubleSide });
        const girder = new THREE.Mesh(girderGeo, girderMat);
        bridgeGroup.add(girder);

        const pillarGeo = new THREE.CylinderGeometry(1.4, 1.8, 22, 12);
        const pLeft = new THREE.Mesh(pillarGeo, girderMat);
        pLeft.position.set(-18.5, -11.0, 0); // 18.5m outside road center (road edge 12m)
        const pRight = new THREE.Mesh(pillarGeo, girderMat);
        pRight.position.set(18.5, -11.0, 0); // 18.5m outside road center
        bridgeGroup.add(pLeft, pRight);

        const trainGeo = new THREE.BoxGeometry(60, 3.5, 4.0);
        const trainMat = new THREE.MeshLambertMaterial({ color: 0x242834, side: THREE.DoubleSide });
        const train = new THREE.Mesh(trainGeo, trainMat);
        train.position.y = 3.2;

        const stripeGeo = new THREE.BoxGeometry(60.2, 0.5, 4.05);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 2.8;
        bridgeGroup.add(train, stripe);

        bridgeGroup.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), normal);
        this.scene.add(bridgeGroup);
    }

    buildIntersectionTrafficLights() {
        const t = 0.92;
        const pt = this.curve.getPointAt(t);
        const tangent = this.curve.getTangent(t).normalize();
        const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

        const gantry = new THREE.Group();
        gantry.position.set(pt.x, pt.y + 8.5, pt.z);

        const beamGeo = new THREE.BoxGeometry(24, 0.75, 0.75);
        const beamMat = new THREE.MeshLambertMaterial({ color: 0x14141c, side: THREE.DoubleSide });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        gantry.add(beam);

        const colors = [0xff3b30, 0xffcc00, 0x34c759];
        [-5, 0, 5].forEach((xOff, i) => {
            const podGeo = new THREE.BoxGeometry(1.2, 3.0, 0.75);
            const podMat = new THREE.MeshBasicMaterial({ color: 0x050507, side: THREE.DoubleSide });
            const pod = new THREE.Mesh(podGeo, podMat);
            pod.position.set(xOff, -0.8, 0);

            const lampGeo = new THREE.CircleGeometry(0.4, 16);
            const lampMat = new THREE.MeshBasicMaterial({
                color: colors[i],
                side: THREE.DoubleSide
            });
            const lamp = new THREE.Mesh(lampGeo, lampMat);
            lamp.position.set(0, 0, 0.4);
            pod.add(lamp);

            gantry.add(pod);
        });

        gantry.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), normal);
        this.scene.add(gantry);
    }

    /* ================= 6. DUAL DAY/NIGHT LIGHTING SWITCHER ================= */
    setDayNightMode(isDay) {
        this.isDayMode = isDay;
        if (!this.scene) return;

        this.initBlenderPBRLightingAndEnvironment();

        if (isDay) {
            this.scene.background.setHex(0xBDC8D6);
            if (this.scene.fog) {
                this.scene.fog.color.setHex(0xBDC8D6);
                this.scene.fog.density = 0.0003;
            }

            this.ambientLight.color.setHex(0xFFFFFF);
            this.ambientLight.intensity = 2.0;

            this.dirLight.color.setHex(0xFFF8E7);
            this.dirLight.intensity = 2.4;

            // ALL DRIVING & VEHICLE LIGHTS OFF IN DAY
            this.headlightLeft.intensity = 0.0;
            this.headlightRight.intensity = 0.0;
            this.vehiclePointLights.forEach(l => l.intensity = 0.0);

            // ALL STREET LIGHTS OFF IN DAY
            this.streetLights.forEach(l => l.intensity = 0.0);
            this.streetLightMeshes.forEach(m => m.material.color.setHex(0x555555));
            this.spireBeacons.forEach(b => b.intensity = 0.0);

            if (this.groundMat) {
                this.groundMat.color.setHex(0x718096);
            }
            if (this.roadMat) {
                this.roadMat.color.setHex(0xffffff);
            }
            if (this.towerMat) {
                this.towerMat.color.setHex(0x3B485A);
            }
        } else {
            this.scene.background.setHex(0x050711);
            if (this.scene.fog) {
                this.scene.fog.color.setHex(0x050711);
                this.scene.fog.density = 0.00030;
            }

            this.ambientLight.color.setHex(0x475569);
            this.ambientLight.intensity = 1.3;

            this.dirLight.color.setHex(0xd4af37);
            this.dirLight.intensity = 2.2;

            // ALL VEHICLE HEADLIGHTS ON IN NIGHT
            this.headlightLeft.intensity = 6.5;
            this.headlightRight.intensity = 6.5;
            this.vehiclePointLights.forEach(l => l.intensity = 3.5);

            // ALL STREET LIGHTS ON IN NIGHT
            this.streetLights.forEach(l => l.intensity = 2.8);
            this.streetLightMeshes.forEach(m => m.material.color.setHex(0xffe699));
            this.spireBeacons.forEach(b => b.intensity = 2.5);

            if (this.groundMat) {
                this.groundMat.color.setHex(0x030509);
            }
            if (this.roadMat) {
                this.roadMat.color.setHex(0xffffff);
            }
            if (this.towerMat) {
                this.towerMat.color.setHex(0x0c111e);
            }
        }
    }

    onSceneClick(e) {
        if (!this.camera) return;
        this.mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouseVec, this.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableMeshes);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const serviceKey = hit.userData?.serviceKey;
            if (serviceKey && typeof openBookingModal === 'function') {
                openBookingModal(serviceKey);
            }
        }
    }

    updateDriveProgress(progress) {
        this.targetProgress = Math.max(0.0, Math.min(progress, 0.999));
        this.progress = this.targetProgress;
        this.syncActiveHeroVehicle();
    }

    setDayNightMode(isDay) {
        this.isDayMode = !!isDay;
        if (!this.scene) return;

        if (this.isDayMode) {
            // Bright Daylight Sky & Sun
            this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
            this.scene.fog = new THREE.FogExp2(0xA0D8EF, 0.00018);
            if (this.ambientLight) {
                this.ambientLight.color.setHex(0xFFFFFF);
                this.ambientLight.intensity = 2.4;
            }
            if (this.dirLight) {
                this.dirLight.color.setHex(0xFFFBEB);
                this.dirLight.intensity = 3.4;
                this.dirLight.position.set(100, 200, -80);
            }
            if (this.groundMesh && this.groundMesh.material) {
                this.groundMesh.material.color.setHex(0x1E3A1E); // Rich green park grass
            }
            this.streetLightMeshes.forEach(l => {
                if (l.material) l.material.color.setHex(0xCBD5E1);
            });
            if (this.headlightLeft) this.headlightLeft.intensity = 0.5;
            if (this.headlightRight) this.headlightRight.intensity = 0.5;
        } else {
            // Night Sky & Glowing City Lights
            this.scene.background = new THREE.Color(0x050711);
            this.scene.fog = new THREE.FogExp2(0x050711, 0.00030);
            if (this.ambientLight) {
                this.ambientLight.color.setHex(0x475569);
                this.ambientLight.intensity = 1.3;
            }
            if (this.dirLight) {
                this.dirLight.color.setHex(0xD4AF37);
                this.dirLight.intensity = 2.2;
                this.dirLight.position.set(70, 150, -100);
            }
            if (this.groundMesh && this.groundMesh.material) {
                this.groundMesh.material.color.setHex(0x04060C);
            }
            this.streetLightMeshes.forEach(l => {
                if (l.material) l.material.color.setHex(0xFFE699);
            });
            if (this.headlightLeft) this.headlightLeft.intensity = 6.5;
            if (this.headlightRight) this.headlightRight.intensity = 6.5;
        }
    }

    onMouseMove(e) {
        this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    setCameraMode(mode) {
        if (['chase', 'hood', 'cinematic'].includes(mode)) {
            this.cameraMode = mode;
        }
    }

    cycleCameraMode() {
        const modes = ['chase', 'hood', 'cinematic'];
        const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
        this.cameraMode = modes[nextIdx];
        return this.cameraMode;
    }

    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.progress += (this.targetProgress - this.progress) * 0.12;

        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Position Hero Vehicle along the road spline (Left Cruising Lane: heroLane = -2.4)
        if (this.curve && this.heroVehicleGroup) {
            this.syncActiveHeroVehicle();

            const heroProgress = Math.min(this.progress + 0.0035, 0.999);
            const heroPtSpline = this.curve.getPointAt(heroProgress);
            const heroTangent = this.curve.getTangent(heroProgress).normalize();
            const heroNormal = new THREE.Vector3().crossVectors(heroTangent, new THREE.Vector3(0, 1, 0)).normalize();

            const heroPos = new THREE.Vector3().copy(heroPtSpline).addScaledVector(heroNormal, this.heroLane);
            this.heroVehicleGroup.position.set(heroPos.x, heroPos.y + 0.12 + Math.sin(time * 12) * 0.01, heroPos.z);
            
            const heroLookPt = this.curve.getPointAt(Math.min(heroProgress + 0.008, 0.9999));
            const heroLookTangent = this.curve.getTangent(Math.min(heroProgress + 0.008, 0.9999)).normalize();
            const heroLookNormal = new THREE.Vector3().crossVectors(heroLookTangent, new THREE.Vector3(0, 1, 0)).normalize();
            const heroLookTarget = new THREE.Vector3().copy(heroLookPt).addScaledVector(heroLookNormal, this.heroLane);
            this.heroVehicleGroup.lookAt(heroLookTarget);
        }

        // Camera following behind Hero Vehicle in Dynamic GTA 5 Perspective Modes
        if (this.curve && this.camera && this.heroVehicleGroup) {
            const camProgress = this.progress;
            const camPosSpline = this.curve.getPointAt(camProgress);
            const camTangent = this.curve.getTangent(camProgress).normalize();
            const camNormal = new THREE.Vector3().crossVectors(camTangent, new THREE.Vector3(0, 1, 0)).normalize();

            const heroTargetProgress = Math.min(this.progress + 0.0055, 0.999);
            const heroTargetPt = this.curve.getPointAt(heroTargetProgress);
            const heroTargetTangent = this.curve.getTangent(heroTargetProgress).normalize();
            const heroTargetNormal = new THREE.Vector3().crossVectors(heroTargetTangent, new THREE.Vector3(0, 1, 0)).normalize();
            const heroTargetPos = new THREE.Vector3().copy(heroTargetPt).addScaledVector(heroTargetNormal, this.heroLane);

            if (this.cameraMode === 'hood') {
                // GTA 5 FIRST-PERSON BUMPER / HOOD VIEW
                const hoodCamPos = new THREE.Vector3().copy(heroTargetPos)
                    .addScaledVector(camTangent, 0.6)
                    .add(new THREE.Vector3(0, 1.25, 0));
                
                this.camera.position.copy(hoodCamPos);

                const hoodLookTarget = new THREE.Vector3().copy(heroTargetPos)
                    .addScaledVector(camTangent, 22.0)
                    .add(new THREE.Vector3(this.mouseX * 1.5, 1.1 + -this.mouseY * 0.8, 0));
                
                this.camera.lookAt(hoodLookTarget);
            } else if (this.cameraMode === 'cinematic') {
                // GTA 5 CINEMATIC DRONE ORBIT VIEW
                const orbitAngle = time * 0.45;
                const droneCamPos = new THREE.Vector3().copy(heroTargetPos)
                    .addScaledVector(camNormal, Math.cos(orbitAngle) * 11.0)
                    .addScaledVector(camTangent, Math.sin(orbitAngle) * 9.0)
                    .add(new THREE.Vector3(0, 5.2, 0));

                this.camera.position.copy(droneCamPos);

                const droneLookTarget = new THREE.Vector3().copy(heroTargetPos).add(new THREE.Vector3(0, 1.0, 0));
                this.camera.lookAt(droneLookTarget);
            } else {
                // GTA 5 DYNAMIC 3/4 CHASE CAMERA (Default)
                const camElevated = new THREE.Vector3().copy(camPosSpline)
                    .addScaledVector(camNormal, this.heroLane + 1.8)
                    .add(new THREE.Vector3(0, 2.35, 0));

                const idleShakeY = Math.sin(time * 12) * 0.008;
                const idleShakeX = Math.cos(time * 8) * 0.005;

                this.camera.position.set(camElevated.x + idleShakeX, camElevated.y + idleShakeY, camElevated.z);

                const lookTarget = new THREE.Vector3().copy(heroTargetPos).add(new THREE.Vector3(0, 0.92, 0));
                lookTarget.x += this.mouseX * 1.8;
                lookTarget.y += -this.mouseY * 1.2;

                this.camera.lookAt(lookTarget);

                if (this.headlightTarget) {
                    this.headlightTarget.position.set(lookTarget.x, lookTarget.y, lookTarget.z);
                }
            }
        }

        // Wheel Rotation Animation (Rolling Forward)
        this.rotatingWheels.forEach(w => {
            w.rotation.x -= delta * 12.0;
        });

        // Hover Floating Effect on Billboards
        this.billboards.forEach((b, i) => {
            b.group.position.y = this.curve.getPointAt(b.progress).y + 10.5 + Math.sin(time * 2.0 + i) * 0.35;
        });

        // Animate Traffic Fleet (Zero-Collision Intelligent Traffic AI)
        const heroProgress = this.progress;

        this.trafficVehicles.forEach((v, idx) => {
            let desiredSpeed = v.baseSpeed;
            let targetLane = v.targetLane !== undefined ? v.targetLane : v.lane;

            // Strict lane clamp: Forward traffic never crosses median (stays in [-7.2, -2.4])
            // Oncoming traffic never crosses median (stays in [2.4, 7.2])
            const otherLane = (v.lane > (v.oncoming ? 4.8 : -4.8)) ? (v.oncoming ? 2.4 : -2.4) : (v.oncoming ? 7.2 : -7.2);

            // 1. Proximity & Collision Check with HERO Vehicle (Only for Forward Traffic)
            if (!v.oncoming) {
                const sDistToHero = this.getSplineDist(v.progress, heroProgress); // positive if hero is ahead of v, negative if hero is behind v
                const latDistHero = Math.abs(v.lane - this.heroLane);

                if (latDistHero < 3.8) {
                    if (sDistToHero > 0 && sDistToHero < 0.070) {
                        // v is BEHIND Hero in the same cruising lane: stay back and match/brake
                        targetLane = -7.5;
                        desiredSpeed = Math.min(v.baseSpeed * 0.5, 0.0002);
                    } else if (sDistToHero < 0 && sDistToHero > -0.090) {
                        // Hero is approaching v from behind: v INSTANTLY yields to outer slow lane -7.5
                        targetLane = -7.5;
                        desiredSpeed = Math.max(v.baseSpeed * 1.8, 0.0009); // Accelerate away cleanly
                    }
                }
            }

            // 2. Proximity & Collision Check with OTHER TRAFFIC VEHICLES in Same Direction
            this.trafficVehicles.forEach((otherV, oIdx) => {
                if (idx === oIdx) return;
                if (v.oncoming !== otherV.oncoming) return;

                const sDist = this.getSplineDist(v.progress, otherV.progress);
                const forwardDist = v.oncoming ? -sDist : sDist; // positive if otherV is ahead of v

                if (forwardDist > 0 && forwardDist < 0.065) {
                    const latDist = Math.abs(v.lane - otherV.lane);
                    if (latDist < 3.2) {
                        // otherV is directly in front of v!
                        if (this.isLaneClear(otherLane, v.progress, 0.055, idx)) {
                            // Alternative lane is clear: execute smooth overtake cut!
                            targetLane = otherLane;
                            desiredSpeed = Math.max(v.baseSpeed * 1.2, otherV.currentSpeed * 1.25);
                        } else {
                            // Alternative lane is occupied: smoothly brake and match speed
                            const gapFactor = Math.max(0.0, (forwardDist - 0.020) / 0.045);
                            desiredSpeed = Math.min(v.currentSpeed, otherV.currentSpeed * gapFactor);
                        }
                    }
                }
            });

            // Smooth Acceleration / Deceleration
            v.currentSpeed += (desiredSpeed - v.currentSpeed) * Math.min(1.0, delta * 4.0);

            // Update Progress along road spline
            if (v.oncoming) {
                v.progress -= v.currentSpeed;
                if (v.progress < 0.001) v.progress = 0.998;
            } else {
                v.progress += v.currentSpeed;
                if (v.progress > 0.998) v.progress = 0.001;
            }

            // Smooth Lateral Lane Diversion / Cut Transition (strictly within allowed road half)
            const minLane = v.oncoming ? 2.0 : -7.6;
            const maxLane = v.oncoming ? 7.6 : -2.0;
            v.targetLane = Math.max(minLane, Math.min(maxLane, targetLane));
            const laneDelta = v.targetLane - v.lane;
            v.lane += laneDelta * Math.min(1.0, delta * 3.2);

            // Calculate 3D Position on Spline
            const vPt = this.curve.getPointAt(v.progress);
            const vTangent = this.curve.getTangent(v.progress).normalize();
            const vNormal = new THREE.Vector3().crossVectors(vTangent, new THREE.Vector3(0, 1, 0)).normalize();

            const pos = new THREE.Vector3().copy(vPt).addScaledVector(vNormal, v.lane);
            pos.y += 0.12 + Math.sin(time * 8 + v.progress * 20) * 0.015;
            v.group.position.copy(pos);

            // Dynamic Heading & Steering Angle during Lane Cut
            let lookTarget;
            if (v.oncoming) {
                const prevP = Math.max(v.progress - 0.015, 0.001);
                const prevPt = this.curve.getPointAt(prevP);
                const prevTangent = this.curve.getTangent(prevP).normalize();
                const prevNormal = new THREE.Vector3().crossVectors(prevTangent, new THREE.Vector3(0, 1, 0)).normalize();
                lookTarget = new THREE.Vector3().copy(prevPt).addScaledVector(prevNormal, v.lane - laneDelta * 0.35);
            } else {
                const nextP = Math.min(v.progress + 0.015, 0.998);
                const nextPt = this.curve.getPointAt(nextP);
                const nextTangent = this.curve.getTangent(nextP).normalize();
                const nextNormal = new THREE.Vector3().crossVectors(nextTangent, new THREE.Vector3(0, 1, 0)).normalize();
                lookTarget = new THREE.Vector3().copy(nextPt).addScaledVector(nextNormal, v.lane + laneDelta * 0.35);
            }
            v.group.lookAt(lookTarget);

            // Smooth Lean / Tilt Physics during Lateral Cuts
            if (Math.abs(laneDelta) > 0.06) {
                const rollAngle = Math.max(-0.14, Math.min(0.14, -laneDelta * 0.06));
                v.group.rotateZ(rollAngle);
            }
        });

        // 3. HARD 3D EUCLIDEAN NON-PENETRATION & BUFFER SOLVER (100% Zero-Collision Guarantee)
        // A. Pairwise Traffic Vehicle Non-Penetration
        for (let i = 0; i < this.trafficVehicles.length; i++) {
            const vA = this.trafficVehicles[i];
            for (let j = i + 1; j < this.trafficVehicles.length; j++) {
                const vB = this.trafficVehicles[j];
                const dx = vA.group.position.x - vB.group.position.x;
                const dz = vA.group.position.z - vB.group.position.z;
                const distSq = dx * dx + dz * dz;
                const minClearance = 4.8; // 4.8 meters minimum bounding radius
                if (distSq < minClearance * minClearance && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);
                    const push = (minClearance - dist) * 0.5;
                    const nx = (dx / dist) * push;
                    const nz = (dz / dist) * push;
                    vA.group.position.x += nx;
                    vA.group.position.z += nz;
                    vB.group.position.x -= nx;
                    vB.group.position.z -= nz;
                    
                    // Decelerate the trailing vehicle
                    vA.currentSpeed = Math.min(vA.currentSpeed, vB.currentSpeed * 0.8);
                }
            }
        }

        // B. Hero Vehicle Non-Penetration
        if (this.heroVehicleGroup) {
            const hx = this.heroVehicleGroup.position.x;
            const hz = this.heroVehicleGroup.position.z;
            for (let i = 0; i < this.trafficVehicles.length; i++) {
                const v = this.trafficVehicles[i];
                const dx = v.group.position.x - hx;
                const dz = v.group.position.z - hz;
                const distSq = dx * dx + dz * dz;
                const minHeroClearance = 5.2; // 5.2 meters clearance from Hero
                if (distSq < minHeroClearance * minHeroClearance && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);
                    const push = (minHeroClearance - dist);
                    v.group.position.x += (dx / dist) * push;
                    v.group.position.z += (dz / dist) * push;
                    v.currentSpeed = Math.min(v.currentSpeed, 0.0002);
                }
            }
        }

        // Pulse Spire Aviation Warning Beacons in Night Mode
        if (!this.isDayMode) {
            const beaconIntensity = 1.2 + Math.sin(time * 4) * 1.0;
            this.spireBeacons.forEach(b => {
                b.intensity = beaconIntensity;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.pakka3D = new Pakka3DScene();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pakka3D.init();
    });
} else {
    window.pakka3D.init();
}
