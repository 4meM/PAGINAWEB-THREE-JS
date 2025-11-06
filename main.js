/**
 * MAIN.JS - Punto de entrada de la aplicación
 * Arquitectura Modular Escalable inspirada en Atomic Design
 */

import { Engine } from './src/core/Engine.js';
import { InputManager } from './src/core/InputManager.js';
import { PlayerController } from './src/core/PlayerController.js';
import { SceneManager } from './src/scenes/SceneManager.js';
import { UIManager } from './src/ui/UIManager.js';
import { state } from './src/core/State.js';

class App {
    constructor() {
        this.engine = null;
        this.sceneManager = null;
        this.playerController = null;
        this.inputManager = null;
        this.uiManager = null;
    }

    async init() {
        console.log(' Initializing Application...');

        this.engine = new Engine();
        this.engine.init();

        this.sceneManager = new SceneManager(this.engine);

        this.inputManager = new InputManager(this.engine.getRenderer());
        this.playerController = new PlayerController(this.engine.getCamera(), this.sceneManager);

        this.uiManager = new UIManager();
        this.uiManager.init();

        const sceneData = await this.sceneManager.loadScene('main');

        if (sceneData.hubInfo) {
            const startY = sceneData.hubInfo.deckTopY + state.player.eyeHeight;
            this.playerController.initPosition(0, startY, 0.8);
        }

        this.engine.onUpdate((delta, elapsed) => this.update(delta, elapsed));

        // Escuchar evento de apertura de módulo de juego
        window.addEventListener('openGameModule', (e) => {
            this.uiManager.openGameModule(e.detail.moduleName);
        });

        // Escuchar evento de cierre de módulo de juego
        window.addEventListener('closeGameModule', () => {
            this.uiManager.closeGameModule();
        });

        // Desbloquear PlayerController cuando se cierra un módulo
        window.addEventListener('gameModuleClosed', () => {
            // Esperar un momento antes de permitir nuevas transiciones
            // Esto evita que se reactive inmediatamente al cerrar
            setTimeout(() => {
                this.playerController.isTransitioning = false;
            }, 500);
        });

        console.log('✓ Application initialized!');
        this.engine.start();
    }

    update(delta, elapsed) {
        this.playerController.update(delta);
        this.sceneManager.update(delta, elapsed);
        this.uiManager.update();
    }
}

const app = new App();
app.init();
