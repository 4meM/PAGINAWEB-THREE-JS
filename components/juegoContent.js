// Content manifest for the "Juego" room.
// Add or reorder items here. Each item has an importance score (higher = more prominent).
export const juegoContent = [
  {
    id: 'hero',
    type: 'image',
    src: 'descripcion1.png', // relative to site root (same as used in Game.tsx)
    title: 'Gameplay Overview',
    importance: 100,
    section: 'idea'
  },
  {
    id: 'ideaimg',
    type: 'image',
    src: 'sketch.png',
    title: 'La Idea',
    importance: 80,
    section: 'idea'
  },
  {
    id: 'sketch1',
    type: 'image',
    src: 'sketch1.png',
    title: 'Sketch 1',
    importance: 65,
    section: 'development'
  },
  {
    id: 'prototypeVid',
    type: 'youtube',
    youtubeId: 'QMEVDcjxyuA',
    title: 'Prototipo (YouTube)',
    importance: 90,
    section: 'pruebas'
  },
  {
    id: 'prototypeVid2',
    type: 'youtube',
    youtubeId: 'FZopgnWH78I',
    title: 'Prototipo 2 (YouTube)',
    importance: 60,
    section: 'pruebas'
  }
];

export function getYouTubeThumbnail(youtubeId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}
