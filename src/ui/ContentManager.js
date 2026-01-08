/**
 * MANAGER: ContentManager
 * Fachada que coordina la gestión de contenido de overlays de juego
 * Patrón Facade + Strategy para manejo de diferentes tipos de contenido
 */

import { GameTemplateFactory } from './templates/gameTemplates.js';
import { Gallery } from './components/Gallery.js';
import { VideoGallery } from './components/VideoGallery.js';
import { Timeline } from './components/Timeline.js';
import { JUGABILIDAD_CONTENT, PROGRESO_CONTENT, COMUNIDAD_CONTENT } from '../data/gameContent.js';
import { MOMENTOS_CONTENT, NECESIDADES_CONTENT, ENTREVISTAS_CONTENT, STORYBOARD_CONTENT } from '../data/proyectoContent.js';

export class ContentManager {
    constructor() {
        this.activeComponents = new Map(); // Guarda componentes activos para cleanup
        this.activeModule = null;
    }

    /**
     * Carga el contenido de un módulo específico
     * @param {string} moduleName - 'jugabilidad', 'progreso', o 'comunidad'
     * @param {string} containerId - ID del contenedor donde renderizar
     */
    loadModule(moduleName, containerId) {
        // Limpiar componentes anteriores
        this.cleanup();

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        // Generar y cargar el HTML del módulo
        const html = GameTemplateFactory.generateHTML(moduleName);
        container.innerHTML = html;

        // Inicializar componentes interactivos del módulo
        this.initializeModuleComponents(moduleName);
        
        this.activeModule = moduleName;
        console.log(`✓ Module ${moduleName} loaded`);
    }

    /**
     * Inicializa componentes interactivos según el módulo
     */
    initializeModuleComponents(moduleName) {
        switch(moduleName.toLowerCase()) {
            case 'jugabilidad':
                this.initializeJugabilidadComponents();
                break;
            case 'progreso':
                this.initializeProgresoComponents();
                break;
            case 'comunidad':
                this.initializeComunidadComponents();
                break;
            case 'momentos':
                this.initializeMomentosComponents();
                break;
            case 'necesidades':
                this.initializeNecesidadesComponents();
                break;
            case 'entrevistas':
                this.initializeEntrevistasComponents();
                break;
            case 'prototipo':
                this.initializePrototipoComponents();
                break;
            case 'storyboard':
                this.initializeStoryboardComponents();
                break;
        }
    }

    /**
     * Inicializa componentes de Jugabilidad
     */
    initializeJugabilidadComponents() {
        // Galería de imágenes
        if (JUGABILIDAD_CONTENT.gallery && JUGABILIDAD_CONTENT.gallery.images.length > 0) {
            const gallery = new Gallery('jugabilidad-gallery', JUGABILIDAD_CONTENT.gallery.images);
            gallery.render();
            this.activeComponents.set('gallery', gallery);
        }
    }

    /**
     * Inicializa componentes de Progreso
     */
    initializeProgresoComponents() {
        // Timeline con galerías integradas
        if (PROGRESO_CONTENT.timeline && PROGRESO_CONTENT.timeline.length > 0) {
            const timeline = new Timeline('progreso-timeline', PROGRESO_CONTENT.timeline);
            timeline.render();
            this.activeComponents.set('timeline', timeline);
        }
    }

    /**
     * Inicializa componentes de Comunidad
     */
    initializeComunidadComponents() {
        // Por ahora solo HTML estático, pero se pueden agregar componentes interactivos
        console.log('Comunidad components initialized');
    }

