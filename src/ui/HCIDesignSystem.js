/**
 * Sistema de Diseño basado en Principios de IHC (Human-Computer Interaction)
 * 
 * Referencias:
 * - "Design with the Mind in Mind" (Jeff Johnson)
 * - Principios de Gestalt
 * - Nielsen Norman Group Heuristics
 * - Don Norman's Design Principles
 * 
 * PRINCIPIOS APLICADOS:
 * 
 * 1. PERCEPCIÓN VISUAL (Gestalt)
 *    - Proximidad: Elementos relacionados cerca
 *    - Similitud: Elementos similares se perciben como grupo
 *    - Continuidad: Patrones visuales fluyen naturalmente
 *    - Cierre: El cerebro completa formas incompletas
 *    - Figura-fondo: Separación clara entre contenido y fondo
 * 
 * 2. AFFORDANCE (Gibson/Norman)
 *    - Los elementos sugieren claramente su función
 *    - Botones parecen presionables
 *    - Áreas interactivas tienen feedback visual
 * 
 * 3. FEEDBACK (Norman)
 *    - Respuesta inmediata a acciones del usuario
 *    - Estados visibles del sistema
 *    - Confirmación de operaciones exitosas
 * 
 * 4. CONSISTENCY (Nielsen)
 *    - Interacciones similares en toda la aplicación
 *    - Terminología consistente
 *    - Patrones visuales predecibles
 * 
 * 5. MAPPING (Norman)
 *    - Relación natural entre controles y efectos
 *    - Layout espacial refleja relaciones conceptuales
 * 
 * 6. COGNITIVE LOAD (Miller's Law)
 *    - Chunking: Agrupar información en 5-9 elementos
 *    - Progressive disclosure: Mostrar info gradualmente
 *    - Recognition over recall: Mostrar opciones vs. recordar
 * 
 * 7. ACCESSIBILITY (WCAG)
 *    - Contraste suficiente (4.5:1 mínimo)
 *    - Teclado accesible
 *    - ARIA labels para screen readers
 */

export class HCIDesignSystem {
    constructor() {
        // Tiempos de respuesta según Jeff Johnson
        // "Design with the Mind in Mind", Chapter 10: Response Time
        this.timings = {
            instant: 100,        // Percibido como instantáneo
            perceptible: 200,    // Mínimo delay perceptible
            attention: 1000,     // Límite para mantener atención
            shortTerm: 10000     // Límite memoria de trabajo
        };

        // Sistema de colores basado en psicología del color
        this.colors = {
            // Estados de UI
            primary: '#00d4ff',      // Cyan: tecnología, claridad
            success: '#00ff88',      // Verde: éxito, confirmación
            warning: '#ffaa00',      // Naranja: precaución
            danger: '#ff3366',       // Rojo: error, peligro
            neutral: '#ffffff',      // Blanco: neutro, contenido
            
            // Backgrounds (Ley de contraste)
            bgDark: 'rgba(0, 0, 0, 0.95)',
            bgMedium: 'rgba(0, 0, 0, 0.85)',
            bgLight: 'rgba(0, 0, 0, 0.7)',
            
            // Overlays (Progressive disclosure)
            overlay: 'rgba(0, 0, 0, 0.6)'
        };

        // Animaciones basadas en curvas naturales (Ley de continuidad)
        this.easings = {
            easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',    // Aceleración natural
            easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',   // Desaceleración natural
            easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',  // Movimiento suave
            elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'   // Rebote suave
        };

        // Espaciado basado en escala armónica (Gestalt: Proximidad)
        this.spacing = {
            xs: '0.25rem',   // 4px
            sm: '0.5rem',    // 8px
            md: '1rem',      // 16px
            lg: '1.5rem',    // 24px
            xl: '2rem',      // 32px
            xxl: '3rem'      // 48px
        };

        // Tipografía (Legibilidad según Johnson)
        this.typography = {
            sizes: {
                xs: '0.75rem',   // 12px - metadata
                sm: '0.875rem',  // 14px - body small
                md: '1rem',      // 16px - body
                lg: '1.25rem',   // 20px - subheading
                xl: '1.5rem',    // 24px - heading
                xxl: '2rem'      // 32px - title
            },
            weights: {
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700
            },
            lineHeights: {
                tight: 1.2,
                normal: 1.5,
                relaxed: 1.8
            }
        };
    }

