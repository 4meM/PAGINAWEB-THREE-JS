import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import * as InicioComponent from './components/inicio.js';
import * as JuegoComponent from './components/juego.js';
import * as ProyectoComponent from './components/proyecto.js';

let scene, camera, renderer, composer, bloomPass;
let spaceRoot, interiorRoot;
const nodes = [];
const interactiveObjects = [];
let starField;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredNode = null;
let clock = new THREE.Clock();
let lastCamPos = null; // previous camera position for portal crossing checks
let presentationPlaying = false;
let presentationAbort = false;
let presentationCooldownUntil = 0;
// WASD movement state
const keys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
let baseSpeed = 6; // units per second
// FPV look state
let isMouseDown = false;
let lastMouse = new THREE.Vector2();
let yaw = 0, pitch = 0; // radians
const MAX_PITCH = Math.PI / 2 - 0.01;
const sensitivity = 0.0025; // mouse sensitivity

// Station elements (reuse structure names for compatibility)
const campus = {
    ground: null,
    buildings: [], // used as station modules/hub
    portals: [],
    paths: [], // used as struts
};
let promptEl = null;
const ui = {
    flashEl: null,
    sectionOverlays: {},
    activeSection: null,
    isTransition: false,
    mode: 'space', // 'space' | 'interior'
    pointerLocked: false,
};
const interior = { colliders: [], exit: null, name: null };
// Loaders
const gltfLoader = new GLTFLoader();
// Animation mixers for GLTF models
const mixers = [];

// Feature flags / tuning knobs
// Toggle diagonal portal-to-portal links for symmetry. When false, only hub→portal catwalks are shown.
const ENABLE_PORTAL_LINKS = false;
// Optional symmetric side rails alongside each catwalk (purely visual)
const ENABLE_SIDE_RAILS = true;
const SIDE_RAIL_OFFSET = 0.6;     // lateral distance from catwalk centerline (meters)
const SIDE_RAIL_HEIGHT = 0.08;    // vertical offset above catwalk surface
const SIDE_RAIL_THICKNESS = 0.02; // rail thickness (square cross-section)
const SIDE_RAIL_COLOR = 0x6cf9ff; // emissive tint for rails

// Player physics (used in space hub walking)
const player = {
    radius: 0.4,
    eyeHeight: 1.6,
    velY: 0,
    onGround: true,
    gravity: 18,      // units/s^2
    jumpSpeed: 7.5    // units/s (slightly higher for a more fun jump)
};
let hubInfo = null;   // set after building the station
let jumpQueued = false; // set on Space keydown, consumed in update
// Parkour supports
const spaceGrounds = []; // meshes that can support the player (deck, catwalks, moving pads)
const spaceAnim = [];    // animated platforms/pads
const groundRay = new THREE.Raycaster();

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);
    spaceRoot = new THREE.Group();
    interiorRoot = new THREE.Group();
    interiorRoot.visible = false;
    scene.add(spaceRoot);
    scene.add(interiorRoot);

    // Camera
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20); // Vista inicial más conveniente

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.physicallyCorrectLights = true;
    document.body.appendChild(renderer.domElement);
    promptEl = document.getElementById('prompt');
    ui.flashEl = document.getElementById('flash');
    // Section overlays (optional existence)
    ['inicio','juego','proyecto'].forEach(id => {
        const el = document.getElementById(`section-${id}`);
        if (el) ui.sectionOverlays[id] = el;
    });

    // Initialize yaw/pitch from current camera orientation
    const eulerInit = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    yaw = eulerInit.y; pitch = eulerInit.x;

    // Lighting
    const hemi = new THREE.HemisphereLight(0x4ac6ff, 0x0a0a12, 0.8);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 10, 8);
    keyLight.castShadow = false;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x00eaff, 1.2, 50);
    rimLight.position.set(-6, 4, 6);
    scene.add(rimLight);

    // Starfield
    createStarfield();

    // Space Station layout (hub + modules + struts + docking portals)
    buildStation();

    // (Graph removed) Now we use Station hub/modules as main navigation landmarks

    // Postprocessing - Bloom
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.3, 0.9);
    composer.addPass(bloomPass);
    // Posición inicial: sobre la base del núcleo (neutral)
    const startY = ((hubInfo && hubInfo.deckTopY) ? hubInfo.deckTopY : 0.63) + player.eyeHeight;
    camera.position.set(0, startY, 1.5);
    lastCamPos = camera.position.clone();
    setYawPitchToLookAt(new THREE.Vector3(0, startY, 0));
    // Snap to nearest ground to avoid an initial falling glitch
    try {
        const snapped = resolveSpaceGround(camera.position, player, { probe: true, prevY: camera.position.y });
        if (snapped && snapped.position) {
            camera.position.copy(snapped.position);
            player.onGround = snapped.onGround || true;
            player.velY = 0;
        }
    } catch (e) {
        // ignore if resolve not ready
    }
    // Start grounded on the hub
    player.velY = 0;
    player.onGround = true;

    // Ensure the camera is snapped to the nearest ground before allowing movement
    // This retries for a short time while the scene settles (GLTF loads, geometry added)
    ensureInitialGroundSnap().then(() => {
        // Start the intro after a short pause so the scene is stable
        setTimeout(() => { playIntroPresentation(); }, 600);
    });

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('mouseleave', onMouseUp, false);
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    window.addEventListener('click', onClick, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Note: presentation cannot be skipped — player control is enabled only after the intro orbit completes

    // Wire close buttons for section overlays if present
    Object.values(ui.sectionOverlays).forEach(el => {
        const btn = el.querySelector('[data-close]');
        if (btn) btn.addEventListener('click', () => leaveSection());
    });

    // No start overlay; pointer lock is requested on first mousedown
}

// Presentation helpers ------------------------------------------------------
function smoothCameraFPAwait(fromPos, toPos, lookAtPoint, durationMs = 1000) {
    return new Promise((resolve) => {
        smoothCameraFP(fromPos.clone(), toPos.clone(), lookAtPoint.clone(), durationMs);
        // resolve after duration (small buffer)
        setTimeout(() => resolve(), durationMs + 80);
    });
}

