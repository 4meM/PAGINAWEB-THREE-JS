/**
 * MOLECULE: StationHub (Núcleo de la Estación)
 * El hub central donde el jugador comienza
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { createTextSprite } from '../atoms/Primitives.js';
import { mutations } from '../../core/State.js';

export class StationHub {
    constructor(name, position, color) {
        this.name = name;
        this.position = position;
        this.color = color;
        
        this.group = new THREE.Group();
        this.deck = null;
        this.mast = null;
        this.label = null;
        
        this.build();
    }

    build() {
        this.group.position.copy(this.position);

        // Base cilíndrica
        const base = new THREE.Group();
        const plinth = new THREE.Mesh(
            new THREE.CylinderGeometry(6.5, 6.5, 0.6, 48),
            new THREE.MeshStandardMaterial({
                color: 0x0e151c,
                metalness: 0.75,
                roughness: 0.35,
                emissive: 0x09202c,
                emissiveIntensity: 0.25
            })
        );
        plinth.position.y = 0.3;
        base.add(plinth);

        // Deck superior (soporta al jugador)
        this.deck = new THREE.Mesh(
            new THREE.CylinderGeometry(6.8, 6.8, 0.06, 64),
            new THREE.MeshStandardMaterial({
                color: 0x14202b,
                metalness: 0.8,
                roughness: 0.25,
                emissive: this.color,
                emissiveIntensity: 0.1
            })
        );
        this.deck.position.y = 0.63;
        base.add(this.deck);
        this.group.add(base);
        
        // Registrar el deck como superficie caminable
        mutations.addSpaceGround(this.deck);

        // Antena/mástil
        this.mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12),
            new THREE.MeshStandardMaterial({
                color: 0x89ecff,
                emissive: 0x2bd5ff,
                emissiveIntensity: 0.4,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        this.mast.position.y = 3.2;
        this.group.add(this.mast);

        // Etiqueta de texto
        this.label = createTextSprite(this.name);
        this.label.position.set(0, 3.8, 0);
        this.group.add(this.label);

        // Guardar información del hub para física
        this.group.userData.hub = {
            deckTopY: this.deck.position.y + 0.03,
            deckRadius: 6.8,
            mastRadius: 0.3
        };
    }

    getGroup() {
        return this.group;
    }

    getHubInfo() {
        return this.group.userData.hub;
    }
}
