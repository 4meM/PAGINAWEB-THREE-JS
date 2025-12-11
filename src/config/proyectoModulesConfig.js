/**
 * Configuración de módulos del Proyecto IHC
 */

export const PROYECTO_MODULE_DEFINITIONS = [
    {
        name: 'momentos',
        displayName: 'Momentos Interesantes',
        color: 0x00d4ff,
        model: 'vehicle_factory/scene.gltf'
    },
    {
        name: 'necesidades',
        displayName: 'Necesidades',
        color: 0xff6b35,
        model: 'boxing/scene.gltf'
    },
    {
        name: 'entrevistas',
        displayName: 'Entrevistas',
        color: 0x7fff00,
        model: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb'
    },
    {
        name: 'storyboard',
        displayName: 'Storyboard',
        color: 0xff00ff,
        model: 'vehicle_factory/scene.gltf'
    }
];

export const PROYECTO_HUB_CONFIG = {
    name: 'Proyecto IHC Hub',
    position: { x: 0, y: -1.63, z: 0 },
    color: 0x4a90e2
};

export const PROYECTO_STATION_CONFIG = {
    portalRadius: 26,
    strutColor: 0x4a90e2,
    catwalkColor: 0x4a90e2
};
