/**
 * Controlador del Jugador
 * Maneja el movimiento, física, colisiones y control de cámara en primera persona
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { state, mutations } from './State.js';

export class PlayerController {
    constructor(camera, sceneManager = null) {
        this.camera = camera;
        this.groundRay = new THREE.Raycaster();
        this.portalRay = new THREE.Raycaster(); // Raycaster para detectar portales
        this.lastCamPos = camera.position.clone();
        this.sceneManager = sceneManager;
        this.isTransitioning = false; // Flag para bloquear movimiento durante transiciones
    }

    /**
     * Actualiza el jugador cada frame
     */
    update(delta) {
        this.updateMovement(delta);
        this.updatePhysics(delta);
        this.updateCamera();
        this.checkPortalProximity();
        this.checkPortalTraversal(); // Nueva función para detectar atravesar portales
        
        this.lastCamPos.copy(this.camera.position);
    }

    updateMovement(delta) {
        // No permitir movimiento durante transiciones
        if (this.isTransitioning) {
            return;
        }
        
        const keys = state.input.keys;
        const speed = keys.shift ? state.player.baseSpeed * 1.8 : state.player.baseSpeed;
        
        // Calcular dirección de movimiento basada en yaw
        const forward = new THREE.Vector3(
            -Math.sin(state.camera.yaw),
            0,
            -Math.cos(state.camera.yaw)
        ).normalize();
        
        const right = new THREE.Vector3().crossVectors(
            forward,
            new THREE.Vector3(0, 1, 0)
        ).normalize();

        const moveDir = new THREE.Vector3();
        
        if (keys.w) moveDir.add(forward);
        if (keys.s) moveDir.sub(forward);
        if (keys.d) moveDir.add(right);
        if (keys.a) moveDir.sub(right);

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize().multiplyScalar(speed * delta);
            this.camera.position.x += moveDir.x;
            this.camera.position.z += moveDir.z;
        }
    }

    updatePhysics(delta) {
        // No aplicar física durante transiciones
        if (this.isTransitioning) {
            return;
        }
        
        // Gravedad
        if (!state.player.onGround) {
            state.player.velY -= state.player.gravity * delta;
        }

        // Salto sin restricciones - puedes saltar incluso en el aire
        if (state.input.jumpQueued) {
            state.player.velY = state.player.jumpSpeed;
            state.player.onGround = false;
        }
        
        // Consumir el salto SIEMPRE (haya saltado o no)
        mutations.consumeJump();

        // Aplicar velocidad vertical
        this.camera.position.y += state.player.velY * delta;

        // Detección de suelo
        this.checkGround();
        
        // Resetear si el jugador cae demasiado bajo
        if (this.camera.position.y < -50) {
            this.initPosition(0, 5, 0);
            console.log('Jugador reseteado al centro por caída');
        }
    }

    checkGround() {
        const rayOrigin = this.camera.position.clone();
        rayOrigin.y += 0.1; // Pequeño offset para evitar auto-colisión
        
        this.groundRay.set(rayOrigin, new THREE.Vector3(0, -1, 0));
        
        const intersects = this.groundRay.intersectObjects(
            state.scene.spaceGrounds,
            false
        );

        if (intersects.length > 0) {
            const dist = intersects[0].distance;
            const groundY = intersects[0].point.y;
            
            // Si estamos cerca del suelo o por debajo
            if (dist < state.player.eyeHeight + 0.2) {
                const targetY = groundY + state.player.eyeHeight;
                
                // Si estamos cayendo hacia el suelo
                if (this.camera.position.y <= targetY) {
                    this.camera.position.y = targetY;
                    state.player.velY = 0;
                    state.player.onGround = true;
                    return;
                }
            }
        }
        
        // No hay suelo debajo
        state.player.onGround = false;
    }

    updateCamera() {
        // Aplicar rotación de yaw y pitch a la cámara
        const euler = new THREE.Euler(
            state.camera.pitch,
            state.camera.yaw,
            0,
            'YXZ'
        );
        this.camera.quaternion.setFromEuler(euler);
    }

    checkPortalProximity() {
        const playerPos = this.camera.position.clone();
        let closestPortal = null;
        let minDist = 3.5; // Distancia mínima para mostrar prompt

        for (const portal of state.scene.portals) {
            const dist = playerPos.distanceTo(portal.group.position);
            if (dist < minDist) {
                minDist = dist;
                closestPortal = portal;
            }
        }

        if (closestPortal && closestPortal !== state.ui.hoveredPortal) {
            state.ui.hoveredPortal = closestPortal;
            // No mostrar prompt, solo marcar el portal cercano
        } else if (!closestPortal && state.ui.hoveredPortal) {
            state.ui.hoveredPortal = null;
        }
    }

    showPortalPrompt(portalName) {
        // Ya no se usa, pero se mantiene por compatibilidad
    }

    hidePortalPrompt() {
        // Ya no se usa, pero se mantiene por compatibilidad
    }

    /**
     * Detecta si el jugador está colisionando frontalmente con un portal
     */
    checkPortalTraversal() {
        if (!this.sceneManager || this.isTransitioning) return;

        const playerPos = this.camera.position.clone();
        
        // Dirección hacia donde mira el jugador
        const forward = new THREE.Vector3(
            -Math.sin(state.camera.yaw),
            0,
            -Math.cos(state.camera.yaw)
        ).normalize();

        // Configurar raycaster desde la posición del jugador hacia adelante
        this.portalRay.set(playerPos, forward);
        this.portalRay.far = 1.8; // Detectar portales a máximo 1.8 unidades (más cerca)

        // Obtener todos los meshes de los portales
        const portalMeshes = [];
        for (const portal of state.scene.portals) {
            // Buscar meshes dentro del grupo del portal
            portal.group.traverse((child) => {
                if (child.isMesh) {
                    child.userData.portal = portal; // Guardar referencia al portal
                    portalMeshes.push(child);
                }
            });
        }

        // Detectar intersecciones
        const intersects = this.portalRay.intersectObjects(portalMeshes, false);
        
        if (intersects.length > 0) {
            const hitPortal = intersects[0].object.userData.portal;
            
            if (hitPortal) {
                const portalName = hitPortal.name.toLowerCase();
                const gameModules = ['jugabilidad', 'progreso', 'comunidad'];
                const mainSections = ['inicio', 'proyecto']; // Secciones principales con overlays simples
                
                // PRINCIPIO DE FEEDBACK: No permitir nuevas interacciones si hay overlay activo
                // Esto previene confusión del usuario (Principio de Gestalt: Ley de Prägnanz)
                const hasActiveOverlay = state.ui.activeSection !== null;
                
                // Portal de salida
                if (hitPortal.isExitPortal && !hasActiveOverlay) {
                    this.transitionToScene('main', 0, 5, 0);
                } 
                // Portal principal "Juego"
                else if (portalName === 'juego' && !hasActiveOverlay) {
                    this.transitionToScene('game', 0, 5, 0);
                }
                // Portales de secciones principales (Inicio, Proyecto)
                else if (mainSections.includes(portalName) && !hasActiveOverlay) {
                    this.openMainSectionByTraversal(portalName);
                }
                // Portales de módulos de juego (Jugabilidad, Progreso, Comunidad)
                // SOLO si no hay overlay abierto (Consistencia de interacción)
                else if (gameModules.includes(portalName) && !hasActiveOverlay) {
                    this.openGameModuleByTraversal(portalName);
                }
            }
        }
    }

    /**
     * Abre una sección principal cuando el jugador atraviesa su portal (Inicio, Proyecto)
     */
    openMainSectionByTraversal(sectionName) {
        // Solo activar si no está ya en transición
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        console.log(`Opening main section by traversal: ${sectionName}`);
        
        // Empujar al jugador hacia atrás para sacarlo del portal
        const backward = new THREE.Vector3(
            Math.sin(state.camera.yaw),
            0,
            Math.cos(state.camera.yaw)
        ).normalize().multiplyScalar(1.5);
        
        this.camera.position.add(backward);
        
        // Transición visual con flash
        const flashEl = document.getElementById('flash');
        if (flashEl) {
            flashEl.setAttribute('aria-hidden', 'false');
        }

        // Después del flash, abrir la sección
        setTimeout(() => {
            // Ocultar flash
            if (flashEl) {
                flashEl.setAttribute('aria-hidden', 'true');
            }
            
            // Abrir el overlay de la sección usando UIManager
            mutations.setActiveSection(sectionName);
            
            // Desbloquear pointer
            if (state.ui.pointerLocked) {
                document.exitPointerLock();
            }
            
            // Mostrar el overlay
            const sectionEl = document.getElementById(`section-${sectionName}`);
            if (sectionEl) {
                sectionEl.setAttribute('aria-hidden', 'false');
            }
            
            // Desbloquear después de un pequeño delay
            setTimeout(() => {
                this.isTransitioning = false;
            }, 500);
        }, 320);
    }

    /**
     * Abre un módulo de juego cuando el jugador atraviesa su portal
     */
    openGameModuleByTraversal(moduleName) {
        // Solo activar si no está ya en transición
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        console.log(`Opening game module by traversal: ${moduleName}`);
        
        // Empujar al jugador hacia atrás para sacarlo del portal (solo 1.5 unidades)
        const backward = new THREE.Vector3(
            Math.sin(state.camera.yaw),
            0,
            Math.cos(state.camera.yaw)
        ).normalize().multiplyScalar(1.5); // Empujar solo 1.5 unidades hacia atrás
        
        this.camera.position.add(backward);
        
        // Transición visual con flash
        const flashEl = document.getElementById('flash');
        if (flashEl) {
            flashEl.setAttribute('aria-hidden', 'false');
        }

        // Después del flash, abrir el módulo
        setTimeout(() => {
            // Ocultar flash
            if (flashEl) {
                flashEl.setAttribute('aria-hidden', 'true');
            }
            
            // Emitir evento para que UIManager maneje el módulo
            const event = new CustomEvent('openGameModule', { 
                detail: { moduleName } 
            });
            window.dispatchEvent(event);
            
            // Desbloquear pointer
            if (state.ui.pointerLocked) {
                document.exitPointerLock();
            }
            
            // Cooldown largo para evitar re-activaciones
            // Solo se desbloqueará cuando se cierre el overlay
            // NO desbloquear automáticamente aquí
        }, 400);
    }

    /**
     * Realiza la transición a otra escena con efecto visual
     */
    async transitionToScene(sceneName, x, y, z) {
        // BUG FIX: Limpiar estado de portal hover ANTES de transicionar
        // Esto previene que el portal de la escena anterior persista
        state.ui.hoveredPortal = null;
        
        // Bloquear movimiento del jugador INMEDIATAMENTE
        this.isTransitioning = true;
        
        // Congelar velocidad vertical para que no siga cayendo/subiendo
        state.player.velY = 0;
        
        // Mostrar pantalla blanca INMEDIATAMENTE
        const flashEl = document.getElementById('flash');
        if (flashEl) {
            flashEl.setAttribute('aria-hidden', 'false');
        }

        // Esperar un momento para el efecto de flash
        await new Promise(resolve => setTimeout(resolve, 400));

        // Cambiar de escena
        await this.sceneManager.loadScene(sceneName);
        
        // Reposicionar al jugador en la nueva escena
        this.initPosition(x, y, z);
        
        // Resetear física
        state.player.velY = 0;
        state.player.onGround = false;

        // Mantener pantalla blanca un poco más
        await new Promise(resolve => setTimeout(resolve, 200));

        // Ocultar flash gradualmente
        if (flashEl) {
            flashEl.setAttribute('aria-hidden', 'true');
        }

        // BUG FIX: Cooldown MÁS LARGO después de transición de escena
        // Esto previene que se detecten portales inmediatamente al aparecer
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Desbloquear movimiento
        this.isTransitioning = false;

        console.log(`Transitioned to scene: ${sceneName}`);
    }

    /**
     * Inicializa la posición del jugador en la escena
     */
    initPosition(x, y, z) {
        this.camera.position.set(x, y, z);
        this.lastCamPos.copy(this.camera.position);
        state.player.velY = 0;
        state.player.onGround = true;
    }
}
