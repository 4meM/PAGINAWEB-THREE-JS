# Proyecto Three.js - Estación Espacial 3D

## 🏗️ Arquitectura Modular Escalable

Este proyecto ha sido refactorizado siguiendo los principios de **Atomic Design** y una **arquitectura modular** similar a la usada en frameworks modernos como React, Vue y Angular.

## 📁 Estructura del Proyecto

```
/
├── index.html                 # Punto de entrada HTML
├── style.css                  # Estilos globales
├── main.js                    # Punto de entrada de la aplicación
│
├── src/
│   ├── core/                  # 🎯 Núcleo de la aplicación
│   │   ├── Engine.js          # Motor de Three.js (render, scene, composer)
│   │   ├── State.js           # Estado global centralizado
│   │   ├── InputManager.js    # Gestor de entrada (teclado, ratón)
│   │   └── PlayerController.js # Control y física del jugador
│   │
│   ├── scenes/                # 🌍 Gestión de escenas/mundos
│   │   ├── SceneManager.js    # Orquestador de escenas
│   │   └── MainScene.js       # Escena principal (estación espacial)
│   │
│   ├── components/            # 🧱 Componentes 3D reutilizables
│   │   ├── atoms/             # Primitivas básicas
│   │   │   └── Primitives.js  # Starfield, TextSprite, Struts, etc.
│   │   │
│   │   ├── molecules/         # Componentes simples
│   │   │   ├── Portal.js      # Portal reutilizable con modelo GLTF
│   │   │   ├── Catwalk.js     # Pasarela con colisionadores
│   │   │   ├── StationHub.js  # Hub central de la estación
│   │   │   └── StationPad.js  # Plataforma/pad estático
│   │   │
│   │   └── organisms/         # Componentes complejos
│   │       └── SpaceStation.js # Estación completa (agrupa moléculas)
│   │
│   └── ui/                    # 🎨 Interfaz de usuario
│       └── UIManager.js       # Gestor de overlays y HUD
│
├── boxing/                    # Modelos GLTF
│   └── scene.gltf
│
└── vehicle_factory/
    └── scene.gltf
```

## 🎨 Atomic Design Aplicado a 3D

### **Atoms (Átomos)**
Componentes 3D más básicos y primitivos:
- `createStarfield()` - Campo de estrellas
- `createTextSprite()` - Etiquetas 3D
- `createStrut()` - Vigas/cilindros conectores
- `createPlatform()` - Plataforma básica

### **Molecules (Moléculas)**
Componentes reutilizables que combinan átomos:
- **`Portal`** - Portal con anillo, plano y carga de modelos GLTF
- **`Catwalk`** - Pasarela con vigas y colisionadores
- **`StationHub`** - Hub central con deck y mástil
- **`StationPad`** - Plataforma con colisionador

### **Organisms (Organismos)**
Componentes complejos que agrupan moléculas:
- **`SpaceStation`** - Construye la estación completa usando portales, catwalks, hub, etc.

## 🚀 Cómo Funciona

### 1. **Inicialización** (`main.js`)
```javascript
const app = new App();
app.init();
```

La clase `App` orquesta todos los módulos:
1. **Engine**: Inicializa Three.js (scene, camera, renderer)
2. **InputManager**: Configura eventos de teclado y ratón
3. **PlayerController**: Maneja movimiento y física del jugador
4. **UIManager**: Gestiona elementos DOM (overlays, HUD)
5. **SceneManager**: Carga la escena inicial

### 2. **Estado Global** (`State.js`)
Todo el estado mutable está centralizado:
```javascript
state.player     // Posición, velocidad, física
state.camera     // Yaw, pitch, sensibilidad
state.input      // Teclas presionadas, mouse
state.ui         // Pointer lock, sección activa
state.scene      // Escena actual, portales, mixers
```

### 3. **Gestión de Escenas** (`SceneManager.js`)
El `SceneManager` permite cargar/descargar escenas dinámicamente:
```javascript
await sceneManager.loadScene('main');          // Escena principal
await sceneManager.transitionTo('interior');   // Cambiar escena
```

**Añadir una nueva escena es muy fácil:**
1. Crear `src/scenes/NewScene.js`
2. Registrarla en `SceneManager`
3. Cargarla cuando sea necesario

### 4. **Portales Reutilizables** (`Portal.js`)
Los portales son componentes completamente reutilizables:

```javascript
const portal = new Portal(
    'Inicio',                    // Nombre
    new THREE.Vector3(x, y, z),  // Posición
    facingVector,                // Dirección
    0x66ffff,                    // Color
    {                            // Configuración del modelo
        url: 'boxing/scene.gltf',
        fallbackUrl: 'https://...',
        scale: 10.0,
        center: true,
        yaw: 0.2
    }
);
```

**Si no se especifica un modelo, usa uno por defecto automáticamente.**

## 🎮 Controles

- **WASD**: Movimiento
- **Mouse**: Mirar alrededor (hacer clic para bloquear puntero)
- **Space**: Saltar
- **Enter**: Entrar al portal cercano
- **Esc**: Cerrar overlays

## 🔧 Escalabilidad

### ✅ Añadir un Nuevo Portal
```javascript
// En src/components/organisms/SpaceStation.js
moduleDefinitions.push({
    name: 'NuevoModulo',
    color: 0xff00ff,
    model: {
        url: 'ruta/al/modelo.gltf',
        scale: 5.0,
        center: true
    }
});
```

### ✅ Añadir una Nueva Escena (ej: Interior de una nave)
```javascript
// 1. Crear src/scenes/InteriorScene.js
export class InteriorScene {
    constructor(engine) { ... }
    async load() { ... }
    update(delta, elapsed) { ... }
    unload() { ... }
}

// 2. Registrarla en SceneManager.js
this.registerScene('interior', InteriorScene);

// 3. Cargarla cuando se entre al portal
await sceneManager.transitionTo('interior');
```

### ✅ Añadir Nuevos Componentes 3D
- **Átomos**: Agregar a `src/components/atoms/Primitives.js`
- **Moléculas**: Crear nuevo archivo en `src/components/molecules/`
- **Organismos**: Crear nuevo archivo en `src/components/organisms/`

## 📦 Dependencias

- **Three.js** v0.132.2 (via Skypack CDN)
- Postprocesamiento: EffectComposer, UnrealBloomPass
- GLTF Loader para modelos 3D

## 🎯 Beneficios de Esta Arquitectura

1. **Modularidad**: Cada componente tiene una responsabilidad única
2. **Reutilización**: Los portales, catwalks, etc. son 100% reutilizables
3. **Escalabilidad**: Fácil añadir nuevas escenas, portales y componentes
4. **Mantenibilidad**: Código organizado y fácil de entender
5. **Testabilidad**: Cada módulo puede probarse independientemente
6. **Separación de Responsabilidades**: UI, lógica 3D y estado están separados

## 🚧 Próximos Pasos

- [ ] Añadir escenas de interiores para cada portal
- [ ] Crear más componentes atómicos (puertas, luces, paneles)
- [ ] Implementar sistema de carga asíncrona de modelos
- [ ] Añadir sistema de física más avanzado
- [ ] Implementar sistema de audio espacial
- [ ] Añadir sistema de partículas

## 📝 Notas

Este proyecto está diseñado para crecer. La arquitectura actual permite añadir fácilmente:
- Múltiples niveles/mundos
- Sistema de inventario
- NPCs y enemigos
- Misiones y objetivos
- Multijugador (con backend)

¡La estructura está lista para escalar! 🚀
