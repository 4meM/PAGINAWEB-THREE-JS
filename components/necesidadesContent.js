// Content manifest for the "Necesidades" module.
export const necesidadesContent = [
  {
    id: 'intro',
    type: 'text',
    title: 'Necesidades del Usuario',
    content: 'Análisis de las necesidades identificadas en la investigación de usuarios.',
    importance: 100,
    section: 'intro'
  },
  {
    id: 'necesidad1',
    type: 'text',
    title: 'Necesidad 1',
    content: 'Descripción de la primera necesidad identificada.',
    importance: 80,
    section: 'necesidades'
  },
  {
    id: 'necesidad2',
    type: 'text',
    title: 'Necesidad 2',
    content: 'Descripción de la segunda necesidad.',
    importance: 75,
    section: 'necesidades'
  }
];

export function getYouTubeThumbnail(youtubeId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}
