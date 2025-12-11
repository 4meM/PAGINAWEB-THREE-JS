/**
 * Gestiona el overlay de Google Drive para reproducir videos o audios
 * @param {string} driveId - ID del archivo en Google Drive
 * @param {string} title - Título a mostrar
 * @param {string} type - 'video' o 'audio' (por defecto: 'video')
 */
export function openDriveVideoOverlay(driveId, title = 'Video', type = 'video') {
    if (!driveId) return;
    
    const existing = document.getElementById('drive-video-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'drive-video-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:10000; flex-direction:column;';
    
    // Título del contenido
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.cssText = 'color:white; font-size:24px; margin-bottom:20px; font-family:Arial,sans-serif;';
    
    const iframe = document.createElement('iframe');
    iframe.width = type === 'audio' ? '60%' : '80%';
    iframe.height = type === 'audio' ? '200px' : '75%';
    iframe.src = `https://drive.google.com/file/d/${driveId}/preview`;
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay';
    iframe.allowFullscreen = type === 'video';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar [ESC]';
    closeBtn.style.cssText = 'position:absolute; top:20px; right:20px; padding:10px 15px; background:white; color:black; border:none; border-radius:5px; cursor:pointer; font-weight:bold;';
    closeBtn.onclick = () => {
        overlay.remove();
        // No reactivar pointer lock aquí, solo cuando se cierre el overlay de entrevistas
    };

    overlay.appendChild(titleElement);
    overlay.appendChild(iframe);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    // Close on ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation(); // Evitar que el evento llegue a otros listeners
            overlay.remove();
            document.removeEventListener('keydown', handleEsc);
            // No reactivar pointer lock aquí, el overlay de entrevistas sigue abierto
        }
    };
    document.addEventListener('keydown', handleEsc);
}
