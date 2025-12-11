// Content manifest for the "Momentos Interesantes" module.
export const momentosContent = [
  {
    id: 'intro',
    type: 'text',
    title: 'Momentos Interesantes',
    content: 'Aquí documentamos los momentos clave identificados durante la investigación de usuarios.',
    importance: 100,
    section: 'intro'
  },
  {
    id: 'momento1',
    type: 'text',
    title: 'Momento 1',
    content: 'Descripción del primer momento interesante identificado.',
    importance: 80,
    section: 'momentos'
  },
  {
    id: 'momento2',
    type: 'text',
    title: 'Momento 2',
    content: 'Descripción del segundo momento interesante.',
    importance: 75,
    section: 'momentos'
  }
];

export function getYouTubeThumbnail(youtubeId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}
