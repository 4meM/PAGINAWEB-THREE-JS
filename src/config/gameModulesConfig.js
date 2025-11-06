/**
 * Configuración de Módulos de la Escena de Juego
 * Estos módulos aparecen cuando entras al portal "Juego"
 */

export const GAME_MODULE_DEFINITIONS = [
    {
        name: 'Jugabilidad',
        color: 0xff3366,
        description: 'Mecánicas y controles del juego',
        model: {
            url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb',
            fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
            scale: 8.0,
            center: true,
            yaw: 0,
            yOffset: 0.3
        }
    },
    {
        name: 'Progreso',
        color: 0x66ff33,
        description: 'Sistema de avance y logros',
        model: {
            url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
            fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
            scale: 12.0,
            center: true,
            yaw: Math.PI / 4,
            yOffset: 0.5
        }
    },
    {
        name: 'Comunidad',
        color: 0x3366ff,
        description: 'Equipo de desarrollo y comunidad',
        model: {
            url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb',
            fallbackUrl: null,
            scale: 3.0,
            center: true,
            yaw: 0,
            yOffset: 0.0
        }
    }
];

export const GAME_HUB_CONFIG = {
    name: 'Game Hub',
    color: 0xff66cc,
    position: { x: 0, y: 0, z: 0 }
};

export const GAME_STATION_CONFIG = {
    portalRadius: 30,
    enablePortalLinks: false,
    enableSideRails: true,
    catwalkColor: 0xaa44cc,
    strutColor: 0xff3399,
    railColor: 0xcc66ff
};