async function playIntroPresentation() {
    // Single 360° orbit around the hub nucleus with short zooms when passing each portal.
    if (!campus || !campus.portals) return;
    presentationPlaying = true;
    presentationAbort = false;
    ui.isTransition = true; // lock movement and input during presentation
    // clear any movement keys
    keys.w = keys.a = keys.s = keys.d = keys.shift = false;

    const center = new THREE.Vector3(0, (hubInfo && hubInfo.deckTopY) ? hubInfo.deckTopY : 0.63, 0);
    // Ensure the camera orbit uses a safe starting height above the deck
    const deckTopY = (hubInfo && hubInfo.deckTopY) ? hubInfo.deckTopY : 0.63;
    const safeEyeY = deckTopY + player.eyeHeight + 0.6; // keep camera comfortably above deck
    const startPos = camera.position.clone();
    if (startPos.y < safeEyeY) startPos.y = safeEyeY;
    // relative vector on XZ plane
    const rel = new THREE.Vector3(startPos.x - center.x, 0, startPos.z - center.z);
    const computedRadius = Math.sqrt(rel.x * rel.x + rel.z * rel.z) || 6.0;
    // Ensure radius is outside the hub deck radius to avoid intersecting the platform
    const hubRadius = (hubInfo && hubInfo.deckRadius) ? hubInfo.deckRadius : 6.8;
    const baseRadius = Math.max(computedRadius, hubRadius + 3.2);
    const startAngle = Math.atan2(rel.z, rel.x);
    const duration = 6000; // milliseconds for full 360

    // Precompute portal angles and state
    const portals = campus.portals.map((p, idx) => ({
        p,
        angle: Math.atan2(p.group.position.z - center.z, p.group.position.x - center.x),
        triggered: false,
        idx
    }));

    // Zoom state machine used during the orbit
    const zoomInMs = 480, zoomHoldMs = 520, zoomOutMs = 480;
    const zoomTotal = zoomInMs + zoomHoldMs + zoomOutMs;
    const zoomFactor = 0.45; // how much to reduce radius when zooming
    let zoomState = { active: false, startTime: 0, smallRadius: baseRadius * zoomFactor, portalIdx: -1 };

    // Angle normalization helper: returns shortest signed difference a - b in [-PI,PI]
    function angleDiff(a, b) {
        let d = a - b;
        while (d <= -Math.PI) d += Math.PI * 2;
        while (d > Math.PI) d -= Math.PI * 2;
        return d;
    }

    await new Promise((resolve) => {
        const t0 = performance.now();
        function step(now) {
            const t = Math.min(1, (now - t0) / duration);
            const ang = startAngle + t * Math.PI * 2;

            // start with base radius and allow zoomState to override
            let radiusCur = baseRadius;
            if (zoomState.active) {
                const ze = now - zoomState.startTime;
                if (ze < 0) radiusCur = baseRadius;
                else if (ze < zoomInMs) {
                    radiusCur = THREE.MathUtils.lerp(baseRadius, zoomState.smallRadius, ze / zoomInMs);
                } else if (ze < zoomInMs + zoomHoldMs) {
                    radiusCur = zoomState.smallRadius;
                } else if (ze < zoomTotal) {
                    radiusCur = THREE.MathUtils.lerp(zoomState.smallRadius, baseRadius, (ze - (zoomInMs + zoomHoldMs)) / zoomOutMs);
                } else {
                    // finish zoom
                    portals[zoomState.portalIdx].triggered = true;
                    zoomState.active = false;
                    zoomState.portalIdx = -1;
                    radiusCur = baseRadius;
                }
            }

            camera.position.x = center.x + radiusCur * Math.cos(ang);
            camera.position.z = center.z + radiusCur * Math.sin(ang);
            // Ensure camera Y stays above the deck during the orbit
            camera.position.y = Math.max(startPos.y + Math.sin(t * Math.PI * 2) * 0.06, deckTopY + player.eyeHeight + 0.35);
            const look = center.clone(); look.y = center.y + 0.2;
            setYawPitchToLookAt(look);

            // Check for portal trigger: if a portal hasn't been zoomed and angle is close, start zoom
            if (!zoomState.active) {
                for (let i = 0; i < portals.length; i++) {
                    const pr = portals[i];
                    if (pr.triggered) continue;
                    const d = angleDiff(ang, pr.angle);
                    const triggerRadius = 0.18; // radians ~10 degrees
                    if (Math.abs(d) < triggerRadius) {
                        // Start zoom for this portal
                        zoomState.active = true;
                        zoomState.startTime = now - (Math.abs(d) / (2 * Math.PI) * duration) * 0.0; // start now
                        zoomState.smallRadius = baseRadius * zoomFactor;
                        zoomState.portalIdx = i;
                        break;
                    }
                }
            }

            if (t < 1) requestAnimationFrame(step);
            else {
                // ensure any active zoom finishes immediately
                zoomState.active = false;
                presentationPlaying = false;
                presentationAbort = false;
                // snap back to original start position and look at center
                camera.position.copy(startPos);
                setYawPitchToLookAt(center.clone());
                // ensure player is grounded and freeze physics briefly to avoid a small fall glitch
                try {
                    player.velY = 0;
                    player.onGround = true;
                    lastCamPos = camera.position.clone();
                } catch (e) {}
                // set a short cooldown during which physics/movement won't be applied
                presentationCooldownUntil = performance.now() + 420;
                ui.isTransition = false;
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

function endPresentation() {
    presentationAbort = true;
    presentationPlaying = false;
    ui.isTransition = false;
}

// Ensure initial ground snap: try a few times while the scene finishes building.
function ensureInitialGroundSnap(maxAttempts = 12, intervalMs = 120) {
    return new Promise((resolve) => {
        let attempts = 0;
        ui.isTransition = true; // keep input locked until snap completes
        const trySnap = () => {
            attempts++;
            try {
                // If there are no spaceGrounds yet, wait for them
                if (!spaceGrounds || spaceGrounds.length === 0) {
                    if (attempts >= maxAttempts) {
                        ui.isTransition = false;
                        resolve();
                    } else setTimeout(trySnap, intervalMs);
                    return;
                }
                const snapped = resolveSpaceGround(camera.position, player, { probe: true, prevY: camera.position.y });
                if (snapped && snapped.position) {
                    camera.position.copy(snapped.position);
                    player.onGround = !!snapped.onGround;
                    player.velY = 0;
                    lastCamPos = camera.position.clone();
                    ui.isTransition = false;
                    resolve();
                    return;
                }
            } catch (e) {
                // ignore and retry
            }
            if (attempts >= maxAttempts) {
                // Fallback: place camera at a safe spawn above the hub deck
                try {
                    const deckTopY = (hubInfo && hubInfo.deckTopY) ? hubInfo.deckTopY : 0.63;
                    const hubRadius = (hubInfo && hubInfo.deckRadius) ? hubInfo.deckRadius : 6.8;
                    const fallback = new THREE.Vector3(0, deckTopY + player.eyeHeight + 0.4, hubRadius + 3.6);
                    camera.position.copy(fallback);
                    lastCamPos = camera.position.clone();
                    player.onGround = true;
                    player.velY = 0;
                } catch (e) {
                    // ignore
                }
                ui.isTransition = false;
                resolve();
            } else setTimeout(trySnap, intervalMs);
        };
        trySnap();
    });
}

function createStarfield() {
    // Build a richer starfield with two layers (far + mid) for depth, larger sizes, and slight twinkle
    const group = new THREE.Group();

    function makeLayer(count, size, opacity) {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        let i3 = 0;
        for (let i = 0; i < count; i++) {
            // random point in a large cube, reject near-origin sphere for clarity
            const x = (Math.random() - 0.5) * 2400;
            const y = (Math.random() - 0.5) * 2400;
            const z = (Math.random() - 0.5) * 2400;
            if (x*x + y*y + z*z < 130*130) { // push away from the center
                i--; continue;
            }
            positions[i3] = x; positions[i3+1] = y; positions[i3+2] = z;
            // cool tint: mostly white with a slight blue/cyan variance
            const tint = 0.92 + Math.random()*0.08; // 0.92..1.0
            const blueBoost = 0.96 + Math.random()*0.2; // 0.96..1.16
            colors[i3] = tint*0.96;     // R
            colors[i3+1] = tint*0.98;   // G
            colors[i3+2] = Math.min(1.0, tint*blueBoost); // B
            i3 += 3;
        }
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xffffff,
            size,
            sizeAttenuation: true,
            transparent: true,
            opacity,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false
        });
        const pts = new THREE.Points(geom, mat);
        return { points: pts, material: mat };
    }

    const far = makeLayer(9000, 0.10, 0.70);
    const mid = makeLayer(6000, 0.16, 0.85);
    group.add(far.points);
    group.add(mid.points);

    // Keep refs for animate()
    group.userData.materials = [far.material, mid.material];
    starField = group;
    spaceRoot.add(group);
}


function createNode(name, position, color) {
    const geometry = new THREE.IcosahedronGeometry(1.5, 2);
    const material = new THREE.MeshPhysicalMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.4,
        metalness: 0.9,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.15
    });
    const node = new THREE.Mesh(geometry, material);
    node.position.copy(position);
    node.name = name;
    node.originalColor = new THREE.Color(color);
    node.userData.baseEmissiveIntensity = material.emissiveIntensity;
    
    const sprite = createTextSprite(name);
    sprite.position.set(0, 2.5, 0);
    node.add(sprite);

    nodes.push(node);
    interactiveObjects.push(node);
    scene.add(node);
    return node;
}

function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 100; // base font size
    const padding = 24;
    const DPR = 2; // high DPI for crisp text
    context.font = `700 ${fontSize}px "Orbitron", sans-serif`;
    
    // Measure text
    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    canvas.width = (textWidth + padding * 2) * DPR;
    canvas.height = (fontSize + padding * 2) * DPR;
    context.scale(DPR, DPR);
    
    const size = fontSize || 80;
    context.font = `700 ${size}px "Orbitron", sans-serif`;
    context.textBaseline = 'top';
    
    // Outer glow
    context.shadowColor = 'rgba(255,255,255,0.9)';
    context.shadowBlur = 16;
    context.fillStyle = '#e6e6e6';

    // Gradient fill for a cyber look
    const grad = context.createLinearGradient(0, 0, textWidth, 0);
    grad.addColorStop(0, '#e6ffff');
    grad.addColorStop(1, '#c5c5ff');
    context.fillStyle = grad;

    context.fillText(text, padding, padding);


    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(aspect * 2.2, 2.2, 1.0);
    
    return sprite;
}

