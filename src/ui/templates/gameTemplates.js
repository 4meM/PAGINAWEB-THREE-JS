/**
 * TEMPLATES: gameTemplates
 * Factory de templates HTML para módulos de juego
 * Patrón Template Method + Factory para generación consistente de HTML
 */

import { JUGABILIDAD_CONTENT, PROGRESO_CONTENT, COMUNIDAD_CONTENT } from '../../data/gameContent.js';
import { MOMENTOS_CONTENT, NECESIDADES_CONTENT, ENTREVISTAS_CONTENT, STORYBOARD_CONTENT } from '../../data/proyectoContent.js';

/**
 * Template base para secciones de juego
 */
class SectionTemplate {
    constructor(content) {
        this.content = content;
    }

    /**
     * Renderiza el header de la sección (común para todas)
     */
    renderHeader() {
        return `
            <div class="game-section__header">
                <h2 class="game-section__title">${this.content.title}</h2>
                ${this.content.subtitle ? `<p class="game-section__subtitle">${this.content.subtitle}</p>` : ''}
            </div>
        `;
    }

    /**
     * Renderiza el footer de la sección (común para todas)
     */
    renderFooter() {
        return `
            <div class="game-section__footer">
                <button class="game-section__close-btn" data-close>
                    Volver
                </button>
            </div>
        `;
    }

    /**
     * Método abstracto para el contenido específico
     * Debe ser implementado por subclases
     */
    renderContent() {
        throw new Error('renderContent() must be implemented by subclass');
    }

    /**
     * Template method que define la estructura completa
     */
    render() {
        return `
            <div class="game-section__card">
                ${this.renderHeader()}
                <div class="game-section__body">
                    ${this.renderContent()}
                </div>
                ${this.renderFooter()}
            </div>
        `;
    }
}

/**
 * Template para la sección de Jugabilidad (Estilo Game.tsx)
 */
