import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Crea un panel de contenido para mostrar media (imágenes/videos)
 */
export function createContentPanel(item, createTextSprite, registerInteractive, getYouTubeThumbnail, openYouTubeOverlay, width = 2.0, height = 1.5) {
    const loader = new THREE.TextureLoader();
    const panelGroup = new THREE.Group();

    // Frame
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1a2b3c,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0x3A86FF,
        emissiveIntensity: 0.2
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.08), frameMat);
    panelGroup.add(frame);

    // Thumbnail
    const thumbWidth = width * 0.9;
    const thumbHeight = height * 0.6;
    const thumbMat = new THREE.MeshBasicMaterial({ color: 0x0a0f1a });
    const thumbPlane = new THREE.Mesh(new THREE.PlaneGeometry(thumbWidth, thumbHeight), thumbMat);
    thumbPlane.position.set(0, height * 0.12, 0.05);
    panelGroup.add(thumbPlane);

    // Load thumbnail
    const firstImage = (item.media || []).find(m => m.type === 'image');
    const firstVideo = (item.media || []).find(m => m.type === 'video' && m.youtubeId);
    const thumbUrl = firstImage ? firstImage.src : (firstVideo ? getYouTubeThumbnail(firstVideo.youtubeId, 'hqdefault') : null);

    if (thumbUrl) {
        loader.load(thumbUrl, (tex) => {
            try {
                tex.encoding = THREE.sRGBEncoding;
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
            } catch (e) {}
            thumbPlane.material.map = tex;
            thumbPlane.material.color.set(0xffffff);
            thumbPlane.material.needsUpdate = true;
        });
    }

    // Title
    if (createTextSprite) {
        const titleSprite = createTextSprite(item.title || 'Untitled');
        titleSprite.position.set(0, -height * 0.32, 0.05);
        titleSprite.scale.set(width * 0.65, width * 0.3, 1);
        panelGroup.add(titleSprite);
    }

    // Hitbox for interaction
    const hitBox = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    hitBox.position.z = 0.06;
    hitBox.userData.isContentPanel = true;
    hitBox.userData.item = item;
    panelGroup.add(hitBox);

    if (registerInteractive) {
        registerInteractive(hitBox, () => {
            console.log(`🖼️ Panel clickeado: ${item.title}`);
            if (firstVideo && firstVideo.youtubeId) {
                openYouTubeOverlay(firstVideo.youtubeId);
            } else if (firstImage) {
                window.open(firstImage.src, '_blank');
            }
        });
    }

    return panelGroup;
}

/**
 * Crea una cuadrícula de paneles de contenido
 */
export function createContentGrid(items, createTextSprite, registerInteractive, getYouTubeThumbnail, openYouTubeOverlay, columns = 3) {
    const gridGroup = new THREE.Group();
    const panelWidth = 2.0;
    const panelHeight = 1.5;
    const spacingX = 2.4;
    const spacingY = 1.9;

    items.forEach((item, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const x = (col - (columns - 1) / 2) * spacingX;
        const y = 1.2 - row * spacingY;

        const panel = createContentPanel(
            item, 
            createTextSprite, 
            registerInteractive, 
            getYouTubeThumbnail, 
            openYouTubeOverlay,
            panelWidth, 
            panelHeight
        );
        panel.position.set(x, y, 0);
        gridGroup.add(panel);
    });

    return gridGroup;
}