function createEdge(node1, node2, color = 0xaaaaaa) {
    // Create a slim cylinder aligned between node1 and node2
    const start = node1.position.clone();
    const end = node2.position.clone();
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const geom = new THREE.CylinderGeometry(0.08, 0.08, length, 20, 1, true);
    const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.35,
        metalness: 0.7,
        roughness: 0.4,
        opacity: 0.9,
        transparent: true
    });
    const edge = new THREE.Mesh(geom, mat);
    edge.position.copy(mid);

    // Orient from Y-axis to dir
    edge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    scene.add(edge);
}

// Estación Espacial ----------------------------------------------------------
function buildStation() {
    // Reduce fog for space depth
    scene.fog.density = 0.006;

    // Neutral central hub (no es sección), solo referencia visual
    const hub = createStationHub('Núcleo', new THREE.Vector3(0, 0, 0), 0x00c6ff);
    campus.buildings.push(hub);
    spaceRoot.add(hub);
    // Save hub dimensions for space physics
    if (hub.userData && hub.userData.hub) hubInfo = hub.userData.hub;

    const R = 22; // increase spacing so modules aren't cramped
    const angles = [0, (2*Math.PI)/3, (4*Math.PI)/3];
    const defs = [
        {
            name: 'Inicio', color: 0x66ffff,
            // Modelo local: vehicle_factory (paquete glTF con texturas)
            module: {
                modelUrl: 'vehicle_factory/scene.gltf',
                // Respaldo: FlightHelmet GLB (CC0) si el local falla
                fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb',
                // Reducir tamaño ~4x para que quede apenas más grande que el portal
                // Girado 180° para invertir orientación (yaw + PI)
                scale: 3.0, center: true, yaw: (Math.PI / 2) + Math.PI, yOffset: 0.25,
                preserveMaterials: true,
                // Luces locales para realzar colores sin iluminar toda la escena
                addFillLights: true,
                fillLightIntensity: 20.0,
                fillLightDistance: 30.0,
                // Alejar un poco más del portal (Inicio está en +X)
                offset: { x: 8.0, y: 0, z: 0 }
            }
        },
        {
            name: 'Juego', color: 0xff66ff,
            // RiggedFigure (CC0) — humanoide cartoon/semirrealista como boxeador
            module: {
                // Modelo local descargado (estructura estándar de Sketchfab): scene.gltf + scene.bin
                modelUrl: 'boxing/scene.gltf',
                // Si falla (404 o CORS), se usa este respaldo online automáticamente.
                fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RiggedFigure/glTF-Binary/RiggedFigure.glb',
                scale: 10.0, center: true, yaw: 0.2, yOffset: 0.4
            }
        },
        {
            name: 'Proyecto', color: 0xffff66,
            // RobotExpressive (CC0) — robótica/innovación
            module: {
                modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb',
                scale: 10.0, center: true, yaw: -Math.PI / 6, yOffset: 0.2
            }
        },
    ];

    for (let i = 0; i < defs.length; i++) {
        const ang = angles[i];
        const pos = new THREE.Vector3(Math.cos(ang) * R, 0, Math.sin(ang) * R);
        // Clone options and push giant models slightly outward to avoid overlapping portal/catwalk
        const moduleOpts = Object.assign({}, defs[i].module || {});
        if (moduleOpts.scale && moduleOpts.scale >= 8) {
            const outward = pos.clone().normalize().multiplyScalar(3.2);
            moduleOpts.offset = { x: outward.x, y: 0, z: outward.z };
        }
        const mod = createStationModule(defs[i].name, pos, defs[i].color, moduleOpts);
    campus.buildings.push(mod);
    spaceRoot.add(mod);

        // Strut from hub to module (plano Y=0 para misma distancia efectiva en 3D)
        const strut = createStrut(new THREE.Vector3(0, 0, 0), pos, 0x3bd3ff);
    campus.paths.push(strut);

        // Docking portal facing hub
        const facing = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), pos).normalize();
        const portalPos = pos.clone().add(facing.clone().multiplyScalar(4.2));
        const p = createPortalStation(defs[i].name, portalPos, facing, defs[i].color);
    campus.portals.push(p);
    spaceRoot.add(p.group);
        // Raise portal ring to approximate eye height for easier entry
        p.group.position.y = player.eyeHeight;

        // Catwalk from hub deck edge to this portal (visual width original)
        const from = new THREE.Vector3(Math.cos(ang) * 6.8, 0.63, Math.sin(ang) * 6.8);
        const to = portalPos.clone();
    createCatwalk(from, to, 0x6cf9ff);
    // Small safety extension beyond the portal plane to avoid falling when jumping into portal
    const beyond = to.clone().add(facing.clone().multiplyScalar(2.2));
    createCatwalk(to, beyond, 0x6cf9ff, 0.08);

        // Static stepping pads along the path for jumping
        // Align exactly on the catwalk plane and orientation, with top equal to catwalk top
        const deckY = 0.63 + 0.025; // catwalk beam center Y
        const fromFlat = from.clone(); fromFlat.y = deckY;
        const toFlat = to.clone(); toFlat.y = deckY;
        const pathDir = new THREE.Vector3().subVectors(toFlat, fromFlat).normalize();
        const pathQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pathDir);
        const padSize = new THREE.Vector3(1.6, 0.08, 1.4);
        const padColHalfY = (padSize.y + 0.02) * 0.5; // collider is slightly taller for forgiving landings
        const catwalkTopY = deckY + 0.03; // catwalk collider half-height is 0.03
        const padCenterY = catwalkTopY - padColHalfY; // so collider top matches catwalk top exactly
        // Step positions along the catwalk (stop earlier to avoid overlapping the landing pad)
        const padSteps = [0.33, 0.62, 0.78];
        for (const s of padSteps) {
            const pos = fromFlat.clone().lerp(toFlat, s);
            pos.y = padCenterY;
            createStaticPad(pos, padSize, 0x6cf9ff, { quaternion: pathQuat, centerY: padCenterY });
        }

        // Wide landing pad near each module portal (on the hub side) to avoid falling on return
        const landSize = new THREE.Vector3(6.5, 0.08, 3.8); // width x height x depth (in path local axes)
        const landColHalfY = (landSize.y + 0.02) * 0.5;
        const landCenterY = catwalkTopY - landColHalfY;
        // Place landing pad center far enough hub-ward so its leading edge doesn't intrude the portal plane
        const landOffset = (landSize.z * 0.5) + 0.3; // half depth + margin
        const landCenter = toFlat.clone().add(facing.clone().multiplyScalar(landOffset));
        landCenter.y = landCenterY;
        createStaticPad(landCenter, landSize, 0x6cf9ff, { quaternion: pathQuat });
    }

    // Catwalks between adjacent portals (parkour loops)
    if (ENABLE_PORTAL_LINKS) {
        for (let i = 0; i < campus.portals.length; i++) {
            const a = campus.portals[i].group.position;
            const b = campus.portals[(i+1) % campus.portals.length].group.position;
            createCatwalk(a, b, 0x2be0ff, 0.06);
            // Safety stubs beyond each portal along the link direction to ease lateral entry
            const dir = new THREE.Vector3().subVectors(b, a).normalize();
            const stub = 1.2;
            const aPrev = a.clone().add(dir.clone().multiplyScalar(-stub));
            const bNext = b.clone().add(dir.clone().multiplyScalar(stub));
            createCatwalk(aPrev, a, 0x2be0ff, 0.06);
            createCatwalk(b, bNext, 0x2be0ff, 0.06);
        }
    }

    // Moving pads removed per request; static catwalks + pads remain for jumping challenges
}