class JugabilidadTemplate extends SectionTemplate {
    renderContent() {
        return `
            <div class="jugabilidad-content">
                <!-- Título impactante -->
                <div class="jugabilidad-hero">
                    <h2 class="jugabilidad-hero__title">${this.content.title}</h2>
                    <div class="jugabilidad-hero__subtitle-container">
                        <div class="jugabilidad-hero__line"></div>
                        <span class="jugabilidad-hero__subtitle">⚡ ${this.content.subtitle} ⚡</span>
                        <div class="jugabilidad-hero__line jugabilidad-hero__line--reverse"></div>
                    </div>
                    <p class="jugabilidad-hero__description">${this.content.description}</p>
                </div>

                <!-- Fila 1: ¿En qué consiste? (texto izquierda, imagen derecha) -->
                <div class="jugabilidad-row">
                    <div class="jugabilidad-card jugabilidad-card--left">
                        <div class="jugabilidad-card__content">
                            <h4 class="jugabilidad-card__title">${this.content.sections[0].title}</h4>
                            <div class="jugabilidad-items">
                                ${this.content.sections[0].items.map(item => `
                                    <div class="jugabilidad-item">
                                        <span class="jugabilidad-item__icon">${item.icon}</span>
                                        <p class="jugabilidad-item__text">
                                            <strong class="jugabilidad-highlight">${item.highlight}</strong> ${item.text}
                                        </p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="jugabilidad-image jugabilidad-image--right">
                        <img src="images/descripcion1.png" alt="Gameplay Virtual Knockout" class="jugabilidad-image__img" />
                    </div>
                </div>

                <!-- Fila 2: Objetivo (imagen izquierda, texto derecha) -->
                <div class="jugabilidad-row jugabilidad-row--reverse">
                    <div class="jugabilidad-image jugabilidad-image--left">
                        <img src="images/objetivo1.png" alt="Objetivo Virtual Knockout" class="jugabilidad-image__img" />
                    </div>
                    <div class="jugabilidad-card jugabilidad-card--right">
                        <div class="jugabilidad-card__content">
                            <h5 class="jugabilidad-card__title">${this.content.sections[1].title}</h5>
                            <p class="jugabilidad-card__text">
                                ${this.content.sections[1].description}
                                <span class="jugabilidad-card__highlight">${this.content.sections[1].highlight}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Fila 3: Features (texto izquierda, imagen derecha) -->
                <div class="jugabilidad-row">
                    <div class="jugabilidad-features jugabilidad-features--left">
                        <p class="jugabilidad-features__intro">${this.content.sections[2].title}</p>
                        <div class="jugabilidad-features__grid">
                            ${this.content.sections[2].features.map(feature => `
                                <div class="feature-card">
                                    <span class="feature-card__icon">${feature.icon}</span>
                                    <div class="feature-card__content">
                                        <span class="feature-card__title">${feature.title}</span>
                                        <span class="feature-card__description">${feature.description}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="jugabilidad-image jugabilidad-image--right">
                        <img src="images/cinturon.png" alt="Acción Virtual Knockout" class="jugabilidad-image__img jugabilidad-image__img--gold" />
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Template para la sección de Progreso (Estilo Game.tsx)
 */
class ProgresoTemplate extends SectionTemplate {
    renderContent() {
        return `
            <div class="progreso-content">
                <!-- Hero Section -->
                <div class="progreso-hero">
                    <h3 class="progreso-hero__title">Proceso de Desarrollo</h3>
                    <p class="progreso-hero__subtitle">
                        Metodología aplicada desde la conceptualización hasta la implementación final
                    </p>
                </div>
                
                <!-- Timeline -->
                <div id="progreso-timeline" class="timeline-wrapper"></div>
            </div>
        `;
    }
}

/**
 * Template para la sección de Comunidad (Estilo Game.tsx)
 */
class ComunidadTemplate extends SectionTemplate {
    renderContent() {
        return `
            <div class="comunidad-content">
                <!-- Team Title -->
                <div class="comunidad-hero">
                    <h3 class="comunidad-hero__title">${this.content.title}</h3>
                    <p class="comunidad-hero__subtitle">${this.content.subtitle}</p>
                </div>

                <!-- Team Grid -->
                <div class="team-grid">
                    ${this.content.team.map((member, index) => `
                        <div class="team-card" data-member="${index + 1}" style="border-color: ${member.borderColor}33;">
                            <!-- Avatar -->
                            <div class="team-card__avatar" style="border-color: ${member.borderColor}80;">
                                <img 
                                    src="${member.image}" 
                                    alt="${member.name}"
                                    class="team-card__image"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                />
                                <div class="team-card__fallback" style="display:none; background: linear-gradient(to bottom right, ${member.borderColor}, ${member.roleColor});">
                                    ${member.fallbackLetter}
                                </div>
                            </div>
                            
                            <!-- Info -->
                            <div class="team-card__info">
                                <h4 class="team-card__name">${member.name}</h4>
                                <p class="team-card__role" style="color: ${member.roleColor};">${member.role}</p>
                                <p class="team-card__bio">${member.bio}</p>
                                
                                <!-- Skills -->
                                <div class="team-card__skills">
                                    ${member.skills.map(skill => `
                                        <span class="skill-badge" style="background: ${skill.color}33; color: ${skill.color}; border-color: ${skill.color}4D;">
                                            ${skill.name}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Project Info -->
                <div class="project-info">
                    <div class="project-info__card">
                        <div class="project-info__header">
                            <div class="project-info__icon">
                                ${this.content.projectInfo.icon}
                            </div>
                            <h4 class="project-info__title">${this.content.projectInfo.title}</h4>
                        </div>
                        
                        <p class="project-info__description">
                            ${this.content.projectInfo.description}
                        </p>
                        
                        <!-- Stats Grid -->
                        <div class="project-stats">
                            ${this.content.projectInfo.stats.map(stat => `
                                <div class="project-stat">
                                    <div class="project-stat__value" style="color: ${stat.color};">
                                        ${stat.value}
                                    </div>
                                    <div class="project-stat__label">${stat.label}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Template para Momentos Interesantes
 */
class MomentosTemplate extends SectionTemplate {
    renderContent() {
        return `
            <div class="game-section__body">
                <p class="game-section__description">${this.content.description}</p>
                ${this.content.sections.map(section => `
                    <div class="content-block">
                        <h3>${section.title}</h3>
                        <p>${section.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

/**
 * Template para Necesidades
 */
class NecesidadesTemplate extends SectionTemplate {
    renderContent() {
        return `
            <div class="game-section__body">
                <p class="game-section__description">${this.content.description}</p>
                ${this.content.sections.map(section => `
                    <div class="content-block">
                        <h3>${section.title}</h3>
                        <p>${section.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

/**
 * Template para Entrevistas
 */
class EntrevistasTemplate extends SectionTemplate {
    renderContent() {
        return `
            <div class="game-section__body">
                <p class="game-section__description">${this.content.description}</p>
                
                <!-- Grid de Personas -->
                <div class="entrevistas-personas-grid">
                    ${this.content.personas.map((persona, personaIndex) => `
                        <div class="entrevistas-persona-card">
                            <h3 class="persona-name">${persona.name}</h3>
                            <div class="entrevistas-list">
                                ${persona.entrevistas.map((entrevista, entrevistaIndex) => {
                                    const icon = entrevista.type === 'audio' ? '🎵' : '🎥';
                                    return `
                                    <button 
                                        class="entrevista-button" 
                                        data-drive-id="${entrevista.driveId}"
                                        data-title="${persona.name} - ${entrevista.title}"
                                        data-type="${entrevista.type || 'video'}"
                                    >
                                        ${icon} ${entrevista.title}
                                    </button>
                                `}).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

/**
 * Template para Storyboard
 */
class StoryboardTemplate extends SectionTemplate {
    renderContent() {
        return `
            <div class="game-section__body">
                <p class="game-section__description">${this.content.description}</p>
                ${this.content.sections.map(section => `
                    <div class="content-block">
                        <h3>${section.title}</h3>
                        <p>${section.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

/**
 * Factory para crear templates
 */
export class GameTemplateFactory {
    static create(moduleName) {
        switch(moduleName.toLowerCase()) {
            case 'jugabilidad':
                return new JugabilidadTemplate(JUGABILIDAD_CONTENT);
            case 'progreso':
                return new ProgresoTemplate(PROGRESO_CONTENT);
            case 'comunidad':
                return new ComunidadTemplate(COMUNIDAD_CONTENT);
            case 'momentos':
                return new MomentosTemplate(MOMENTOS_CONTENT);
            case 'necesidades':
                return new NecesidadesTemplate(NECESIDADES_CONTENT);
            case 'entrevistas':
                return new EntrevistasTemplate(ENTREVISTAS_CONTENT);
            case 'storyboard':
                return new StoryboardTemplate(STORYBOARD_CONTENT);
            default:
                throw new Error(`Unknown module: ${moduleName}`);
        }
    }

    /**
     * Genera HTML para un módulo específico
     */
    static generateHTML(moduleName) {
        const template = this.create(moduleName);
        return template.render();
    }
}
