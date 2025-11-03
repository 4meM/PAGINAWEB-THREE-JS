/**
 * SceneManager: Orquestador de Escenas
 * Maneja la carga, descarga y transición entre diferentes escenas
 * Esto permite escalar la aplicación con múltiples "mundos" o secciones
 */

import { MainScene } from './MainScene.js';
import { state } from '../core/State.js';

export class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.currentScene = null;
        this.scenes = new Map();
        
        // Registrar escenas disponibles
        this.registerScene('main', MainScene);
        // En el futuro, puedes añadir más escenas aquí:
        // this.registerScene('interior', InteriorScene);
        // this.registerScene('game', GameScene);
    }

    registerScene(name, SceneClass) {
        this.scenes.set(name, SceneClass);
    }

    async loadScene(sceneName, ...args) {
        console.log(`SceneManager: Loading scene "${sceneName}"`);

        // Descargar escena actual si existe
        if (this.currentScene) {
            this.currentScene.unload();
        }

        // Verificar que la escena existe
        const SceneClass = this.scenes.get(sceneName);
        if (!SceneClass) {
            throw new Error(`Scene "${sceneName}" not found`);
        }

        // Crear e inicializar la nueva escena
        this.currentScene = new SceneClass(this.engine, ...args);
        const sceneData = await this.currentScene.load();

        // Actualizar el estado global
        state.scene.currentScene = sceneName;

        console.log(`✓ Scene "${sceneName}" loaded successfully`);
        
        return sceneData;
    }

    update(delta, elapsed) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(delta, elapsed);
        }
    }

    getCurrentScene() {
        return this.currentScene;
    }

    /**
     * Transición a otra escena con efecto de flash
     */
    async transitionTo(sceneName, ...args) {
        // Mostrar flash de transición
        const flashEl = document.getElementById('flash');
        if (flashEl) {
            flashEl.setAttribute('aria-hidden', 'false');
        }

        // Esperar un momento para el efecto visual
        await new Promise(resolve => setTimeout(resolve, 325));

        // Cargar la nueva escena
        const sceneData = await this.loadScene(sceneName, ...args);

        // Ocultar flash
        if (flashEl) {
            setTimeout(() => {
                flashEl.setAttribute('aria-hidden', 'true');
            }, 325);
        }

        return sceneData;
    }
}
