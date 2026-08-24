export function getFloorFromUrl(url: string, fallback: number): number {
  const filename = url.split('/').pop() ?? '';
  if (/ABAJO/i.test(filename)) return 0;
  if (/ARRIBA/i.test(filename)) return 1;
  return fallback;
}

export function getShotLabel(url: string): string {
  const filename = url.split('/').pop() ?? '';
  const withoutExt = filename.replace(/\.[^.]+$/, '');
  const spaced = withoutExt.replace(/_/g, ' ');
  const withoutPrefix = spaced.replace(/^Edif\w*\s*/i, '');
  const clean = (withoutPrefix || spaced)
    .replace(/\b(ABAJO|ARRIBA)\b\s*/gi, '')
    .trim();
  return clean || withoutPrefix || spaced;
}

export function getFloorLabel(floor: number): string {
  if (floor === 0) return 'Planta Baja';
  if (floor === 1) return 'Planta Alta';
  return `Piso ${floor}`;
}
