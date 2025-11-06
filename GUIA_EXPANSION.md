# Guía de Expansión del Proyecto

## 🎯 Cómo Añadir un Nuevo Portal

### Opción 1: Configuración Rápida (Recomendado)

Edita el archivo `src/config/moduleConfig.js` y añade un nuevo objeto al array `MODULE_DEFINITIONS`:

```javascript
{
    name: 'MiNuevoPortal',
    color: 0x00ff00,  // Verde
    description: 'Descripción del portal',
    model: {
        url: 'ruta/a/mi/modelo.gltf',
        fallbackUrl: 'https://url/de/respaldo.glb',
        scale: 5.0,
        center: true,
        yaw: 0,
        yOffset: 0.5
    }
}
```

**¡Y listo!** El sistema automáticamente:
- Creará el portal en la estación
- Cargará el modelo especificado (o uno por defecto si `model: null`)
- Configurará las pasarelas y plataformas
- Registrará el portal para detección de proximidad

### Opción 2: Sin Modelo 3D

Si quieres un portal simple sin modelo personalizado:

```javascript
{
    name: 'PortalSimple',
    color: 0xff00ff,
    description: 'Portal sin modelo custom',
    model: null  // Usará el modelo por defecto
}
```

## 🏢 Cómo Crear una Nueva Escena/Mundo

Cuando un jugador entre a un portal, puedes llevarlo a una escena completamente nueva (ej: interior de una nave, otro planeta, un nivel de juego).

### Paso 1: Crear la Clase de Escena

Crea un nuevo archivo en `src/scenes/` (ej: `InteriorScene.js`):

```javascript
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class InteriorScene {
    constructor(engine, portalName) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.portalName = portalName;
        this.root = new THREE.Group();
    }

    async load() {
        console.log(`Loading interior for: ${this.portalName}`);
        
        this.scene.add(this.root);
        
        // Construir tu mundo aquí
        this.buildRoom();
        this.setupLights();
        
        return {
            spawnPoint: new THREE.Vector3(0, 1.6, 5)
        };
    }

    buildRoom() {
        // Crear piso, paredes, objetos, etc.
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        floor.rotation.x = -Math.PI / 2;
        this.root.add(floor);
        
        // Añadir más objetos...
    }

    setupLights() {
        const light = new THREE.PointLight(0xffffff, 1, 50);
        light.position.set(0, 5, 0);
        this.root.add(light);
    }

    update(delta, elapsed) {
        // Actualizar animaciones, física, etc.
    }

    unload() {
        this.scene.remove(this.root);
        // Limpiar recursos...
    }
}
```

### Paso 2: Registrar la Escena

En `src/scenes/SceneManager.js`, registra tu nueva escena:

```javascript
constructor(engine) {
    this.engine = engine;
    this.currentScene = null;
    this.scenes = new Map();
    
    this.registerScene('main', MainScene);
    this.registerScene('interior', InteriorScene);  // <-- Añadir aquí
}
```

### Paso 3: Cargar la Escena al Entrar al Portal

Modifica `src/core/PlayerController.js` en el método `enterPortal()`:

```javascript
enterPortal(portal) {
    // Transición visual
    const flashEl = document.getElementById('flash');
    if (flashEl) {
        flashEl.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            flashEl.setAttribute('aria-hidden', 'true');
        }, 650);
    }

    // Cargar la nueva escena
    setTimeout(async () => {
        // En lugar de solo abrir un overlay, carga una escena nueva
        await this.sceneManager.transitionTo('interior', portal.name);
        
        // Posicionar al jugador en el spawn point de la nueva escena
        const sceneData = this.sceneManager.getCurrentScene();
        if (sceneData && sceneData.spawnPoint) {
            this.camera.position.copy(sceneData.spawnPoint);
        }
    }, 325);
}
```

### Paso 4: Añadir un Portal de Salida en la Nueva Escena

En tu `InteriorScene`, crea un portal de salida:

```javascript
buildRoom() {
    // ... tu código de construcción ...
    
    // Portal de salida
    this.exitPortal = new THREE.Mesh(
        new THREE.CircleGeometry(1.5, 32),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5
        })
    );
    this.exitPortal.position.set(0, 2, -10);
    this.root.add(this.exitPortal);
}

update(delta, elapsed) {
    // Detectar si el jugador está cerca del portal de salida
    const playerPos = this.engine.getCamera().position;
    const dist = playerPos.distanceTo(this.exitPortal.position);
    
    if (dist < 2.0) {
        this.showExitPrompt();
        
        // Si presiona Enter, volver a la escena principal
        if (state.input.keys.enter) {
            this.exitToMainScene();
        }
    }
}

async exitToMainScene() {
    await this.engine.sceneManager.transitionTo('main');
}
```

