/**
 * ATOMS: Componentes 3D más básicos y reutilizables
 * Estas son las "primitivas" de tu aplicación 3D
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Crea un sprite de texto 3D estilizado
 */
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
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true 
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(aspect * 2.2, 2.2, 1.0);
    
    return sprite;
}

/**
 * Crea un campo de estrellas con múltiples capas para profundidad
 */
export function createStarfield() {
    const group = new THREE.Group();

    function makeLayer(count, size, opacity) {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        let i3 = 0;
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 2400;
            const y = (Math.random() - 0.5) * 2400;
            const z = (Math.random() - 0.5) * 2400;
            
            if (x*x + y*y + z*z < 130*130) {
                i--;
                continue;
            }
            
            positions[i3] = x;
            positions[i3+1] = y;
            positions[i3+2] = z;
            
            const tint = 0.92 + Math.random() * 0.08;
            const blueBoost = 0.96 + Math.random() * 0.2;
            colors[i3] = tint * 0.96;
            colors[i3+1] = tint * 0.98;
            colors[i3+2] = Math.min(1.0, tint * blueBoost);
            i3 += 3;
        }
        
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const mat = new THREE.PointsMaterial({
            color: 0xffffff,
            size,
            sizeAttenuation: true,
            transparent: true,
            opacity,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false
        });
        
        const pts = new THREE.Points(geom, mat);
        return { points: pts, material: mat };
    }

    const far = makeLayer(9000, 0.10, 0.70);
    const mid = makeLayer(6000, 0.16, 0.85);
    group.add(far.points);
    group.add(mid.points);

    group.userData.materials = [far.material, mid.material];
    return group;
}

/**
 * Crea un cilindro que conecta dos puntos (para struts/vigas)
 */
export function createStrut(pointA, pointB, color, radius = 0.12) {
    const dir = new THREE.Vector3().subVectors(pointB, pointA);
    const len = dir.length();
    
    // Validar que la longitud sea válida
    if (len < 0.01 || !isFinite(len)) {
        console.warn('createStrut: Invalid length', len, pointA, pointB);
        return new THREE.Group(); // Retornar grupo vacío
    }
    
    const mid = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);
    
    const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, len, 16),
        new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.6
        })
    );
    
    tube.position.copy(mid);
    tube.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize()
    );
    
    return tube;
}

/**
 * Crea una plataforma/pad estática básica
 */
export function createPlatform(center, size, color) {
    const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x0b141c,
        metalness: 0.8,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.35
    });
    
    const pad = new THREE.Mesh(geom, mat);
    pad.position.copy(center);
    
    return pad;
}

/**
 * Crea luces de navegación parpadeantes
 */
export function createNavLights(color, positions) {
    const lights = [];
    
    for (const pos of positions) {
        const light = new THREE.PointLight(color, 0.0, 8);
        light.position.copy(pos);
        lights.push(light);
    }
    
    return lights;
}
