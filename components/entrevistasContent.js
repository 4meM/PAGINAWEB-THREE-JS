// Content manifest for the "Entrevistas" module.
export const entrevistasContent = [
  {
    id: 'intro',
    type: 'text',
    title: 'Entrevistas a Usuarios',
    content: 'Documentación y análisis de las entrevistas realizadas.',
    importance: 100,
    section: 'intro'
  },
  {
    id: 'drive-link',
    type: 'text',
    title: '📁 Acceder a Entrevistas',
    content: '<a href="https://drive.google.com/drive/folders/1_LFFICgvsbnnlKofel0j_WU-_8_XxmJN" target="_blank" rel="noopener noreferrer" class="button button--primary">🎥 Ver Entrevistas en Drive</a>',
    importance: 95,
    section: 'recursos'
  },
  {
    id: 'entrevista1',
    type: 'text',
    title: 'Entrevista 1',
    content: 'Resumen de la primera entrevista realizada.',
    importance: 80,
    section: 'entrevistas'
  }
];

export function getYouTubeThumbnail(youtubeId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}
