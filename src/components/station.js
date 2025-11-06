import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { createPortal } from './portal.js';
import { createTextSprite } from '../ui.js';

// Constantes de configuración
const ENABLE_PORTAL_LINKS = false;
const ENABLE_SIDE_RAILS = true;
const SIDE_RAIL_OFFSET = 0.6;
const SIDE_RAIL_HEIGHT = 0.08;
const SIDE_RAIL_THICKNESS = 0.02;
const SIDE_RAIL_COLOR = 0x6cf9ff;

export const campus = {
    ground: null,
    buildings: [],
    portals: [],
    paths: [],
};

export const spaceGrounds = [];
export let hubInfo = null;

export function buildStation(scene, player) {
    const spaceRoot = new THREE.Group();
    scene.add(spaceRoot);

    scene.fog.density = 0.006;

    const hub = createStationHub('Núcleo', new THREE.Vector3(0, 0, 0), 0x00c6ff);
    campus.buildings.push(hub);
    spaceRoot.add(hub);
    if (hub.userData && hub.userData.hub) hubInfo = hub.userData.hub;

    const R = 36;
    const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    const defs = [
        {
            name: 'Inicio', color: 0x66ffff,
            module: {
                modelUrl: 'vehicle_factory/scene.gltf',
                fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb',
                scale: 3.0, center: true, yaw: (Math.PI / 2) + Math.PI, yOffset: 0.25,
                preserveMaterials: true,
                addFillLights: true,
                fillLightIntensity: 20.0,
                fillLightDistance: 30.0,
                offset: { x: 8.0, y: 0, z: 0 }
            }
        },
        {
            name: 'Juego', color: 0xff66ff,
            module: {
                modelUrl: 'boxing/scene.gltf',
                fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RiggedFigure/glTF-Binary/RiggedFigure.glb',
                scale: 10.0, center: true, yaw: 0.2, yOffset: 0.4
            }
        },
        {
            name: 'Proyecto', color: 0xffff66,
            // Sin modelUrl para que use el por defecto
        },
    ];

    for (let i = 0; i < defs.length; i++) {
        const ang = angles[i];
        const pos = new THREE.Vector3(Math.cos(ang) * R, 0, Math.sin(ang) * R);
        
        const moduleOpts = { ...defs[i].module };
        if (moduleOpts.scale && moduleOpts.scale >= 8) {
            const outward = pos.clone().normalize().multiplyScalar(3.2);
            moduleOpts.offset = { x: outward.x, y: 0, z: outward.z };
        }
        const mod = createStationModule(defs[i].name, pos, defs[i].color, moduleOpts);
        campus.buildings.push(mod);
        spaceRoot.add(mod);

        const strut = createStrut(new THREE.Vector3(0, 0, 0), pos, 0x3bd3ff);
        campus.paths.push(strut);
        spaceRoot.add(strut);

        const facing = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), pos).normalize();
        const portalPos = pos.clone().add(facing.clone().multiplyScalar(4.2));
        
        // Usamos el nuevo componente de portal
        const p = createPortal(defs[i].name, portalPos, facing, defs[i].color, defs[i].module);
        campus.portals.push(p);
        spaceRoot.add(p.group);
        p.group.position.y = player.eyeHeight;

        const from = new THREE.Vector3(Math.cos(ang) * 6.8, 0.63, Math.sin(ang) * 6.8);
        const to = portalPos.clone();
        createCatwalk(from, to, 0x6cf9ff, spaceRoot);
        const beyond = to.clone().add(facing.clone().multiplyScalar(2.2));
        createCatwalk(to, beyond, 0x6cf9ff, spaceRoot, 0.08);

        const deckY = 0.63 + 0.025;
        const fromFlat = from.clone(); fromFlat.y = deckY;
        const toFlat = to.clone(); toFlat.y = deckY;
        const pathDir = new THREE.Vector3().subVectors(toFlat, fromFlat).normalize();
        const pathQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pathDir);
        const padSize = new THREE.Vector3(1.6, 0.08, 1.4);
        const catwalkTopY = deckY + 0.03;
        const padColHalfY = (padSize.y + 0.02) * 0.5;
        const padCenterY = catwalkTopY - padColHalfY;
        const padSteps = [0.33, 0.62, 0.78];
        for (const s of padSteps) {
            const pos = fromFlat.clone().lerp(toFlat, s);
            pos.y = padCenterY;
            createStaticPad(pos, padSize, 0x6cf9ff, spaceRoot, { quaternion: pathQuat, centerY: padCenterY });
        }

        const landSize = new THREE.Vector3(6.5, 0.08, 3.8);
        const landColHalfY = (landSize.y + 0.02) * 0.5;
        const landCenterY = catwalkTopY - landColHalfY;
        const landOffset = (landSize.z * 0.5) + 0.3;
        const landCenter = toFlat.clone().add(facing.clone().multiplyScalar(landOffset));
        landCenter.y = landCenterY;
        createStaticPad(landCenter, landSize, 0x6cf9ff, spaceRoot, { quaternion: pathQuat });
    }

    if (ENABLE_PORTAL_LINKS) {
        for (let i = 0; i < campus.portals.length; i++) {
            const a = campus.portals[i].group.position;
            const b = campus.portals[(i + 1) % campus.portals.length].group.position;
            createCatwalk(a, b, 0x2be0ff, spaceRoot, 0.06);
            const dir = new THREE.Vector3().subVectors(b, a).normalize();
            const stub = 1.2;
            const aPrev = a.clone().add(dir.clone().multiplyScalar(-stub));
            const bNext = b.clone().add(dir.clone().multiplyScalar(stub));
            createCatwalk(aPrev, a, 0x2be0ff, spaceRoot, 0.06);
            createCatwalk(b, bNext, 0x2be0ff, spaceRoot, 0.06);
        }
    }
    return spaceRoot;
}

