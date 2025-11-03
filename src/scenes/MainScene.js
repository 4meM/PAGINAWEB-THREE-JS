/**
 * MainScene: Escena principal de la estación espacial
 * Define y construye todo lo que aparece en la escena del hub
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { SpaceStation } from '../components/organisms/SpaceStation.js';
import { createStarfield } from '../components/atoms/Primitives.js';

export class MainScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        
        this.spaceRoot = new THREE.Group();
        this.starfield = null;
        this.station = null;
        this.lights = [];
    }

    async load() {
        console.log('Loading MainScene...');
        
        // Configurar fog para profundidad espacial
        this.scene.fog.density = 0.006;

        // Añadir el grupo raíz del espacio
        this.scene.add(this.spaceRoot);

        // Crear campo de estrellas
        this.starfield = createStarfield();
        this.spaceRoot.add(this.starfield);

        // Iluminación
        this.setupLights();

        // Construir la estación espacial
        this.station = new SpaceStation();
        this.station.build();
        this.spaceRoot.add(this.station.getGroup());

        console.log('✓ MainScene loaded');
        
        return {
            hubInfo: this.station.getHubInfo(),
            portals: this.station.getPortals()
        };
    }

    setupLights() {
        // Luz hemisférica para ambiente general
        const hemi = new THREE.HemisphereLight(0x4ac6ff, 0x0a0a12, 0.8);
        this.scene.add(hemi);
        this.lights.push(hemi);

        // Luz direccional principal
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        keyLight.position.set(5, 10, 8);
        keyLight.castShadow = false;
        this.scene.add(keyLight);
        this.lights.push(keyLight);

        // Luz de realce (rim light)
        const rimLight = new THREE.PointLight(0x00eaff, 1.2, 50);
        rimLight.position.set(-6, 4, 6);
        this.scene.add(rimLight);
        this.lights.push(rimLight);
    }

    update(delta, elapsed) {
        // Rotación sutil del campo de estrellas
        if (this.starfield) {
            this.starfield.rotation.x += 0.00012;
            this.starfield.rotation.y += 0.00022;

            // Parpadeo sutil de las estrellas
            const mats = this.starfield.userData?.materials;
            if (mats && mats.length) {
                const base1 = 0.70, base2 = 0.85;
                if (mats[0]) mats[0].opacity = base1 + Math.sin(elapsed * 0.6) * 0.06;
                if (mats[1]) mats[1].opacity = base2 + Math.cos(elapsed * 0.8) * 0.06;
            }
        }

        // Actualizar la estación
        if (this.station) {
            this.station.update(elapsed);
        }
    }

    unload() {
        // Limpiar recursos cuando se cambie de escena
        this.scene.remove(this.spaceRoot);
        console.log('MainScene unloaded');
    }

    getStation() {
        return this.station;
    }
}
