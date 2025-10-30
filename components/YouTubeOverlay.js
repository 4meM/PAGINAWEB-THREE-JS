/**
 * Gestiona el overlay de YouTube para reproducir videos
 */
export function openYouTubeOverlay(youtubeId) {
    if (!youtubeId) return;
    
    const existing = document.getElementById('youtube-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'youtube-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:10000;';
    
    const iframe = document.createElement('iframe');
    iframe.width = '80%';
    iframe.height = '80%';
    iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar [ESC]';
    closeBtn.style.cssText = 'position:absolute; top:20px; right:20px; padding:10px 15px; background:white; color:black; border:none; border-radius:5px; cursor:pointer; font-weight:bold;';
    closeBtn.onclick = () => overlay.remove();

    overlay.appendChild(iframe);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    // Close on ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}
