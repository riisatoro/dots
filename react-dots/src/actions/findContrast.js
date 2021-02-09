/* eslint-disable no-bitwise */

function contrast(rgb1, rgb2) {
  return Math.abs(rgb1.r - rgb2.r) + Math.abs(rgb1.g - rgb2.g) + Math.abs(rgb1.b - rgb2.b);
}

function hexToRgb(color) {
  const hex = color.replace('#', '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function isContrast(hex1, hex2, ratio) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return contrast(rgb1, rgb2) >= ratio;
}

export default isContrast;
