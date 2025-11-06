/**
 * COMPONENT: VideoGallery
 * Componente reutilizable para mostrar galerías de videos (YouTube)
 * Principio DRY: Reutiliza lógica similar a Gallery pero especializado en videos
 */

export class VideoGallery {
    constructor(containerId, videos = []) {
        this.containerId = containerId;
        this.videos = videos; // Array de { youtubeId, alt, title }
        this.modal = null;
        this.listeners = [];
    }

    /**
     * Renderiza la galería de videos
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`VideoGallery container ${this.containerId} not found`);
            return;
        }

        container.innerHTML = this.getGalleryHTML();
        this.attachEventListeners();
    }

    /**
     * Genera HTML de la galería de videos (horizontal con scroll)
     */
    getGalleryHTML() {
        if (this.videos.length === 0) {
            return '<p class="video-gallery__empty">No hay videos disponibles</p>';
        }

        return `
            <div class="video-gallery">
                <div class="video-gallery__scroll-container">
                    <div class="video-gallery__horizontal">
                        ${this.videos.map((video, index) => `
                            <div class="video-gallery__item" data-index="${index}">
                                <div class="video-gallery__thumbnail">
                                    <img 
                                        src="${this.getThumbnail(video.youtubeId)}" 
                                        alt="${video.alt || 'Video thumbnail'}"
                                        class="video-gallery__thumb-image"
                                        loading="lazy"
                                    />
                                    <div class="video-gallery__play-button">
                                        <svg width="68" height="48" viewBox="0 0 68 48">
                                            <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                                            <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                                        </svg>
                                    </div>
                                    <div class="video-gallery__overlay">
                                        <span class="video-gallery__label">Video</span>
                                    </div>
                                </div>
                                ${video.title ? `<p class="video-gallery__title">${video.title}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene la URL del thumbnail de YouTube
     */
    getThumbnail(youtubeId, quality = 'hqdefault') {
        return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
    }

    /**
     * Abre el modal con el video de YouTube
     */
    openModal(index) {
        const video = this.videos[index];
        this.createModal(video);
        
        // Prevenir scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Crea el modal de video
     */
    createModal(video) {
        if (this.modal) this.closeModal();

        this.modal = document.createElement('div');
        this.modal.className = 'video-modal';
        this.modal.innerHTML = `
            <div class="video-modal__backdrop"></div>
            <div class="video-modal__content">
                <button class="video-modal__close" aria-label="Cerrar">✕</button>
                <div class="video-modal__player">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/${video.youtubeId}?autoplay=1"
                        title="${video.alt || 'YouTube video'}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
                ${video.title ? `<h3 class="video-modal__title">${video.title}</h3>` : ''}
            </div>
        `;

        document.body.appendChild(this.modal);
        this.attachModalListeners();
    }

    /**
     * Cierra el modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
            document.body.style.overflow = '';
        }
    }

    /**
     * Adjunta event listeners a la galería
     */
    attachEventListeners() {
        const items = document.querySelectorAll(`#${this.containerId} .video-gallery__item`);
        
        items.forEach(item => {
            const listener = () => {
                const index = parseInt(item.dataset.index);
                this.openModal(index);
            };
            
            item.addEventListener('click', listener);
            this.listeners.push({ element: item, event: 'click', handler: listener });
        });
    }

    /**
     * Adjunta event listeners al modal
     */
    attachModalListeners() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.video-modal__close');
        const backdrop = this.modal.querySelector('.video-modal__backdrop');

        const closeHandler = () => this.closeModal();
        const keyHandler = (e) => {
            if (e.key === 'Escape') this.closeModal();
        };

        closeBtn?.addEventListener('click', closeHandler);
        backdrop?.addEventListener('click', closeHandler);
        document.addEventListener('keydown', keyHandler);

        this.listeners.push(
            { element: document, event: 'keydown', handler: keyHandler }
        );
    }

    /**
     * Limpia event listeners
     */
    destroy() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
        this.closeModal();
    }

    /**
     * Actualiza los videos
     */
    updateVideos(videos) {
        this.videos = videos;
        this.render();
    }
}
