import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Componente reutilizable de Portal
 * Crea un portal interactivo con anillo, luz y etiqueta
 */
export class PortalComponent {
    constructor(config) {
        const { name, position, rotation, color, label, onClick } = config;
        
        this.name = name;
        this.color = color;
        this.onClick = onClick;
        this.isInteractive = false;
        
        // Grupo principal del portal
        this.group = new THREE.Group();
        this.group.position.copy(position);
        if (rotation !== undefined) {
            this.group.rotation.y = rotation;
        }

        // Anillo exterior (torus)
        this.ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.2, 0.1, 12, 64),
            new THREE.MeshStandardMaterial({ 
                color, 
                emissive: color, 
                emissiveIntensity: 0.8, 
                metalness: 0.7, 
                roughness: 0.35 
            })
        );
        this.group.add(this.ring);

        // Plano interior (círculo semi-transparente)
        this.plane = new THREE.Mesh(
            new THREE.CircleGeometry(1.1, 48),
            new THREE.MeshBasicMaterial({ 
                color, 
                transparent: true, 
                opacity: 0.25,
                side: THREE.DoubleSide
            })
        );
        this.group.add(this.plane);

        // Luz beacon
        this.beacon = new THREE.PointLight(color, 0.7, 8);
        this.beacon.position.z = 0.5;
        this.group.add(this.beacon);

        // HitBox para interacción - MÁS GRANDE
        this.hitBox = new THREE.Mesh(
            new THREE.CircleGeometry(1.5, 32),
            new THREE.MeshBasicMaterial({ 
                visible: false,
                side: THREE.DoubleSide
            })
        );
        this.hitBox.position.z = 0.05;
        this.hitBox.userData.isPortal = true;
        this.hitBox.userData.portalName = name;
        this.hitBox.userData.onClick = onClick;
        this.group.add(this.hitBox);

        // Etiqueta de texto
        this.labelSprite = null;
        this.labelText = label;
    }

    // Crear etiqueta con createTextSprite
    createLabel(createTextSprite) {
        if (createTextSprite) {
            this.labelSprite = createTextSprite(this.labelText);
            this.labelSprite.position.set(0, 1.6, 0.1);
            this.labelSprite.scale.set(1.8, 0.7, 1);
            this.group.add(this.labelSprite);
        }
    }

    // Registrar interacción con el portal
    registerInteraction(registerInteractiveFn) {
        if (registerInteractiveFn && this.onClick && !this.isInteractive) {
            console.log(`🔵 Registrando interacción para portal: ${this.name}`);
            registerInteractiveFn(this.hitBox, () => {
                console.log(`🟢 Portal ${this.name} CLICKEADO!`);
                this.onClick();
            });
            this.isInteractive = true;
        }
    }

    // Mostrar/ocultar portal
    setVisible(visible) {
        this.group.visible = visible;
    }

    // Añadir al scene
    addToScene(scene) {
        scene.add(this.group);
    }

    // Obtener hitBox para raycasting manual
    getHitBox() {
        return this.hitBox;
    }
}
