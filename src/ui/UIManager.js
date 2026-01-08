/**
 * UIManager: Gestiona toda la interfaz de usuario DOM
 * Separado de la lógica 3D para mantener responsabilidades claras
 * Ahora maneja overlays principales y sub-overlays (game modules)
 */

import { state, mutations } from '../core/State.js';
import { ContentManager } from './ContentManager.js';

export class UIManager {
    constructor() {
        this.elements = {
            prompt: null,
            flash: null,
            sectionOverlays: {},
            gameModuleOverlays: {}, // Overlays de módulos de juego
            proyectoModuleOverlays: {} // Overlays de módulos de proyecto
        };
        this.contentManager = new ContentManager();
    }

    init() {
        // Obtener referencias a elementos del DOM
        this.elements.prompt = document.getElementById('prompt');
        this.elements.flash = document.getElementById('flash');

        // Registrar overlays principales (secciones)
        ['inicio', 'juego', 'proyecto'].forEach(id => {
            const el = document.getElementById(`section-${id}`);
            if (el) {
                // FORCE HIDE: Asegurar que estén ocultos al iniciar
                el.setAttribute('aria-hidden', 'true');
                console.log(`UIManager: Section ${id} initialized with aria-hidden=true`);
                this.elements.sectionOverlays[id] = el;
                
                // Añadir listener al botón de cerrar
                const btn = el.querySelector('[data-close]');
                if (btn) {
                    btn.addEventListener('click', () => this.closeSection());
                }
            }
        });

        // Registrar overlays de módulos de juego
        ['jugabilidad', 'progreso', 'comunidad'].forEach(id => {
            const el = document.getElementById(`section-${id}`);
            if (el) {
                this.elements.gameModuleOverlays[id] = el;
                
                // Añadir listener al botón de cerrar (delegated event)
                el.addEventListener('click', (e) => {
                    if (e.target.hasAttribute('data-close')) {
                        this.closeGameModule();
                    }
                });
            }
        });

        // Registrar overlays de módulos de proyecto
        if (!this.elements.proyectoModuleOverlays) {
            this.elements.proyectoModuleOverlays = {};
        }
        ['momentos', 'necesidades', 'entrevistas', 'prototipo', 'storyboard'].forEach(id => {
            const el = document.getElementById(`section-${id}`);
            if (el) {
                this.elements.proyectoModuleOverlays[id] = el;
                
                // Añadir listener al botón de cerrar
                el.addEventListener('click', (e) => {
                    if (e.target.hasAttribute('data-close')) {
                        this.closeProyectoModule();
                    }
                });
            }
        });

        // Listener global de ESC para cerrar overlays de proyecto
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.ui.activeSection) {
                const activeId = state.ui.activeSection.toLowerCase();
                // Solo cerrar si es un módulo de proyecto Y no hay otro overlay abierto (como DriveVideoOverlay)
                if (['momentos', 'necesidades', 'entrevistas', 'storyboard'].includes(activeId)) {
                    // Verificar si NO hay overlay de Drive abierto
                    const driveOverlay = document.getElementById('drive-video-overlay');
                    if (!driveOverlay) {
                        console.log('✓ ESC pressed, closing proyecto module');
                        this.closeProyectoModule();
                    }
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
        
        console.log(`UIManager: Opening section ${sectionName}`);
        
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
            
            // BUG FIX: Limpiar también el portal hover para evitar activaciones fantasma
            state.ui.hoveredPortal = null;
        }
    }

    /**
     * Abre un módulo de juego específico (Jugabilidad, Progreso, Comunidad)
     * @param {string} moduleName - Nombre del módulo
     */
    openGameModule(moduleName) {
        const moduleId = moduleName.toLowerCase();
        const overlay = this.elements.gameModuleOverlays[moduleId];
        
        if (!overlay) {
            console.error(`Game module overlay ${moduleId} not found`);
            return;
        }

        // Cargar contenido dinámico
        this.contentManager.loadModule(moduleId, `${moduleId}-content`);
        
        // Mostrar overlay
        overlay.setAttribute('aria-hidden', 'false');
        mutations.setActiveSection(moduleName);
        
        // Desbloquear pointer si estaba bloqueado
        if (state.ui.pointerLocked) {
            document.exitPointerLock();
        }

        console.log(`✓ Game module ${moduleName} opened`);
    }

