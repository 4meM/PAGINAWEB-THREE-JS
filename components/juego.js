import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { juegoContent, getYouTubeThumbnail } from './juegoContent.js';

export function addJuego(root, { addColliderFromMesh, createTextSprite, registerInteractive }) {
    // Layout constants (tweak these to change spacing/scale)
    const loader = new THREE.TextureLoader();
    const wallX = 5.2;         // distance from center to left/right wall (increased to spread walls)
    const backZ = -11.0;       // depth of back wall (moved back a little)
    const wallYTop = 2.6;      // top of wall grid
    const wallSpacingY = 1.8;  // vertical spacing between items on walls
    const wallColumns = 2;     // number of columns on wall (horizontal stacking)

    // Group items by section and sort by importance desc
    const grouped = {};
    (juegoContent || []).forEach(it => {
        const sec = it.section || 'development';
        grouped[sec] = grouped[sec] || [];
        grouped[sec].push(it);
    });

    // Create holders for each logical area
    const leftWall = new THREE.Group(); leftWall.name = 'juego_leftWall'; leftWall.position.set(-wallX, 0, 0); leftWall.rotation.y = Math.PI / 2;
    const rightWall = new THREE.Group(); rightWall.name = 'juego_rightWall'; rightWall.position.set(wallX, 0, 0); rightWall.rotation.y = -Math.PI / 2;
    const backWall = new THREE.Group(); backWall.name = 'juego_backWall'; backWall.position.set(0, 0, backZ);
    const pedestals = new THREE.Group(); pedestals.name = 'juego_pedestals'; pedestals.position.set(0, 0, -4);

    root.add(leftWall, rightWall, backWall, pedestals);

    // Helper to create a framed plane for an item
    function createFramedPlane(texture, w, h) {
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        // subtle rim frame
        const frameMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const frame = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.06, h + 0.06), frameMat);
        frame.position.set(0, 0, -0.01);
        const g = new THREE.Group(); g.add(frame); g.add(plane);
        return { group: g, plane };
    }

    // Place items on a wall group in a simple grid (columns x rows)
    function layoutWall(group, items) {
        // For left/right walls we want a depth x rows grid so items are spread along the wall surface.
        if (group === leftWall || group === rightWall) {
            const perRow = Math.min(items.length, 3); // up to 3 rows vertically
            const numCols = Math.ceil(items.length / perRow);
            const depthSpacing = 2.4;
            const startZ = -((numCols - 1) * depthSpacing) / 2;
                for (let i = 0; i < items.length; i++) {
                    const col = Math.floor(i / perRow);
                    const row = i % perRow;
                    const localZ = startZ + col * depthSpacing;
                    const localX = 0; // group is rotated so local +Z faces center
                    const y = wallYTop - row * wallSpacingY;
                    // create an item holder so all children for this item move together
                    const holder = new THREE.Group();
                    holder.position.set(0, 0, localZ);
                    group.add(holder);
                    placeItemOnWall(holder, items[i], localX, y + 0.0);
                }
            return;
        }

        // fallback: simple centered row
        const spacingX = 2.6;
        const startX = -((items.length - 1) * spacingX) / 2;
        items.forEach((it, idx) => {
            const x = startX + idx * spacingX;
            const y = 1.8;
            placeItemOnWall(group, it, x, y);
        });
    }

    // Back wall layout: a single centered row
    function layoutBackWall(group, items) {
        const spacing = 2.6;
        const startX = -((items.length - 1) * spacing) / 2;
        items.forEach((it, idx) => {
            const x = startX + idx * spacing;
            const y = 1.8;
            placeItemOnBackWall(group, it, x, y);
        });
    }

    // Pedestals layout: create up to 3 pedestals in center
    function layoutPedestals(group, items) {
        const count = Math.min(items.length, 3);
        const xs = count === 1 ? [0] : count === 2 ? [-1.6, 1.6] : [-2.6, 0, 2.6];
        for (let i = 0; i < count; i++) {
            placeItemOnPedestal(group, items[i], xs[i], 0.9);
        }
    }

    // Core placement implementations
    function placeItemOnWall(group, it, localX, localY) {
        const importance = it.importance || 10;
        // reduce max scale to avoid huge, low-res planes
        const scale = THREE.MathUtils.clamp(0.9 + (importance / 120), 0.8, 1.4);
        if (it.type === 'image') {
            loader.load(it.src, tex => {
                // improve sampling and color space for crisp display
                try { tex.encoding = THREE.sRGBEncoding; } catch (e) {}
                try { tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 4; } catch (e) {}
                const aspect = tex.image ? (tex.image.width / tex.image.height) : (16/9);
                const h = 1.6 * scale; const w = h * aspect;
                const framed = createFramedPlane(tex, w, h);
                framed.group.position.set(localX, localY, 0);
                group.add(framed.group);
                if (importance > 75 && addColliderFromMesh) addColliderFromMesh(framed.plane);
            }, undefined, () => {
                const mat = new THREE.MeshBasicMaterial({ color: 0x222222 });
                const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.6 * scale, 1.0 * scale), mat);
                plane.position.set(localX, localY, 0);
                group.add(plane);
            });

        } else if (it.type === 'video') {
            const video = document.createElement('video');
            video.src = it.src; video.loop = true; video.muted = true; video.playsInline = true; video.autoplay = true;
            video.preload = 'auto'; video.play().catch(()=>{});
            const vtex = new THREE.VideoTexture(video);
            // improve sampling and color for video
            try { vtex.minFilter = THREE.LinearFilter; vtex.magFilter = THREE.LinearFilter; vtex.generateMipmaps = false; vtex.encoding = THREE.sRGBEncoding; } catch (e) {}
            vtex.needsUpdate = true;
            // initial size (will update on loadedmetadata)
            const h = 1.6 * scale; const w = h * (16/9);
            const mat = new THREE.MeshBasicMaterial({ map: vtex });
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
            plane.position.set(localX, localY, 0);
            group.add(plane);
            if (importance > 75 && addColliderFromMesh) addColliderFromMesh(plane);
            // when video metadata loads, resize plane to match actual aspect
            video.addEventListener('loadedmetadata', () => {
                try {
                    const aspect = (video.videoWidth && video.videoHeight) ? (video.videoWidth / video.videoHeight) : (16/9);
                    const newH = 1.6 * scale; const newW = newH * aspect;
                    plane.geometry.dispose();
                    plane.geometry = new THREE.PlaneGeometry(newW, newH);
                    vtex.needsUpdate = true;
                } catch (e) {}
            });
            if (registerInteractive) registerInteractive(plane, () => {
                if (video.paused) { video.muted = false; video.play().catch(()=>{}); }
                else { video.pause(); }
            });

        } else if (it.type === 'youtube') {
            // prefer the best thumbnail available
            const thumb = getYouTubeThumbnail(it.youtubeId || '', 'maxresdefault') || getYouTubeThumbnail(it.youtubeId || '', 'hqdefault');
            loader.load(thumb, tex => {
                try { tex.encoding = THREE.sRGBEncoding; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 4; } catch (e) {}
                const aspect = tex.image ? (tex.image.width / tex.image.height) : (16/9);
                const h = 1.6 * scale; const w = h * aspect;
                const framed = createFramedPlane(tex, w, h);
                framed.group.position.set(localX, localY, 0);
                group.add(framed.group);
                const play = createTextSprite('▶');
                play.scale.set(0.5 * scale, 0.5 * scale, 1);
                play.position.set(localX, localY, 0.02);
                group.add(play);
                if (importance > 75 && addColliderFromMesh) addColliderFromMesh(framed.plane);
                if (registerInteractive) registerInteractive(framed.plane, () => openYouTubeOverlay(it.youtubeId));
            });
        }
    }

    function placeItemOnBackWall(group, it, x, y) {
        // back wall faces forward; item sits on the backWall group at z=0
        placeItemOnWall(group, it, x, y);
    }

    function placeItemOnPedestal(group, it, x, y) {
        const importance = it.importance || 10;
        // limit pedestal scale to avoid huge low-res displays
        const scale = THREE.MathUtils.clamp(1.0 + (importance / 140), 0.9, 1.6);
        // base pedestal
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        ped.position.set(x, y - 0.3, 0);
        group.add(ped);

        if (it.type === 'image') {
            loader.load(it.src, tex => {
                try { tex.encoding = THREE.sRGBEncoding; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 4; } catch (e) {}
                const aspect = tex.image ? (tex.image.width / tex.image.height) : (16/9);
                const h = 1.2 * scale; const w = h * aspect;
                const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
                plane.position.set(x, y + 0.25, 0);
                group.add(plane);
                if (importance > 75 && addColliderFromMesh) addColliderFromMesh(plane);
            });

        } else if (it.type === 'video') {
            const video = document.createElement('video');
            video.src = it.src; video.loop = true; video.muted = true; video.playsInline = true; video.autoplay = true;
            video.preload = 'auto'; video.play().catch(()=>{});
            const vtex = new THREE.VideoTexture(video);
            try { vtex.minFilter = THREE.LinearFilter; vtex.magFilter = THREE.LinearFilter; vtex.generateMipmaps = false; vtex.encoding = THREE.sRGBEncoding; } catch (e) {}
            vtex.needsUpdate = true;
            const h = 1.2 * scale; const w = h * (16/9);
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: vtex }));
            plane.position.set(x, y + 0.25, 0);
            group.add(plane);
            if (importance > 75 && addColliderFromMesh) addColliderFromMesh(plane);
            video.addEventListener('loadedmetadata', () => {
                try {
                    const aspect = (video.videoWidth && video.videoHeight) ? (video.videoWidth / video.videoHeight) : (16/9);
                    const newH = 1.2 * scale; const newW = newH * aspect;
                    plane.geometry.dispose();
                    plane.geometry = new THREE.PlaneGeometry(newW, newH);
                    vtex.needsUpdate = true;
                } catch (e) {}
            });
            if (registerInteractive) registerInteractive(plane, () => {
                if (video.paused) { video.muted = false; video.play().catch(()=>{}); }
                else { video.pause(); }
            });

        } else if (it.type === 'youtube') {
            const thumb = getYouTubeThumbnail(it.youtubeId || '', 'maxresdefault') || getYouTubeThumbnail(it.youtubeId || '', 'hqdefault');
            loader.load(thumb, tex => {
                try { tex.encoding = THREE.sRGBEncoding; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 4; } catch (e) {}
                const aspect = tex.image ? (tex.image.width / tex.image.height) : (16/9);
                const h = 1.2 * scale; const w = h * aspect;
                const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
                plane.position.set(x, y + 0.25, 0);
                group.add(plane);
                const play = createTextSprite('▶');
                play.scale.set(0.5 * scale, 0.5 * scale, 1);
                play.position.set(x, y + 0.25, 0.02);
                group.add(play);
                if (importance > 75 && addColliderFromMesh) addColliderFromMesh(plane);
                if (registerInteractive) registerInteractive(plane, () => openYouTubeOverlay(it.youtubeId));
            });
        }
    }

    // Build layouts using section -> area mapping
    const ideaItems = (grouped.idea || []).slice().sort((a,b)=> (b.importance||0)-(a.importance||0));
    const pruebasItems = (grouped.pruebas || []).slice().sort((a,b)=> (b.importance||0)-(a.importance||0));
    const developmentItems = (grouped.development || []).slice().sort((a,b)=> (b.importance||0)-(a.importance||0));

    // Pedestals should show the most important items overall
    const allSorted = (juegoContent || []).slice().sort((a,b)=> (b.importance||0)-(a.importance||0));
    layoutPedestals(pedestals, allSorted.slice(0,3));

    // Left wall -> idea, Right wall -> pruebas, Back wall -> development
    layoutWall(leftWall, ideaItems);
    layoutWall(rightWall, pruebasItems);
    layoutBackWall(backWall, developmentItems);

    // Section labels
    const leftLabel = createTextSprite('Idea'); leftLabel.position.set(-wallX, 3.1, 0); root.add(leftLabel);
    const rightLabel = createTextSprite('Pruebas'); rightLabel.position.set(wallX, 3.1, 0); root.add(rightLabel);
    const backLabel = createTextSprite('Desarrollo'); backLabel.position.set(0, 3.1, backZ + 0.5); root.add(backLabel);

    // Helper: open a YouTube iframe overlay
    function openYouTubeOverlay(youtubeId) {
        if (!youtubeId) return;
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.left = '0'; overlay.style.top = '0'; overlay.style.width = '100%'; overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.85)'; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = 9999;
        const iframe = document.createElement('iframe');
        iframe.width = Math.min(window.innerWidth * 0.8, 1280);
        iframe.height = Math.min(window.innerHeight * 0.6, 720);
        iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
        iframe.frameBorder = '0'; iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.allowFullscreen = true;
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cerrar';
        closeBtn.style.position = 'absolute'; closeBtn.style.top = '12px'; closeBtn.style.right = '12px';
        closeBtn.style.padding = '8px 12px'; closeBtn.style.fontSize = '14px'; closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => { document.body.removeChild(overlay); });
        overlay.appendChild(iframe); overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
    }
}
