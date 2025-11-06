/**
 * Motor Principal de Three.js
 * Gestiona el renderer, la escena, la cámara y el bucle de animación
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { state } from './State.js';

export class Engine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.updateCallbacks = [];
        
        state.game.clock = this.clock;
    }

    init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initPostProcessing();
        this.setupResizeHandler();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x02040a, 0.02);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(
            state.player.position.x,
            state.player.position.y,
            state.player.position.z
        );
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.physicallyCorrectLights = true;
        document.body.appendChild(this.renderer.domElement);
    }

    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.55,
            0.3,
            0.9
        );
        this.composer.addPass(bloomPass);
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Registra una función que se ejecutará en cada frame
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * Bucle principal de animación
     */
    start() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            const delta = this.clock.getDelta();
            const elapsed = this.clock.elapsedTime;

            // Ejecutar todos los callbacks registrados
            this.updateCallbacks.forEach(callback => callback(delta, elapsed));

            // Actualizar animaciones de modelos GLTF
            state.scene.mixers.forEach(mixer => mixer.update(delta));

            // Renderizar
            this.composer.render();
        };

        animate();
    }

    getCamera() {
        return this.camera;
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }
}
