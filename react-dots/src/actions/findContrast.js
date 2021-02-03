/* eslint-disable no-bitwise */

function luminanace(r, g, b) {
  return (r / 255) * 0.2126 + (g / 255) * 0.7152 + (b / 255) * 0.0722;
}

function contrast(rgb1, rgb2) {
  const lum1 = luminanace(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = luminanace(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return brightest / darkest;
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
  const contrastValue = contrast(rgb1, rgb2);
  return contrastValue >= ratio;
}

export default isContrast;