function createStationHub(name, position, color) {
    const g = new THREE.Group();
    g.position.copy(position);
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
    spaceGrounds.push(deck);

    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x89ecff, emissive: 0x2bd5ff, emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.2 })
    );
    mast.position.y = 3.2;
    g.add(mast);

    const label = createTextSprite(name);
    label.position.set(0, 3.8, 0);
    g.add(label);
    g.userData.hub = {
        deckTopY: deck.position.y + 0.03,
        deckRadius: 6.8,
        mastRadius: 0.3
    };
    return g;
}

function createStationModule(name, position, color, options = {}) {
    const g = new THREE.Group();
    g.position.copy(position);

    // Placeholder geometry
    const bodyGeom = new THREE.CylinderGeometry(2.1, 2.1, 8.0, 24);
    const body = new THREE.Mesh(
        bodyGeom,
        new THREE.MeshStandardMaterial({ color: 0x11161c, metalness: 0.85, roughness: 0.35, emissive: color, emissiveIntensity: 0.1 })
    );
    body.rotation.z = Math.PI / 2;
    g.add(body);

    const label = createTextSprite(name);
    label.position.set(0, 3.8, 0);
    g.add(label);

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
    return tube;
}

function createCatwalk(a, b, color = 0x6cf9ff, spaceRoot, halfWidth = 0.08) {
    const deckY = 0.63 + 0.025;
    const aFlat = a.clone(); aFlat.y = deckY;
    const bFlat = b.clone(); bFlat.y = deckY;

    const dir = new THREE.Vector3().subVectors(bFlat, aFlat);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(aFlat, bFlat).multiplyScalar(0.5);

    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(halfWidth * 2, 0.05, len),
        new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: color, emissiveIntensity: 0.35 })
    );
    beam.position.copy(mid);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
    beam.quaternion.copy(quat);
    spaceRoot.add(beam);

    if (ENABLE_SIDE_RAILS) {
        const railGeom = new THREE.BoxGeometry(SIDE_RAIL_THICKNESS, SIDE_RAIL_THICKNESS, len);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: SIDE_RAIL_COLOR, emissiveIntensity: 0.4 });
        const offL = new THREE.Vector3(SIDE_RAIL_OFFSET, SIDE_RAIL_HEIGHT, 0).applyQuaternion(beam.quaternion);
        const railL = new THREE.Mesh(railGeom, railMat);
        railL.position.copy(beam.position).add(offL);
        railL.quaternion.copy(beam.quaternion);
        spaceRoot.add(railL);
        const offR = new THREE.Vector3(-SIDE_RAIL_OFFSET, SIDE_RAIL_HEIGHT, 0).applyQuaternion(beam.quaternion);
        const railR = new THREE.Mesh(railGeom, railMat);
        railR.position.copy(beam.position).add(offR);
        railR.quaternion.copy(beam.quaternion);
        spaceRoot.add(railR);
    }

    const colW = Math.max(halfWidth * 2.5, 0.36);
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

function createStaticPad(center, size, color = 0x6cf9ff, spaceRoot, options = {}) {
    const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0b141c, metalness: 0.8, roughness: 0.2, emissive: color, emissiveIntensity: 0.35 });
    const pad = new THREE.Mesh(geom, mat);
    pad.position.copy(center);
    if (options.quaternion) pad.quaternion.copy(options.quaternion);
    spaceRoot.add(pad);

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