    /**
     * AFFORDANCE: Crea feedback visual para elementos interactivos
     * Principio: Los objetos deben sugerir cómo usarlos
     */
    applyInteractiveAffordance(element) {
        if (!element) return;

        element.style.cursor = 'pointer';
        element.style.transition = `all ${this.timings.instant}ms ${this.easings.easeOut}`;
        
        // Hover effect (Feedback inmediato)
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.05)';
            element.style.filter = 'brightness(1.2)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
            element.style.filter = 'brightness(1)';
        });

        // Click feedback (Feedback táctil virtual)
        element.addEventListener('mousedown', () => {
            element.style.transform = 'scale(0.95)';
        });

        element.addEventListener('mouseup', () => {
            element.style.transform = 'scale(1.05)';
        });
    }

    /**
     * FEEDBACK: Muestra estado de carga/procesamiento
     * Principio: El usuario siempre debe saber qué está pasando
     */
    showLoadingState(element, message = 'Cargando...') {
        if (!element) return;

        const loader = document.createElement('div');
        loader.className = 'hci-loader';
        loader.innerHTML = `
            <div class="hci-loader__spinner" aria-label="${message}"></div>
            <p class="hci-loader__message">${message}</p>
        `;
        
        element.appendChild(loader);
        
        // Aplicar animación con timing correcto
        setTimeout(() => {
            loader.style.opacity = '1';
        }, 10);

        return loader;
    }

    /**
     * CONSISTENCY: Valida que elementos similares tengan comportamiento similar
     */
    ensureConsistentButtons(containerElement) {
        if (!containerElement) return;

        const buttons = containerElement.querySelectorAll('button, .btn, [role="button"]');
        
        buttons.forEach(btn => {
            // Aplicar affordance consistente
            this.applyInteractiveAffordance(btn);
            
            // Asegurar accesibilidad
            if (!btn.hasAttribute('aria-label') && !btn.textContent.trim()) {
                console.warn('Button sin label detectado:', btn);
            }
        });
    }

    /**
     * MAPPING: Organiza elementos según relaciones lógicas
     * Principio: La disposición espacial debe reflejar relaciones conceptuales
     */
    applyLogicalGrouping(elements, groupType = 'horizontal') {
        if (!elements || elements.length === 0) return;

        const container = elements[0].parentElement;
        if (!container) return;

        // Aplicar Gestalt: Proximidad
        container.style.display = 'flex';
        container.style.flexDirection = groupType === 'horizontal' ? 'row' : 'column';
        container.style.gap = this.spacing.md;
        
        // Gestalt: Similitud
        elements.forEach(el => {
            el.style.flex = '1';
        });
    }

    /**
     * COGNITIVE LOAD: Implementa progressive disclosure
     * Principio: No abrumar al usuario con información
     */
    createProgressiveDisclosure(sections) {
        const container = document.createElement('div');
        container.className = 'hci-accordion';

        sections.forEach((section, index) => {
            const item = document.createElement('div');
            item.className = 'hci-accordion__item';
            
            const header = document.createElement('button');
            header.className = 'hci-accordion__header';
            header.textContent = section.title;
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', `section-${index}`);
            
            const content = document.createElement('div');
            content.className = 'hci-accordion__content';
            content.id = `section-${index}`;
            content.innerHTML = section.content;
            content.style.display = 'none';
            
            // Toggle con feedback
            header.addEventListener('click', () => {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                
                // CONSISTENCY: Cerrar otros accordions
                container.querySelectorAll('.hci-accordion__header').forEach(h => {
                    if (h !== header) {
                        h.setAttribute('aria-expanded', 'false');
                        h.nextElementSibling.style.display = 'none';
                    }
                });
                
                // Toggle actual
                header.setAttribute('aria-expanded', !isExpanded);
                content.style.display = isExpanded ? 'none' : 'block';
                
                // FEEDBACK: Animación suave
                if (!isExpanded) {
                    content.style.animation = `slideDown ${this.timings.perceptible}ms ${this.easings.easeOut}`;
                }
            });
            
            this.applyInteractiveAffordance(header);
            
            item.appendChild(header);
            item.appendChild(content);
            container.appendChild(item);
        });

        return container;
    }

    /**
     * GESTALT - Ley de Proximidad: Agrupa elementos relacionados
     */
    applyProximityGrouping(container) {
        if (!container) return;

        const sections = container.querySelectorAll('.feature-card, .team-card, .timeline-item');
        
        sections.forEach(section => {
            section.style.marginBottom = this.spacing.lg;
            
            // Agrupar elementos internos
            const relatedElements = section.querySelectorAll('h3 + p, .skill-badge');
            relatedElements.forEach(el => {
                el.style.marginTop = this.spacing.sm;
            });
        });
    }

    /**
     * GESTALT - Ley de Similitud: Elementos similares se perciben juntos
     */
    applySimilarityPrinciple(container, elementType) {
        if (!container) return;

        const elements = container.querySelectorAll(elementType);
        
        elements.forEach(el => {
            // Consistencia visual
            el.style.border = `1px solid ${this.colors.primary}`;
            el.style.borderRadius = '8px';
            el.style.padding = this.spacing.md;
            el.style.background = this.colors.bgMedium;
        });
    }

    /**
     * FEEDBACK VISUAL: Notificaciones toast
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `hci-toast hci-toast--${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        // Posicionar
        toast.style.position = 'fixed';
        toast.style.bottom = this.spacing.xl;
        toast.style.right = this.spacing.xl;
        toast.style.padding = this.spacing.md;
        toast.style.background = this.colors.bgDark;
        toast.style.border = `2px solid ${this.colors[type] || this.colors.primary}`;
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '10000';
        toast.style.animation = `slideInRight ${this.timings.perceptible}ms ${this.easings.easeOut}`;
        
        document.body.appendChild(toast);
        
        // Auto-remove
        setTimeout(() => {
            toast.style.animation = `slideOutRight ${this.timings.perceptible}ms ${this.easings.easeIn}`;
            setTimeout(() => toast.remove(), this.timings.perceptible);
        }, duration);
    }

    /**
     * ACCESSIBILITY: Valida contraste de colores
     */
    validateContrast(foreground, background) {
        // Simplificado: En producción usar algoritmo WCAG
        const ratio = this.calculateContrastRatio(foreground, background);
        return ratio >= 4.5; // WCAG AA standard
    }

    calculateContrastRatio(color1, color2) {
        // Implementación simplificada
        // En producción: convertir hex a luminancia y calcular ratio
        return 7; // Placeholder
    }
}

// Export singleton
export const hciDesign = new HCIDesignSystem();
