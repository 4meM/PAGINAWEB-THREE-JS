import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export function addProyecto(root, { addColliderFromMesh, createTextSprite, registerInteractive }) {
    console.log('🎯 Inicializando módulo Proyecto...');
    
    // ⭐ ENLACE A GOOGLE DRIVE - Cambia esta URL por tu enlace real
    const DRIVE_URL = 'https://drive.google.com/drive/folders/TU_CARPETA_AQUI';
    
    // Título principal
    const title = createTextSprite('📁 Proyecto - Entrevistas');
    title.position.set(0, 2.6, -4);
    title.scale.set(4, 1.3, 1);
    root.add(title);
    
    // Descripción
    const description = createTextSprite('Haz clic en el botón para ver las entrevistas');
    description.position.set(0, 1.8, -3.5);
    description.scale.set(3, 0.8, 1);
    root.add(description);
    
    // Crear botón interactivo "Ver Entrevistas"
    const buttonGroup = new THREE.Group();
    
    // Fondo del botón
    const buttonBg = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 1.0, 0.15),
        new THREE.MeshStandardMaterial({
            color: 0x4285F4, // Azul de Google Drive
            metalness: 0.6,
            roughness: 0.3,
            emissive: 0x4285F4,
            emissiveIntensity: 0.4
        })
    );
    buttonGroup.add(buttonBg);
    
    // Texto del botón
    const buttonText = createTextSprite('🎥 Ver Entrevistas');
    buttonText.position.set(0, 0, 0.08);
    buttonText.scale.set(2.8, 0.8, 1);
    buttonGroup.add(buttonText);
    
    // Posicionar el botón
    buttonGroup.position.set(0, 0.8, -2);
    root.add(buttonGroup);
    
    // HitBox invisible para detección de clics (más grande que el visual)
    const hitBox = new THREE.Mesh(
        new THREE.PlaneGeometry(3.8, 1.2),
        new THREE.MeshBasicMaterial({ 
            visible: false,
            side: THREE.DoubleSide 
        })
    );
    hitBox.position.set(0, 0, 0.1);
    buttonGroup.add(hitBox);
    
    // Registrar interactividad - abrir enlace en nueva pestaña
    if (registerInteractive) {
        registerInteractive(hitBox, () => {
            console.log('🔗 Abriendo Google Drive...');
            window.open(DRIVE_URL, '_blank');
        });
        
        // Efecto hover - cambiar color al pasar el mouse
        let isHovering = false;
        const originalColor = new THREE.Color(0x4285F4);
        const hoverColor = new THREE.Color(0x5294FF);
        
        // Nota: el efecto hover completo requeriría raycasting adicional en main.js
        // Por ahora, el clic funcionará correctamente
    }
    
    // Instrucción adicional
    const instruction = createTextSprite('💡 También puedes presionar ESC para salir');
    instruction.position.set(0, -0.5, -1.5);
    instruction.scale.set(2.5, 0.6, 1);
    root.add(instruction);
    
    // Decoración: Iconos de carpeta flotantes
    for (let i = 0; i < 3; i++) {
        const iconGeo = new THREE.BoxGeometry(0.4, 0.4, 0.1);
        const iconMat = new THREE.MeshStandardMaterial({
            color: 0x34A853, // Verde Drive
            emissive: 0x34A853,
            emissiveIntensity: 0.3,
            metalness: 0.5,
            roughness: 0.4
        });
        const icon = new THREE.Mesh(iconGeo, iconMat);
        const angle = (i / 3) * Math.PI * 2;
        const radius = 4;
        icon.position.set(
            Math.cos(angle) * radius,
            1.5 + Math.sin(i) * 0.3,
            -3 + Math.sin(angle) * radius * 0.3
        );
        icon.rotation.y = -angle;
        root.add(icon);
    }
    
    console.log('✅ Módulo Proyecto inicializado con botón de Drive');
}
