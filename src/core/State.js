/**
 * Estado Global de la Aplicación
 * Centraliza todo el estado mutable para evitar dispersión
 */

export const state = {
    // Player state
    player: {
        position: { x: 0, y: 5, z: 0.8 },
        velocity: { x: 0, y: 0, z: 0 },
        radius: 0.4,
        eyeHeight: 1.6,
        velY: 0,
        onGround: true,
        gravity: 18,
        jumpSpeed: 7.5,
        baseSpeed: 6
    },

    // Camera state
    camera: {
        yaw: 0,
        pitch: 0,
        sensitivity: 0.0025,
        maxPitch: Math.PI / 2 - 0.01
    },

    // Input state
    input: {
        keys: {
            w: false, a: false, s: false, d: false,
            q: false, e: false, shift: false, space: false
        },
        mouse: {
            x: 0, y: 0,
            isDown: false,
            lastX: 0, lastY: 0
        },
        jumpQueued: false
    },

    // UI state
    ui: {
        pointerLocked: false,
        activeSection: null,
        isTransitioning: false,
        mode: 'space', // 'space' | 'interior'
        hoveredPortal: null
    },

    // Scene state
    scene: {
        currentScene: 'main',
        spaceGrounds: [], // Meshes que soportan al jugador
        portals: [],
        mixers: [] // Animation mixers para GLTF
    },

    // Game state
    game: {
        clock: null,
        lastCamPos: null
    }
};

/**
 * Métodos para actualizar el estado de forma controlada
 */
export const mutations = {
    setPlayerPosition(x, y, z) {
        state.player.position = { x, y, z };
    },

    setPointerLock(locked) {
        state.ui.pointerLocked = locked;
    },

    setActiveSection(section) {
        state.ui.activeSection = section;
    },

    addSpaceGround(mesh) {
        state.scene.spaceGrounds.push(mesh);
    },

    addPortal(portal) {
        state.scene.portals.push(portal);
    },

    addMixer(mixer) {
        state.scene.mixers.push(mixer);
    },

    queueJump() {
        state.input.jumpQueued = true;
    },

    consumeJump() {
        state.input.jumpQueued = false;
    },

    updateCameraRotation(yaw, pitch) {
        state.camera.yaw = yaw;
        state.camera.pitch = Math.max(
            -state.camera.maxPitch,
            Math.min(state.camera.maxPitch, pitch)
        );
    }
};