    /**
     * Cierra el módulo de juego activo
     */
    closeGameModule() {
        if (!state.ui.activeSection) return;

        const sectionId = state.ui.activeSection.toLowerCase();
        const overlay = this.elements.gameModuleOverlays[sectionId];
        
        if (overlay) {
            // Limpiar contenido
            this.contentManager.cleanup();
            
            // Ocultar overlay
            overlay.setAttribute('aria-hidden', 'true');
            mutations.setActiveSection(null);
            
            // BUG FIX: Limpiar también el portal hover para evitar activaciones fantasma
            state.ui.hoveredPortal = null;
            
            // Desbloquear transiciones del PlayerController
            const event = new CustomEvent('gameModuleClosed');
            window.dispatchEvent(event);
            
            console.log(`✓ Game module ${sectionId} closed`);
        }
    }

    /**
     * Verifica si hay un módulo de juego activo
     */
    isGameModuleActive() {
        const activeSection = state.ui.activeSection?.toLowerCase();
        return activeSection && this.elements.gameModuleOverlays[activeSection] !== undefined;
    }

    /**
     * Abre un módulo de proyecto específico (Momentos, Necesidades, Entrevistas, Storyboard)
     * @param {string} moduleName - Nombre del módulo
     */
    openProyectoModule(moduleName) {
        const moduleId = moduleName.toLowerCase();
        const overlay = this.elements.proyectoModuleOverlays[moduleId];
        
        if (!overlay) {
            console.error(`Proyecto module overlay ${moduleId} not found`);
            return;
        }

        // Cargar contenido dinámico
        this.contentManager.loadModule(moduleId, `${moduleId}-content`);
        
        // Mostrar overlay
        overlay.setAttribute('aria-hidden', 'false');
        mutations.setActiveSection(moduleName);
        
        // Desbloquear pointer si estaba bloqueado
        if (state.ui.pointerLocked) {
            document.exitPointerLock();
        }

        console.log(`✓ Proyecto module ${moduleName} opened`);
    }

    /**
     * Cierra el módulo de proyecto activo
     */
    closeProyectoModule() {
        if (!state.ui.activeSection) return;

        const sectionId = state.ui.activeSection.toLowerCase();
        const overlay = this.elements.proyectoModuleOverlays[sectionId];
        
        if (overlay) {
            // BUG FIX: Quitar el foco de cualquier elemento dentro del overlay
            // antes de ocultarlo para evitar el error "aria-hidden on focused element"
            const focusedElement = overlay.querySelector(':focus');
            if (focusedElement) {
                console.log('✓ Blurring focused element:', focusedElement);
                focusedElement.blur();
            }
            
            // Enfocar el canvas para preparar el pointer lock
            const canvas = document.querySelector('canvas');
            if (canvas) {
                console.log('✓ Focusing canvas');
                canvas.focus();
            }
            
            // Limpiar contenido
            this.contentManager.cleanup();
            
            // Ocultar overlay
            overlay.setAttribute('aria-hidden', 'true');
            mutations.setActiveSection(null);
            
            // BUG FIX: Limpiar también el portal hover
            state.ui.hoveredPortal = null;
            
            // Desbloquear transiciones del PlayerController
            const event = new CustomEvent('proyectoModuleClosed');
            window.dispatchEvent(event);
            
            console.log(`✓ Proyecto module ${sectionId} closed`);
        }
    }

    update() {
        // Aquí se pueden añadir actualizaciones de UI si es necesario
        // Por ejemplo, actualizar HUD, estadísticas, etc.
    }

    /**
     * Limpieza al destruir
     */
    destroy() {
        this.contentManager.cleanup();
    }
}