## 🎨 Personalización de Portales

### Cambiar el Color de un Portal

En `moduleConfig.js`:
```javascript
color: 0xff0000  // Rojo
color: 0x00ff00  // Verde
color: 0x0000ff  // Azul
color: 0xffff00  // Amarillo
```

### Ajustar el Modelo 3D

```javascript
model: {
    url: 'mi/modelo.gltf',
    scale: 10.0,           // Tamaño del modelo
    center: true,          // Centrar el modelo
    yaw: Math.PI / 4,      // Rotación horizontal (radianes)
    pitch: 0,              // Rotación vertical
    roll: 0,               // Rotación lateral
    yOffset: 2.0,          // Elevar el modelo
    offset: {              // Mover el modelo
        x: 5,
        y: 0,
        z: -3
    },
    preserveMaterials: true,  // Mantener materiales originales
    addFillLights: true,      // Añadir luces para resaltar
    fillLightIntensity: 15.0, // Intensidad de las luces
    fillLightDistance: 25.0   // Alcance de las luces
}
```

### Añadir Animaciones Automáticas

Si tu modelo GLTF tiene animaciones, se reproducirán automáticamente. La clase `Portal` busca animaciones con nombres comunes:
- 'idle'
- 'walk'
- 'run'
- 'dance'
- 'wave'

Si no encuentra ninguna, reproduce la primera animación disponible.

## 🔧 Configuración Avanzada

### Cambiar el Diseño de la Estación

En `src/config/moduleConfig.js`, modifica `STATION_CONFIG`:

```javascript
export const STATION_CONFIG = {
    portalRadius: 50,          // Aumentar distancia de portales
    enablePortalLinks: true,   // Conectar portales entre sí
    enableSideRails: false,    // Quitar rieles laterales
    catwalkColor: 0xff00ff,    // Cambiar color de pasarelas
    strutColor: 0x00ffff,      // Cambiar color de vigas
};
```

### Añadir Más de 3 Portales

El sistema calcula automáticamente los ángulos. Para añadir más portales, simplemente agrega más objetos a `MODULE_DEFINITIONS`.

Para 4 portales (cuadrado):
```javascript
const angles = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
```

Para 5 portales (pentágono):
```javascript
const angles = Array.from({length: 5}, (_, i) => (i * 2 * Math.PI) / 5);
```

El código en `SpaceStation.js` ya maneja esto automáticamente basado en la cantidad de definiciones.

## 📝 Ejemplo Completo: Portal a un Juego

```javascript
// 1. En moduleConfig.js
{
    name: 'MiniJuego',
    color: 0xff6600,
    description: 'Juego de plataformas',
    model: {
        url: 'models/game_controller.gltf',
        scale: 3.0,
        center: true
    }
}

// 2. Crear src/scenes/GameScene.js
export class GameScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.root = new THREE.Group();
        this.platforms = [];
        this.collectibles = [];
    }

    async load() {
        this.scene.add(this.root);
        this.buildGameWorld();
        return { spawnPoint: new THREE.Vector3(0, 2, 0) };
    }

    buildGameWorld() {
        // Crear plataformas
        for (let i = 0; i < 10; i++) {
            const platform = this.createPlatform(i);
            this.platforms.push(platform);
            this.root.add(platform);
        }
        
        // Añadir objetos coleccionables
        this.spawnCollectibles();
    }

    createPlatform(index) {
        const geometry = new THREE.BoxGeometry(3, 0.5, 3);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4444ff 
        });
        const platform = new THREE.Mesh(geometry, material);
        
        // Posicionar en espiral
        platform.position.set(
            Math.cos(index) * 5,
            index * 2,
            Math.sin(index) * 5
        );
        
        return platform;
    }

    update(delta, elapsed) {
        // Lógica del juego
        this.checkCollisions();
        this.updateScore();
    }

    unload() {
        this.scene.remove(this.root);
    }
}

// 3. Registrar en SceneManager.js
this.registerScene('game', GameScene);

// 4. Modificar PlayerController.js para cargar GameScene
if (portal.name === 'MiniJuego') {
    await this.sceneManager.transitionTo('game');
}
```

## 🎓 Recursos Útiles

- **Modelos 3D GLTF**: [Sketchfab](https://sketchfab.com), [Poly Haven](https://polyhaven.com)
- **Three.js Docs**: [threejs.org/docs](https://threejs.org/docs)
- **GLTF Sample Models**: [KhronosGroup](https://github.com/KhronosGroup/glTF-Sample-Models)

¡Experimenta y diviértete construyendo tu mundo 3D! 🚀