function createStationHub(name, position, color) {
    const g = new THREE.Group();
    g.position.copy(position);
    // Base platform (cylinder + plate)
    const base = new THREE.Group();
    const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(6.5, 6.5, 0.6, 48),
        new THREE.MeshStandardMaterial({ color: 0x0e151c, metalness: 0.75, roughness: 0.35, emissive: 0x09202c, emissiveIntensity: 0.25 })
    );
    plinth.position.y = 0.3;
    base.add(plinth);
    const deck = new THREE.Mesh(
        new THREE.CylinderGeometry(6.8, 6.8, 0.06, 64),
        new THREE.MeshStandardMaterial({ color: 0x14202b, metalness: 0.8, roughness: 0.25, emissive: color, emissiveIntensity: 0.1 })
    );
    deck.position.y = 0.63;
    base.add(deck);
    g.add(base);
    // Deck supports player
    spaceGrounds.push(deck);

    // Antena
    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x89ecff, emissive: 0x2bd5ff, emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.2 })
    );
    mast.position.y = 3.2;
    g.add(mast);

    // Label
    const label = createTextSprite(name);
    label.position.set(0, 3.8, 0);
    g.add(label);
    // Expose dimensions for space-walking physics on hub
    g.userData.hub = {
        deckTopY: deck.position.y + 0.03, // cylinder half-thickness ~0.03
        deckRadius: 6.8,
        mastRadius: 0.3
    };
    return g;
}

function createStationModule(name, position, color, options = {}) {
    const g = new THREE.Group();
    g.position.copy(position);

    const hasCapsule = typeof THREE.CapsuleGeometry === 'function';
    const bodyGeom = hasCapsule
        ? new THREE.CapsuleGeometry(2.1, 6.0, 8, 16)
        : new THREE.CylinderGeometry(2.1, 2.1, 8.0, 24);
    const body = new THREE.Mesh(
        bodyGeom,
        new THREE.MeshStandardMaterial({ color: 0x11161c, metalness: 0.85, roughness: 0.35, emissive: color, emissiveIntensity: 0.1 })
    );
    body.rotation.z = Math.PI / 2;
    g.add(body);

    // Accent bands
    const band = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.1, 10, 40),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.2 })
    );
    band.position.x = 2.6;
    band.rotation.y = Math.PI / 2;
    g.add(band);

    const band2 = band.clone();
    band2.position.x = -2.6;
    g.add(band2);

    const label = createTextSprite(name);
    label.position.set(0, 6.8, 0);
    g.add(label);

    // Nav blink lights
    const nav1 = new THREE.PointLight(color, 0.0, 8);
    nav1.position.set(3.2, 0.6, 0);
    const nav2 = new THREE.PointLight(color, 0.0, 8);
    nav2.position.set(-3.2, -0.6, 0);
    g.add(nav1, nav2);
    g.userData.blinkers = [nav1, nav2];

    // Optional: replace placeholder with a custom GLTF/GLB model from the web
    if (options.modelUrl) {
        const primaryUrl = options.modelUrl;
        const fallbackUrl = options.fallbackUrl;

        const onLoaded = (gltf) => {
                try {
                    const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
                    if (!model) return;
                    // Prepare model
                    model.traverse((o) => {
                        if (o.isMesh) {
                            o.castShadow = false; o.receiveShadow = false;
                            if (!options.preserveMaterials) {
                                if (o.material && o.material.emissive) {
                                    // keep subtle emissive when allowed to tweak
                                    o.material.emissiveIntensity = Math.min(0.2, o.material.emissiveIntensity || 0.2);
                                }
                            }
                        }
                    });
                    // Optionally center the model around its bounding box center
                    if (options.center) {
                        const box = new THREE.Box3().setFromObject(model);
                        const c = box.getCenter(new THREE.Vector3());
                        model.position.sub(c); // move so center sits at group origin
                    }
                    // Transform controls
                    const scl = options.scale != null ? options.scale : 1.0;
                    model.scale.setScalar(scl);
                    model.rotation.order = 'YXZ';
                    if (options.yaw) model.rotation.y = options.yaw;
                    if (options.pitch) model.rotation.x = options.pitch;
                    if (options.roll) model.rotation.z = options.roll;
                    if (options.yOffset) model.position.y += options.yOffset;
                    if (options.offset) {
                        const off = options.offset;
                        model.position.add(new THREE.Vector3(off.x||0, off.y||0, off.z||0));
                    }

                    // Remove placeholder bits
                    g.remove(body); body.geometry.dispose?.(); body.material.dispose?.();
                    g.remove(band); band.geometry.dispose?.(); band.material.dispose?.();
                    g.remove(band2); band2.geometry.dispose?.(); band2.material?.dispose?.();
                    // Keep label and nav lights for now
                    g.add(model);

                    // Opcional: luces locales para realzar colores del modelo sin afectar toda la escena
                    if (options.addFillLights) {
                        try {
                            const bbox = new THREE.Box3().setFromObject(model);
                            const c = bbox.getCenter(new THREE.Vector3());
                            const size = bbox.getSize(new THREE.Vector3());
                            const maxSide = Math.max(size.x, size.y, size.z) || 3;
                            const baseI = options.fillLightIntensity != null ? options.fillLightIntensity : 1.2;
                            const baseD = options.fillLightDistance != null ? options.fillLightDistance : maxSide * 3.0;

                            const key = new THREE.PointLight(0xffffff, baseI * 1.0, baseD);
                            key.position.copy(c).add(new THREE.Vector3(maxSide * 0.45, maxSide * 0.35, maxSide * 0.6));
                            const fill = new THREE.PointLight(0xffedd5, baseI * 0.75, baseD * 1.0);
                            fill.position.copy(c).add(new THREE.Vector3(-maxSide * 0.5, maxSide * 0.2, -maxSide * 0.3));
                            const rim = new THREE.PointLight(0x66ccff, baseI * 0.8, baseD * 1.1);
                            rim.position.copy(c).add(new THREE.Vector3(0, maxSide * 0.7, -maxSide * 0.1));
                            // Spot suave desde arriba para contraste y detalle
                            const spot = new THREE.SpotLight(0xffffff, baseI * 1.1, baseD * 1.4, Math.PI / 4, 0.35, 0.9);
                            spot.position.copy(c).add(new THREE.Vector3(maxSide * 0.2, maxSide * 1.2, maxSide * 0.2));
                            spot.target.position.copy(c);
                            // Rebote desde abajo para levantar sombras
                            const bounce = new THREE.PointLight(0xddddff, baseI * 0.6, baseD * 0.8);
                            bounce.position.copy(c).add(new THREE.Vector3(0, -maxSide * 0.3, 0));
                            // Luz direccional suave para uniformidad
                            const dir = new THREE.DirectionalLight(0xffffff, baseI * 0.3);
                            dir.position.copy(c).add(new THREE.Vector3(maxSide * -1.5, maxSide * 1.2, maxSide * 1.5));
                            dir.target = model;
                            // Adjuntar al grupo del módulo para que se muevan/escale con él
                            g.add(key, fill, rim, spot, spot.target, bounce, dir);
                        } catch (e) {
                            console.warn('Error adding fill lights for module', name, e);
                        }
                    }

                    // Auto-play animations if present
                    if (gltf.animations && gltf.animations.length) {
                        const mixer = new THREE.AnimationMixer(model);
                        // Prefer an idle-like clip if available
                        let clip = null;
                        const names = gltf.animations.map(a => (a.name || '').toLowerCase());
                        const prefer = ['idle', 'walk', 'run', 'dance', 'wave'];
                        for (const p of prefer) {
                            const idx = names.findIndex(n => n.includes(p));
                            if (idx >= 0) { clip = gltf.animations[idx]; break; }
                        }
                        if (!clip) clip = gltf.animations[0];
                        const action = mixer.clipAction(clip);
                        action.loop = THREE.LoopRepeat;
                        action.clampWhenFinished = false;
                        action.enabled = true;
                        action.play();
                        mixers.push(mixer);
                    }
                } catch (e) {
                    console.warn('Error applying model for module', name, e);
                }
            };

        const onError = (failedUrl, err) => {
            console.warn('Failed to load model for module', name, failedUrl, err);
            if (fallbackUrl && failedUrl !== fallbackUrl) {
                // Try fallback once
                gltfLoader.load(fallbackUrl, onLoaded, undefined, (e) => {
                    console.warn('Fallback also failed for module', name, fallbackUrl, e);
                });
            }
        };

        gltfLoader.load(primaryUrl, onLoaded, undefined, (err) => onError(primaryUrl, err));
    }

    return g;
}

