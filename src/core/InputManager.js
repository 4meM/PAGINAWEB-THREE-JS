/**
 * Gestor de Entrada (Teclado y Ratón)
 * Centraliza el manejo de todos los eventos de entrada
 */

import { state, mutations } from './State.js';

export class InputManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Teclado
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Ratón
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
        window.addEventListener('mouseleave', () => this.onMouseUp());

        // Pointer Lock
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    }

    onKeyDown(e) {
        const k = e.key.toLowerCase();
        
        if (k in state.input.keys) {
            state.input.keys[k] = true;
        }
        
        if (k === 'shift') {
            state.input.keys.shift = true;
        }

        if (e.code === 'Space' || k === ' ') {
            e.preventDefault();
            mutations.queueJump();
        }

        if (k === 'escape') {
            this.closeActiveSection();
        }
    }

    onKeyUp(e) {
        const k = e.key.toLowerCase();
        
        if (k in state.input.keys) {
            state.input.keys[k] = false;
        }
        
        if (k === 'shift') {
            state.input.keys.shift = false;
        }
    }

    onMouseMove(e) {
        // Actualizar posición del mouse normalizada
        state.input.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        state.input.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Si el pointer está bloqueado, usar movimiento relativo para la cámara
        if (state.ui.pointerLocked) {
            const dx = e.movementX || 0;
            const dy = e.movementY || 0;
            
            const newYaw = state.camera.yaw - dx * state.camera.sensitivity;
            const newPitch = state.camera.pitch - dy * state.camera.sensitivity;
            
            mutations.updateCameraRotation(newYaw, newPitch);
            return;
        }

        // Fallback: drag para mirar cuando no está bloqueado
        if (state.input.mouse.isDown) {
            const dx = e.clientX - state.input.mouse.lastX;
            const dy = e.clientY - state.input.mouse.lastY;
            
            state.input.mouse.lastX = e.clientX;
            state.input.mouse.lastY = e.clientY;
            
            const newYaw = state.camera.yaw - dx * state.camera.sensitivity;
            const newPitch = state.camera.pitch - dy * state.camera.sensitivity;
            
            mutations.updateCameraRotation(newYaw, newPitch);
        }
    }

    onMouseDown(e) {
        // No solicitar pointer lock si se hace clic en elementos de UI
        const isUIElement = e.target.closest('.video-gallery__item, .gallery__item, .video-gallery__nav, .gallery__nav, .video-modal, .image-modal, button, .game-section, .overlay');
        
        if (isUIElement) {
            // Si es un elemento de UI, no activar pointer lock
            return;
        }
        
        // Solicitar pointer lock para vista libre solo si es el canvas
        if (!state.ui.pointerLocked && e.target === this.renderer.domElement) {
            this.renderer.domElement.requestPointerLock?.();
        }
        
        state.input.mouse.isDown = true;
        state.input.mouse.lastX = e.clientX;
        state.input.mouse.lastY = e.clientY;
        
        if (!state.ui.pointerLocked) {
            document.body.style.cursor = 'grabbing';
        }
    }

    onMouseUp() {
        state.input.mouse.isDown = false;
        if (!state.ui.pointerLocked) {
            document.body.style.cursor = 'default';
        }
    }

    onPointerLockChange() {
        const locked = document.pointerLockElement === this.renderer.domElement;
        mutations.setPointerLock(locked);
        document.body.style.cursor = locked ? 'none' : 'default';
    }

    closeActiveSection() {
        if (state.ui.activeSection) {
            const sectionId = state.ui.activeSection.toLowerCase();
            const gameModules = ['jugabilidad', 'progreso', 'comunidad'];
            
            // Si es un módulo de juego, usar el método específico de UIManager
            if (gameModules.includes(sectionId)) {
                const event = new CustomEvent('closeGameModule');
                window.dispatchEvent(event);
                return;
            }
            
            // Para secciones normales
            const overlay = document.getElementById(`section-${sectionId}`);
            if (overlay) {
                overlay.setAttribute('aria-hidden', 'true');
                overlay.classList.remove('visible');
                mutations.setActiveSection(null);
            }
        }
    }
}
