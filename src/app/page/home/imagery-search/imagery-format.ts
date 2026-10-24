import { CatalogItem, ImagingMode } from '@/model/collection';
import { boundsCenter, Bounds, boundsOfCoordinates } from '@/shared/utils/geo.util';

const pad = (n: number) => String(n).padStart(2, '0');

/** 2026-04-22 10:00 UTC */
export function formatUtc(iso: string | undefined, withSeconds = false): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const base = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  return `${base}${withSeconds ? `:${pad(d.getUTCSeconds())}` : ''} UTC`;
}

/** sar:instrument_mode 값을 화면용 이름(Spotlight Single 등)으로 */
export function modeLabel(item: CatalogItem): string {
  const raw = item.properties?.['sar:instrument_mode'] ?? '';
  const known = Object.values(ImagingMode).find((m) => m.toLowerCase() === raw.toLowerCase());
  const text = known ?? raw;
  return text.replace(/_/g, ' ');
}

/** COSMOS · Stripmap */
export function itemTitle(item: CatalogItem): string {
  const mission = item.properties?.mission || item.collection?.toUpperCase() || 'Item';
  const mode = modeLabel(item);
  return mode ? `${mission} · ${mode}` : mission;
}

export function incidence(item: CatalogItem): string {
  const value = item.properties?.['view:incidence_angle'];
  return typeof value === 'number' ? `${value.toFixed(1)}°` : '-';
}

function itemBounds(item: CatalogItem): Bounds | null {
  if (item.bbox?.length === 4) return item.bbox as Bounds;
  const ring = (item.geometry as { coordinates?: number[][][] })?.coordinates?.[0];
  return ring?.length ? boundsOfCoordinates(ring) : null;
}

/** 37.5665°N, 126.9780°E */
export function centerCoordinates(item: CatalogItem): string {
  const bounds = itemBounds(item);
  if (!bounds) return '-';
  const [lng, lat] = boundsCenter(bounds);
  return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
}
