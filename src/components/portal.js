import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();
const mixers = [];

// Función para crear un portal con un modelo GLTF
export function createPortal(name, position, facing, color, options = {}) {
    const group = new THREE.Group();
    group.position.copy(position);
    const lookAt = position.clone().add(facing);
    group.lookAt(lookAt);

    // Anillo del portal
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.15, 12, 64),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, metalness: 0.7, roughness: 0.35 })
    );
    group.add(ring);

    // Plano interior
    const plane = new THREE.Mesh(
        new THREE.CircleGeometry(1.9, 48),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14 })
    );
    group.add(plane);

    // Luz de baliza
    const beacon = new THREE.PointLight(color, 0.8, 12);
    beacon.position.z = 1.5;
    group.add(beacon);

    // Cargar modelo GLTF
    if (options.modelUrl) {
        loadGltfModel(group, name, options);
    } else {
        // Cargar un modelo por defecto si no se proporciona uno
        loadGltfModel(group, name, {
            modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
            scale: 1.5,
            center: true,
            yOffset: 1.0
        });
    }

    return { group, ring, plane, beacon, name, color, facing };
}

function loadGltfModel(group, name, options) {
    const onLoaded = (gltf) => {
        try {
            const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
            if (!model) return;

            // Preparar modelo
            model.traverse((o) => {
                if (o.isMesh) {
                    o.castShadow = false;
                    o.receiveShadow = false;
                }
            });

            if (options.center) {
                const box = new THREE.Box3().setFromObject(model);
                const c = box.getCenter(new THREE.Vector3());
                model.position.sub(c);
            }

            const scl = options.scale != null ? options.scale : 1.0;
            model.scale.setScalar(scl);
            model.rotation.order = 'YXZ';
            if (options.yaw) model.rotation.y = options.yaw;
            if (options.pitch) model.rotation.x = options.pitch;
            if (options.roll) model.rotation.z = options.roll;
            if (options.yOffset) model.position.y += options.yOffset;
            if (options.offset) {
                const off = options.offset;
                model.position.add(new THREE.Vector3(off.x || 0, off.y || 0, off.z || 0));
            }

            group.add(model);

            if (gltf.animations && gltf.animations.length) {
                const mixer = new THREE.AnimationMixer(model);
                const clip = gltf.animations[0];
                const action = mixer.clipAction(clip);
                action.play();
                mixers.push(mixer);
            }
        } catch (e) {
            console.warn('Error applying model for portal', name, e);
        }
    };

    const onError = (failedUrl, err) => {
        console.warn('Failed to load model for portal', name, failedUrl, err);
        if (options.fallbackUrl && failedUrl !== options.fallbackUrl) {
            gltfLoader.load(options.fallbackUrl, onLoaded, undefined, (e) => {
                console.warn('Fallback also failed for portal', name, options.fallbackUrl, e);
            });
        }
    };

    gltfLoader.load(options.modelUrl, onLoaded, undefined, (err) => onError(options.modelUrl, err));
}

export function updatePortals(delta) {
    for (const mixer of mixers) {
        mixer.update(delta);
    }
}
