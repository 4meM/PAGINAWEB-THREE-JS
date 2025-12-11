// Content manifest for the "Storyboard" module.
export const storyboardContent = [
  {
    id: 'intro',
    type: 'text',
    title: 'Storyboard del Proyecto',
    content: 'Visualización del flujo de experiencia del usuario.',
    importance: 100,
    section: 'intro'
  },
  {
    id: 'scene1',
    type: 'text',
    title: 'Escena 1',
    content: 'Descripción de la primera escena del storyboard.',
    importance: 80,
    section: 'scenes'
  },
  {
    id: 'scene2',
    type: 'text',
    title: 'Escena 2',
    content: 'Descripción de la segunda escena.',
    importance: 75,
    section: 'scenes'
  }
];

export function getYouTubeThumbnail(youtubeId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}
