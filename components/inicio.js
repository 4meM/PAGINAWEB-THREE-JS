import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export function addInicio(root, { addColliderFromMesh, createTextSprite }) {
    // Example: add an image on the left wall, a video on the right wall and a text panel in the center
    const loader = new THREE.TextureLoader();

    // Image (local preferred; fallback remote sample)
    const imgUrlLocal = 'textures/inicio.jpg'; // place your local image here
    const imgFallback = 'https://placekitten.com/800/600';
    loader.load(imgUrlLocal, (tex) => {
        const mat = new THREE.MeshBasicMaterial({ map: tex });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.6), mat);
        plane.position.set(-4.6, 1.6, -2.5);
        plane.rotation.y = Math.PI / 8;
        root.add(plane);
        addColliderFromMesh(plane);
    }, undefined, () => {
        // fallback
        loader.load(imgFallback, (tex) => {
            const mat = new THREE.MeshBasicMaterial({ map: tex });
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.6), mat);
            plane.position.set(-4.6, 1.6, -2.5);
            plane.rotation.y = Math.PI / 8;
            root.add(plane);
            addColliderFromMesh(plane);
        });
    });

    // Video panel on right wall
    const video = document.createElement('video');
    video.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.play().catch(() => {}); // may be blocked until user gesture

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    const videoMat = new THREE.MeshBasicMaterial({ map: videoTexture });
    const vplane = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.25), videoMat);
    vplane.position.set(4.6, 1.6, -2.5);
    vplane.rotation.y = -Math.PI / 8;
    root.add(vplane);
    addColliderFromMesh(vplane);

    // Informational text in the center using the project's createTextSprite helper
    const info = createTextSprite('Bienvenido a Inicio\n(Imagen + Video)');
    info.position.set(0, 1.8, -3.8);
    root.add(info);
}
