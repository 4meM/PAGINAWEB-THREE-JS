import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export const ui = {
    flashEl: null,
    sectionOverlays: {},
    activeSection: null,
    isTransition: false,
    mode: 'space', // 'space' | 'interior'
    pointerLocked: false,
    promptEl: null,
};

export function initUI() {
    ui.promptEl = document.getElementById('prompt');
    ui.flashEl = document.getElementById('flash');
    
    ['inicio', 'juego', 'proyecto'].forEach(id => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
            ui.sectionOverlays[id] = el;
            const btn = el.querySelector('[data-close]');
            if (btn) btn.addEventListener('click', () => leaveSection());
        }
    });
}

export function showPrompt(text) {
    if (ui.promptEl) {
        ui.promptEl.textContent = text;
        ui.promptEl.setAttribute('aria-hidden', 'false');
    }
}

export function hidePrompt() {
    if (ui.promptEl) {
        ui.promptEl.setAttribute('aria-hidden', 'true');
    }
}

export function flash(duration = 650) {
    if (ui.flashEl) {
        ui.isTransition = true;
        ui.flashEl.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            ui.flashEl.setAttribute('aria-hidden', 'true');
            ui.isTransition = false;
        }, duration);
    }
}

export function enterSection(name) {
    if (ui.activeSection || ui.isTransition) return;
    const overlay = ui.sectionOverlays[name.toLowerCase()];
    if (overlay) {
        ui.activeSection = name;
        overlay.setAttribute('aria-hidden', 'false');
        // Unlock pointer if it was locked
        if (ui.pointerLocked) {
            document.exitPointerLock();
        }
    }
}

export function leaveSection() {
    if (!ui.activeSection || ui.isTransition) return;
    const overlay = ui.sectionOverlays[ui.activeSection.toLowerCase()];
    if (overlay) {
        overlay.setAttribute('aria-hidden', 'true');
        ui.activeSection = null;
    }
}

export function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 60;
    const padding = 24;
    const DPR = 2;
    context.font = `700 ${fontSize}px "Orbitron", sans-serif`;
    
    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    canvas.width = (textWidth + padding * 2) * DPR;
    canvas.height = (fontSize + padding * 2) * DPR;
    context.scale(DPR, DPR);
    
    context.font = `700 ${fontSize}px "Orbitron", sans-serif`;
    context.textBaseline = 'top';
    
    context.shadowColor = 'rgba(255,255,255,0.9)';
    context.shadowBlur = 16;
    
    const grad = context.createLinearGradient(0, 0, textWidth, 0);
    grad.addColorStop(0, '#e6ffff');
    grad.addColorStop(1, '#c5c5ff');
    context.fillStyle = grad;

    context.fillText(text, padding, padding);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(aspect * 2.2, 2.2, 1.0);
    
    return sprite;
}
