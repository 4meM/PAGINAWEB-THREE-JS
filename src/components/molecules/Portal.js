/**
 * MOLECULE: Portal
 * Un portal reutilizable que puede cargar cualquier modelo GLTF o usar uno por defecto
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { state, mutations } from '../../core/State.js';
import { createTextSprite } from '../atoms/Primitives.js';

const gltfLoader = new GLTFLoader();

// Caché global de modelos GLTF para evitar recargas
const modelCache = new Map();

// Modelo por defecto si no se especifica uno
const DEFAULT_MODEL = {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    scale: 1.5,
    yOffset: 1.0
};

export class Portal {
    constructor(name, position, facing, color, modelConfig = null) {
        this.name = name;
        this.position = position;
        this.facing = facing;
        this.color = color;
        this.modelConfig = modelConfig || DEFAULT_MODEL;
        
        this.group = new THREE.Group();
        this.ring = null;
        this.plane = null;
        this.beacon = null;
        this.model = null;
        this.label = null;
        this.isModelLoaded = false;
        
        this.build();
        // NO cargar el modelo automáticamente
        // this.loadModel();
    }

    build() {
        this.group.position.copy(this.position);
        const lookAt = this.position.clone().add(this.facing);
        this.group.lookAt(lookAt);

        // Anillo del portal
        this.ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.2, 0.15, 12, 64),
            new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 0.9,
                metalness: 0.7,
                roughness: 0.35
            })
        );
        this.group.add(this.ring);

        // Plano interior semitransparente
        this.plane = new THREE.Mesh(
            new THREE.CircleGeometry(1.9, 48),
            new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.14
            })
        );
        this.group.add(this.plane);

        // Luz de baliza
        this.beacon = new THREE.PointLight(this.color, 0.8, 12);
        this.beacon.position.z = 1.5;
        this.group.add(this.beacon);
        
        // Etiqueta de texto flotante sobre el portal
        this.label = createTextSprite(this.name);
        this.label.position.set(0, 3.0, 0);
        this.group.add(this.label);
    }

    loadModel() {
        if (this.isModelLoaded) {
            console.log(`Portal ${this.name}: Model already loaded`);
            return Promise.resolve();
        }

        const config = this.modelConfig;
        const primaryUrl = config.url || config.modelUrl;
        const fallbackUrl = config.fallbackUrl;

        if (!primaryUrl) {
            console.warn(`Portal ${this.name}: No model URL provided, using default`);
            return this.loadGLTF(DEFAULT_MODEL.url, DEFAULT_MODEL);
        }

        return this.loadGLTF(primaryUrl, config, fallbackUrl);
    }

    loadGLTF(url, config, fallbackUrl = null) {
        // Check cache first
        if (modelCache.has(url)) {
            console.log(`Portal ${this.name}: Loading model from cache (${url})`);
            const cachedGltf = modelCache.get(url);
            
            // Crear un objeto gltf fake con el modelo clonado
            const clonedGltf = {
                scene: this.cloneGltfScene(cachedGltf.scene),
                animations: cachedGltf.animations
            };
            
            // Usar el mismo método que para red, ya que los materiales están clonados
            this.onModelLoaded(clonedGltf, config);
            return Promise.resolve();
        }

        console.log(`Portal ${this.name}: Loading model from network (${url})`);
        
        return new Promise((resolve, reject) => {
            gltfLoader.load(
                url,
                (gltf) => {
                    const originalScene = gltf.scene || (gltf.scenes && gltf.scenes[0]);
                    
                    // Store the ORIGINAL unmodified model in cache
                    modelCache.set(url, {
                        scene: originalScene,
                        animations: gltf.animations
                    });
                    
                    // Clone it for this portal instance
                    const clonedGltf = {
                        scene: this.cloneGltfScene(originalScene),
                        animations: gltf.animations
                    };
                    
                    // Process only the clone, not the cached original
                    this.onModelLoaded(clonedGltf, config);
                    resolve();
                },
                undefined,
                (error) => {
                    this.onModelError(url, error, fallbackUrl, config);
                    reject(error);
                }
            );
        });
    }

    /**
     * Clona correctamente un modelo GLTF con materiales independientes
     */
    cloneGltfScene(source) {
        const cloned = source.clone(true);
        
        // Clonar materiales profundamente para que cada portal tenga su propia copia
        cloned.traverse((node) => {
            if (node.isMesh && node.material) {
                if (Array.isArray(node.material)) {
                    node.material = node.material.map(mat => this.deepCloneMaterial(mat));
                } else {
                    node.material = this.deepCloneMaterial(node.material);
                }
            }
        });
        
        return cloned;
    }

    /**
     * Clona un material profundamente preservando todas las propiedades
     */
    deepCloneMaterial(material) {
        const cloned = material.clone();
        
        // Preservar propiedades emisivas originales
        if (material.emissive) {
            cloned.emissive = material.emissive.clone();
            cloned.emissiveIntensity = material.emissiveIntensity;
        }
        
        // Preservar otras propiedades importantes
        if (material.color) cloned.color = material.color.clone();
        if (material.map) cloned.map = material.map;
        if (material.emissiveMap) cloned.emissiveMap = material.emissiveMap;
        
        cloned.opacity = material.opacity;
        cloned.transparent = material.transparent;
        cloned.side = material.side;
        
        return cloned;
    }

    onModelLoaded(gltf, config) {
        try {
            const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
            if (!model) return;

            // Procesar el modelo
            model.traverse((obj) => {
                if (obj.isMesh) {
                    obj.castShadow = false;
                    obj.receiveShadow = false;
                    
                    if (!config.preserveMaterials && obj.material?.emissive) {
                        obj.material.emissiveIntensity = Math.min(
                            0.2,
                            obj.material.emissiveIntensity || 0.2
                        );
                    }
                }
            });

            // Centrar el modelo si se solicita
            if (config.center) {
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);
            }

            // Aplicar transformaciones
            const scale = config.scale != null ? config.scale : 1.0;
            model.scale.setScalar(scale);
            
            model.rotation.order = 'YXZ';
            if (config.yaw) model.rotation.y = config.yaw;
            if (config.pitch) model.rotation.x = config.pitch;
            if (config.roll) model.rotation.z = config.roll;
            
            if (config.yOffset) model.position.y += config.yOffset;
            if (config.offset) {
                const off = config.offset;
                model.position.add(new THREE.Vector3(off.x || 0, off.y || 0, off.z || 0));
            }

            this.group.add(model);
            this.model = model;
            this.isModelLoaded = true;

            // Añadir luces locales si se solicita
            if (config.addFillLights) {
                this.addFillLights(model, config);
            }

            // Reproducir animaciones si existen
            if (gltf.animations && gltf.animations.length) {
                this.playAnimation(model, gltf.animations);
            }

            console.log(`✓ Model loaded for portal: ${this.name}`);
        } catch (e) {
            console.warn(`Error applying model for portal ${this.name}:`, e);
        }
    }

    onModelError(url, error, fallbackUrl, config) {
        console.warn(`Failed to load model for portal ${this.name} from ${url}:`, error);
        
        if (fallbackUrl && url !== fallbackUrl) {
            console.log(`Trying fallback model for ${this.name}...`);
            this.loadGLTF(fallbackUrl, config);
        } else if (url !== DEFAULT_MODEL.url) {
            console.log(`Using default model for ${this.name}...`);
            this.loadGLTF(DEFAULT_MODEL.url, DEFAULT_MODEL);
        }
    }

    addFillLights(model, config) {
        try {
            const bbox = new THREE.Box3().setFromObject(model);
            const center = bbox.getCenter(new THREE.Vector3());
            const size = bbox.getSize(new THREE.Vector3());
            const maxSide = Math.max(size.x, size.y, size.z) || 3;
            
            const baseI = config.fillLightIntensity || 1.2;
            const baseD = config.fillLightDistance || maxSide * 3.0;

            const key = new THREE.PointLight(0xffffff, baseI * 1.0, baseD);
            key.position.copy(center).add(new THREE.Vector3(
                maxSide * 0.45,
                maxSide * 0.35,
                maxSide * 0.6
            ));

            const fill = new THREE.PointLight(0xffedd5, baseI * 0.75, baseD);
            fill.position.copy(center).add(new THREE.Vector3(
                -maxSide * 0.5,
                maxSide * 0.2,
                -maxSide * 0.3
            ));

            const rim = new THREE.PointLight(0x66ccff, baseI * 0.8, baseD * 1.1);
            rim.position.copy(center).add(new THREE.Vector3(
                0,
                maxSide * 0.7,
                -maxSide * 0.1
            ));

            this.group.add(key, fill, rim);
        } catch (e) {
            console.warn(`Error adding fill lights for portal ${this.name}:`, e);
        }
    }

    playAnimation(model, animations) {
        const mixer = new THREE.AnimationMixer(model);
        
        // Buscar animación preferida
        const names = animations.map(a => (a.name || '').toLowerCase());
        const prefer = ['idle', 'walk', 'run', 'dance', 'wave'];
        
        let clip = null;
        for (const p of prefer) {
            const idx = names.findIndex(n => n.includes(p));
            if (idx >= 0) {
                clip = animations[idx];
                break;
            }
        }
        
        if (!clip) clip = animations[0];
        
        const action = mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        action.play();
        
        mutations.addMixer(mixer);
    }

    getGroup() {
        return this.group;
    }

    update(elapsed) {
        // Animación sutil del anillo
        if (this.ring) {
            this.ring.rotation.z = elapsed * 0.3;
        }
    }
}