    /**
     * Inicializa componentes de Momentos Interesantes
     */
    initializeMomentosComponents() {
        // Inicializar botones frontales para los videos del módulo Momentos
        import('../../components/DriveVideoOverlay.js').then(module => {
            const { openDriveVideoOverlay } = module;

            const buttons = document.querySelectorAll('.momento-video-button');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const driveId = btn.getAttribute('data-drive-id');
                    const title = btn.getAttribute('data-title');
                    const type = btn.getAttribute('data-type') || 'video';
                    openDriveVideoOverlay(driveId, title, type);
                });
            });

            console.log(`✓ Momentos components initialized (${buttons.length} buttons)`);
        }).catch(err => {
            console.warn('Failed to initialize Momentos components', err);
        });
    }

    /**
     * Inicializa componentes de Necesidades
     */
    initializeNecesidadesComponents() {
        console.log('Necesidades components initialized');
    }

    /**
     * Inicializa componentes de Entrevistas
     */
    initializeEntrevistasComponents() {
        // Importar dinámicamente el DriveVideoOverlay
        import('../../components/DriveVideoOverlay.js').then(module => {
            const { openDriveVideoOverlay } = module;
            
            // Agregar event listeners a todos los botones de entrevistas
            const entrevistaButtons = document.querySelectorAll('.entrevista-button');
            entrevistaButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const driveId = button.getAttribute('data-drive-id');
                    const title = button.getAttribute('data-title');
                    const type = button.getAttribute('data-type') || 'video';
                    openDriveVideoOverlay(driveId, title, type);
                });
            });
            
            console.log(`✓ Entrevistas components initialized (${entrevistaButtons.length} buttons)`);
        });
    }

    /**
     * Inicializa componentes del módulo Prototipo (botones de video frontales)
     */
    initializePrototipoComponents() {
        import('../../components/DriveVideoOverlay.js').then(module => {
            const { openDriveVideoOverlay } = module;

            const buttons = document.querySelectorAll('.prototipo-video-button');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const driveId = btn.getAttribute('data-drive-id');
                    const title = btn.getAttribute('data-title');
                    const type = btn.getAttribute('data-type') || 'video';
                    openDriveVideoOverlay(driveId, title, type);
                });
            });

            console.log(`✓ Prototipo components initialized (${buttons.length} buttons)`);
        });
    }

    /**
     * Inicializa componentes de Storyboard
     */
    initializeStoryboardComponents() {
        // Inicializar botones frontales para los videos del storyboard
        import('../../components/DriveVideoOverlay.js').then(module => {
            const { openDriveVideoOverlay } = module;

            const buttons = document.querySelectorAll('.storyboard-video-button');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const driveId = btn.getAttribute('data-drive-id');
                    const title = btn.getAttribute('data-title');
                    const type = btn.getAttribute('data-type') || 'video';
                    openDriveVideoOverlay(driveId, title, type);
                });
            });

            console.log(`✓ Storyboard components initialized (${buttons.length} buttons)`);
        }).catch(err => {
            console.warn('Failed to initialize Storyboard components', err);
        });
    }

    /**
     * Limpia todos los componentes activos
     */
    cleanup() {
        this.activeComponents.forEach((component, key) => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        this.activeComponents.clear();
        this.activeModule = null;
    }

    /**
     * Obtiene el módulo actualmente activo
     */
    getActiveModule() {
        return this.activeModule;
    }

    /**
     * Verifica si un módulo está cargado
     */
    isModuleLoaded(moduleName) {
        return this.activeModule === moduleName.toLowerCase();
    }

    /**
     * Pre-carga recursos de un módulo (para optimización)
     */
    async preloadModule(moduleName) {
        // Aquí se pueden pre-cargar imágenes, modelos, etc.
        console.log(`Preloading module: ${moduleName}`);
        
        switch(moduleName.toLowerCase()) {
            case 'jugabilidad':
                await this.preloadImages(JUGABILIDAD_CONTENT.gallery?.images || []);
                break;
            case 'progreso':
                await this.preloadTimelineMedia(PROGRESO_CONTENT.timeline || []);
                break;
        }
    }

    /**
     * Pre-carga imágenes
     */
    async preloadImages(images) {
        const promises = images.map(img => {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = resolve;
                image.onerror = reject;
                image.src = img.url;
            });
        });

        try {
            await Promise.all(promises);
            console.log(`✓ Preloaded ${images.length} images`);
        } catch (error) {
            console.warn('Some images failed to preload:', error);
        }
    }

    /**
     * Pre-carga medios del timeline
     */
    async preloadTimelineMedia(timelineData) {
        const allImages = timelineData
            .flatMap(item => item.media || [])
            .filter(media => media.type === 'image');
        
        await this.preloadImages(allImages);
    }
}
