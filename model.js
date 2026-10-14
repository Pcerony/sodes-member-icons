export const DEFAULT_COLOR = '#A6D62F';

export function normalizeColor(value) {
  const text = String(value).trim().replace(/^#/, '');
  return /^[\da-f]{6}$/i.test(text) ? '#' + text.toUpperCase() : null;
}

export function recolorSvg(source, color) {
  const normalized = normalizeColor(color);
  if (!normalized) throw new Error('Invalid HEX color');
  if (!/<svg\s[^>]*color="#[\da-f]{6}"/i.test(source)) throw new Error('Missing SVG color attribute');
  return source.replace(/(<svg\s[^>]*\bcolor=")#[\da-f]{6}("[^>]*>)/i, `$1${normalized}$2`);
}

export function downloadName(id, format, color) {
  const normalized = normalizeColor(color);
  if (!normalized || !/^[a-z]+$/.test(id) || !['svg', 'png'].includes(format)) throw new Error('Invalid download');
  return `${id}-${normalized.slice(1).toLowerCase()}.${format}`;
}
