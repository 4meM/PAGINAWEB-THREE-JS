/**
 * MOLECULE: StationPad (Plataforma Estática)
 * Plataformas de apoyo para parkour
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { mutations } from '../../core/State.js';

export class StationPad {
    constructor(center, size, color = 0x6cf9ff, options = {}) {
        this.center = center;
        this.size = size;
        this.color = color;
        this.options = options;
        
        this.group = new THREE.Group();
        this.pad = null;
        this.collider = null;
        
        this.build();
    }

    build() {
        // Plataforma visible
        const geom = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x0b141c,
            metalness: 0.8,
            roughness: 0.2,
            emissive: this.color,
            emissiveIntensity: 0.35
        });
        
        this.pad = new THREE.Mesh(geom, mat);
        this.pad.position.copy(this.center);
        
        if (this.options.quaternion) {
            this.pad.quaternion.copy(this.options.quaternion);
        }
        
        this.group.add(this.pad);

        // Colisionador invisible más grande
        const col = new THREE.Mesh(
            new THREE.BoxGeometry(
                this.size.x * 1.4,
                this.size.y + 0.02,
                this.size.z * 1.4
            ),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        col.position.copy(this.center);
        
        if (this.options.quaternion) {
            col.quaternion.copy(this.options.quaternion);
        }
        
        this.group.add(col);
        this.collider = col;
        
        mutations.addSpaceGround(col);
    }

    getGroup() {
        return this.group;
    }
}
