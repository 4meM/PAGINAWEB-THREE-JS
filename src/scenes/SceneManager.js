/**
 * SceneManager: Orquestador de Escenas
 * Maneja la carga, descarga y transición entre diferentes escenas
 * Esto permite escalar la aplicación con múltiples "mundos" o secciones
 */

import { MainScene } from './MainScene.js';
import { GameScene } from './GameScene.js';
import { state } from '../core/State.js';

export class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.currentScene = null;
        this.currentSceneName = null;
        this.scenes = new Map();
        this.sceneInstances = new Map(); // Instancias de escenas para reutilizar
        
        // Registrar escenas disponibles
        this.registerScene('main', MainScene);
        this.registerScene('game', GameScene);
    }

    registerScene(name, SceneClass) {
        this.scenes.set(name, SceneClass);
    }

    async loadScene(sceneName, ...args) {
        console.log(`SceneManager: Loading scene "${sceneName}"`);

        // Si ya estamos en esta escena, no hacer nada
        if (this.currentSceneName === sceneName && this.currentScene) {
            console.log(`Already in scene "${sceneName}"`);
            return this.getSceneData();
        }

        // Ocultar escena actual si existe
        if (this.currentScene) {
            this.currentScene.unload();
        }

        // Verificar si ya existe una instancia de esta escena
        let sceneInstance = this.sceneInstances.get(sceneName);
        
        if (sceneInstance) {
            // Reutilizar instancia existente
            console.log(`Reusing existing instance of scene "${sceneName}"`);
            this.currentScene = sceneInstance;
            
            // Reactivar la escena
            if (sceneInstance.activate) {
                await sceneInstance.activate();
            }
        } else {
            // Crear nueva instancia solo si no existe
            const SceneClass = this.scenes.get(sceneName);
            if (!SceneClass) {
                throw new Error(`Scene "${sceneName}" not found`);
            }

            console.log(`Creating new instance of scene "${sceneName}"`);
            sceneInstance = new SceneClass(this.engine, ...args);
            await sceneInstance.load();
            
            // Guardar instancia para reutilizar después
            this.sceneInstances.set(sceneName, sceneInstance);
            this.currentScene = sceneInstance;
        }

        // Actualizar el estado global
        this.currentSceneName = sceneName;
        state.scene.currentScene = sceneName;

        console.log(`✓ Scene "${sceneName}" loaded successfully`);
        
        return this.getSceneData();
    }

    getSceneData() {
        if (!this.currentScene) {
            return { hubInfo: null, portals: [] };
        }

        return {
            hubInfo: this.currentScene.getStationInfo?.() || 
                     this.currentScene.station?.getHubInfo?.() || 
                     this.currentScene.spaceStation?.getHubInfo?.() ||
                     null,
            portals: this.currentScene.gameStation?.getPortals?.() || 
                     this.currentScene.station?.getPortals?.() ||
                     this.currentScene.spaceStation?.getPortals?.() || 
                     []
        };
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
