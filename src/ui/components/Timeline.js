/**
 * COMPONENT: Timeline
 * Componente reutilizable para mostrar líneas de tiempo de desarrollo
 * Alta cohesión, bajo acoplamiento
 */

import { Gallery } from './Gallery.js';
import { VideoGallery } from './VideoGallery.js';

export class Timeline {
    constructor(containerId, timelineData = []) {
        this.containerId = containerId;
        this.timelineData = timelineData;
        this.galleries = new Map();
        this.videoGalleries = new Map();
    }

    /**
     * Renderiza el timeline
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Timeline container ${this.containerId} not found`);
            return;
        }

        container.innerHTML = this.getTimelineHTML();
        this.initializeGalleries();
    }

    /**
     * Genera HTML del timeline
     */
    getTimelineHTML() {
        if (this.timelineData.length === 0) {
            return '<p class="timeline__empty">No hay eventos en el timeline</p>';
        }

        return `
            <div class="timeline-container">
                ${this.timelineData.map((item, index) => `
                    <div class="timeline-row">
                        <!-- Card de contenido (lado izquierdo) -->
                        <div class="timeline-card">
                            <div class="timeline-card__header">
                                <div class="timeline-card__number">${index + 1}</div>
                                <h3 class="timeline-card__title">${item.phase}</h3>
                            </div>
                            <div class="timeline-card__body">
                                <p class="timeline-card__description">${item.description}</p>
                            </div>
                        </div>

                        <!-- Timeline marker (centro) -->
                        <div class="timeline-center">
                            ${index > 0 ? '<div class="timeline-line timeline-line--top"></div>' : ''}
                            <div class="timeline-dot">
                                <div class="timeline-dot__inner">
                                    <div class="timeline-dot__center"></div>
                                </div>
                            </div>
                            ${index < this.timelineData.length - 1 ? '<div class="timeline-line timeline-line--bottom"></div>' : ''}
                        </div>

                        <!-- Gallery de medios (lado derecho) -->
                        <div class="timeline-gallery-container">
                            ${this.getMediaHTML(item, index)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Genera HTML para medios (imágenes/videos)
     */
    getMediaHTML(item, index) {
        if (!item.media || item.media.length === 0) return '';

        const images = item.media.filter(m => m.type === 'image');
        const videos = item.media.filter(m => m.type === 'video');

        return `
            <div class="media-gallery">
                <div class="media-gallery__header">
                    <h4 class="media-gallery__title">
                        <span>📸</span> Gallery - ${item.phase}
                    </h4>
                    <div class="media-gallery__count">
                        ${item.media.length} archivo${item.media.length > 1 ? 's' : ''}
                    </div>
                </div>
                
                <div id="timeline-gallery-${index}" class="media-gallery__content"></div>
                ${videos.length > 0 ? `<div id="timeline-videos-${index}" class="media-gallery__videos"></div>` : ''}
            </div>
        `;
    }

    /**
     * Inicializa galerías para cada item del timeline
     */
    initializeGalleries() {
        this.timelineData.forEach((item, index) => {
            // Inicializar galería de imágenes
            const images = item.media?.filter(m => m.type === 'image') || [];
            if (images.length > 0) {
                const gallery = new Gallery(`timeline-gallery-${index}`, images);
                gallery.render();
                this.galleries.set(index, gallery);
            }

            // Inicializar galería de videos
            const videos = item.media?.filter(m => m.type === 'video') || [];
            if (videos.length > 0) {
                const videoGallery = new VideoGallery(`timeline-videos-${index}`, videos);
                videoGallery.render();
                this.videoGalleries.set(index, videoGallery);
            }
        });
    }

    /**
     * Limpia todas las galerías
     */
    destroy() {
        this.galleries.forEach(gallery => gallery.destroy());
        this.videoGalleries.forEach(videoGallery => videoGallery.destroy());
        this.galleries.clear();
        this.videoGalleries.clear();
    }

    /**
     * Actualiza los datos del timeline
     */
    updateData(timelineData) {
        this.destroy();
        this.timelineData = timelineData;
        this.render();
    }
}
