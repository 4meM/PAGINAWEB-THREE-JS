/**
 * ORGANISM: GameStation
 * Estación que aparece en la escena de juego con los módulos: Jugabilidad, Progreso, Equipo
 * Incluye un portal de salida para volver a la escena principal
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { Portal } from '../molecules/Portal.js';
import { StationHub } from '../molecules/StationHub.js';
import { Catwalk } from '../molecules/Catwalk.js';
import { StationPad } from '../molecules/StationPad.js';
import { createStrut } from '../atoms/Primitives.js';
import { mutations } from '../../core/State.js';
import { GAME_MODULE_DEFINITIONS, GAME_HUB_CONFIG, GAME_STATION_CONFIG } from '../../config/gameModulesConfig.js';

export class GameStation {
    constructor() {
        this.group = new THREE.Group();
        this.hub = null;
        this.portals = [];
        this.catwalks = [];
        this.pads = [];
        this.struts = [];
        this.exitPortal = null;
        
        this.moduleDefinitions = GAME_MODULE_DEFINITIONS;
        this.config = GAME_STATION_CONFIG;
    }

    build() {
        // Hub central
        const hubPos = new THREE.Vector3(
            GAME_HUB_CONFIG.position.x,
            GAME_HUB_CONFIG.position.y,
            GAME_HUB_CONFIG.position.z
        );
        this.hub = new StationHub(GAME_HUB_CONFIG.name, hubPos, GAME_HUB_CONFIG.color);
        this.group.add(this.hub.getGroup());

        const R = this.config.portalRadius;
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
            portal.group.position.y = 1.6;
            this.portals.push(portal);
            this.group.add(portal.getGroup());
            mutations.addPortal(portal);

            // Strut desde el hub al módulo
            const strut = createStrut(
                new THREE.Vector3(0, 0, 0),
                pos,
                this.config.strutColor
            );
            this.struts.push(strut);
            this.group.add(strut);

            // Catwalk desde el hub al portal
            const from = new THREE.Vector3(
                Math.cos(ang) * 6.8,
                0.63,
                Math.sin(ang) * 6.8
            );
            const to = portalPos.clone();
            
            const catwalk = new Catwalk(from, to, this.config.catwalkColor);
            this.catwalks.push(catwalk);
            this.group.add(catwalk.getGroup());

            // Extensión de seguridad
            const beyond = to.clone().add(facing.clone().multiplyScalar(2.2));
            const extCatwalk = new Catwalk(to, beyond, this.config.catwalkColor, 0.08);
            this.catwalks.push(extCatwalk);
            this.group.add(extCatwalk.getGroup());

            // Plataformas de salto
            this.createJumpingPads(from, to, ang);

            // Plataforma de aterrizaje
            this.createLandingPad(to, facing);
        }

        // PORTAL DE SALIDA (180 grados desde el primer portal)
        const exitAngle = Math.PI;
        const exitPos = new THREE.Vector3(Math.cos(exitAngle) * R, 0, Math.sin(exitAngle) * R);
        const exitFacing = new THREE.Vector3()
            .subVectors(new THREE.Vector3(0, 0, 0), exitPos)
            .normalize();
        const exitPortalPos = exitPos.clone().add(exitFacing.clone().multiplyScalar(4.2));
        
        this.exitPortal = new Portal(
            'Salir',
            exitPortalPos,
            exitFacing,
            0xffaa00, // Color naranja
            {
                url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb',
                scale: 2.0,
                center: true,
                yaw: 0,
                yOffset: 1.0
            }
        );
        this.exitPortal.group.position.y = 1.6;
        this.exitPortal.isExitPortal = true; // Marcar como portal de salida
        this.portals.push(this.exitPortal);
        this.group.add(this.exitPortal.getGroup());
        mutations.addPortal(this.exitPortal);

        // Strut y catwalk para el portal de salida
        const exitStrut = createStrut(
            new THREE.Vector3(0, 0, 0),
            exitPos,
            0xffaa00
        );
        this.struts.push(exitStrut);
        this.group.add(exitStrut);

        const exitFrom = new THREE.Vector3(
            Math.cos(exitAngle) * 6.8,
            0.63,
            Math.sin(exitAngle) * 6.8
        );
        const exitTo = exitPortalPos.clone();
        
        const exitCatwalk = new Catwalk(exitFrom, exitTo, 0xffaa00);
        this.catwalks.push(exitCatwalk);
        this.group.add(exitCatwalk.getGroup());

        const exitBeyond = exitTo.clone().add(exitFacing.clone().multiplyScalar(2.2));
        const exitExtCatwalk = new Catwalk(exitTo, exitBeyond, 0xffaa00, 0.08);
        this.catwalks.push(exitExtCatwalk);
        this.group.add(exitExtCatwalk.getGroup());

        this.createJumpingPads(exitFrom, exitTo, exitAngle);
        this.createLandingPad(exitTo, exitFacing);

        console.log('✓ GameStation built successfully');
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
            
            const pad = new StationPad(pos, padSize, this.config.catwalkColor, {
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

        const pad = new StationPad(landCenter, landSize, this.config.catwalkColor, {
            quaternion: pathQuat
        });
        this.pads.push(pad);
        this.group.add(pad.getGroup());
    }

    update(elapsed) {
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

    getExitPortal() {
        return this.exitPortal;
    }

    /**
     * Carga explícitamente los modelos de todos los portales
     * Se llama cuando la escena se activa por primera vez
     */
    async loadPortalModels() {
        console.log('GameStation: Loading portal models...');
        
        // BUG FIX: Re-agregar portales al estado global cuando se reactiva la escena
        this.portals.forEach(portal => {
            mutations.addPortal(portal);
        });
        
        const loadPromises = this.portals.map(portal => {
            if (portal.modelConfig && (portal.modelConfig.url || portal.modelConfig.modelUrl)) {
                return portal.loadModel();
            }
            return Promise.resolve();
        });
        
        await Promise.all(loadPromises);
        console.log('✓ GameStation: All portal models loaded');
    }
}