function createStrut(a, b, color) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, len, 16),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2, transparent: true, opacity: 0.6 })
    );
    tube.position.copy(mid);
    tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    spaceRoot.add(tube);
    return tube;
}

function createCatwalk(a, b, color = 0x6cf9ff, halfWidth = 0.08) {
    // Ensure catwalk is perfectly horizontal at deck height for consistent distances
    const deckY = 0.63 + 0.025; // visual center of the beam
    const aFlat = a.clone(); aFlat.y = deckY;
    const bFlat = b.clone(); bFlat.y = deckY;

    const dir = new THREE.Vector3().subVectors(bFlat, aFlat);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(aFlat, bFlat).multiplyScalar(0.5);

    // Visible narrow beam
    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(halfWidth * 2, 0.05, len),
        new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: color, emissiveIntensity: 0.35 })
    );
    beam.position.copy(mid);
    // Rotate so its Z axis aligns with the horizontal link
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
    beam.quaternion.copy(quat);
    spaceRoot.add(beam);

    // Optional symmetric side rails (visual only)
    if (ENABLE_SIDE_RAILS) {
        const railGeom = new THREE.BoxGeometry(SIDE_RAIL_THICKNESS, SIDE_RAIL_THICKNESS, len);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: SIDE_RAIL_COLOR, emissiveIntensity: 0.4 });
        // Left rail (+X in beam local space)
        const offL = new THREE.Vector3(SIDE_RAIL_OFFSET, SIDE_RAIL_HEIGHT, 0).applyQuaternion(beam.quaternion);
        const railL = new THREE.Mesh(railGeom, railMat);
        railL.position.copy(beam.position).add(offL);
        railL.quaternion.copy(beam.quaternion);
        spaceRoot.add(railL);
        // Right rail (-X in beam local space)
        const offR = new THREE.Vector3(-SIDE_RAIL_OFFSET, SIDE_RAIL_HEIGHT, 0).applyQuaternion(beam.quaternion);
        const railR = new THREE.Mesh(railGeom, railMat);
        railR.position.copy(beam.position).add(offR);
        railR.quaternion.copy(beam.quaternion);
        spaceRoot.add(railR);
    }

    // Invisible wider collider for more forgiving foot placement
    const colW = Math.max(halfWidth * 2.5, 0.36); // wider than visual
    const collider = new THREE.Mesh(
        new THREE.BoxGeometry(colW, 0.06, len),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    collider.position.copy(beam.position);
    collider.quaternion.copy(beam.quaternion);
    spaceRoot.add(collider);
    spaceGrounds.push(collider);
    return beam;
}

// Static platform (registers as ground)
function createStaticPad(center, size, color = 0x6cf9ff, options = {}) {
    // Visible pad (keeps original visual size)
    const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: color, emissiveIntensity: 0.35 });
    const pad = new THREE.Mesh(geom, mat);
    pad.position.copy(center);
    if (options.quaternion) pad.quaternion.copy(options.quaternion);
    spaceRoot.add(pad);
    // Invisible, slightly larger collider for forgiving landings
    const col = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 1.4, size.y + 0.02, size.z * 1.4),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    col.position.copy(center);
    if (options.quaternion) col.quaternion.copy(options.quaternion);
    spaceRoot.add(col);
    spaceGrounds.push(col);
    return pad;
}

function createMovingPad(start, end, size, color = 0x6cf9ff, periodSec = 4) {
    const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: color, emissiveIntensity: 0.4 });
    const pad = new THREE.Mesh(geom, mat);
    pad.position.copy(start);
    spaceRoot.add(pad);
    spaceGrounds.push(pad);
    const dist = new THREE.Vector3().subVectors(end, start).length();
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const update = (t) => {
        const phase = (Math.sin((t/periodSec) * Math.PI * 2) + 1) * 0.5; // 0..1
        pad.position.copy(start).add(dir.clone().multiplyScalar(dist * phase));
    };
    spaceAnim.push({ mesh: pad, update });
    return pad;
}

function createBobbingPad(center, size, color = 0x6cf9ff, amplitude = 0.5, periodSec = 2.5) {
    const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: color, emissiveIntensity: 0.4 });
    const pad = new THREE.Mesh(geom, mat);
    pad.position.copy(center);
    spaceRoot.add(pad);
    spaceGrounds.push(pad);
    const baseY = center.y;
    const update = (t) => {
        pad.position.y = baseY + Math.sin((t/periodSec) * Math.PI * 2) * amplitude;
    };
    spaceAnim.push({ mesh: pad, update });
    return pad;
}

function createPortalStation(name, position, facing, color) {
    const group = new THREE.Group();
    group.position.copy(position);
    const lookAt = position.clone().add(facing);
    group.lookAt(lookAt);

    // Ring (XY plane) - group faces along +Z towards facing
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.15, 12, 64),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, metalness: 0.7, roughness: 0.35 })
    );
    // No extra rotation; group orientation handles facing
    group.add(ring);

    // Inner plane
    const plane = new THREE.Mesh(
        new THREE.CircleGeometry(1.9, 48),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14 })
    );
    group.add(plane);

    // Beacon light slightly ahead
    const beacon = new THREE.PointLight(color, 0.8, 12);
    beacon.position.z = 1.5;
    group.add(beacon);

    return { group, ring, plane, beacon, name, color, facing };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    // If pointer locked, use relative movement
    if (ui.pointerLocked) {
        const dx = event.movementX || 0;
        const dy = event.movementY || 0;
        yaw -= dx * sensitivity;
        pitch -= dy * sensitivity;
        pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
        return;
    }
    // Fallback: allow drag-to-look when not locked
    if (!isMouseDown) return;
    const dx = event.clientX - lastMouse.x;
    const dy = event.clientY - lastMouse.y;
    lastMouse.set(event.clientX, event.clientY);
    yaw -= dx * sensitivity;
    pitch -= dy * sensitivity;
    pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
}

function onMouseDown(event) {
    // Request pointer lock for free look with mouse
    if (!ui.pointerLocked) {
        renderer.domElement.requestPointerLock?.();
    }
    isMouseDown = true;
    lastMouse.set(event.clientX, event.clientY);
    if (!ui.pointerLocked) document.body.style.cursor = 'grabbing';
}

function onMouseUp() {
    isMouseDown = false;
    if (!ui.pointerLocked && !hoveredNode) document.body.style.cursor = 'default';
}

function onPointerLockChange() {
    const locked = document.pointerLockElement === renderer.domElement;
    ui.pointerLocked = !!locked;
    document.body.style.cursor = locked ? 'none' : 'default';
}

function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (k in keys) keys[k] = true;
    if (k === 'shift') keys.shift = true;
    if (e.key === 'Escape') {
        // Close any open overlay
        leaveSection();
    }
    if (e.code === 'Space' || k === ' ') { // Space for jump
        e.preventDefault?.();
        jumpQueued = true;
    }
    if (k === 'enter') tryEnterPortal();
}

function onKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k in keys) keys[k] = false;
    if (k === 'shift') keys.shift = false;
    if (e.code === 'Space' || k === ' ') {
        e.preventDefault?.();
    }
}

function checkIntersections() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (hoveredNode !== intersectedObject) {
            if (hoveredNode) {
                // Restore previous hovered node
                hoveredNode.material.color.set(hoveredNode.originalColor);
                hoveredNode.material.emissiveIntensity = hoveredNode.userData.baseEmissiveIntensity;
                hoveredNode.scale.set(1, 1, 1);
            }
            hoveredNode = intersectedObject;
            // Highlight new node
            hoveredNode.material.color.set(0xffffff); // Highlight with white
            hoveredNode.material.emissiveIntensity = 1.1;
            hoveredNode.scale.set(1.22, 1.22, 1.22);
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (hoveredNode) {
            // Restore previously hovered node
            hoveredNode.material.color.set(hoveredNode.originalColor);
            hoveredNode.material.emissiveIntensity = hoveredNode.userData.baseEmissiveIntensity;
            hoveredNode.scale.set(1, 1, 1);
            hoveredNode = null;
        }
        document.body.style.cursor = 'default';
    }
}

