import { METERS_PER_PIXEL } from '@/constants/mapData';
import type { GpsReference, MapPosition } from '@/types/map';

interface AffineCoeffs {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

function solveAffine(refs: GpsReference[]): AffineCoeffs | null {
  if (refs.length < 3) return null;

  const [r0, r1, r2] = refs;
  const lng0 = r0.gps.longitude,
    lat0 = r0.gps.latitude;
  const lng1 = r1.gps.longitude,
    lat1 = r1.gps.latitude;
  const lng2 = r2.gps.longitude,
    lat2 = r2.gps.latitude;

  const det = (lng0 - lng2) * (lat1 - lat2) - (lng1 - lng2) * (lat0 - lat2);
  if (Math.abs(det) < 1e-12) return null;

  const px0 = r0.pixel.x,
    py0 = r0.pixel.y;
  const px1 = r1.pixel.x,
    py1 = r1.pixel.y;
  const px2 = r2.pixel.x,
    py2 = r2.pixel.y;

  const a = ((px0 - px2) * (lat1 - lat2) - (px1 - px2) * (lat0 - lat2)) / det;
  const b = ((lng0 - lng2) * (px1 - px2) - (lng1 - lng2) * (px0 - px2)) / det;
  const c = px0 - a * lng0 - b * lat0;

  const d = ((py0 - py2) * (lat1 - lat2) - (py1 - py2) * (lat0 - lat2)) / det;
  const e = ((lng0 - lng2) * (py1 - py2) - (lng1 - lng2) * (py0 - py2)) / det;
  const f = py0 - d * lng0 - e * lat0;

  return { a, b, c, d, e, f };
}

let cachedCoeffs: AffineCoeffs | null = null;

export function initTransform(refs: GpsReference[]): boolean {
  cachedCoeffs = solveAffine(refs);
  return cachedCoeffs !== null;
}

export function gpsToPixel(
  latitude: number,
  longitude: number,
): MapPosition | null {
  if (!cachedCoeffs) return null;
  const { a, b, c, d, e, f } = cachedCoeffs;
  return {
    x: a * longitude + b * latitude + c,
    y: d * longitude + e * latitude + f,
  };
}

export function pixelDistanceToMeters(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy) * METERS_PER_PIXEL;
}
