export const ILLUSTRATION = require('../../assets/images/tutorial-web.png');

const MATERI_ILLUSTRATIONS = [
  require('../../assets/images/ilustration/ilustration 1.jpg'),
  require('../../assets/images/ilustration/ilustration 2.jpg'),
  require('../../assets/images/ilustration/ilustration 3.jpg'),
  require('../../assets/images/ilustration/ilustration 4.jpg'),
];

export function getMateriIllustration(materiId) {
  const index = Number(materiId.replace('m', '')) - 1;
  return MATERI_ILLUSTRATIONS[index % MATERI_ILLUSTRATIONS.length] || MATERI_ILLUSTRATIONS[0];
}