function onClick(event) {
    event.preventDefault();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);

    if (intersects.length > 0) {
        const selectedNode = intersects[0].object;
        console.log(`Clicked on: ${selectedNode.name}`);
        // If the object registered an onClick handler, call it
        if (selectedNode.userData && typeof selectedNode.userData.onClick === 'function') {
            try { selectedNode.userData.onClick(selectedNode); } catch (e) { console.warn('onClick handler error', e); }
            return;
        }

        // En modo primera persona, el clic se usa solo para mirar.
        // Si quieres, aquí podemos abrir secciones con tecla 'Enter' o doble click.


        if (selectedNode.name === 'Juego') {
            // Placeholder for switching context
            // For example, fade out the current scene and load a new one.
            console.log('Transitioning to Game section...');
        }
    }
}

// Tween sin librerías (primera persona)
function smoothCameraFP(fromPos, toPos, lookAtPoint, durationMs = 1000) {
    const start = performance.now();
    const easeInOut = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    // calcular yaw/pitch objetivo para mirar hacia lookAtPoint
    const dir = new THREE.Vector3().subVectors(lookAtPoint, camera.position).normalize();
    const targetYaw = Math.atan2(dir.x, dir.z * -1) * -1; // se ajustará en step usando posición interpolada
    function step(now) {
        const tRaw = Math.min(1, (now - start) / durationMs);
        const t = easeInOut(tRaw);
        camera.position.lerpVectors(fromPos, toPos, t);
        // Recalcular dir hacia lookAt desde la posición interpolada
        const d = new THREE.Vector3().subVectors(lookAtPoint, camera.position).normalize();
        // Convertir a yaw/pitch
        const y = Math.atan2(d.x, d.z);
        const p = Math.asin(-d.y);
        yaw = y; pitch = THREE.MathUtils.clamp(p, -MAX_PITCH, MAX_PITCH);
        if (tRaw < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const t = clock.elapsedTime;
    
    if (starField) {
        starField.rotation.x += 0.00012;
        starField.rotation.y += 0.00022;
        // Subtle twinkle: modulate opacity of layers if available
        const mats = starField.userData?.materials;
        if (mats && mats.length) {
            const base1 = 0.70, base2 = 0.85;
            if (mats[0]) mats[0].opacity = base1 + Math.sin(t * 0.6) * 0.06;
            if (mats[1]) mats[1].opacity = base2 + Math.cos(t * 0.8) * 0.06;
        }
    }

    // Subtle emissive pulse (sin rotaciones)
    for (const n of nodes) {
        if (n !== hoveredNode) {
            n.material.emissiveIntensity = n.userData.baseEmissiveIntensity + Math.sin(t * 1.5) * 0.08;
        }
    }

    // Desactivar rotaciones y blinkers de elementos no interactivos
    for (const b of campus.buildings) {
        if (b && b.userData) {
            // no llamar a animate para que nada gire
            if (b.userData.blinkers) {
                b.userData.blinkers.forEach((l) => l.intensity = 0.4);
            }
        }
    }

    // Moving platforms removed; no animated pads to update
    // Update any GLTF animations
    if (mixers.length) {
        for (const m of mixers) m.update(delta);
    }

    // WASD movement update
    updateWASD(delta);
    // Update camera orientation from yaw/pitch
    updateLook();
    
    checkIntersections();
    updatePortals();
    if (ui.mode === 'interior') {
        updateInteriorExit();
        // Actualizar detección de portales interiores si existe
        if (interiorRoot.userData.updateJuegoPortals) {
            interiorRoot.userData.updateJuegoPortals(camera);
        }
    }
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
    // Track previous camera position for next frame
    if (!lastCamPos) lastCamPos = camera.position.clone();
    else lastCamPos.copy(camera.position);
}

function updateWASD(delta) {
    if (ui.isTransition) return; // lock movement during transitions
    // During intro cooldown, ignore physics/movement to avoid a tiny fall
    if (performance.now() < (presentationCooldownUntil || 0)) return;
    // Horizontal speed always computed; vertical handled via physics in space
    const speed = (keys.shift ? baseSpeed * 2.2 : baseSpeed) * delta;

    // Get camera basis vectors
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward); // includes vertical component (pitch)
    // In both interior and space walking, movement is horizontal-only
    forward.y = 0;
    if (forward.lengthSq() > 0) forward.normalize();

    // Right vector estable en el plano horizontal calculado desde yaw (no afecta por pitch)
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

    const move = new THREE.Vector3();
    if (keys.w) move.add(forward);
    if (keys.s) move.sub(forward);
    if (keys.a) move.sub(right);   // A: izquierda
    if (keys.d) move.add(right);   // D: derecha
    // Q/E deshabilitados por requerimiento (solo WASD)
    // Normalize movement direction if any
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed);

    if (ui.mode === 'interior') {
        // interior: planar move + fixed height + wall collisions
        const next = camera.position.clone().add(move);
        next.y = player.eyeHeight; // eye height constante
        camera.position.copy(resolveInteriorCollision(camera.position, next));
        player.velY = 0; player.onGround = true; // interior is always grounded
        jumpQueued = false;
    } else {
        // space mode: parkour - gravity always applies; collisions with hub deck and mast only near the hub
        const info = hubInfo || { deckTopY: 0.63, deckRadius: 6.8, mastRadius: 0.3 };
        let next = camera.position.clone().add(move);

        // Gravity and jump
        player.velY -= player.gravity * delta;
    // Predict support to allow buffered jumps near ground (probe mode)
    const groundProbe = resolveSpaceGround(next, player, { probe: true, prevY: camera.position.y });
        const canJump = player.onGround || groundProbe.onGround;
        if (jumpQueued && canJump) {
            player.velY = player.jumpSpeed;
            player.onGround = false;
        }
        jumpQueued = false;
        next.y += player.velY * delta;

        // Resolve mast collision (horizontal only)
        const resolved = resolveSpaceCollision(camera.position, next, info, player);
        next.copy(resolved.position);
    // Raycast to any ground (deck, catwalks, pads) with crossing check for smooth landing
    const ground = resolveSpaceGround(next, player, { prevY: camera.position.y });
        camera.position.copy(ground.position);
        player.onGround = ground.onGround;
        if (ground.onGround && player.velY < 0) player.velY = 0;

        // Fall reset if too low
        if (camera.position.y < -10) {
            const startY = ((hubInfo && hubInfo.deckTopY) ? hubInfo.deckTopY : 0.63) + player.eyeHeight;
            camera.position.set(0, startY, 0.8);
            setYawPitchToLookAt(new THREE.Vector3(0, startY, 0));
            player.velY = 0;
            player.onGround = true;
        }
    }
}

// Collision against hub deck (circular) and antenna mast (cylinder) for space walking
function resolveSpaceCollision(curr, next, info, player) {
    const out = { position: next.clone(), onGround: false };
    // Ground snap handled by raycast; only handle mast collision here

    // Simple cylindrical collision for mast at origin
    const mastR = info.mastRadius + player.radius;
    const px = out.position.x, pz = out.position.z;
    const dist2 = px*px + pz*pz;
    if (dist2 < mastR * mastR) {
        const len = Math.sqrt(dist2) || 1e-6;
        const push = mastR / len;
        out.position.x *= push;
        out.position.z *= push;
    }
    return out;
}

