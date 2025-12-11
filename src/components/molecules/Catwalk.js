/**
 * MOLECULE: Catwalk (Pasarela)
 * Una pasarela horizontal que conecta dos puntos con colisionadores
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { mutations } from '../../core/State.js';

const ENABLE_SIDE_RAILS = true;
const SIDE_RAIL_OFFSET = 0.6;
const SIDE_RAIL_HEIGHT = 0.08;
const SIDE_RAIL_THICKNESS = 0.02;
const SIDE_RAIL_COLOR = 0x6cf9ff;

export class Catwalk {
    constructor(pointA, pointB, color = 0x6cf9ff, halfWidth = 0.08) {
        this.pointA = pointA;
        this.pointB = pointB;
        this.color = color;
        this.halfWidth = halfWidth;
        
        this.group = new THREE.Group();
        this.beam = null;
        this.collider = null;
        this.rails = [];
        
        this.build();
    }

    build() {
        // Usar la altura promedio de los dos puntos
        const aFlat = this.pointA.clone();
        const bFlat = this.pointB.clone();

        const dir = new THREE.Vector3().subVectors(bFlat, aFlat);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(aFlat, bFlat).multiplyScalar(0.5);

        // Viga visible
        this.beam = new THREE.Mesh(
            new THREE.BoxGeometry(this.halfWidth * 2, 0.05, len),
            new THREE.MeshStandardMaterial({
                color: 0x0b141c,
                metalness: 0.8,
                roughness: 0.2,
                emissive: this.color,
                emissiveIntensity: 0.35
            })
        );
        this.beam.position.copy(mid);
        
        const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            dir.clone().normalize()
        );
        this.beam.quaternion.copy(quat);
        this.group.add(this.beam);

        // Rieles laterales opcionales
        if (ENABLE_SIDE_RAILS) {
            this.addSideRails(len, quat);
        }

        // Colisionador invisible más ancho
        const colW = Math.max(this.halfWidth * 2.5, 0.36);
        this.collider = new THREE.Mesh(
            new THREE.BoxGeometry(colW, 0.06, len),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.collider.position.copy(mid);
        this.collider.quaternion.copy(quat);
        this.group.add(this.collider);
        
        mutations.addSpaceGround(this.collider);
    }

    addSideRails(length, quaternion) {
        const railGeom = new THREE.BoxGeometry(
            SIDE_RAIL_THICKNESS,
            SIDE_RAIL_THICKNESS,
            length
        );
        const railMat = new THREE.MeshStandardMaterial({
            color: 0x0b141c,
            metalness: 0.8,
            roughness: 0.2,
            emissive: SIDE_RAIL_COLOR,
            emissiveIntensity: 0.4
        });

        // Riel izquierdo
        const offL = new THREE.Vector3(SIDE_RAIL_OFFSET, SIDE_RAIL_HEIGHT, 0)
            .applyQuaternion(quaternion);
        const railL = new THREE.Mesh(railGeom, railMat);
        railL.position.copy(this.beam.position).add(offL);
        railL.quaternion.copy(quaternion);
        this.group.add(railL);
        this.rails.push(railL);

        // Riel derecho
        const offR = new THREE.Vector3(-SIDE_RAIL_OFFSET, SIDE_RAIL_HEIGHT, 0)
            .applyQuaternion(quaternion);
        const railR = new THREE.Mesh(railGeom, railMat.clone());
        railR.position.copy(this.beam.position).add(offR);
        railR.quaternion.copy(quaternion);
        this.group.add(railR);
        this.rails.push(railR);
    }

    getGroup() {
        return this.group;
    }
}
