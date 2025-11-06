/**
 * SCENE: GameScene
 * Escena secundaria que se carga al atravesar el portal "Juego"
 * Contiene un nuevo hub con módulos: Jugabilidad, Progreso, Equipo
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GameStation } from '../components/organisms/GameStation.js';
import { createStarfield } from '../components/atoms/Primitives.js';

export class GameScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.name = 'game';
        this.gameStation = null;
        this.starfield = null;
        this.lights = []; // Array para guardar las luces
    }

    async load() {
        console.log('Loading GameScene...');
        
        // Crear campo de estrellas con colores rosados
        this.starfield = createStarfield(3000, 500, 0xff88dd);
        this.scene.add(this.starfield);

        // Construir la estación de juego
        this.gameStation = new GameStation();
        this.gameStation.build();
        this.scene.add(this.gameStation.getGroup());

        // Iluminación temática rosa/magenta
        this.setupLights();

        console.log('✓ GameScene loaded');
        
        return {
            hubInfo: this.gameStation.getHubInfo(),
            portals: this.gameStation.getPortals()
        };
    }

    setupLights() {
        // Luz ambiental rosada
        const ambientLight = new THREE.AmbientLight(0xff66cc, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Luces direccionales con tono magenta
        const dirLight1 = new THREE.DirectionalLight(0xff99dd, 0.8);
        dirLight1.position.set(10, 20, 10);
        this.scene.add(dirLight1);
        this.lights.push(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xaa66ff, 0.4);
        dirLight2.position.set(-10, 10, -10);
        this.scene.add(dirLight2);
        this.lights.push(dirLight2);

        // Luz de relleno suave
        const fillLight = new THREE.HemisphereLight(0xff88dd, 0x4422aa, 0.5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
    }

    unload() {
        console.log('Unloading GameScene...');
        
        // Ocultar starfield
        if (this.starfield) {
            this.starfield.visible = false;
        }

        // Ocultar estación
        if (this.gameStation) {
            this.gameStation.getGroup().visible = false;
        }

        // Ocultar todas las luces de esta escena
        this.lights.forEach(light => light.visible = false);

        console.log('✓ GameScene unloaded');
    }

    /**
     * Reactiva la escena cuando se vuelve a cargar desde el caché
     */
    async activate() {
        if (this.starfield) {
            this.starfield.visible = true;
        }

        if (this.gameStation) {
            this.gameStation.getGroup().visible = true;
            // Cargar los modelos de los portales si aún no están cargados
            await this.gameStation.loadPortalModels();
        }

        // Mostrar todas las luces de esta escena
        this.lights.forEach(light => light.visible = true);
    }

    update(elapsed) {
        if (this.starfield) {
            this.starfield.rotation.y += 0.00005;
        }

        if (this.gameStation) {
            this.gameStation.update(elapsed);
        }
    }

    getStationInfo() {
        return this.gameStation ? this.gameStation.getHubInfo() : null;
    }
}