// Raycast down from next position to any ground; returns snapped position and grounded flag
function resolveSpaceGround(next, player, options = {}) {
    const out = { position: next.clone(), onGround: false };
    if (!spaceGrounds.length) return out;
    const probe = !!options.probe;
    const prevY = (typeof options.prevY === 'number') ? options.prevY : next.y;
    // Do not snap to ground while ascending unless probe-only
    if (!probe && player.velY > 0.01) return out;
    const down = new THREE.Vector3(0, -1, 0);
    const sampleR = Math.max(0.3, player.radius * 1.0);
    const offsets = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(sampleR, 0, 0),
        new THREE.Vector3(-sampleR, 0, 0),
        new THREE.Vector3(0, 0, sampleR),
        new THREE.Vector3(0, 0, -sampleR),
        new THREE.Vector3(sampleR, 0, sampleR),
        new THREE.Vector3(sampleR, 0, -sampleR),
        new THREE.Vector3(-sampleR, 0, sampleR),
        new THREE.Vector3(-sampleR, 0, -sampleR)
    ];
    let bestHit = null;
    let bestY = -Infinity;
    for (const off of offsets) {
        const origin = new THREE.Vector3(next.x + off.x, next.y + 0.4, next.z + off.z);
        groundRay.set(origin, down);
        const hits = groundRay.intersectObjects(spaceGrounds, false);
        if (hits.length) {
            const hit = hits[0];
            // Accept if feet are within snap range above the surface
            const feetY = next.y - player.eyeHeight;
            // If already grounded, be a bit stickier to edges; else use normal range
            const baseRange = 0.22;
            const snapRange = player.onGround ? baseRange + 0.06 : baseRange;
            if (feetY >= hit.point.y - snapRange) {
                if (hit.point.y > bestY) { bestY = hit.point.y; bestHit = hit; }
            }
        }
    }
    if (bestHit) {
        const surfY = bestHit.point.y;
        const feetPrev = prevY - player.eyeHeight;
        const feetNext = next.y - player.eyeHeight;
        if (probe) {
            // Generous probe to allow jump buffering near ground
            const probeRange = 0.28;
            if (feetNext >= surfY - probeRange) {
                out.position.y = surfY + player.eyeHeight;
                out.onGround = true;
            }
        } else {
            // Smooth landing: snap when descending and crossing/touching the surface
            // Use >= for feetPrev to handle the case of starting exactly on the surface
            const crossed = (player.velY <= 0) && (feetPrev >= surfY - 1e-4) && (feetNext <= surfY + 0.02);
            if (crossed) {
                out.position.y = surfY + player.eyeHeight;
                out.onGround = true;
            }
        }
    }
    return out;
}

function updateLook() {
    // Apply yaw (Y) then pitch (X)
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}

function setYawPitchToLookAt(target) {
    const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
    const y = Math.atan2(dir.x, dir.z);
    const p = Math.asin(-dir.y);
    yaw = y;
    pitch = THREE.MathUtils.clamp(p, -MAX_PITCH, MAX_PITCH);
    updateLook();
}

// Portal logic ----------------------------------------------------------------
function updatePortals() {
    if (!campus.portals.length) return;
    let closest = null;
    let closestDist = Infinity;
    for (const p of campus.portals) {
        const d = camera.position.distanceTo(p.group.position);
        // Microanimación: pulso del ring según cercanía + blink del beacon
        const pulse = THREE.MathUtils.clamp(1.0 + 0.25 * Math.exp(-d * 0.3) * Math.sin(clock.elapsedTime * 6), 0.9, 1.3);
        p.ring.scale.setScalar(pulse);
        if (p.beacon) p.beacon.intensity = 0.3 + Math.abs(Math.sin(clock.elapsedTime * 4)) * 0.7;
        if (d < closestDist) { closest = p; closestDist = d; }
    }

    if (!closest) return;
    const show = closestDist < 6.0; // umbral de activación
    if (promptEl) {
        promptEl.style.opacity = show ? '1' : '0';
        promptEl.setAttribute('aria-hidden', show ? 'false' : 'true');
        if (show) promptEl.textContent = `Acércate para entrar a ${closest.name}`;
    }
    // Guardar foco actual
    updatePortals.current = show ? closest : null;

    // Autoentrada robusta: cruza el plano del portal dentro del radio del aro o está muy cerca del plano
    if (!ui.isTransition && ui.mode === 'space') {
        const center = closest.group.position;
        const n = closest.facing.clone(); // normal del plano del portal (apunta hacia el hub)
        // Distancias firmadas al plano en fotograma previo y actual
        const sPrev = n.dot(new THREE.Vector3().subVectors(lastCamPos || camera.position, center));
        const sCurr = n.dot(new THREE.Vector3().subVectors(camera.position, center));
        // Radio de activación ligeramente mayor que el aro
        const activateR = 2.4; // aro ~2.2
        const horizDist = new THREE.Vector2(camera.position.x - center.x, camera.position.z - center.z).length();
        const crossedForward = sPrev > 0 && sCurr <= 0; // entró atravesando el plano hacia el portal
        const nearPlane = Math.abs(sCurr) < 0.9; // tolerancia cerca del plano
        if (horizDist <= activateR && (crossedForward || nearPlane)) {
            beginPortalTransition(closest);
        }
    }
}

function tryEnterPortal() {
    if (ui.mode === 'space') {
        const target = updatePortals.current;
        if (!target) return;
        beginPortalTransition(target);
    } else if (ui.mode === 'interior') {
        // Try to exit if near interior exit
        if (!interior.exit) return;
        const c = interior.exit.position;
        const r = (interior.exit.radius || 1.2) + 0.4;
        const dx = camera.position.x - c.x;
        const dz = camera.position.z - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= r) beginExitTransition();
    }
}

// Transition: blinding light flash and section change
function beginPortalTransition(target) {
    if (ui.isTransition) return;
    ui.isTransition = true;
    // Lock input
    keys.w = keys.a = keys.s = keys.d = keys.shift = false;

    // Boost bloom for drama
    const bloomStart = bloomPass.strength;
    const exposureStart = renderer.toneMappingExposure;
    const start = performance.now();
    const rampMs = 260;
    function ramp(now) {
        const t = Math.min(1, (now - start) / rampMs);
        bloomPass.strength = THREE.MathUtils.lerp(bloomStart, 1.3, t);
        renderer.toneMappingExposure = THREE.MathUtils.lerp(exposureStart, 1.6, t);
        if (t < 1) requestAnimationFrame(ramp);
    }
    requestAnimationFrame(ramp);

    // Flash overlay
    if (ui.flashEl) {
        ui.flashEl.classList.add('show');
    }

    // After flash, switch to interior walking
    setTimeout(() => {
        switchToInterior(target.name);
        // Restore rendering params gently
        const start2 = performance.now();
        const backMs = 500;
        function back(now) {
            const t = Math.min(1, (now - start2) / backMs);
            bloomPass.strength = THREE.MathUtils.lerp(1.3, 0.55, t);
            renderer.toneMappingExposure = THREE.MathUtils.lerp(1.6, exposureStart, t);
            if (t < 1) requestAnimationFrame(back);
        }
        requestAnimationFrame(back);
        // Fade flash out once section is visible
        setTimeout(() => ui.flashEl && ui.flashEl.classList.remove('show'), 220);
    }, 320);
}
// Interior helpers -----------------------------------------------------------
function clearGroup(g) {
    for (let i = g.children.length - 1; i >= 0; i--) {
        const c = g.children[i];
        g.remove(c);
        if (c.geometry) c.geometry.dispose?.();
        if (c.material) {
            const m = c.material;
            if (Array.isArray(m)) m.forEach(x => x.dispose?.()); else m.dispose?.();
        }
    }
}

function switchToInterior(name) {
    ui.mode = 'interior';
    spaceRoot.visible = false;
    interiorRoot.visible = true;
    clearGroup(interiorRoot);
    interior.colliders = [];
    interior.exit = null;
    interior.name = name;
    buildInteriorRoom(name);
    camera.position.set(0, 1.6, 6.5);
    setYawPitchToLookAt(new THREE.Vector3(0, 1.6, 0));
    // Show related overlay content (Inicio/Juego/Proyecto)
    const id = name ? name.toLowerCase() : '';
    showSection(id);
    setTimeout(() => { ui.isTransition = false; }, 120);
}

