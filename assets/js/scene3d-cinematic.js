/**
 * PAKKA LOCAL — CINEMATIC 3D ENGINE
 * three.js r180 · real Sketchfab assets · PBR + IBL + post-processing
 *
 * Replaces the r128 procedural scene. Key differences:
 *   - Real GLB models (city + 4 vehicles), auto-normalised for scale/orientation
 *   - Light budget kept under ~10 real lights; every glow is EMISSIVE + bloom.
 *     (The old scene put 284 lights in the graph, which overflowed
 *      MAX_FRAGMENT_UNIFORM_VECTORS and failed shader compilation outright.)
 *   - Camera route runs along corridors verified clear by raycast against
 *     the actual city mesh, so we never drive through a building.
 *
 * Public contract consumed by main.js:
 *   window.pakka3D.{ init, updateDriveProgress, setDayNightMode, cycleCameraMode,
 *                    renderer, scene, camera, canvas, progress, targetProgress }
 */
(function () {
  'use strict';

  // ───────────────────────── configuration ─────────────────────────

  const MODEL_BASE = 'assets/models/';

  // Real-world lengths (metres). Sketchfab source scales are wildly
  // inconsistent — apache ships at 0.18 units, sedan at 0.51 — so every
  // vehicle is rescaled to a true-to-life footprint at load time.
  const VEHICLES = {
    bike:       { file: 'scifibike.glb',    length: 2.10, name: 'Pakka Bike' },
    auto:       { file: 'autorickshaw.glb', length: 2.63, name: 'Bajaj Auto Rickshaw' },
    cab:        { file: 'dzire.glb',        length: 4.00, name: 'Maruti Swift Dzire' },
    parcel:     { file: 'eskuta.glb',       length: 1.95, name: 'Parcel Express Bike' },
    ev:         { file: 'scifibike.glb',    length: 2.10, name: 'Pakka EV' },
    outstation: { file: 'scorpiohp.glb',    length: 4.46, name: 'Mahindra Scorpio' }
  };

  /**
   * Which models are authored nose-down-negative-Z and need a 180 turn.
   *
   * This is NOT guesswork. Each model was rendered headlessly in Blender
   * with the camera parked on its +Z side, after applying the same yaw
   * _normalize applies, and inspected: whatever faces the camera IS the +Z
   * end. The XUV showed its full-width LED tail bar and rear wiper; the
   * sci-fi bike showed the rider's back; the pack cars showed boot lids.
   * Auto, Checkers, SETC bus, Porsche and the Bentley sedan showed their
   * grilles and headlights, so they are left alone — which matches exactly
   * which vehicles looked right on screen.
   */
  const MODEL_FLIP = {
    'scifibike.glb': true,
    'eskuta.glb': true,
    'xuv3xo.glb': true,
    'apache.glb': true,
    // Re-verified AFTER the min-width realignment, which rotated each pack
    // car by a different amount and so changed several of these. Rendered
    // from +Z in Blender and read off: pack_suv shows a rear wiper and tail
    // lights, pack_coupe shows twin round headlights, and so on. Blanket
    // -flipping all ten was leaving half of them driving backwards.
    'pack_sedan.glb': true,
    'pack_wagon.glb': true,
    'pack_offroad.glb': true,
    'pack_suv.glb': true,
    'pack_pickup.glb': true,
    // REGRESSION GUARD: these two were dropped once by a careless block
    // rewrite of the pack-car entries above, which silently sent the ridden
    // Swift Dzire and the Scorpio down the road backwards. Keep them here.
    'dzire.glb': true,
    'scorpiohp.glb': true
    // these face +Z already — do NOT flip:
    // pack_hatchback, pack_compact, pack_coupe, pack_minivan, pack_car8,
    // autorickshaw, checkers, sedan, porsche, setcbus
  };

  // Which kind of occupant each model needs. Cars are enclosed and read
  // fine empty at street distance; open vehicles do not.
  const RIDER_FOR = {
    // The sci-fi bike ships with its own modelled rider, so adding a
    // capsule figure on top would double them up.
    'scifibike.glb': 'none',
    'eskuta.glb': 'bike',
    'checkers.glb': 'bike',
    'apache.glb': 'bike',
    'autorickshaw.glb': 'auto',
    'sedan.glb': 'none', 'porsche.glb': 'none', 'xuv3xo.glb': 'none',
    'scorpiohp.glb': 'none', 'setcbus.glb': 'none', 'dzire.glb': 'none',
    'pack_sedan.glb': 'none', 'pack_hatchback.glb': 'none',
    'pack_compact.glb': 'none', 'pack_coupe.glb': 'none',
    'pack_wagon.glb': 'none', 'pack_minivan.glb': 'none',
    'pack_offroad.glb': 'none', 'pack_suv.glb': 'none',
    'pack_pickup.glb': 'none', 'pack_car8.glb': 'none'
  };

  /**
   * Seating tuned per model, as fractions of that vehicle's own bounding
   * box. One shared set of numbers does not work: a sport bike seats the
   * rider low and pitched forward over a long tank, whereas a delivery
   * scooter is upright with the bars close to the chest.
   *   seatY/barY = fraction of vehicle height · seatZ/barZ = fraction of length
   */
  const RIDER_TUNE = {
    'apache.glb':   { seatY: 0.60, seatZ: -0.02, barZ: 0.27, barY: 0.84, lean: 0.34 },
    'checkers.glb': { seatY: 0.56, seatZ: -0.04, barZ: 0.25, barY: 0.82, lean: 0.10 },
    'autorickshaw.glb': { seatY: 0.34, seatZ: 0.16, barZ: 0.40, barY: 0.56, lean: 0.08 },
    'eskuta.glb':   { seatY: 0.52, seatZ: -0.06, barZ: 0.26, barY: 0.84, lean: 0.14 },
    'scooter.glb':  { seatY: 0.60, seatZ: -0.10, barZ: 0.30, barY: 0.92, lean: 0.05 }
  };

  /**
   * Lamp counts per vehicle class, matching how these actually look on the
   * road: a bike runs a single headlamp and a single tail lamp, an auto
   * rickshaw has one headlamp but a pair of tail lamps, and a car carries
   * two of each.
   *   front  = white headlamps, rear = red tail lamps
   *   spread = lateral separation for paired lamps (metres)
   */
  const LAMPS = {
    'apache.glb':       { front: 1, rear: 1, spread: 0.00, frontY: 0.62, rearY: 0.60 },
    'checkers.glb':     { front: 1, rear: 1, spread: 0.00, frontY: 0.58, rearY: 0.62 },
    'autorickshaw.glb': { front: 1, rear: 0, spread: 0.42, frontY: 0.66, rearY: 0.52 },
    'sedan.glb':        { front: 2, rear: 2, spread: 0.62, frontY: 0.52, rearY: 0.54 },
    'scorpio.glb':      { front: 2, rear: 2, spread: 0.70, frontY: 0.60, rearY: 0.62 },
    'bus.glb':          { front: 2, rear: 2, spread: 1.50, frontY: 0.34, rearY: 0.36 },
    'minibus.glb':      { front: 2, rear: 2, spread: 1.35, frontY: 0.34, rearY: 0.36 },
    'truck.glb':        { front: 2, rear: 2, spread: 1.40, frontY: 0.30, rearY: 0.32 },
    'van.glb':          { front: 2, rear: 2, spread: 1.10, frontY: 0.30, rearY: 0.32 },
    'hatchback.glb':    { front: 2, rear: 2, spread: 1.05, frontY: 0.38, rearY: 0.42 },
    'hatchback_red.glb':{ front: 2, rear: 2, spread: 1.05, frontY: 0.38, rearY: 0.42 },
    'suv2.glb':         { front: 2, rear: 2, spread: 1.15, frontY: 0.38, rearY: 0.42 },
    'scooter.glb':      { front: 1, rear: 1, spread: 0.00, frontY: 0.62, rearY: 0.58 }
  };

  // Relative frequency of each vehicle in ambient traffic. Indian streets are
  // mostly two-wheelers and autos with occasional buses, so an even spread
  // reads wrong. Buses are heavy and slow, so a couple go a long way.
  const TRAFFIC_MIX = {
    // two-wheelers
    'scifibike.glb': 4,
    'checkers.glb': 3,
    'eskuta.glb': 3,
    // three-wheeler
    'autorickshaw.glb': 6,
    // the passenger-car pack, every body used as its own vehicle
    'pack_sedan.glb': 3, 'pack_hatchback.glb': 3, 'pack_compact.glb': 3,
    'pack_coupe.glb': 2, 'pack_wagon.glb': 2, 'pack_minivan.glb': 2,
    'pack_offroad.glb': 2, 'pack_suv.glb': 2, 'pack_pickup.glb': 2,
    'pack_car8.glb': 2,
    // other hero-grade cars seen in traffic too
    'scorpiohp.glb': 3, 'dzire.glb': 4,
    'porsche.glb': 2,
    // buses
    'setcbus.glb': 8
  };
  const TRAFFIC_COUNT = 46;

  // Extra models loaded purely as traffic (never ridden by the player).
  const TRAFFIC_ONLY_FILES = [
    'setcbus.glb', 'scorpiohp.glb', 'checkers.glb', 'dzire.glb', 'porsche.glb',
    'pack_sedan.glb', 'pack_hatchback.glb', 'pack_compact.glb',
    'pack_coupe.glb', 'pack_wagon.glb', 'pack_minivan.glb',
    'pack_offroad.glb', 'pack_suv.glb', 'pack_pickup.glb', 'pack_car8.glb'
  ];

  // True length in metres for the generated fleet, so _normalize rescales
  // each to a believable footprint next to the scanned Sketchfab models.
  const TRAFFIC_LENGTHS = {
    'scifibike.glb': 2.10, 'autorickshaw.glb': 2.63, 'checkers.glb': 1.95,
    'eskuta.glb': 1.95, 'sedan.glb': 4.40, 'porsche.glb': 4.29,
    'xuv3xo.glb': 4.10, 'scorpiohp.glb': 4.46, 'setcbus.glb': 11.20, 'dzire.glb': 4.00,
    'pack_sedan.glb': 4.55, 'pack_hatchback.glb': 3.95, 'pack_compact.glb': 3.70,
    'pack_coupe.glb': 4.45, 'pack_wagon.glb': 4.60, 'pack_minivan.glb': 4.90,
    'pack_offroad.glb': 4.40, 'pack_suv.glb': 4.85, 'pack_pickup.glb': 5.30,
    'pack_car8.glb': 4.30
  };

  // Vehicles too wide or long for the outer lane keep to the inner lane.
  // True overall height in metres, used to stop badly-proportioned sources
  // scaling into skyscrapers when normalised by length alone.
  const VEHICLE_HEIGHTS = { 'setcbus.glb': 3.30 };

  // Real-world car colours, deliberately excluding yellow. Applied per
  // instance so the same model appears in several colours and the street
  // reads as many more distinct cars than there are model files.
  const CAR_COLOURS = [
    0xf2f2f4, 0xd9dcdf, 0x9aa0a6, 0x5b6067, 0x24272b, 0x101215,
    0xb02a2a, 0x7d1c26, 0x1f4f8f, 0x24608f, 0x1d5c4a, 0x2f6b46,
    0x8a6a3f, 0x6b4a2f, 0xc46a1f, 0xa8452a
  ];

  /**
   * Which material actually carries each model's paint. The generic rule —
   * "yellow, or a material called body" — misses these, so the Dzire stayed
   * navy and the Porsche stayed white on every single instance. Named here
   * so they get repainted like everything else. Models whose paint shares a
   * texture with their glass and trim are deliberately absent: tinting those
   * would colour the windows too.
   */
  // Vehicles whose colour is part of their identity and must not be
  // repainted: an Indian auto is yellow, the SETC bus wears its own livery,
  // and the two delivery bikes carry brand colours.
  const NO_TINT = ['autorickshaw.glb', 'setcbus.glb', 'checkers.glb',
                   'eskuta.glb', 'scifibike.glb'];

  const PAINT_MATERIALS = {
    'dzire.glb':     /^primary$/i,
    'porsche.glb':   /^coat$/i,
    'scorpiohp.glb': /^material_0$/i
  };

  /**
   * The wider road network that ambient traffic drives on.
   *
   * Traffic used to share the camera's single spline, so the rest of the
   * city was dead and every vehicle you ever saw was on your own road.
   * These are straight corridors in unscaled city coordinates, each one
   * taken from the raycast road-mask survey (the same survey that chose the
   * camera route), so all of them are real carriageway end to end.
   *   [x1, z1, x2, z2]
   */
  const TRAFFIC_ROUTES = [
    [ 250,   96, -250,   96],   // long east-west boulevard
    [ 250,    0, -105,    0],   // central east-west road
    [ 155, -112, -210, -112],   // southern east-west road
    [ 200,  -40, -105,  -40],   // second east-west road
    [-208,  250, -208, -250],   // long north-south avenue (west)
    [ -96,  135,  -96, -195],   // north-south avenue (mid-west)
    [  24,  108,   24, -180],   // north-south avenue (mid-east)
    [ 205,  115,  205, -250]    // north-south avenue (east)
  ];

  const BIG_VEHICLES = ['setcbus.glb', 'pack_minivan.glb', 'pack_pickup.glb'];

  /**
   * City landmarks, placed beside the route rather than dropped at fixed
   * world coordinates — that way they always sit next to the road you
   * actually drive, whatever the route becomes.
   *   progress = where along the drive · side = which kerb · offset = metres out
   */
  const LANDMARKS = [
    { file: 'bus_stand.glb',       progress: 0.10, side:  1, offset: 13, yaw: 0,           label: 'Bus Stand' },
    { file: 'railway_station.glb', progress: 0.42, side: -1, offset: 34, yaw: Math.PI / 2, label: 'Railway Station' },
    { file: 'bus_stand.glb',       progress: 0.62, side: -1, offset: 13, yaw: Math.PI,     label: 'Bus Stand' },
    { file: 'airport.glb',         progress: 0.88, side:  1, offset: 46, yaw: Math.PI / 2, label: 'Airport Terminal' }
  ];

  const CITY_FILE = 'goldencity.glb';
  // The scan ships two enormous dark-green shells (Object_90 / Object_91,
  // ~546x284x546) that enclose the whole city; left visible they fill the
  // frame with flat green. Size alone can't identify them — the city's
  // per-material merged batches also span the full 546 extent, and the
  // shells actually have the HIGHEST triangle count of any mesh. The
  // reliable signal is the material: only the shells use CONCRETEWALL*.
  const CITY_SHELL_MATERIAL = /CONCRETEWALL/i;
  const CITY_SPAN_THRESHOLD = 400;

  // Route waypoints, chosen by raycasting a road-mask of the city mesh
  // rather than by eye. The obvious pick — the wide central boulevard — is a
  // DEPRESSED expressway at y=-7.3 walled on both sides: you'd drive a third
  // of the journey in a trench and never see the skyline, so it is avoided.
  // Seven turns, alternating left and right, for the stop-start feel of an
  // Indian city grid rather than one long straight. Every segment AND every
  // junction was validated against a raycast road-mask of the city mesh, so
  // each leg runs on real carriageway and each corner lands where two
  // corridors genuinely cross.
  /**
   * Scale applied to the whole city. Vehicles keep their true metric size,
   * so scaling the city up makes every road proportionally WIDER relative
   * to the traffic on it — which is the "enlarge the road" fix. Route
   * waypoints below are in unscaled city coordinates and are multiplied by
   * this at build time, so the two stay in step.
   */
  const CITY_SCALE = 1.5;

  /**
   * Legs are deliberately long. The previous route turned at z=0 and again
   * at z=-40 — two 90-degree turns just 40m apart, and the spline overshot
   * both (measured 106 and 105 degrees where it should bend 90). Back to
   * back like that it reads as a crooked zigzag, which is what showed up
   * during the auto phase. Every leg here is at least 112m.
   */
  const ROUTE = [
    [ 208, 0,  112],
    [ 208, 0,    0],   // turn 1 — onto the z=0 road      (112m)
    [  24, 0,    0],   // turn 2 — onto the x=24 avenue   (184m)
    [  24, 0, -112],   // turn 3 — onto the z=-112 road   (112m)
    [-208, 0, -112],   // turn 4 — onto the x=-208 avenue (232m)
    [-208, 0,   96],   // turn 5 — onto the z=96 boulevard(208m)
    [ -40, 0,   96]
  ];

  // Roadside hoardings, carried over from the original design: each sits in
  // the middle of the service phase it advertises, so you read the board and
  // then become that vehicle.
  // A gantry only reads if you approach it down a straight: on a corner you
  // arrive side-on and the panel is edge-on and unreadable. Each of these
  // was nudged off its nearest turn onto the straight that precedes it, and
  // _buildBillboards additionally rejects any position where the road bends
  // sharply, sliding it forward until the approach is straight.
  const BILLBOARDS = [
    { progress: 0.13, title: 'PAKKA BIKE TAXI',            image: 'assets/images/billboard-bike.jpg' },
    { progress: 0.26, title: 'PAKKA AUTO RICKSHAW',        image: 'assets/images/billboard-auto.jpg' },
    { progress: 0.45, title: 'PAKKA PRIME CAB & SUV',      image: 'assets/images/billboard-cab.jpg' },
    { progress: 0.58, title: 'PAKKA PARCEL EXPRESS',       image: 'assets/images/billboard-parcel.jpg' },
    { progress: 0.71, title: 'PAKKA EV GREEN FLEET',       image: 'assets/images/billboard-ev.jpg' },
    { progress: 0.86, title: 'PAKKA OUTSTATION & AIRPORT', image: 'assets/images/billboard-outstation.jpg' }
  ];

  // Vehicle morph points along the drive (thresholds from the original site).
  const MORPH = [
    { until: 0.23, mode: 'bike' },
    { until: 0.38, mode: 'auto' },
    { until: 0.52, mode: 'cab' },
    { until: 0.66, mode: 'parcel' },
    { until: 0.78, mode: 'ev' },
    { until: 1.01, mode: 'outstation' }
  ];

  const EYE_HEIGHT = 1.55;
  const DPR_CAP = 1.6;

  class PakkaCinematic3D {
    constructor() {
      this.progress = 0;
      this.targetProgress = 0;
      this.speedKmh = 0;
      this.isDay = false;
      this.cameraMode = 0;
      this.cameraModes = ['cockpit', 'chase', 'cinematic'];
      this.ready = false;
      this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      this.clock = null;
      this.traffic = [];
      this.heroes = {};
      this.cityWindowMats = [];
      this.activeMode = 'bike';
    }

    async init() {
      this.canvas = document.getElementById('webgl-canvas');
      if (!this.canvas) { console.warn('[Pakka3D] no #webgl-canvas'); return; }
      if (typeof THREE === 'undefined') { console.error('[Pakka3D] THREE missing'); return; }

      this.clock = new THREE.Clock();
      this._setupRenderer();
      this._setupScene();
      this._setupLighting();
      this._buildRoute();

      try {
        await this._loadAssets();
      } catch (e) {
        console.error('[Pakka3D] asset load failed:', e);
      }

      this._setupPostFX();
      this._bindEvents();
      this.setDayNightMode(false);
      this.ready = true;
      this._animate();
      document.body.classList.add('pakka3d-ready');
      console.log('[Pakka3D] ready · lights in scene:', this._countLights());
    }

    _setupRenderer() {
      const r = new THREE.WebGLRenderer({
        canvas: this.canvas, antialias: true, alpha: false,
        powerPreference: 'high-performance', stencil: false,
        logarithmicDepthBuffer: true
      });
      r.setSize(window.innerWidth, window.innerHeight);
      r.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
      r.shadowMap.autoUpdate = true;
      r.outputColorSpace = THREE.SRGBColorSpace;
      // AgX is what Blender 4.x uses by default — matches the look of the
      // cinematic-city references without hand-tuned grading.
      r.toneMapping = THREE.AgXToneMapping;
      r.toneMappingExposure = 1.15;
      r.shadowMap.enabled = true;
      r.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer = r;
    }

    _setupScene() {
      this.scene = new THREE.Scene();
      // Depth precision is governed by the near:far RATIO, not far alone.
      // 0.1 to 2200 is 22,000:1 and leaves so few bits at distance that
      // road and building faces flicker through one another. Pulling near
      // out to 0.6 gives ~6x the precision, and a logarithmic depth buffer
      // removes the remaining fighting on the far skyline.
      this.camera = new THREE.PerspectiveCamera(
        58, window.innerWidth / window.innerHeight, 0.6, 1800);
      this.camera.position.set(ROUTE[0][0], EYE_HEIGHT, ROUTE[0][2]);

      // Image-based lighting from a procedural room — gives every PBR
      // material real reflections without shipping an HDRI file.
      this.pmrem = new THREE.PMREMGenerator(this.renderer);
      this.envRT = this.pmrem.fromScene(new THREE.RoomEnvironment(), 0.04);
      this.scene.environment = this.envRT.texture;
      this.scene.environmentIntensity = 0.35;
    }

    _setupLighting() {
      this.sun = new THREE.DirectionalLight(0xffd9a0, 2.2);
      this.sun.position.set(-120, 160, -80);
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.set(1024, 1024);
      this.sun.shadow.camera.near = 1;
      this.sun.shadow.camera.far = 600;
      const S = 90;
      this.sun.shadow.camera.left = -S;
      this.sun.shadow.camera.right = S;
      this.sun.shadow.camera.top = S;
      this.sun.shadow.camera.bottom = -S;
      this.sun.shadow.bias = -0.0008;
      this.sun.shadow.normalBias = 0.35;
      this.sun.shadow.camera.updateProjectionMatrix();
      this.scene.add(this.sun);
      this.scene.add(this.sun.target);

      this.hemi = new THREE.HemisphereLight(0x9dc4ff, 0x241a12, 0.9);
      this.scene.add(this.hemi);

      // Two travelling accents that follow the camera so the immediate
      // street always reads, regardless of where the sun is.
      this.headlightGlow = new THREE.PointLight(0xfff0d0, 12, 45, 2);
      this.streetFill = new THREE.PointLight(0xffb066, 9, 60, 2);
      this.scene.add(this.headlightGlow);
      this.scene.add(this.streetFill);
    }

    _countLights() { let n = 0; this.scene.traverse(o => { if (o.isLight) n++; }); return n; }

    /**
     * A 5-point Catmull-Rom through these waypoints does NOT stay on the
     * street: the curve bows outward through each 90-degree turn and ends
     * up over rooftops (measured y=48.7 at one corner) or off the mesh
     * entirely. Densifying each leg with intermediate points pins the
     * spline to the straight sections and confines curvature to the corner.
     */
    _densifyRoute(waypoints, spacing) {
      // Corner FILLETS, not raw vertices.
      //
      // Feeding a Catmull-Rom a sharp 90-degree vertex makes it overshoot:
      // measured 105-106 degrees of turn where the corner is only 90, so the
      // path swings wide and snakes back. Replacing each corner with a real
      // circular arc — cut back along both legs by RADIUS and sweep between —
      // keeps the turn at exactly 90 and the approach dead straight.
      const RADIUS = 30 * CITY_SCALE;
      const ARC_STEPS = 16;

      const pts = waypoints.map(w => new THREE.Vector3().fromArray(w));
      const path = [];

      for (let i = 0; i < pts.length; i++) {
        const cur = pts[i];
        if (i === 0 || i === pts.length - 1) { path.push(cur.clone()); continue; }

        const prev = pts[i - 1], next = pts[i + 1];
        const inDir = cur.clone().sub(prev).normalize();
        const outDir = next.clone().sub(cur).normalize();

        // never eat more than 45% of either leg
        const r = Math.min(RADIUS,
          cur.distanceTo(prev) * 0.45, cur.distanceTo(next) * 0.45);

        const start = cur.clone().addScaledVector(inDir, -r);
        const end = cur.clone().addScaledVector(outDir, r);
        path.push(start);
        // quadratic Bezier through the corner approximates the arc closely
        for (let s = 1; s < ARC_STEPS; s++) {
          const u = s / ARC_STEPS, iu = 1 - u;
          path.push(new THREE.Vector3(
            iu * iu * start.x + 2 * iu * u * cur.x + u * u * end.x,
            iu * iu * start.y + 2 * iu * u * cur.y + u * u * end.y,
            iu * iu * start.z + 2 * iu * u * cur.z + u * u * end.z));
        }
        path.push(end);
      }

      // densify the straights so the spline cannot bow between corners
      const out = [];
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1];
        const steps = Math.max(1, Math.round(a.distanceTo(b) / spacing));
        for (let s = 0; s < steps; s++) out.push(a.clone().lerp(b, s / steps));
      }
      out.push(path[path.length - 1].clone());
      return out;
    }

    _buildRoute() {
      const scaled = ROUTE.map(function (w) {
        return [w[0] * CITY_SCALE, w[1] * CITY_SCALE, w[2] * CITY_SCALE];
      });
      const pts = this._densifyRoute(scaled, 25 * CITY_SCALE);
      this.curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
      this.routeLength = this.curve.getLength();
      this.groundProfile = null;
    }

    /**
     * The city is not flat — the main boulevard runs through a depressed
     * section at y=-7.3 while side streets sit at y=0. Riding a fixed y=0
     * route puts the camera in a trench for a third of the journey, so the
     * road surface is sampled once after load and the whole ride is
     * conformed to it.
     */
    _buildGroundProfile(samples) {
      if (!this.city) return;
      const N = samples || 240;
      const ray = new THREE.Raycaster();
      const targets = [];
      this.city.traverse(o => { if (o.isMesh && o.visible) targets.push(o); });
      const down = new THREE.Vector3(0, -1, 0);
      const raw = new Array(N + 1);

      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const pos = this.curve.getPointAt(t);
        // sample the CENTRED path, not the raw waypoint line
        const shift = this._centreAt(t);
        if (shift) {
          const tan = this.curve.getTangentAt(t);
          const side = new THREE.Vector3()
            .crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
          pos.addScaledVector(side, shift);
        }
        ray.set(new THREE.Vector3(pos.x, 140, pos.z), down);
        const hit = ray.intersectObjects(targets, false)[0];
        // Ignore hits high above the street — those are rooftops/awnings
        // overhanging the route, not the surface we drive on.
        raw[i] = (hit && hit.point.y < 20) ? hit.point.y : null;
      }

      // fill gaps (holes in the mesh) by carrying the last known height
      let last = 0;
      for (let i = 0; i <= N; i++) {
        if (raw[i] === null) raw[i] = last; else last = raw[i];
      }
      for (let i = N; i >= 0; i--) {
        if (raw[i] === null) raw[i] = last; else last = raw[i];
      }

      // Light smoothing only — the route is deliberately routed along
      // street-grade corridors, so this just removes kerb-height jitter.
      // A wide window here would lift the ride off the road surface.
      const smooth = raw.slice();
      const W = 3;
      for (let i = 0; i <= N; i++) {
        let sum = 0, n = 0;
        for (let k = -W; k <= W; k++) {
          const j = i + k;
          if (j >= 0 && j <= N) { sum += raw[j]; n++; }
        }
        smooth[i] = sum / n;
      }
      this.groundProfile = smooth;
      console.log('[Pakka3D] ground profile built · range ' +
        Math.min.apply(null, smooth).toFixed(1) + ' to ' +
        Math.max.apply(null, smooth).toFixed(1));
    }

    /**
     * The grid-derived waypoints sit wherever the corridor scan found clear
     * cells, which is often hard against one kerb — measured 17.5m of road on
     * the left and 1.5m on the right at the start. That makes a genuinely
     * wide road feel like an alley and pushes the outer traffic lane onto the
     * pavement. This probes the drivable width either side at each sample and
     * stores the lateral shift that re-centres the path between the kerbs.
     */
    _buildCentringProfile(samples) {
      if (!this.city) return;
      const N = samples || 240;
      const ray = new THREE.Raycaster();
      const T = this._cityTargets || [];
      const down = new THREE.Vector3(0, -1, 0);
      const up = new THREE.Vector3(0, 1, 0);
      // Probe budget matters: this runs synchronously during load, and a
      // fine sweep (240 samples x 0.5m steps to 24m) is ~23,000 raycasts
      // against 666 meshes, which locks the main thread for minutes. A
      // coarse sweep resolves the kerb line just as well for centring.
      const MAXP = 18 * CITY_SCALE, STEP = 1.5 * CITY_SCALE;

      const clearAt = (x, z) => {
        ray.set(new THREE.Vector3(x, 200, z), down);
        const h = ray.intersectObjects(T, false)[0];
        return !!(h && Math.abs(h.point.y) < 2.0);
      };

      const raw = new Array(N + 1);
      const halfRaw = new Array(N + 1);
      const leftRaw = new Array(N + 1);
      const rightRaw = new Array(N + 1);
      let widest = 0;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const pos = this.curve.getPointAt(t);
        const tan = this.curve.getTangentAt(t);
        const side = new THREE.Vector3().crossVectors(tan, up).normalize();
        let L = 0, R = 0;
        for (let d = STEP; d <= MAXP; d += STEP) {
          const q = pos.clone().addScaledVector(side, d);
          if (clearAt(q.x, q.z)) R = d; else break;
        }
        for (let d = STEP; d <= MAXP; d += STEP) {
          const q = pos.clone().addScaledVector(side, -d);
          if (clearAt(q.x, q.z)) L = d; else break;
        }
        raw[i] = (R - L) / 2;                  // shift toward the roomier side
        // After that shift the usable half-width each side is (L+R)/2.
        // Lanes are placed as a fraction of THIS, because a fixed offset
        // that fits a 48m boulevard puts vehicles on the footpath where
        // the carriageway narrows to 16m.
        halfRaw[i] = (L + R) / 2;
        // after the centring shift, each side has (L+R)/2 of room
        leftRaw[i] = (L + R) / 2;
        rightRaw[i] = (L + R) / 2;
        widest = Math.max(widest, L + R);
      }

      // smooth hard, otherwise the path snakes as the kerb line steps
      const sm = raw.slice();
      const W = 3;
      for (let i = 0; i <= N; i++) {
        let s = 0, n = 0;
        for (let k = -W; k <= W; k++) {
          const j = i + k;
          if (j >= 0 && j <= N) { s += raw[j]; n++; }
        }
        sm[i] = s / n;
      }
      this.centreProfile = sm;

      const hw = halfRaw.slice();
      for (let i = 0; i <= N; i++) {
        let acc = 0, cnt = 0;
        for (let k = -W; k <= W; k++) {
          const j = i + k;
          if (j >= 0 && j <= N) { acc += halfRaw[j]; cnt++; }
        }
        hw[i] = acc / cnt;
      }
      this.halfWidthProfile = hw;
      this.leftWidthProfile = hw;
      this.rightWidthProfile = hw;
      console.log('[Pakka3D] carriageway half-width ' +
        Math.min.apply(null, hw).toFixed(1) + '..' +
        Math.max.apply(null, hw).toFixed(1) + 'm');

      console.log('[Pakka3D] route re-centred · max shift ' +
        Math.max.apply(null, sm.map(Math.abs)).toFixed(1) + 'm · widest road ' +
        widest.toFixed(0) + 'm');
    }

    /** Usable half-width of carriageway at t, in metres. */
    /**
     * Turn each corridor into a drivable route: a straight curve plus its
     * own measured half-width, so lane clamping works on these exactly as
     * it does on the camera route. Measured once at load; nothing here
     * costs anything per frame.
     */
    _buildTrafficNetwork() {
      const ray = new THREE.Raycaster();
      const T = this._cityTargets || [];
      const down = new THREE.Vector3(0, -1, 0);
      const up = new THREE.Vector3(0, 1, 0);
      const isRoad = (x, z) => {
        ray.set(new THREE.Vector3(x, 200, z), down);
        const h = ray.intersectObjects(T, false)[0];
        return !!(h && Math.abs(h.point.y) < 2.0);
      };

      this.routes = [];
      const SAMPLES = 5;
      TRAFFIC_ROUTES.forEach((seg) => {
        const a = new THREE.Vector3(seg[0] * CITY_SCALE, 0, seg[1] * CITY_SCALE);
        const b = new THREE.Vector3(seg[2] * CITY_SCALE, 0, seg[3] * CITY_SCALE);
        const curve = new THREE.LineCurve3(a, b);
        const tan = b.clone().sub(a).normalize();
        const side = new THREE.Vector3().crossVectors(tan, up).normalize();

        // measure the carriageway either side, then centre the corridor
        const widths = [];
        let shiftSum = 0;
        for (let i = 0; i <= SAMPLES; i++) {
          const pos = curve.getPointAt(i / SAMPLES);
          let L = 0, R = 0;
          for (let d = 3; d <= 27; d += 3) {
            if (isRoad(pos.x + side.x * d, pos.z + side.z * d)) R = d; else break;
          }
          for (let d = 3; d <= 27; d += 3) {
            if (isRoad(pos.x - side.x * d, pos.z - side.z * d)) L = d; else break;
          }
          widths.push((L + R) / 2);
          shiftSum += (R - L) / 2;
        }
        const half = widths.reduce((x, y) => x + y, 0) / widths.length;
        const shift = shiftSum / (SAMPLES + 1);
        if (half < 4) return;                    // too narrow to be a road
        this.routes.push({
          curve: curve, tan: tan, side: side,
          halfWidth: half, shift: shift,
          length: a.distanceTo(b),
          phase: [Math.random(), Math.random(), Math.random(), Math.random()],
          count: [0, 0, 0, 0]
        });
      });
      console.log('[Pakka3D] traffic network: ' + this.routes.length +
        ' corridors, widths ' +
        this.routes.map(r => r.halfWidth.toFixed(0)).join('/') + 'm');
    }

    /** 0 on a straight, ~1 in the tightest bend — scales the swing budget. */
    _bendAt(t) {
      if (!this.curve) return 0;
      const d = 0.012;
      const a = this.curve.getTangentAt(Math.max(0, Math.min(1, t - d)));
      const b = this.curve.getTangentAt(Math.max(0, Math.min(1, t + d)));
      return Math.min(1, a.angleTo(b) / 0.9);
    }

    _halfWidthAt(t) {
      const h = this.halfWidthProfile;
      if (!h) return 7.0;
      const N = h.length - 1;
      const f = Math.max(0, Math.min(1, t)) * N;
      const i = Math.floor(f), frac = f - i;
      const a = h[i], b = h[Math.min(N, i + 1)];
      return a + (b - a) * frac;
    }

    _centreAt(t) {
      const c = this.centreProfile;
      if (!c) return 0;
      const N = c.length - 1;
      const f = Math.max(0, Math.min(1, t)) * N;
      const i = Math.floor(f), frac = f - i;
      const a = c[i], b = c[Math.min(N, i + 1)];
      return a + (b - a) * frac;
    }

    _groundAt(t) {
      const g = this.groundProfile;
      if (!g) return 0;
      const N = g.length - 1;
      const f = Math.max(0, Math.min(1, t)) * N;
      const i = Math.floor(f);
      const frac = f - i;
      const a = g[i];
      const b = g[Math.min(N, i + 1)];
      return a + (b - a) * frac;
    }

    _routeAt(t) {
      const c = Math.max(0, Math.min(1, t));
      const pos = this.curve.getPointAt(c);
      const tan = this.curve.getTangentAt(c);
      pos.y += this._groundAt(c);
      const shift = this._centreAt(c);
      if (shift) {
        const side = new THREE.Vector3()
          .crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
        pos.addScaledVector(side, shift);
      }
      return { pos: pos, tan: tan };
    }

    async _loadAssets() {
      const draco = new THREE.DRACOLoader();
      draco.setDecoderPath('assets/vendor/draco/');
      draco.setDecoderConfig({ type: 'js' });

      const loader = new THREE.GLTFLoader();
      loader.setDRACOLoader(draco);
      if (THREE.MeshoptDecoder) loader.setMeshoptDecoder(THREE.MeshoptDecoder);
      this.loader = loader;

      const load = (file) => new Promise((res, rej) =>
        loader.load(MODEL_BASE + file, res, undefined, rej));

      try {
        const city = await load(CITY_FILE);
        this._installCity(city.scene);
        // centring first — the ground profile then samples the centred path
        this._buildCentringProfile(64);
        this._buildGroundProfile(240);
      } catch (e) { console.warn('[Pakka3D] city failed:', e); }

      const files = Array.from(new Set(
        Object.values(VEHICLES).map(v => v.file).concat(TRAFFIC_ONLY_FILES)));
      const loaded = {};
      await Promise.all(files.map(async (f) => {
        try { loaded[f] = (await load(f)).scene; }
        catch (e) { console.warn('[Pakka3D] model failed:', f, e); }
      }));
      this._rawModels = loaded;

      this._buildHeroVehicle();
      // must precede _buildTraffic: vehicles claim a corridor and a lane
      // slot on it as they are created
      this._buildTrafficNetwork();
      this._buildTraffic();
      this._buildBillboards();
      this._buildStreetFurniture();
      await this._buildLandmarks(load);
    }

    /**
     * Airport, railway station and bus stands, anchored to the route so they
     * line the road you actually drive. Each is dropped onto the measured
     * ground height and pushed far enough off the kerb to clear the traffic
     * lanes.
     */
    async _buildLandmarks(load) {
      this.landmarks = [];
      const up = new THREE.Vector3(0, 1, 0);
      const cache = {};
      for (const cfg of LANDMARKS) {
        try {
          if (!cache[cfg.file]) cache[cfg.file] = (await load(cfg.file)).scene;
          const inst = cache[cfg.file].clone(true);
          const r = this._routeAt(cfg.progress);
          const side = new THREE.Vector3().crossVectors(r.tan, up).normalize();

          const g = new THREE.Group();
          g.position.copy(r.pos).addScaledVector(side, cfg.side * cfg.offset);
          // orient along the road, then apply the per-landmark yaw
          g.lookAt(g.position.clone().add(r.tan));
          g.rotateY(cfg.yaw);

          // sit it on the ground rather than the route's ride height
          const box = new THREE.Box3().setFromObject(inst);
          inst.position.y -= box.min.y;

          inst.traverse((o) => {
            if (!o.isMesh) return;
            o.castShadow = true; o.receiveShadow = true;
            [].concat(o.material || []).forEach((m) => {
              if (m) m.envMapIntensity = 0.8;
            });
          });
          g.add(inst);
          this.scene.add(g);
          this.landmarks.push({ group: g, cfg: cfg });
        } catch (e) {
          console.warn('[Pakka3D] landmark failed:', cfg.file, e);
        }
      }
      console.log('[Pakka3D] landmarks placed:', this.landmarks.length);
    }

    _installCity(root) {
      this._stripNonRenderables(root);

      let shells = 0;
      root.traverse((o) => {
        if (!o.isMesh) return;
        const m = [].concat(o.material || [])[0];
        if (!m || !CITY_SHELL_MATERIAL.test(m.name || '')) return;
        const s = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
        if (s.x > CITY_SPAN_THRESHOLD && s.z > CITY_SPAN_THRESHOLD) {
          o.visible = false;
          shells++;
        }
      });
      console.log('[Pakka3D] hid ' + shells + ' enclosing shell mesh(es)');

      root.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;
        const mats = [].concat(o.material || []);
        mats.forEach((m) => {
          if (!m) return;
          if (m.map) m.map.anisotropy = 4;
          // Buildings arrive fully rough; a touch of spec makes glass and
          // wet asphalt catch the sun instead of reading as flat paper.
          if (m.roughness !== undefined && m.roughness > 0.92) m.roughness = 0.72;
          if (m.metalness !== undefined && m.metalness === 0) m.metalness = 0.08;
          m.envMapIntensity = 0.7;
          if (/glass|window|glazing/i.test(m.name || '')) {
            m.emissive = new THREE.Color(0xffd9a0);
            m.emissiveIntensity = 0.0;
            m._isWindow = true;
          }
        });
      });

      this.cityWindowMats = [];
      root.traverse((o) => {
        if (!o.isMesh) return;
        [].concat(o.material || []).forEach((m) => {
          if (m && m._isWindow) this.cityWindowMats.push(m);
        });
      });

      // Enlarge the city relative to the (true-size) vehicles, so the roads
      // read as genuinely wide rather than the traffic looking oversized.
      root.scale.setScalar(CITY_SCALE);
      root.updateMatrixWorld(true);
      this.city = root;
      // cached once for the traffic clearance probe
      this._cityTargets = [];
      root.traverse(o => { if (o.isMesh && o.visible) this._cityTargets.push(o); });
      this.scene.add(root);
      console.log('[Pakka3D] city installed · window materials:', this.cityWindowMats.length);
    }

    /**
     * Rescale + reorient an imported model so it faces -Z at true size,
     * sitting on the ground plane. Sketchfab sources vary in both scale
     * and forward axis, so this is derived from the bounding box rather
     * than hardcoded per model.
     */
    /**
     * COLLADA sources carry edge geometry and authoring cameras alongside
     * the real surfaces — the Apache alone ships 86 LineSegments and a
     * PerspectiveCamera. Exported to glTF they survive as renderable line
     * primitives, which draw the model as a white wireframe cage on top of
     * its own shaded mesh. Drop anything that isn't a Mesh.
     */
    _stripNonRenderables(root) {
      const doomed = [];
      root.traverse((o) => {
        if (o.isLineSegments || o.isLine || o.isPoints || o.isCamera) doomed.push(o);
      });
      doomed.forEach((o) => { if (o.parent) o.parent.remove(o); });
      return doomed.length;
    }

    _normalize(obj, targetLength, file, targetHeight) {
      this._stripNonRenderables(obj);
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const group = new THREE.Group();

      const forwardIsX = size.x >= size.z;
      const currentLength = forwardIsX ? size.x : size.z;
      let k = (currentLength > 0) ? (targetLength / currentLength) : 1;
      // Some sources are badly out of proportion — the SETC bus came out
      // 4.7m tall when scaled purely by length. Where a true height is
      // known, cap the scale so the vehicle cannot tower over the street.
      if (targetHeight && size.y > 0) {
        k = Math.min(k, targetHeight / size.y);
      }
      obj.scale.multiplyScalar(k);

      const box2 = new THREE.Box3().setFromObject(obj);
      const c = box2.getCenter(new THREE.Vector3());
      obj.position.x -= c.x;
      obj.position.z -= c.z;
      obj.position.y -= box2.min.y;

      // Two nested groups, deliberately. The INNER one carries the yaw that
      // turns a model whose long axis is X into one facing +Z. Anything
      // attached to that inner group inherits the same 90-degree yaw — which
      // is what previously threw riders and lamps out sideways (both lamps
      // measured exactly 0 along the travel axis). The OUTER group has no
      // rotation, so attachments mounted on it use +Z = forward directly.
      const inner = new THREE.Group();
      if (forwardIsX) inner.rotation.y = -Math.PI / 2;
      // per-model nose correction, measured not guessed (see MODEL_FLIP)
      if (file && MODEL_FLIP[file]) inner.rotation.y += Math.PI;
      inner.add(obj);
      group.add(inner);

      group.traverse((o) => {
        if (!o.isMesh) return;
        // receive, but do not cast: 46 shadow-casting vehicles cost far more
        // than the contact shadows they contributed at this camera distance
        o.castShadow = false;
        o.receiveShadow = true;
        [].concat(o.material || []).forEach((m) => {
          if (!m) return;
          if (m.map) m.map.anisotropy = 8;
          m.envMapIntensity = 1.1;
          if (m.metalness !== undefined && m.metalness < 0.1 &&
              /body|paint|metal|chrome|tank/i.test(m.name || '')) {
            m.metalness = 0.85;
            m.roughness = Math.min(m.roughness === undefined ? 0.4 : m.roughness, 0.35);
          }
        });
      });
      return group;
    }

    /**
     * None of the Sketchfab vehicles ship with an occupant, so a bike with
     * no rider looks like it is driving itself. This builds a seated figure
     * sized from the host vehicle's own bounding box: hunched forward, hands
     * out at bar height, knees tucked — readable as a person at street
     * distance without the cost of a rigged character model.
     */
    _createRider(len, height, opts) {
      const o = opts || {};
      const g = new THREE.Group();
      const skin   = new THREE.MeshStandardMaterial({ color: 0x8d5a3b, roughness: 0.72, metalness: 0.0 });
      const jacket = new THREE.MeshStandardMaterial({ color: o.jacket || 0x1d2733, roughness: 0.78, metalness: 0.05 });
      const pants  = new THREE.MeshStandardMaterial({ color: 0x23262c, roughness: 0.85, metalness: 0.0 });
      const helmet = new THREE.MeshStandardMaterial({ color: o.helmet || 0xd4af37, roughness: 0.22, metalness: 0.35 });
      const visor  = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.08, metalness: 0.9 });

      // proportions derived from the vehicle so one builder serves bike/auto
      const S = Math.max(0.55, Math.min(1.25, height / 1.25));
      const seatY = height * (o.seatY || 0.52);
      const seatZ = len * (o.seatZ || 0.06);

      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.145 * S, 0.40 * S, 4, 10), jacket);
      torso.position.set(0, seatY + 0.34 * S, seatZ);
      torso.rotation.x = o.lean === undefined ? -0.30 : o.lean;
      g.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.135 * S, 16, 14), helmet);
      head.position.set(0, seatY + 0.76 * S, seatZ + 0.14 * S);
      head.userData.isHead = true;
      g.add(head);
      // visor cut faces forward (+Z)
      const vis = new THREE.Mesh(new THREE.SphereGeometry(0.138 * S, 16, 12,
        Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.42, Math.PI * 0.34), visor);
      vis.position.copy(head.position);
      vis.userData.isHead = true;
      g.add(vis);
      // where a first-person camera sits: just behind the visor
      g.userData.eye = new THREE.Vector3(0, seatY + 0.80 * S, seatZ + 0.10 * S);

      // A limb is a capsule stretched between two points. Building arms and
      // legs as single straight tubes (the previous approach) reads as a
      // mannequin; real riding posture is defined by the BEND — elbow dropped
      // below the shoulder line, knee folded so the shin angles back to the
      // peg rather than forward.
      const limb = (a, b, radius, mat) => {
        const len2 = a.distanceTo(b);
        const m = new THREE.Mesh(
          new THREE.CapsuleGeometry(radius, Math.max(0.02, len2 - radius * 2), 4, 8), mat);
        m.position.copy(a).lerp(b, 0.5);
        m.lookAt(b);
        m.rotateX(Math.PI / 2);
        return m;
      };

      const barZ = len * (o.barZ || 0.30);
      const barY = height * (o.barY || 0.78);

      [-1, 1].forEach((sx) => {
        const shoulder = new THREE.Vector3(sx * 0.155 * S, seatY + 0.58 * S, seatZ + 0.08 * S);
        const hand     = new THREE.Vector3(sx * 0.21 * S, barY, barZ);
        // elbow hangs below and behind the shoulder-to-hand line
        const elbow = shoulder.clone().lerp(hand, 0.52);
        elbow.y -= 0.14 * S;
        elbow.z -= 0.05 * S;
        g.add(limb(shoulder, elbow, 0.055 * S, jacket));
        g.add(limb(elbow, hand, 0.046 * S, jacket));
        const fist = new THREE.Mesh(new THREE.SphereGeometry(0.055 * S, 10, 8), skin);
        fist.position.copy(hand);
        g.add(fist);
      });

      const pegZ = seatZ + len * 0.06;
      const pegY = seatY - 0.42 * S;
      [-1, 1].forEach((sx) => {
        const hip  = new THREE.Vector3(sx * 0.135 * S, seatY + 0.06 * S, seatZ);
        // knee sits forward and slightly above the peg — the tucked riding fold
        const knee = new THREE.Vector3(sx * 0.185 * S, seatY - 0.02 * S, seatZ + len * 0.20);
        const foot = new THREE.Vector3(sx * 0.175 * S, pegY, pegZ);
        g.add(limb(hip, knee, 0.072 * S, pants));
        g.add(limb(knee, foot, 0.056 * S, pants));
        const boot = new THREE.Mesh(
          new THREE.BoxGeometry(0.12 * S, 0.09 * S, 0.24 * S), pants);
        boot.position.copy(foot);
        boot.position.z += 0.04 * S;
        g.add(boot);
      });

      g.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
      return g;
    }

    /**
     * Head and tail lamps as emissive geometry. These are not real lights —
     * bloom supplies the glow — so lamp count costs nothing in the shader
     * budget. Counts and placement come from LAMPS so a bike gets one lamp
     * each end while a car gets a pair.
     */
    /**
     * Some models already ship their own lamps — the Checkers bike has
     * Front_Light, Blinker_Light and Tail_Light_2 as real geometry. Bolting
     * synthetic lamps on top of those is what gave the delivery bike two
     * headlights. Where the model has its own, drive those and add nothing.
     * Returns true if the model was self-lit.
     */
    _useBuiltInLamps(group) {
      const head = [], tail = [];
      group.traverse((o) => {
        if (!o.isMesh) return;
        const n = (o.name || '');
        if (/head[_ ]?light|front[_ ]?light/i.test(n)) head.push(o);
        else if (/tail[_ ]?light|rear[_ ]?light|brake[_ ]?light/i.test(n)) tail.push(o);
      });
      if (!head.length && !tail.length) return false;

      this._builtInLamps = this._builtInLamps || { head: [], tail: [] };
      const tint = (list, colour, bucket) => {
        list.forEach((o) => {
          [].concat(o.material || []).forEach((m) => {
            if (!m) return;
            // clone so tinting one vehicle doesn't tint every clone
            const mm = m.clone();
            mm.emissive = new THREE.Color(colour);
            mm.toneMapped = false;
            o.material = mm;
            this._builtInLamps[bucket].push(mm);
          });
        });
      };
      tint(head, 0xfff6e0, 'head');
      tint(tail, 0xff1f00, 'tail');
      return true;
    }

    _mountLamps(group, file) {
      const spec = LAMPS[file];
      if (!spec) return;
      if (this._useBuiltInLamps(group)) return;
      // MUST run before the rider is attached: measuring a box that already
      // contains a seated figure inflates the height by ~30% and lifts the
      // headlamp to shoulder level instead of the front cowl.
      const box = new THREE.Box3().setFromObject(group);
      const size = box.getSize(new THREE.Vector3());
      const halfLen = Math.max(size.x, size.z) / 2;
      const h = size.y;

      if (!this._lampMats) {
        // Tail lamps were washing out to pale pink: at emissiveIntensity 3.2
        // with toneMapped:false the red channel clips well past 1.0 while
        // bloom lifts green and blue with it, so the core desaturates. Keep
        // red at ~1.0 and green/blue near zero and it stays properly RED,
        // letting bloom supply the glow instead of raw intensity.
        this._lampMats = {
          head: new THREE.MeshStandardMaterial({
            color: 0xfff6e0, emissive: 0xfff6e0, emissiveIntensity: 1.0,
            toneMapped: false }),
          tail: new THREE.MeshStandardMaterial({
            color: 0xff0400, emissive: 0xff0400, emissiveIntensity: 1.0,
            toneMapped: false })
        };
      }
      const headGeo = new THREE.SphereGeometry(0.085, 12, 10);
      const tailGeo = new THREE.SphereGeometry(0.058, 10, 8);

      const place = (n, geo, mat, z, y) => {
        // n === 0 means "this vehicle carries its own lamps, add none".
        // Without this guard 0 fell through to the pair branch and placed
        // TWO — which is why the auto kept showing duplicate tail lamps
        // over its own, long after its count was set to zero.
        if (!n || n < 1) return;
        const xs = (n === 1) ? [0] : [-spec.spread / 2, spec.spread / 2];
        xs.forEach((x) => {
          const m = new THREE.Mesh(geo, mat);
          m.position.set(x, y, z);
          group.add(m);
        });
      };
      // +Z is forward after _normalize
      place(spec.front, headGeo, this._lampMats.head,  halfLen * 0.94, h * spec.frontY);
      place(spec.rear,  tailGeo, this._lampMats.tail, -halfLen * 0.94, h * spec.rearY);
    }

    /**
     * Repaint a vehicle's bodywork.
     *
     * Six of the pack models ship in the same pure yellow (#fffe00) — both
     * SUVs among them — so the street read as a fleet of identical yellow
     * cars. Materials are shared between clones, so each instance gets its
     * own copy before being tinted; otherwise recolouring one repaints them
     * all. Only large, strongly-yellow surfaces are touched, which leaves
     * glass, tyres, lights and trim alone.
     */
    _tintBody(group, colour, file) {
      if (file && NO_TINT.indexOf(file) !== -1) return;
      // Excluded by name: anything that must keep its own colour.
      const KEEP = /glass|window|windscreen|screen|tyre|tire|wheel|rim|chrome|mirror|plate|light|lamp|interior|seat|dash|grill|grille|bumper|trim|rubber|shadow|sticker/i;

      // Pass 1: gather candidate paint materials with their surface area.
      const cand = new Map();
      group.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.material) return;
        const g = o.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        const sz = g.boundingBox.getSize(new THREE.Vector3());
        const area = 2 * (sz.x * sz.y + sz.y * sz.z + sz.z * sz.x);
        [].concat(o.material).forEach((m) => {
          if (!m || !m.color) return;
          // Never tint a textured material: the colour multiplies the map,
          // so it would stain the windows and badges too.
          if (m.map) return;
          const name = m.name || '';
          if (KEEP.test(name)) return;
          cand.set(m, (cand.get(m) || 0) + area);
        });
      });
      if (!cand.size) return;

      const hsl = {};
      const paintRe = file && PAINT_MATERIALS[file];
      const wanted = new Set();
      cand.forEach((area, m) => {
        m.color.getHSL(hsl);
        const yellow = hsl.h * 360 >= 40 && hsl.h * 360 <= 70 &&
                       hsl.s > 0.35 && hsl.l > 0.25;
        if (yellow) wanted.add(m);
        if (/body|paint|carpaint/i.test(m.name || '')) wanted.add(m);
        if (paintRe && paintRe.test(m.name || '')) wanted.add(m);
      });
      // Fallback: nothing matched by name or colour, so take the material
      // covering the most surface. This is what finally catches the plain
      // white pack bodies, whose paint material is simply called "Body".
      if (!wanted.size) {
        let best = null, bestArea = -1;
        cand.forEach((area, m) => { if (area > bestArea) { bestArea = area; best = m; } });
        if (best) wanted.add(best);
      }

      // Pass 2: clone before tinting — materials are shared between clones,
      // so recolouring in place would repaint every copy of the model.
      const swap = new Map();
      group.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const mats = [].concat(o.material);
        const out = mats.map((m) => {
          if (!wanted.has(m)) return m;
          if (!swap.has(m)) {
            const c = m.clone();
            c.color = new THREE.Color(colour);
            if (c.metalness !== undefined) c.metalness = 0.62;
            if (c.roughness !== undefined) c.roughness = 0.34;
            swap.set(m, c);
          }
          return swap.get(m);
        });
        o.material = Array.isArray(o.material) ? out : out[0];
      });
    }

    /** Attach a rider to a normalised vehicle group, if its type takes one. */
    _mountRider(group, kind, tint, file) {
      if (kind === 'none') return;
      const box = new THREE.Box3().setFromObject(group);
      const size = box.getSize(new THREE.Vector3());
      const len = Math.max(size.x, size.z);
      const height = size.y;
      // _normalize leaves every vehicle facing +Z in group space, so the
      // handlebars are at POSITIVE z and the seat sits behind them. Getting
      // these signs backwards stretches the arms into metre-long tubes.
      const tune = RIDER_TUNE[file] ||
        { seatY: 0.58, seatZ: -0.04, barZ: 0.27, barY: 0.82, lean: 0.28 };
      const opts = {
        seatY: tune.seatY, seatZ: tune.seatZ,
        barZ: tune.barZ, barY: tune.barY, lean: tune.lean
      };
      if (kind === 'auto') {
        opts.helmet = 0x2b2f36;
        opts.jacket = tint || 0x35507a;
      } else {
        opts.helmet = tint || 0xd4af37;
      }
      const rider = this._createRider(len, height, opts);
      group.add(rider);
      group.userData.rider = rider;
    }

    _buildHeroVehicle() {
      this.heroGroup = new THREE.Group();
      this.scene.add(this.heroGroup);
      Object.keys(VEHICLES).forEach((mode) => {
        const spec = VEHICLES[mode];
        const src = this._rawModels[spec.file];
        if (!src) return;
        const inst = this._normalize(src.clone(true), spec.length, spec.file);
        // the vehicle you ride gets a chosen colour, not a random one
        const HERO_PAINT = {
          'dzire.glb': 0x9b1c24,      // deep red
          'porsche.glb': 0x1d5c4a,    // racing green
          'scorpiohp.glb': 0x24272b   // graphite
        };
        if (spec.file.indexOf('pack_') === 0) {
          this._tintBody(inst, 0x2b3a55, spec.file);
        } else if (HERO_PAINT[spec.file] !== undefined) {
          this._tintBody(inst, HERO_PAINT[spec.file], spec.file);
        }
        this._mountLamps(inst, spec.file);
        this._mountRider(inst, RIDER_FOR[spec.file] || 'none', 0xd4af37, spec.file);
        inst.visible = (mode === this.activeMode);
        this.heroes[mode] = inst;
        this.heroGroup.add(inst);
      });
      this.syncActiveHeroVehicle(this.activeMode);
    }

    syncActiveHeroVehicle(mode) {
      if (mode) this.activeMode = mode;
      Object.keys(this.heroes).forEach((k) => {
        this.heroes[k].visible = (k === this.activeMode);
      });
    }

    _buildTraffic() {
      const files = Object.keys(this._rawModels || {}).filter(f => TRAFFIC_MIX[f]);
      if (!files.length) return;
      const lengths = TRAFFIC_LENGTHS;

      // Weighted pool so the street reads like real mixed traffic — plenty of
      // two-wheelers and autos, fewer buses — rather than an even round-robin
      // that produced one of everything in a repeating line.
      const pool = [];
      files.forEach((f) => {
        for (let k = 0; k < (TRAFFIC_MIX[f] || 0); k++) pool.push(f);
      });
      if (!pool.length) return;

      // Guarantee a few buses up front. Pure weighted sampling can produce
      // zero across the whole route, which reads as "there is no bus".
      const GUARANTEED = ['setcbus.glb', 'setcbus.glb', 'setcbus.glb',
                          'autorickshaw.glb', 'scifibike.glb'];
      for (let i = 0; i < TRAFFIC_COUNT; i++) {
        const file = (i < GUARANTEED.length && this._rawModels[GUARANTEED[i]])
          ? GUARANTEED[i]
          : pool[Math.floor(Math.random() * pool.length)];
        const src = this._rawModels[file];
        if (!src) continue;
        const len = lengths[file] || 3;
        const v = this._normalize(src.clone(true), len, file, VEHICLE_HEIGHTS[file]);
        // vary helmet/jacket colour so the traffic doesn't look cloned
        const tints = [0xd4af37, 0xc0392b, 0x2e6fb7, 0xe8e8ea, 0x2f8f5b];
        // repaint before lamps/rider so their materials are not touched
        this._tintBody(v, CAR_COLOURS[Math.floor(Math.random() * CAR_COLOURS.length)], file);
        this._mountLamps(v, file);
        this._mountRider(v, RIDER_FOR[file] || 'none', tints[i % tints.length], file);

        // LANE QUEUES, not free-floating vehicles.
        // Independent random t + random speed meant two vehicles in the same
        // lane inevitably drifted into one another — the recording shows a
        // wheel passing straight through an auto. Each vehicle is assigned
        // to one of four queues (two lanes per direction); within a queue
        // every vehicle shares one speed and holds an evenly spaced slot, so
        // separation is fixed by construction and they can never overlap.
        const big = BIG_VEHICLES.indexOf(file) !== -1;
        const laneIdx = big ? (i % 2) * 2 : (i % 4);        // big ones stay inner
        const oncoming = (laneIdx % 2 === 0);
        const outer = laneIdx >= 2;

        // Spread across the whole network rather than the camera's spline:
        // each vehicle claims a corridor and takes a slot in one of that
        // corridor's four lane queues, so the rest of the city has traffic
        // on it too instead of only the road you happen to be driving.
        const routeIdx = (this.routes && this.routes.length)
          ? (i % this.routes.length) : -1;
        const rt = (routeIdx >= 0) ? this.routes[routeIdx] : null;
        const slot = rt ? rt.count[laneIdx]++ : 0;

        // inner lane at 32% of usable half-width, outer at 68%
        // An 11m bus sweeps a much wider arc through a 90-degree turn than
        // a 4m car, so its outer corner leaves the carriageway even in a
        // legal lane. Long vehicles hug the centreline where there is room.
        // Fractions chosen by sweeping them against the actual road mask rather
        // than picked by feel: outer 0.54 left the footprint off-carriageway
        // 8.1% of the route, 0.42 halves that to 4.0%, and inner 0.20 is the
        // best of its range at 1.6%. Long vehicles hug the centre at 0.16.
        // Lane 0 and lane 2 sit on the SAME side of the road (both oncoming),
        // as do 1 and 3. So the inner/outer fractions must be far enough
        // apart to hold two car widths, or same-side neighbours touch.
        // 0.20 vs 0.42 left only ~0.7m of clearance, and forcing buses to
        // 0.16 dropped a 4.5m-wide body straight onto the inner lane.
        // 0.18 vs 0.52 gives ~4.4m of separation instead.
        const laneFrac = outer ? 0.52 : 0.18;
        const vb = new THREE.Box3().setFromObject(v).getSize(new THREE.Vector3());
        this.traffic.push({
          obj: v,
          oncoming: oncoming,
          laneIdx: laneIdx,
          slot: slot,
          routeIdx: routeIdx,
          len: len,
          big: big,
          width: Math.min(vb.x, vb.z),
          laneFrac: laneFrac
        });
        v.userData.srcFile = file;
        this.scene.add(v);
      }
    }

    /**
     * Roadside hoardings. Positioned off the carriageway edge and turned to
     * face oncoming traffic, so the board is readable as you approach rather
     * than flashing past edge-on. The gold border is emissive and unaffected
     * by tone mapping, so bloom picks it up at night the way real DOOH does.
     */
    _buildBillboards() {
      const loader = new THREE.TextureLoader();
      const up = new THREE.Vector3(0, 1, 0);
      // Overhead gantry hoardings straddling the carriageway: legs planted
      // clear of both kerbs, panel centred over the road. Roadside boards
      // flick past edge-on and are never really read; a gantry sits dead
      // ahead in the middle of the road and grows as you approach, which is
      // the effect the reference site gets.
      const W = 11.0, H = 5.0;
      const CLEAR = 6.6;    // underside height — traffic passes beneath
      const LEG_MIN = 4.0, LEG_MAX = 24.0 * CITY_SCALE;

      // A fixed 8m half-span plants the legs wherever they happen to land.
      // Where the carriageway is wider than that, the posts stand IN the
      // road — which is what made the third gantry look like it was built
      // in the middle of the street. Measure the kerb at each site and put
      // the legs just beyond it instead.
      const ray = new THREE.Raycaster();
      const T = this._cityTargets || [];
      const down = new THREE.Vector3(0, -1, 0);
      const isRoad = (q) => {
        ray.set(new THREE.Vector3(q.x, 200, q.z), down);
        const h = ray.intersectObjects(T, false)[0];
        return !!(h && Math.abs(h.point.y) < 2.0);
      };
      /**
       * Walk outward to the kerb. A single non-road sample is not enough to
       * stop on — the city mesh has gaps, and stopping at one put a mast
       * back in the carriageway further out. Require three consecutive
       * off-road samples before calling it the edge.
       */
      const roadEdge = (pos, side) => {
        let clearRun = 0;
        for (let d = 1.0; d <= LEG_MAX; d += 0.5) {
          const q = pos.clone().addScaledVector(side, d);
          if (isRoad(q)) {
            clearRun = 0;
          } else if (++clearRun >= 3) {
            return d - 1.0;               // first sample of the clear run
          }
        }
        return LEG_MAX;
      };

      const postMat = new THREE.MeshStandardMaterial({ color: 0x16161e, roughness: 0.7, metalness: 0.6 });
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0e, roughness: 0.45, metalness: 0.8,
        emissive: new THREE.Color(0xd4af37), emissiveIntensity: 0.55
      });

      this.billboards = [];

      /**
       * Slide a gantry forward until the road there is straight. Curvature is
       * measured as the angle between tangents a little either side; on a
       * 90-degree turn that is large, and the panel would face across the
       * road instead of down it.
       */
      const straightNear = (p0) => {
        const D = 0.020, LIMIT = 0.10;   // radians of allowed bend
        for (let k = 0; k < 60; k++) {
          const p = Math.min(0.97, p0 + k * 0.006);
          const a = this.curve.getTangentAt(Math.max(0, p - D));
          const b = this.curve.getTangentAt(Math.min(1, p + D));
          if (a.angleTo(b) < LIMIT) return p;
        }
        return p0;
      };

      BILLBOARDS.forEach((cfg) => {
        const at = straightNear(cfg.progress);
        if (Math.abs(at - cfg.progress) > 0.001) {
          console.log('[Pakka3D] gantry "' + cfg.title + '" moved off a bend: ' +
                      cfg.progress.toFixed(3) + ' -> ' + at.toFixed(3));
        }
        const r = this._routeAt(at);

        const g = new THREE.Group();
        g.position.copy(r.pos);          // dead centre of the road

        // face back down the road toward the approaching camera
        const facing = r.tan.clone().negate();
        g.lookAt(g.position.clone().add(facing));

        // CANTILEVER, not a full-width gantry. These roads run up to 36m
        // kerb to kerb, so a two-legged span either needs an absurd 18m+
        // reach or — as happened — gets clamped and drops its posts in the
        // middle of the carriageway. A single mast on the pavement with an
        // arm over the road keeps every part of the structure off the road
        // while still hanging the panel where you drive toward it.
        const sideVec = new THREE.Vector3()
          .crossVectors(r.tan, new THREE.Vector3(0, 1, 0)).normalize();
        const edgeR = roadEdge(r.pos, sideVec);
        const edgeL = roadEdge(r.pos, sideVec.clone().negate());
        // mount on whichever kerb is nearer, so the arm stays short
        const mountSign = (edgeR <= edgeL) ? 1 : -1;
        let mountDist = Math.min(LEG_MAX,
          Math.max(LEG_MIN, (mountSign > 0 ? edgeR : edgeL) + 0.9));
        // final guard: if that spot is still carriageway, keep stepping out
        for (let k = 0; k < 24 && mountDist < LEG_MAX; k++) {
          const probe = r.pos.clone()
            .addScaledVector(sideVec, mountSign * mountDist);
          if (!isRoad(probe)) break;
          mountDist += 1.0;
        }
        // Some sites open into a plaza where drivable surface just keeps
        // going; without this cap the guard marched a mast out to 48m.
        // Accept the cap and let the panel hang over the near lanes.
        mountDist = Math.min(mountDist, LEG_MAX);
        const mountX = mountSign * mountDist;
        // panel hangs part-way out over the road, not at the far kerb
        const panelX = mountX * 0.28;

        const postH = CLEAR + H / 2 + 0.4;
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.30, 0.40, postH, 14), postMat);
        post.position.set(mountX, postH / 2, 0);
        post.castShadow = false;
        g.add(post);

        // arm reaching from the mast out over the carriageway
        const armLen = Math.abs(mountX - panelX) + 0.6;
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(armLen, 0.40, 0.40), postMat);
        arm.position.set((mountX + panelX) / 2, CLEAR + H - 0.2, 0);
        arm.castShadow = true;
        g.add(arm);

        // diagonal stay, so the arm doesn't look unsupported
        const stay = new THREE.Mesh(
          new THREE.BoxGeometry(armLen * 0.8, 0.18, 0.18), postMat);
        stay.position.set((mountX + panelX) / 2, CLEAR + H * 0.55, 0);
        stay.rotation.z = mountSign * 0.42;
        g.add(stay);

        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(W + 0.5, H + 0.5, 0.35), frameMat);
        frame.position.set(panelX, CLEAR + H / 2, 0);
        frame.castShadow = true;
        g.add(frame);

        const screenMat = new THREE.MeshStandardMaterial({
          color: 0x8a8a8a, roughness: 0.6, metalness: 0.0,
          emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.0
        });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenMat);
        screen.position.set(panelX, CLEAR + H / 2, 0.2);
        g.add(screen);

        loader.load(cfg.image, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          screenMat.map = tex;
          screenMat.emissiveMap = tex;
          screenMat.color.setHex(0xffffff);
          screenMat.needsUpdate = true;
          this._syncBillboardGlow();
        }, undefined, () => {
          console.warn('[Pakka3D] billboard image missing:', cfg.image);
        });

        this.scene.add(g);
        console.log('[Pakka3D] hoarding "' + cfg.title + '" mast at ' +
          mountX.toFixed(1) + 'm, panel at ' + panelX.toFixed(1) + 'm');
        this.billboards.push({ group: g, mat: screenMat, cfg: cfg });
      });

      this._syncBillboardGlow();
      console.log('[Pakka3D] billboards placed:', this.billboards.length);
    }

    /** Hoardings are backlit at night, plain reflective panels by day. */
    _syncBillboardGlow() {
      if (!this.billboards) return;
      const lit = this.isDay ? 0.12 : 1.25;
      this.billboards.forEach((b) => { b.mat.emissiveIntensity = lit; });
    }

    /**
     * Lamps are shared materials, so one update covers every vehicle.
     * In daylight they sit near-neutral; pushing them hard enough to glow
     * at noon just blooms a white disc over the whole bike.
     */
    _syncLampGlow() {
      // Headlamps may over-drive (white clipping to white looks right).
      // Tail lamps must stay under ~1.6 or the red core turns pink.
      const h = this.isDay ? 0.9 : 4.5;
      const t = this.isDay ? 0.8 : 1.5;
      if (this._lampMats) {
        this._lampMats.head.emissiveIntensity = h;
        this._lampMats.tail.emissiveIntensity = t;
      }
      if (this._builtInLamps) {
        this._builtInLamps.head.forEach(m => { m.emissiveIntensity = h; });
        this._builtInLamps.tail.forEach(m => { m.emissiveIntensity = t; });
      }
    }

    /**
     * Street lights and traffic signals. Both are emissive geometry rather
     * than real lights, so however many we place the fragment-shader budget
     * is untouched — bloom does the glowing. Posts are set just outside the
     * measured carriageway so they never stand in a lane.
     */
    _buildStreetFurniture() {
      const up = new THREE.Vector3(0, 1, 0);
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0x23262b, roughness: 0.55, metalness: 0.75 });
      this._streetLampMat = new THREE.MeshStandardMaterial({
        color: 0xffe9bd, emissive: 0xffe2ad, emissiveIntensity: 1.0,
        toneMapped: false });

      const poleGeo = new THREE.CylinderGeometry(0.11, 0.16, 8.2, 10);
      const armGeo  = new THREE.BoxGeometry(2.2, 0.16, 0.16);
      const headGeo = new THREE.BoxGeometry(0.85, 0.20, 0.42);

      const lamps = new THREE.Group();
      const SPACING = 0.022;                       // in route-progress units
      let side = 1, n = 0;
      for (let t = 0.01; t < 0.99; t += SPACING) {
        const r = this._routeAt(t);
        const sv = new THREE.Vector3().crossVectors(r.tan, up).normalize();
        const off = Math.max(3.2, this._halfWidthAt(t) - 0.6);

        const g = new THREE.Group();
        g.position.copy(r.pos).addScaledVector(sv, side * off);
        g.lookAt(g.position.clone().add(r.tan));

        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 4.1;
        pole.castShadow = false;
        g.add(pole);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(-side * 1.1, 8.0, 0);
        g.add(arm);
        const head = new THREE.Mesh(headGeo, this._streetLampMat);
        head.position.set(-side * 2.1, 7.9, 0);
        g.add(head);

        lamps.add(g);
        side = -side;
        n++;
      }
      this.scene.add(lamps);
      this.streetLamps = lamps;

      // Traffic signals wherever the route actually turns.
      const sigHousing = new THREE.MeshStandardMaterial({
        color: 0x14161a, roughness: 0.6, metalness: 0.4 });
      this.signalLights = { red: [], amber: [], green: [] };
      const mkBulb = (colour) => new THREE.MeshStandardMaterial({
        color: colour, emissive: colour, emissiveIntensity: 1.0, toneMapped: false });

      const signals = new THREE.Group();
      let placed = 0;
      let lastT = -1;
      for (let t = 0.02; t < 0.98; t += 0.004) {
        const a = this.curve.getTangentAt(Math.max(0, t - 0.02));
        const b = this.curve.getTangentAt(Math.min(1, t + 0.02));
        if (a.angleTo(b) < 0.5) continue;          // not a junction
        if (lastT > 0 && t - lastT < 0.05) continue;
        lastT = t;

        const r = this._routeAt(Math.max(0, t - 0.035));
        const sv = new THREE.Vector3().crossVectors(r.tan, up).normalize();
        const off = Math.max(3.4, this._halfWidthAt(t) - 0.5);

        const g = new THREE.Group();
        g.position.copy(r.pos).addScaledVector(sv, off);
        g.lookAt(g.position.clone().add(r.tan.clone().negate()));

        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.10, 0.14, 5.4, 10), poleMat);
        post.position.y = 2.7;
        g.add(post);
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.35, 0.4), sigHousing);
        box.position.set(0, 5.3, 0);
        g.add(box);

        const bulbGeo = new THREE.SphereGeometry(0.14, 10, 8);
        [['red', 0xff1200, 0.42], ['amber', 0xffa400, 0.0], ['green', 0x22ff5a, -0.42]]
          .forEach(([key, col, dy]) => {
            const m = mkBulb(col);
            const bulb = new THREE.Mesh(bulbGeo, m);
            bulb.position.set(0, 5.3 + dy, 0.22);
            g.add(bulb);
            this.signalLights[key].push(m);
          });

        signals.add(g);
        placed++;
      }
      this.scene.add(signals);
      this.trafficSignals = signals;
      console.log('[Pakka3D] street lamps: ' + n + ' · traffic signals: ' + placed);
      this._syncStreetGlow();
    }

    _syncStreetGlow() {
      if (this._streetLampMat) {
        this._streetLampMat.emissiveIntensity = this.isDay ? 0.15 : 4.0;
      }
      if (!this.signalLights) return;
      // one signal phase for the whole city, so they change together
      const phase = this._signalPhase || 0;
      const on = this.isDay ? 2.2 : 3.4, off = 0.06;
      this.signalLights.red.forEach(m => { m.emissiveIntensity = phase === 0 ? on : off; });
      this.signalLights.amber.forEach(m => { m.emissiveIntensity = phase === 1 ? on : off; });
      this.signalLights.green.forEach(m => { m.emissiveIntensity = phase === 2 ? on : off; });
    }

    _setupPostFX() {
      if (!THREE.EffectComposer) { this.composer = null; return; }
      const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
      const composer = new THREE.EffectComposer(this.renderer);
      composer.addPass(new THREE.RenderPass(this.scene, this.camera));

      this.bloom = new THREE.UnrealBloomPass(size, 0.62, 0.72, 0.82);
      composer.addPass(this.bloom);

      if (THREE.ShaderPass && THREE.VignetteShader) {
        this.vignette = new THREE.ShaderPass(THREE.VignetteShader);
        this.vignette.uniforms.offset.value = 1.05;
        this.vignette.uniforms.darkness.value = 1.25;
        composer.addPass(this.vignette);
      }
      if (THREE.FilmPass) {
        this.film = new THREE.FilmPass(0.18, false);
        composer.addPass(this.film);
      }
      composer.addPass(new THREE.OutputPass());
      this.composer = composer;
    }

    _bindEvents() {
      window.addEventListener('resize', () => this.onResize());
      window.addEventListener('mousemove', (e) => {
        this.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    onResize() {
      const w = window.innerWidth, h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
      if (this.composer) this.composer.setSize(w, h);
    }

    updateDriveProgress(p) {
      this.targetProgress = Math.max(0, Math.min(1, p || 0));
      this._syncMorph(this.targetProgress);
    }

    /** Swap the ridden vehicle as the journey passes each service phase. */
    _syncMorph(t) {
      for (let i = 0; i < MORPH.length; i++) {
        if (t < MORPH[i].until) {
          if (this.activeMode !== MORPH[i].mode) {
            this.syncActiveHeroVehicle(MORPH[i].mode);
            if (typeof this.onModeChange === 'function') this.onModeChange(MORPH[i].mode);
          }
          return;
        }
      }
    }

    setDayNightMode(isDay) {
      this.isDay = !!isDay;
      if (this.isDay) {
        this.sun.color.setHex(0xfff2d8); this.sun.intensity = 3.0;
        this.hemi.color.setHex(0xbcd8ff); this.hemi.groundColor.setHex(0x6b5844);
        this.hemi.intensity = 1.15;
        this.scene.environmentIntensity = 0.85;
        this.scene.fog = new THREE.FogExp2(0xb9cbe0, 0.0016);
        this.scene.background = new THREE.Color(0xb9cbe0);
        this.renderer.toneMappingExposure = 1.05;
        this.headlightGlow.intensity = 2;
        this.streetFill.intensity = 0;
        if (this.bloom) this.bloom.strength = 0.32;
        this.cityWindowMats.forEach(m => { m.emissiveIntensity = 0.0; });
      } else {
        this.sun.color.setHex(0x8fb0ff); this.sun.intensity = 0.35;
        this.hemi.color.setHex(0x2a3a5c); this.hemi.groundColor.setHex(0x120c08);
        this.hemi.intensity = 0.5;
        this.scene.environmentIntensity = 0.18;
        this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.0032);
        this.scene.background = new THREE.Color(0x0a0d14);
        this.renderer.toneMappingExposure = 1.3;
        this.headlightGlow.intensity = 16;
        this.streetFill.intensity = 10;
        if (this.bloom) this.bloom.strength = 0.85;
        this.cityWindowMats.forEach(m => { m.emissiveIntensity = 1.4; });
      }
      this._syncBillboardGlow();
      this._syncLampGlow();
      this._syncStreetGlow();
    }

    /**
     * Every measurement says the models face +Z correctly (the Checkers
     * model's own Front_Tyre sits at +Z, its number plate at -Z, and heading
     * dotted with travel direction reads 1.000). If it still LOOKS reversed
     * on screen, call this from the console to spin every vehicle 180 and
     * settle it visually:  pakka3D.flipVehicles()
     * Pass true to make it stick as the new default for this session.
     */
    flipVehicles(persist) {
      this._flipped = !this._flipped;
      const yaw = this._flipped ? Math.PI : 0;
      Object.keys(this.heroes).forEach((k) => {
        this.heroes[k].rotation.y = yaw;
      });
      this.traffic.forEach((c) => {
        c.obj.children.forEach((ch) => { if (ch.isGroup) ch.rotation.y = yaw; });
      });
      if (persist) this._flipPersist = true;
      console.log('[Pakka3D] vehicles ' + (this._flipped ? 'FLIPPED 180' : 'restored'));
      return this._flipped;
    }

    /**
     * Turn one model around live, by name or by a partial match.
     *   pakka3D.flipModel('bus')     -> flips setcbus.glb
     *   pakka3D.flipModel('green')   -> lists options if ambiguous
     * Applies to the ridden vehicle and every one of that model in traffic,
     * so you can confirm a fix on the page instead of describing it.
     */
    flipModel(name) {
      const files = Object.keys(this._rawModels || {});
      const hits = files.filter(f => f.toLowerCase().indexOf(String(name).toLowerCase()) !== -1);
      if (!hits.length) {
        console.log('[Pakka3D] no model matches "' + name + '". Loaded:', files.join(', '));
        return files;
      }
      if (hits.length > 1) {
        console.log('[Pakka3D] "' + name + '" matches several:', hits.join(', '));
        return hits;
      }
      const file = hits[0];
      const spin = (group) => {
        group.children.forEach((ch) => {
          if (ch.isGroup) ch.rotation.y += Math.PI;
        });
      };
      let n = 0;
      Object.keys(this.heroes).forEach((m) => {
        if (VEHICLES[m] && VEHICLES[m].file === file) { spin(this.heroes[m]); n++; }
      });
      this.traffic.forEach((c) => {
        if (c.obj.userData.srcFile === file) { spin(c.obj); n++; }
      });
      console.log('[Pakka3D] flipped ' + n + ' x ' + file +
        ' — if that looks right, tell Claude: "' + file + ' needs flip toggled"');
      return file;
    }

    /** List the models currently in the scene, for flipModel(). */
    listModels() {
      const files = Object.keys(this._rawModels || {});
      console.log('[Pakka3D] loaded models:\n  ' + files.join('\n  '));
      return files;
    }

    cycleCameraMode() {
      this.cameraMode = (this.cameraMode + 1) % this.cameraModes.length;
      return this.cameraModes[this.cameraMode];
    }

    _animate() {
      requestAnimationFrame(() => this._animate());
      const dt = Math.min(this.clock.getDelta(), 0.05);

      const prev = this.progress;
      this.progress += (this.targetProgress - this.progress) * 0.055;
      const delta = Math.abs(this.progress - prev);
      this.speedKmh += ((delta * this.routeLength * 90) - this.speedKmh) * 0.09;

      this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;

      // traffic signals cycle red -> amber -> green on a slow loop
      this._signalClock = (this._signalClock || 0) + dt;
      const phase = Math.floor(this._signalClock / 4) % 3;
      if (phase !== this._signalPhase) { this._signalPhase = phase; this._syncStreetGlow(); }

      this._updateCamera(dt);
      this._updateTraffic(dt);

      if (this.composer) this.composer.render(dt);
      else this.renderer.render(this.scene, this.camera);
    }

    _updateCamera() {
      const r = this._routeAt(this.progress);
      const pos = r.pos, tan = r.tan;
      const look = pos.clone().add(tan.clone().multiplyScalar(12));
      const mode = this.cameraModes[this.cameraMode];

      if (this.heroGroup) {
        // keep-left offset, applied below once the route frame is known
        const lead = (mode === 'cockpit') ? 0.0 : 0.010;
        const hv = this._routeAt(this.progress + lead);
        // India drives on the LEFT: sit the ridden vehicle in the near-side
        // lane rather than straddling the centre line, so oncoming traffic
        // passes on the right the way it should.
        const hUp = new THREE.Vector3(0, 1, 0);
        const hSide = new THREE.Vector3().crossVectors(hv.tan, hUp).normalize();
        const hHalf = this._halfWidthAt(this.progress);
        const hOff = Math.min(6.5, Math.max(2.2, hHalf * 0.26));
        this.heroGroup.position.copy(hv.pos).addScaledVector(hSide, hOff);
        const hf = hv.tan.clone(); hf.y = 0;
        if (hf.lengthSq() > 1e-6) {
          hf.normalize();
          // Aim from where the vehicle ACTUALLY is. Once the keep-left
          // offset moved it ~4.6m off the centreline, a target still sitting
          // on the centreline pointed it diagonally across the road — a 79
          // degree yaw error, which is the bike that looked sideways.
          const hl = this.heroGroup.position.clone().add(hf);
          hl.y = this.heroGroup.position.y;
          this.heroGroup.lookAt(hl);
        }
        // Conform the ridden vehicle to the ground directly beneath it. The
        // smoothed route profile can sit up to ~0.4m under the true surface
        // where the road steps, which reads as the vehicle sunk into tarmac.
        if (this._cityTargets) {
          this._heroRay = this._heroRay || new THREE.Raycaster();
          this._heroRay.set(
            new THREE.Vector3(this.heroGroup.position.x, 200, this.heroGroup.position.z),
            new THREE.Vector3(0, -1, 0));
          const gh = this._heroRay.intersectObjects(this._cityTargets, false)[0];
          if (gh && Math.abs(gh.point.y - this.heroGroup.position.y) < 6) {
            this._heroRideY = (this._heroRideY === undefined)
              ? gh.point.y
              : this._heroRideY + Math.max(-0.06, Math.min(0.06,
                  (gh.point.y - this._heroRideY) * 0.08));
            this.heroGroup.position.y = this._heroRideY;
          }
        }
        const vib = Math.min(this.speedKmh, 80) * 0.00012;
        this.heroGroup.position.y += Math.sin(performance.now() * 0.02) * vib;
        // GTA-style first person keeps the vehicle rendered — you want the
        // handlebars, mirrors and the rider's hands in shot. Only the rider's
        // own head is culled so it doesn't fill the lens.
        this.heroGroup.visible = true;
        const rider = this.heroes[this.activeMode] &&
                      this.heroes[this.activeMode].userData.rider;
        if (rider) {
          const inCockpit = (mode === 'cockpit');
          rider.traverse((n) => {
            if (n.userData && n.userData.isHead) n.visible = !inCockpit;
          });
        }
      }

      const up = new THREE.Vector3(0, 1, 0);
      // camera rides with the vehicle, so it keeps left too
      const camLat = new THREE.Vector3()
        .crossVectors(tan, up).normalize()
        .multiplyScalar(Math.min(6.5, Math.max(2.2, this._halfWidthAt(this.progress) * 0.26)));
      let camPos;
      if (mode === 'cockpit') {
        // Sit the lens where the rider's eyes are, derived from the figure
        // actually mounted on this vehicle, so the handlebars and hands sit
        // naturally in frame instead of a guessed fixed height.
        const hero = this.heroes[this.activeMode];
        const rider = hero && hero.userData.rider;
        if (rider && rider.userData.eye && this.heroGroup) {
          camPos = rider.userData.eye.clone();
          this.heroGroup.updateMatrixWorld(true);
          camPos.applyMatrix4(this.heroGroup.matrixWorld);
        } else {
          camPos = pos.clone();
          camPos.y += EYE_HEIGHT;
        }
      } else if (mode === 'chase') {
        camPos = pos.clone().sub(tan.clone().multiplyScalar(9)); camPos.y += 3.4;
      } else {
        const s = new THREE.Vector3().crossVectors(tan, up).normalize();
        camPos = pos.clone().add(s.multiplyScalar(6)).sub(tan.clone().multiplyScalar(4));
        camPos.y += 2.6;
      }

      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      camPos.add(side.clone().multiplyScalar(this.mouse.x * 1.1));
      camPos.y += -this.mouse.y * 0.7;

      camPos.add(camLat);
      this.camera.position.lerp(camPos, 0.18);
      if (!this._lookTarget) this._lookTarget = look.clone();
      look.add(camLat);
      this._lookTarget.lerp(look, 0.14);
      this.camera.lookAt(this._lookTarget);

      this.headlightGlow.position.copy(pos).addScaledVector(tan, 8);
      this.headlightGlow.position.y = 1.4;
      this.streetFill.position.copy(pos);
      this.streetFill.position.y = 6;

      // keep the shadow frustum travelling with us instead of covering the
      // whole 546-unit city (which would make shadows unusably coarse)
      this.sun.target.position.copy(pos);
      this.sun.target.updateMatrixWorld();
      const off = this.isDay
        ? new THREE.Vector3(-90, 150, -60)
        : new THREE.Vector3(90, 110, 70);
      this.sun.position.copy(pos).add(off);
    }

    _updateTraffic(dt) {
      const up = new THREE.Vector3(0, 1, 0);
      this._clearCheckCursor = this._clearCheckCursor || 0;

      // One shared phase per lane, PER CORRIDOR. Vehicles ride fixed, evenly
      // spaced slots off their own corridor's phase, so spacing within a
      // lane is constant and same-lane collisions cannot happen.
      if (!this._laneSpeed) {
        // Sign MUST match the lane's oncoming flag. Lanes 0 and 2 are the
        // oncoming ones (laneIdx % 2 === 0) and face -tangent, so they must
        // travel -t. Getting this inverted made every vehicle in every lane
        // face one way while translating the other — i.e. driving in reverse.
        this._laneSpeed = [-0.0062, 0.0062, -0.0078, 0.0078];
        this._laneCount = [0, 0, 0, 0];
        this.traffic.forEach(c => { this._laneCount[c.laneIdx]++; });
        this._lanePhase = [0, 0, 0, 0];
      }
      for (let L = 0; L < 4; L++) {
        this._lanePhase[L] += this._laneSpeed[L] * dt;
        if (this._lanePhase[L] > 1) this._lanePhase[L] -= 1;
        if (this._lanePhase[L] < 0) this._lanePhase[L] += 1;
      }
      if (this.routes) {
        this.routes.forEach((rt) => {
          for (let L = 0; L < 4; L++) {
            // shorter corridors advance faster in t so real speed stays even
            const k = 900 / Math.max(200, rt.length);
            rt.phase[L] += this._laneSpeed[L] * k * dt;
            if (rt.phase[L] > 1) rt.phase[L] -= 1;
            if (rt.phase[L] < 0) rt.phase[L] += 1;
          }
        });
      }

      for (let i = 0; i < this.traffic.length; i++) {
        const c = this.traffic[i];
        // PARKED vehicles hold their last good pose and stop advancing.
        // A vehicle that repeatedly cannot keep all four corners on the
        // carriageway is better read as parked at the kerb than as traffic
        // driving along the footpath, so it stops rather than trespassing.
        if (c.parked) continue;
        const rt = (c.routeIdx >= 0 && this.routes) ? this.routes[c.routeIdx] : null;
        const n = Math.max(1, rt ? rt.count[c.laneIdx] : this._laneCount[c.laneIdx]);
        c.t = (rt ? rt.phase[c.laneIdx] : this._lanePhase[c.laneIdx]) + c.slot / n;
        if (c.t > 1) c.t -= 1;
        if (c.t < 0) c.t += 1;
        const r = rt
          ? { pos: rt.curve.getPointAt(c.t).clone().addScaledVector(rt.side, rt.shift),
              tan: rt.tan }
          : this._routeAt(c.t);
        const side = rt ? rt.side : new THREE.Vector3().crossVectors(r.tan, up).normalize();
        // Lane offset is a FRACTION of the measured carriageway here, not a
        // fixed distance. A constant 6.4m outer lane fits the 48m boulevard
        // but sits on the footpath where the road narrows to 16m — which is
        // how traffic ended up driving on the walkway.
        // Hard geometric clamp instead of probe-and-correct.
        //
        // A turning vehicle sweeps a wider band than its width: the corner
        // of a long body swings out by roughly half its LENGTH on a bend.
        // Budget for that and a vehicle can never put a corner over the
        // kerb, which is what the raycast guard was only ever catching
        // after the fact.
        const hw = rt ? rt.halfWidth : this._halfWidthAt(c.t);
        const halfW = (c.width || 2.0) / 2;
        // corridors are dead straight, so no turn-swing budget is needed
        const swing = rt ? 0 : (c.len || 3) * 0.5 * this._bendAt(c.t);
        const margin = halfW + swing + 1.4;
        const usable = Math.max(1.2, hw - margin);
        const want = c.laneFrac * usable * (c.oncoming ? -1 : 1);
        if (c.effLane === undefined) c.effLane = want;
        c.effLane += (want - c.effLane) * 0.08;
        // final guard: never exceed the measured carriageway
        const limit = Math.max(0, hw - halfW - swing - 0.9);
        if (c.effLane > limit) c.effLane = limit;
        if (c.effLane < -limit) c.effLane = -limit;
        c.obj.position.copy(r.pos).addScaledVector(side, c.effLane);
        // Height comes from the route's own ground profile, which measures
        // -0.1..0.0 across the whole drive — flat enough that a per-vehicle
        // ground probe bought nothing and cost a raycast every frame.
        // Face along the road but stay LEVEL: feeding lookAt a target with a
        // different height pitches the whole vehicle, which is why traffic
        // looked tilted rather than sitting flat on the road.
        const facing = (c.oncoming ? r.tan.clone().negate() : r.tan.clone());
        facing.y = 0;
        if (facing.lengthSq() > 1e-6) {
          facing.normalize();
          const look = c.obj.position.clone().add(facing);
          look.y = c.obj.position.y;
          c.obj.lookAt(look);
        }
      }

      // NOTE: this loop used to raycast 8 vehicles per frame against all
      // 666 city meshes (17 casts/frame once the hero and corner probes are
      // counted), which was the main source of stutter. The carriageway
      // width is measured once at load, so containment is now an O(1)
      // lookup and no raycasting happens per frame at all.
    }
  }

  window.pakka3D = new PakkaCinematic3D();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.pakka3D.init(); });
  } else {
    window.pakka3D.init();
  }
})();
