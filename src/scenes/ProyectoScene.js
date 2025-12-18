/**
 * SCENE: ProyectoScene
 * Escena secundaria que se carga al atravesar el portal "Proyecto"
 * Contiene un nuevo hub con módulos: Momentos Interesantes, Necesidades, Entrevistas, Storyboard
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { ProyectoStation } from '../components/organisms/ProyectoStation.js';
import { createStarfield } from '../components/atoms/Primitives.js';

export class ProyectoScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.name = 'proyecto';
        this.proyectoStation = null;
        this.starfield = null;
        this.lights = [];
    }

    async load() {
        console.log('Cargando ProyectoScene...');
        
        // Crear campo de estrellas con colores azules
        this.starfield = createStarfield(3000, 500, 0x4a90e2);
        this.scene.add(this.starfield);

        // Construir la estación de proyecto
        this.proyectoStation = new ProyectoStation();
        this.proyectoStation.build();
        this.scene.add(this.proyectoStation.getGroup());

        // Iluminación temática azul
        this.setupLights();

        console.log('✓ ProyectoScene loaded');
        
        return {
            hubInfo: this.proyectoStation.getHubInfo(),
            portals: this.proyectoStation.getPortals()
        };
    }

    setupLights() {
        // Luz ambiental azulada
        const ambientLight = new THREE.AmbientLight(0x6699ff, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Luces direccionales con tono azul
        const dirLight1 = new THREE.DirectionalLight(0x4a90e2, 0.8);
        dirLight1.position.set(10, 20, 10);
        this.scene.add(dirLight1);
        this.lights.push(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x66aaff, 0.4);
        dirLight2.position.set(-10, 10, -10);
        this.scene.add(dirLight2);
        this.lights.push(dirLight2);

        // Luz de relleno suave
        const fillLight = new THREE.HemisphereLight(0x88bbff, 0x224488, 0.5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
    }

    unload() {
        console.log('Unloading ProyectoScene...');
        
        // Ocultar starfield
        if (this.starfield) {
            this.starfield.visible = false;
        }

        // Ocultar estación
        if (this.proyectoStation) {
            this.proyectoStation.getGroup().visible = false;
        }

        // Ocultar todas las luces de esta escena
        this.lights.forEach(light => {
            light.visible = false;
        });
    }

    activate() {
        console.log('Activating ProyectoScene...');
        
        // Mostrar starfield
        if (this.starfield) {
            this.starfield.visible = true;
        }

        // Mostrar estación
        if (this.proyectoStation) {
            this.proyectoStation.getGroup().visible = true;
        }

        // Mostrar todas las luces
        this.lights.forEach(light => {
            light.visible = true;
        });
    }

    update(delta, elapsed) {
        // Rotación del starfield
        if (this.starfield) {
            this.starfield.rotation.y += delta * 0.02;
        }
    }
}
