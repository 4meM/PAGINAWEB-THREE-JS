import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export function addProyecto(root, { addColliderFromMesh, createTextSprite }) {
    // Small placeholder for "Proyecto" room. Add images and a short video/text.
    const loader = new THREE.TextureLoader();
    const url = 'https://picsum.photos/seed/proyecto/800/500';
    loader.load(url, (tex) => {
        const mat = new THREE.MeshBasicMaterial({ map: tex });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 3.1), mat);
        plane.position.set(0, 1.8, -4.2);
        root.add(plane);
        addColliderFromMesh(plane);
    });

    const info = createTextSprite('Proyecto\nColoca aquí imágenes, videos o texto explicativo.');
    info.position.set(0, 2.4, -2.0);
    root.add(info);
}
