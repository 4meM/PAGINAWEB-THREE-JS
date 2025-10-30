import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { juegoContent, getYouTubeThumbnail } from './juegoContent.js';
import { PortalComponent } from './PortalComponent.js';
import { createContentGrid } from './ContentPanelComponent.js';
import { openYouTubeOverlay } from './YouTubeOverlay.js';

export function addJuego(root, { addColliderFromMesh, createTextSprite, registerInteractive, THREE }) {
    console.log('🎮 Inicializando módulo Juego...');
    
    const grouped = {};
    (juegoContent || []).forEach(item => {
        const section = item.section || 'development';
        grouped[section] = grouped[section] || [];
        grouped[section].push(item);
    });

    const ideaItems = grouped.idea || [];
    const pruebasItems = grouped.pruebas || [];
    const developmentItems = grouped.development || [];

    const ideaContentGroup = new THREE.Group();
    const ideaGrid = createContentGrid(ideaItems, createTextSprite, registerInteractive, getYouTubeThumbnail, openYouTubeOverlay, 2);
    ideaGrid.position.set(0, 0, -6);
    ideaContentGroup.add(ideaGrid);
    const ideaTitle = createTextSprite('💡 Idea — Concepto Inicial');
    ideaTitle.position.set(0, 3.2, -4);
    ideaTitle.scale.set(3.5, 1.2, 1);
    ideaContentGroup.add(ideaTitle);
    ideaContentGroup.visible = false;
    root.add(ideaContentGroup);

    const pruebasContentGroup = new THREE.Group();
    const pruebasGrid = createContentGrid(pruebasItems, createTextSprite, registerInteractive, getYouTubeThumbnail, openYouTubeOverlay, 2);
    pruebasGrid.position.set(0, 0, -6);
    pruebasContentGroup.add(pruebasGrid);
    const pruebasTitle = createTextSprite('🧪 Pruebas — Validación');
    pruebasTitle.position.set(0, 3.2, -4);
    pruebasTitle.scale.set(3.5, 1.2, 1);
    pruebasContentGroup.add(pruebasTitle);
    pruebasContentGroup.visible = false;
    root.add(pruebasContentGroup);

    const desarrolloContentGroup = new THREE.Group();
    const desarrolloGrid = createContentGrid(developmentItems, createTextSprite, registerInteractive, getYouTubeThumbnail, openYouTubeOverlay, 3);
    desarrolloGrid.position.set(0, 0, -6);
    desarrolloContentGroup.add(desarrolloGrid);
    const desarrolloTitle = createTextSprite('🚀 Desarrollo — Implementación');
    desarrolloTitle.position.set(0, 3.2, -4);
    desarrolloTitle.scale.set(4, 1.3, 1);
    desarrolloContentGroup.add(desarrolloTitle);
    desarrolloContentGroup.visible = false;
    root.add(desarrolloContentGroup);

    const contentGroups = [ideaContentGroup, pruebasContentGroup, desarrolloContentGroup];

    function showContent(contentGroup) {
        console.log('🚪 Mostrando contenido...');
        portals.forEach(p => p.setVisible(false));
        welcomeLabel.visible = false;
        contentGroups.forEach(g => g.visible = false);
        contentGroup.visible = true;
        backButton.visible = true;
    }

    function showPortals() {
        console.log('🏠 Volviendo a portales...');
        portals.forEach(p => p.setVisible(true));
        welcomeLabel.visible = true;
        contentGroups.forEach(g => g.visible = false);
        backButton.visible = false;
    }

    const portals = [];

    const ideaPortal = new PortalComponent({
        name: 'idea',
        position: new THREE.Vector3(-6.6, 1.6, -3),
        rotation: Math.PI / 2,
        color: 0xFFD700,
        label: '💡 Idea',
        onClick: () => showContent(ideaContentGroup)
    });
    ideaPortal.addToScene(root);
    ideaPortal.createLabel(createTextSprite);
    ideaPortal.registerInteraction(registerInteractive);
    portals.push(ideaPortal);

    const pruebasPortal = new PortalComponent({
        name: 'pruebas',
        position: new THREE.Vector3(6.6, 1.6, -3),
        rotation: -Math.PI / 2,
        color: 0xFF4D8B,
        label: '🧪 Pruebas',
        onClick: () => showContent(pruebasContentGroup)
    });
    pruebasPortal.addToScene(root);
    pruebasPortal.createLabel(createTextSprite);
    pruebasPortal.registerInteraction(registerInteractive);
    portals.push(pruebasPortal);

    const desarrolloPortal = new PortalComponent({
        name: 'desarrollo',
        position: new THREE.Vector3(0, 1.6, -8.6),
        rotation: 0,
        color: 0x3A86FF,
        label: '🚀 Desarrollo',
        onClick: () => showContent(desarrolloContentGroup)
    });
    desarrolloPortal.addToScene(root);
    desarrolloPortal.createLabel(createTextSprite);
    desarrolloPortal.registerInteraction(registerInteractive);
    portals.push(desarrolloPortal);

    console.log(`✅ ${portals.length} portales creados`);

    const welcomeLabel = createTextSprite('🎮 Atraviesa un portal');
    welcomeLabel.position.set(0, 2.8, -3);
    welcomeLabel.scale.set(3.8, 1.2, 1);
    root.add(welcomeLabel);

    // Sistema de detección de colisión con portales
    let lastCameraPos = null;
    function updatePortalCollisions(camera) {
        if (!camera || contentGroups.some(g => g.visible)) return; // No detectar si ya está en contenido
        
        const currentPos = camera.position.clone();
        if (!lastCameraPos) {
            lastCameraPos = currentPos.clone();
            return;
        }

        portals.forEach(portal => {
            if (!portal.group || !portal.group.visible) return;
            
            const portalPos = portal.group.position;
            const portalNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(portal.group.quaternion);
            
            // Distancia al plano del portal
            const prevDist = portalNormal.dot(new THREE.Vector3().subVectors(lastCameraPos, portalPos));
            const currDist = portalNormal.dot(new THREE.Vector3().subVectors(currentPos, portalPos));
            
            // Radio de activación del portal
            const activationRadius = 1.5;
            const horizontalDist = new THREE.Vector2(
                currentPos.x - portalPos.x,
                currentPos.y - portalPos.y
            ).length();
            
            // Detectar cruce del plano o proximidad muy cercana
            const crossed = prevDist > 0 && currDist <= 0;
            const veryClose = Math.abs(currDist) < 0.3;
            
            if (horizontalDist <= activationRadius && (crossed || veryClose)) {
                console.log(`🚪 Portal ${portal.name} atravesado!`);
                if (portal.onClick) {
                    portal.onClick();
                }
            }
        });
        
        lastCameraPos = currentPos.clone();
    }

    // Exponer función de actualización para que main.js la llame
    root.userData.updateJuegoPortals = updatePortalCollisions;

    const backButton = new THREE.Group();
    const backBtnMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.7, 0.1),
        new THREE.MeshStandardMaterial({
            color: 0xE63946,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0xE63946,
            emissiveIntensity: 0.4
        })
    );
    backButton.add(backBtnMesh);
    
    const backLabel = createTextSprite('← Volver');
    backLabel.position.set(0, 0, 0.06);
    backLabel.scale.set(1.4, 0.55, 1);
    backButton.add(backLabel);
    
    backButton.position.set(-5.5, 2.8, -3);
    backButton.visible = false;
    
    const backHitBox = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.7),
        new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    backHitBox.position.z = 0.06;
    backButton.add(backHitBox);
    
    if (registerInteractive) {
        registerInteractive(backHitBox, showPortals);
    }
    
    root.add(backButton);
    console.log('✅ Módulo Juego inicializado');
}
