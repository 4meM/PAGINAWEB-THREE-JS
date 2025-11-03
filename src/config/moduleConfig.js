/**
 * Configuración de Módulos/Portales
 * 
 * Este archivo centraliza la configuración de todos los portales y sus modelos.
 * Para añadir un nuevo portal, simplemente agrega un objeto a este array.
 */

export const MODULE_DEFINITIONS = [
    {
        name: 'Inicio',
        color: 0x66ffff,
        description: '¿Quiénes somos?',
        model: {
            url: 'vehicle_factory/scene.gltf',
            fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb',
            scale: 3.0,
            center: true,
            yaw: (Math.PI / 2) + Math.PI,
            yOffset: 0.25,
            preserveMaterials: true,
            addFillLights: true,
            fillLightIntensity: 20.0,
            fillLightDistance: 30.0,
            offset: { x: 8.0, y: 0, z: 0 }
        }
    },
    {
        name: 'Juego',
        color: 0xff66ff,
        description: 'Proyecto en desarrollo',
        model: {
            url: 'boxing/scene.gltf',
            fallbackUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RiggedFigure/glTF-Binary/RiggedFigure.glb',
            scale: 10.0,
            center: true,
            yaw: 0.2,
            yOffset: 0.4
        }
    },
    {
        name: 'Proyecto',
        color: 0xffff66,
        description: 'Innovación IHC',
        model: null // Usará el modelo por defecto
    }
];

/**
 * Configuración del Hub Central
 */
export const HUB_CONFIG = {
    name: 'Núcleo',
    color: 0x00c6ff,
    position: { x: 0, y: 0, z: 0 }
};

/**
 * Configuración de la Estación
 */
export const STATION_CONFIG = {
    portalRadius: 36,          // Distancia de los portales desde el centro
    portalSpacing: 'equidistant', // 'equidistant' o 'custom'
    enablePortalLinks: false,  // Enlaces diagonales entre portales
    enableSideRails: true,     // Rieles laterales en catwalks
    
    // Colores
    catwalkColor: 0x6cf9ff,
    strutColor: 0x3bd3ff,
    railColor: 0x6cf9ff,
    
    // Dimensiones
    sideRailOffset: 0.6,
    sideRailHeight: 0.08,
    sideRailThickness: 0.02
};
