/**
 * UIManager: Gestiona toda la interfaz de usuario DOM
 * Separado de la lógica 3D para mantener responsabilidades claras
 */

import { state, mutations } from '../core/State.js';

export class UIManager {
    constructor() {
        this.elements = {
            prompt: null,
            flash: null,
            sectionOverlays: {}
        };
    }

    init() {
        // Obtener referencias a elementos del DOM
        this.elements.prompt = document.getElementById('prompt');
        this.elements.flash = document.getElementById('flash');

        // Registrar overlays de secciones
        ['inicio', 'juego', 'proyecto'].forEach(id => {
            const el = document.getElementById(`section-${id}`);
            if (el) {
                this.elements.sectionOverlays[id] = el;
                
                // Añadir listener al botón de cerrar
                const btn = el.querySelector('[data-close]');
                if (btn) {
                    btn.addEventListener('click', () => this.closeSection());
                }
            }
        });

        console.log('✓ UIManager initialized');
    }

    showPrompt(text) {
        if (this.elements.prompt) {
            this.elements.prompt.textContent = text;
            this.elements.prompt.setAttribute('aria-hidden', 'false');
        }
    }

    hidePrompt() {
        if (this.elements.prompt) {
            this.elements.prompt.setAttribute('aria-hidden', 'true');
        }
    }

    showFlash(duration = 650) {
        if (this.elements.flash) {
            this.elements.flash.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                this.elements.flash.setAttribute('aria-hidden', 'true');
            }, duration);
        }
    }

    openSection(sectionName) {
        const sectionId = sectionName.toLowerCase();
        const overlay = this.elements.sectionOverlays[sectionId];
        
        if (overlay) {
            overlay.setAttribute('aria-hidden', 'false');
            mutations.setActiveSection(sectionName);
            
            // Desbloquear pointer si estaba bloqueado
            if (state.ui.pointerLocked) {
                document.exitPointerLock();
            }
        }
    }

    closeSection() {
        if (!state.ui.activeSection) return;

        const sectionId = state.ui.activeSection.toLowerCase();
        const overlay = this.elements.sectionOverlays[sectionId];
        
        if (overlay) {
            overlay.setAttribute('aria-hidden', 'true');
            mutations.setActiveSection(null);
        }
    }

    update() {
        // Aquí se pueden añadir actualizaciones de UI si es necesario
        // Por ejemplo, actualizar HUD, estadísticas, etc.
    }
}
