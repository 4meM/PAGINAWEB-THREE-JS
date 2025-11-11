/**
 * COMPONENT: Gallery
 * Componente reutilizable para mostrar galerías de imágenes con navegación
 * Sigue principios SOLID: Single Responsibility + Open/Closed
 * Basado en Game.tsx - muestra 2 imágenes a la vez con navegación
 */

export class Gallery {
    constructor(containerId, images = []) {
        this.containerId = containerId;
        this.images = images;
        this.currentIndex = 0;
        this.galleryIndex = 0; // Índice para navegación de bloques
        this.itemsPerPage = 2; // Mostrar 2 imágenes a la vez
        this.modal = null;
        this.listeners = [];
    }

    /**
     * Renderiza la galería en el contenedor especificado
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Gallery container ${this.containerId} not found`);
            return;
        }

        container.innerHTML = this.getGalleryHTML();
        this.attachEventListeners();
    }

    /**
     * Obtiene las imágenes visibles actualmente
     */
    getVisibleImages() {
        return this.images.slice(this.galleryIndex, this.galleryIndex + this.itemsPerPage);
    }

    /**
     * Genera HTML de la galería con navegación
     */
    getGalleryHTML() {
        if (this.images.length === 0) {
            return '<p class="gallery__empty">No hay imágenes disponibles</p>';
        }

        const visibleImages = this.getVisibleImages();
        const hasNavigation = this.images.length > this.itemsPerPage;

        return `
            <div class="gallery">
                <div class="gallery__header">
                    <span class="gallery__counter">
                        📸 Gallery - ${this.images.length} archivo${this.images.length > 1 ? 's' : ''}
                    </span>
                </div>
                <div class="gallery__container">
                    ${hasNavigation ? `
                        <button class="gallery__nav gallery__nav--prev" data-action="prev" aria-label="Anterior">
                            ‹
                        </button>
                    ` : ''}
                    <div class="gallery__grid">
                        ${visibleImages.map((img, index) => {
                            const absoluteIndex = this.galleryIndex + index;
                            return `
                                <div class="gallery__item" data-index="${absoluteIndex}">
                                    <img 
                                        src="${img.url}" 
                                        alt="${img.alt || 'Imagen de galería'}"
                                        class="gallery__image"
                                        loading="lazy"
                                    />
                                    <div class="gallery__overlay">
                                        <span class="gallery__zoom-icon">🔍</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${hasNavigation ? `
                        <button class="gallery__nav gallery__nav--next" data-action="next" aria-label="Siguiente">
                            ›
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Navega entre bloques de imágenes
     */
    navigateGallery(direction) {
        if (direction === 'next') {
            this.galleryIndex = (this.galleryIndex + this.itemsPerPage >= this.images.length) 
                ? 0 
                : this.galleryIndex + this.itemsPerPage;
        } else {
            this.galleryIndex = (this.galleryIndex === 0) 
                ? Math.max(0, this.images.length - this.itemsPerPage)
                : this.galleryIndex - this.itemsPerPage;
        }
        this.render();
    }

    /**
     * Abre el modal con la imagen seleccionada
     */
    openModal(index) {
        // Salir del pointer lock si está activo
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        this.currentIndex = index;
        this.createModal();
        this.updateModalContent();
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    /**
     * Crea el modal si no existe
     */
    createModal() {
        if (this.modal) return;

        this.modal = document.createElement('div');
        this.modal.className = 'gallery-modal';
        this.modal.innerHTML = `
            <div class="gallery-modal__backdrop"></div>
            <div class="gallery-modal__content">
                <button class="gallery-modal__close" aria-label="Cerrar">✕</button>
                ${this.images.length > 1 ? `
                    <button class="gallery-modal__nav gallery-modal__nav--prev" aria-label="Anterior">‹</button>
                    <button class="gallery-modal__nav gallery-modal__nav--next" aria-label="Siguiente">›</button>
                ` : ''}
                <img class="gallery-modal__image" src="" alt="" />
                <div class="gallery-modal__counter"></div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.attachModalListeners();
    }

    /**
     * Actualiza el contenido del modal
     */
    updateModalContent() {
        if (!this.modal) return;

        const img = this.modal.querySelector('.gallery-modal__image');
        const counter = this.modal.querySelector('.gallery-modal__counter');
        
        const currentImage = this.images[this.currentIndex];
        img.src = currentImage.url;
        img.alt = currentImage.alt || 'Imagen de galería';
        
        if (this.images.length > 1) {
            counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        }
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
     * Navega a la siguiente imagen
     */
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateModalContent();
    }

    /**
     * Navega a la imagen anterior
     */
    previous() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateModalContent();
    }

    /**
     * Adjunta event listeners a la galería
     */
    attachEventListeners() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Listeners para items de galería (abrir modal) - detener propagación
        const items = container.querySelectorAll('.gallery__item');
        items.forEach(item => {
            const listener = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const index = parseInt(item.dataset.index);
                this.openModal(index);
            };
            
            item.addEventListener('click', listener);
            this.listeners.push({ element: item, event: 'click', handler: listener });
        });

        // Listeners para navegación de galería
        const prevBtn = container.querySelector('.gallery__nav--prev');
        const nextBtn = container.querySelector('.gallery__nav--next');

        if (prevBtn) {
            const prevListener = (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.navigateGallery('prev');
            };
            prevBtn.addEventListener('click', prevListener);
            this.listeners.push({ element: prevBtn, event: 'click', handler: prevListener });
        }

        if (nextBtn) {
            const nextListener = (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.navigateGallery('next');
            };
            nextBtn.addEventListener('click', nextListener);
            this.listeners.push({ element: nextBtn, event: 'click', handler: nextListener });
        }
    }

    /**
     * Adjunta event listeners al modal
     */
    attachModalListeners() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.gallery-modal__close');
        const backdrop = this.modal.querySelector('.gallery-modal__backdrop');
        const prevBtn = this.modal.querySelector('.gallery-modal__nav--prev');
        const nextBtn = this.modal.querySelector('.gallery-modal__nav--next');

        const closeHandler = () => this.closeModal();
        const prevHandler = () => this.previous();
        const nextHandler = () => this.next();
        const keyHandler = (e) => {
            if (e.key === 'Escape') this.closeModal();
            else if (e.key === 'ArrowLeft' && this.images.length > 1) this.previous();
            else if (e.key === 'ArrowRight' && this.images.length > 1) this.next();
        };

        closeBtn?.addEventListener('click', closeHandler);
        backdrop?.addEventListener('click', closeHandler);
        prevBtn?.addEventListener('click', prevHandler);
        nextBtn?.addEventListener('click', nextHandler);
        document.addEventListener('keydown', keyHandler);

        // Guardar referencias para cleanup
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
     * Actualiza las imágenes de la galería
     */
    updateImages(images) {
        this.images = images;
        this.currentIndex = 0;
        this.render();
    }
}