function switchToSpace(atPortalName) {
    ui.mode = 'space';
    interiorRoot.visible = false;
    spaceRoot.visible = true;
    // Hide overlays when returning to space
    leaveSection();
    clearGroup(interiorRoot);
    interior.colliders = [];
    interior.exit = null;
    interior.name = null;
    const p = campus.portals.find(pp => pp.name.toLowerCase() === (atPortalName||'').toLowerCase());
    if (p) {
        // Spawn slightly farther beyond the portal towards the landing pad/extension
        const spawn = p.group.position.clone().add(p.facing.clone().multiplyScalar(3.6));
        // Snap Y to the catwalk/pad plane to avoid mid-air start
        const deckTop = ((hubInfo && hubInfo.deckTopY) ? hubInfo.deckTopY : 0.63);
        spawn.y = deckTop + player.eyeHeight;
        camera.position.copy(spawn);
        // One-time ground snap to the exact surface (pad/catwalk) to prevent falling due to small mismatches
        const snapped = resolveSpaceGround(camera.position, player, { probe: true, prevY: camera.position.y });
        camera.position.copy(snapped.position);
        player.onGround = snapped.onGround || true;
        player.velY = 0;
        const look = p.group.position.clone().add(p.facing.clone().multiplyScalar(12));
        setYawPitchToLookAt(look);
    }
    // Reset player state to avoid unexpected falling/glitches
    player.velY = 0;
    player.onGround = true;
}

// Overlay helpers -----------------------------------------------------------
function showSection(id) {
    if (!id) return;
    const el = ui.sectionOverlays[id];
    if (!el) return;
    // Release pointer lock so the user can interact with the overlay
    if (ui.pointerLocked) document.exitPointerLock?.();
    Object.entries(ui.sectionOverlays).forEach(([key, node]) => {
        if (!node) return;
        const on = key === id;
        node.classList.toggle('visible', on);
        node.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    ui.activeSection = id;
}

function leaveSection() {
    if (!ui.activeSection) return;
    const el = ui.sectionOverlays[ui.activeSection];
    if (el) {
        el.classList.remove('visible');
        el.setAttribute('aria-hidden', 'true');
    }
    ui.activeSection = null;
}

function buildInteriorRoom(name) {
    // Create the shared room shell (floor, ceiling, walls, trims, exit)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.9, metalness: 0.05 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x111922, roughness: 0.6, metalness: 0.1, emissive: 0x0a2230, emissiveIntensity: 0.15 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x6cf9ff, emissive: 0x6cf9ff, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.25 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), floorMat);
    floor.rotation.x = -Math.PI/2;
    interiorRoot.add(floor);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), wallMat);
    ceiling.rotation.x = Math.PI/2;
    ceiling.position.y = 3.2;
    interiorRoot.add(ceiling);

    const walls = [];
    walls.push(new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 18), wallMat));
    walls[walls.length-1].position.set(-7, 1.6, 0);
    walls.push(new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 18), wallMat));
    walls[walls.length-1].position.set(7, 1.6, 0);
    walls.push(new THREE.Mesh(new THREE.BoxGeometry(14, 3.2, 0.4), wallMat));
    walls[walls.length-1].position.set(0, 1.6, -9);
    walls.forEach(w => { interiorRoot.add(w); addColliderFromMesh(w); });

    const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 18), trimMat);
    trimL.position.set(-6.5, 0.05, 0);
    interiorRoot.add(trimL);
    const trimR = trimL.clone(); trimR.position.x = 6.5; interiorRoot.add(trimR);

    const label = createTextSprite(name);
    label.position.set(0, 2.2, -8.6);
    interiorRoot.add(label);

    const exit = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.08, 10, 48), trimMat);
    exit.add(ring);
    exit.position.set(0, 1.6, 8.0);
    interiorRoot.add(exit);
    interior.exit = { position: exit.position.clone(), radius: 1.2 };

    // After building the shell, delegate room-specific content to the component
    const key = (name || '').toLowerCase();
    const helpers = {
        addColliderFromMesh,
        createTextSprite,
        THREE,
        gltfLoader,
        // registerInteractive(mesh, onClick): registers a mesh for raycast clicks and stores handler
        registerInteractive: (mesh, onClick) => {
            try {
                if (mesh) {
                    interactiveObjects.push(mesh);
                    mesh.userData.onClick = onClick;
                }
            } catch (e) { console.warn('registerInteractive failed', e); }
        }
    };
    try {
        if (key === 'inicio' && InicioComponent && typeof InicioComponent.addInicio === 'function') {
            InicioComponent.addInicio(interiorRoot, helpers);
        } else if (key === 'juego' && JuegoComponent && typeof JuegoComponent.addJuego === 'function') {
            JuegoComponent.addJuego(interiorRoot, helpers);
        } else if (key === 'proyecto' && ProyectoComponent && typeof ProyectoComponent.addProyecto === 'function') {
            ProyectoComponent.addProyecto(interiorRoot, helpers);
        } else {
            // default: nothing more to add
        }
    } catch (e) {
        console.warn('Error building room content for', name, e);
    }
}

// Interior exit detection and transition back to space
function updateInteriorExit() {
    if (!interior.exit || ui.isTransition) return;
    const c = interior.exit.position;
    const r = (interior.exit.radius || 1.2) + 0.6; // a bit generous
    const dx = camera.position.x - c.x;
    const dz = camera.position.z - c.z;
    const dist = Math.hypot(dx, dz);
    // Optional prompt
    if (promptEl) {
        const show = dist < r + 0.6;
        promptEl.style.opacity = show ? '1' : '0';
        promptEl.setAttribute('aria-hidden', show ? 'false' : 'true');
        if (show) promptEl.textContent = `Acércate para salir a ${interior.name || 'Espacio'}`;
    }
    // Plane-crossing OR near-plane within radius, similar to space portal logic
    const lastZ = lastCamPos ? lastCamPos.z : camera.position.z;
    const crossed = (lastZ < c.z) && (camera.position.z >= c.z);
    const nearPlane = Math.abs(camera.position.z - c.z) < 0.9;
    if (dist <= r && (crossed || nearPlane)) beginExitTransition();
}

function beginExitTransition() {
    if (ui.isTransition) return;
    ui.isTransition = true;
    // Lock input
    keys.w = keys.a = keys.s = keys.d = keys.shift = false;
    // Boost bloom and exposure briefly
    const bloomStart = bloomPass.strength;
    const exposureStart = renderer.toneMappingExposure;
    const start = performance.now();
    const rampMs = 220;
    function ramp(now) {
        const t = Math.min(1, (now - start) / rampMs);
        bloomPass.strength = THREE.MathUtils.lerp(bloomStart, 1.2, t);
        renderer.toneMappingExposure = THREE.MathUtils.lerp(exposureStart, 1.5, t);
        if (t < 1) requestAnimationFrame(ramp);
    }
    requestAnimationFrame(ramp);
    if (ui.flashEl) ui.flashEl.classList.add('show');
    setTimeout(() => {
        // Return to space at the same module portal
        const name = interior.name;
        switchToSpace(name);
        // Ease back rendering params
        const start2 = performance.now();
        const backMs = 420;
        function back(now) {
            const t = Math.min(1, (now - start2) / backMs);
            bloomPass.strength = THREE.MathUtils.lerp(1.2, 0.55, t);
            renderer.toneMappingExposure = THREE.MathUtils.lerp(1.5, exposureStart, t);
            if (t < 1) requestAnimationFrame(back);
        }
        requestAnimationFrame(back);
        setTimeout(() => ui.flashEl && ui.flashEl.classList.remove('show'), 200);
        setTimeout(() => { ui.isTransition = false; }, 100);
    }, 280);
}

function addColliderFromMesh(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    interior.colliders.push(box);
}

function resolveInteriorCollision(curr, next) {
    const radius = 0.4;
    let resolved = next.clone();
    for (const b of interior.colliders) {
        const expanded = b.clone().expandByScalar(radius);
        if (expanded.containsPoint(resolved)) {
            const center = b.getCenter(new THREE.Vector3());
            const half = b.getSize(new THREE.Vector3()).multiplyScalar(0.5).addScalar(radius);
            const delta = resolved.clone().sub(center);
            const dx = half.x - Math.abs(delta.x);
            const dy = half.y - Math.abs(delta.y);
            const dz = half.z - Math.abs(delta.z);
            const m = Math.min(dx, dy, dz);
            if (m === dx) resolved.x = center.x + Math.sign(delta.x) * half.x;
            else if (m === dy) resolved.y = center.y + Math.sign(delta.y) * half.y;
            else resolved.z = center.z + Math.sign(delta.z) * half.z;
        }
    }
    return resolved;
}
