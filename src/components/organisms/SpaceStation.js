/**
 * ORGANISM: SpaceStation
 * Construye la estación espacial completa usando moléculas
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { Portal } from '../molecules/Portal.js';
import { StationHub } from '../molecules/StationHub.js';
import { Catwalk } from '../molecules/Catwalk.js';
import { StationPad } from '../molecules/StationPad.js';
import { createStrut } from '../atoms/Primitives.js';
import { mutations } from '../../core/State.js';
import { MODULE_DEFINITIONS, HUB_CONFIG, STATION_CONFIG } from '../../config/moduleConfig.js';

export class SpaceStation {
    constructor() {
        this.group = new THREE.Group();
        this.hub = null;
        this.portals = [];
        this.catwalks = [];
        this.pads = [];
        this.struts = [];
        
        // Usar configuración externa
        this.moduleDefinitions = MODULE_DEFINITIONS;
        this.config = STATION_CONFIG;
    }

    build() {
        // Hub central (desde configuración)
        const hubPos = new THREE.Vector3(
            HUB_CONFIG.position.x,
            HUB_CONFIG.position.y,
            HUB_CONFIG.position.z
        );
        this.hub = new StationHub(HUB_CONFIG.name, hubPos, HUB_CONFIG.color);
        this.group.add(this.hub.getGroup());

        const R = this.config.portalRadius; // Radio de los portales
        const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

        // Construir cada módulo con su portal
        for (let i = 0; i < this.moduleDefinitions.length; i++) {
            const def = this.moduleDefinitions[i];
            const ang = angles[i];
            const pos = new THREE.Vector3(Math.cos(ang) * R, 0, Math.sin(ang) * R);

            // Crear portal
            const facing = new THREE.Vector3()
                .subVectors(new THREE.Vector3(0, 0, 0), pos)
                .normalize();
            const portalPos = pos.clone().add(facing.clone().multiplyScalar(4.2));
            
            const portal = new Portal(def.name, portalPos, facing, def.color, def.model);
            portal.group.position.y = 1.6; // Altura del ojo del jugador
            this.portals.push(portal);
            this.group.add(portal.getGroup());
            mutations.addPortal(portal);

            // Strut desde el hub al módulo
            const strut = createStrut(
                new THREE.Vector3(0, 0, 0),
                pos,
                0x3bd3ff
            );
            this.struts.push(strut);
            this.group.add(strut);

            // Catwalk desde el hub al portal (usando config)
            const from = new THREE.Vector3(
                Math.cos(ang) * 6.8,
                0.63,
                Math.sin(ang) * 6.8
            );
            const to = portalPos.clone();
            
            const catwalk = new Catwalk(from, to, this.config.catwalkColor);
            this.catwalks.push(catwalk);
            this.group.add(catwalk.getGroup());

            // Extensión de seguridad más allá del portal
            const beyond = to.clone().add(facing.clone().multiplyScalar(2.2));
            const extCatwalk = new Catwalk(to, beyond, this.config.catwalkColor, 0.08);
            this.catwalks.push(extCatwalk);
            this.group.add(extCatwalk.getGroup());

            // Plataformas de salto a lo largo del camino
            this.createJumpingPads(from, to, ang);

            // Plataforma de aterrizaje grande cerca del portal
            this.createLandingPad(to, facing);
        }

        console.log('✓ SpaceStation built successfully');
    }

    createJumpingPads(from, to, angle) {
        const deckY = 0.63 + 0.025;
        const fromFlat = from.clone();
        fromFlat.y = deckY;
        const toFlat = to.clone();
        toFlat.y = deckY;

        const pathDir = new THREE.Vector3()
            .subVectors(toFlat, fromFlat)
            .normalize();
        const pathQuat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            pathDir
        );

        const padSize = new THREE.Vector3(1.6, 0.08, 1.4);
        const catwalkTopY = deckY + 0.03;
        const padColHalfY = (padSize.y + 0.02) * 0.5;
        const padCenterY = catwalkTopY - padColHalfY;

        const padSteps = [0.33, 0.62, 0.78];
        
        for (const s of padSteps) {
            const pos = fromFlat.clone().lerp(toFlat, s);
            pos.y = padCenterY;
            
            const pad = new StationPad(pos, padSize, 0x6cf9ff, {
                quaternion: pathQuat,
                centerY: padCenterY
            });
            this.pads.push(pad);
            this.group.add(pad.getGroup());
        }
    }

    createLandingPad(portalPos, facing) {
        const deckY = 0.63 + 0.025;
        const catwalkTopY = deckY + 0.03;
        
        const landSize = new THREE.Vector3(6.5, 0.08, 3.8);
        const landColHalfY = (landSize.y + 0.02) * 0.5;
        const landCenterY = catwalkTopY - landColHalfY;
        
        const landOffset = (landSize.z * 0.5) + 0.3;
        const landCenter = portalPos.clone();
        landCenter.y = deckY;
        landCenter.add(facing.clone().multiplyScalar(landOffset));
        landCenter.y = landCenterY;

        const pathDir = facing.clone();
        const pathQuat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            pathDir
        );

        const pad = new StationPad(landCenter, landSize, 0x6cf9ff, {
            quaternion: pathQuat
        });
        this.pads.push(pad);
        this.group.add(pad.getGroup());
    }

    update(elapsed) {
        // Actualizar portales (animaciones, etc.)
        this.portals.forEach(portal => portal.update(elapsed));
    }

    getGroup() {
        return this.group;
    }

    getHubInfo() {
        return this.hub ? this.hub.getHubInfo() : null;
    }

    getPortals() {
        return this.portals;
    }
}
