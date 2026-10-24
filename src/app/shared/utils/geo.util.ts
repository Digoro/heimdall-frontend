export type LngLat = [number, number];
export type Bounds = [number, number, number, number];

const EARTH_RADIUS_M = 6378137;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** 폴리곤 외곽 링의 구면 면적(km²) */
export function ringAreaKm2(ring: number[][]): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    sum += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2) / 1e6;
}

/** 닫힌 링에서 마지막(중복) 꼭짓점을 제외한 좌표 */
function openRing(ring: number[][]): LngLat[] {
  const pts = ring.map((p) => [p[0], p[1]] as LngLat);
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (pts.length > 1 && first[0] === last[0] && first[1] === last[1]) pts.pop();
  return pts;
}

export function boundsOfCoordinates(coords: number[][]): Bounds {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return [minLng, minLat, maxLng, maxLat];
}

export function mergeBounds(list: Bounds[]): Bounds | null {
  if (!list.length) return null;
  return list.reduce<Bounds>(
    (acc, b) => [
      Math.min(acc[0], b[0]),
      Math.min(acc[1], b[1]),
      Math.max(acc[2], b[2]),
      Math.max(acc[3], b[3]),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  );
}

export function boundsCenter(b: Bounds): LngLat {
  return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
}

/**
 * footprint 폴리곤을 MapLibre image 소스가 요구하는 [좌상, 우상, 우하, 좌하] 순서의 4점으로 변환한다.
 * 꼭짓점이 4개가 아니면 bbox 사각형으로 대체한다.
 */
export function imageQuad(
  geometry: { type?: string; coordinates?: unknown } | null | undefined,
): [LngLat, LngLat, LngLat, LngLat] | null {
  const ring = (geometry as { coordinates?: number[][][] } | null | undefined)?.coordinates?.[0];
  if (!ring || ring.length < 4) return null;

  const pts = openRing(ring);
  if (pts.length !== 4) {
    const [minLng, minLat, maxLng, maxLat] = boundsOfCoordinates(pts);
    return [
      [minLng, maxLat],
      [maxLng, maxLat],
      [maxLng, minLat],
      [minLng, minLat],
    ];
  }

  // 중심 기준 시계 방향으로 정렬한 뒤, 가장 북서쪽 꼭짓점을 시작점으로 삼는다.
  const cx = pts.reduce((s, p) => s + p[0], 0) / 4;
  const cy = pts.reduce((s, p) => s + p[1], 0) / 4;
  const clockwise = [...pts].sort(
    (a, b) => Math.atan2(b[1] - cy, b[0] - cx) - Math.atan2(a[1] - cy, a[0] - cx),
  );
  let start = 0;
  clockwise.forEach((p, i) => {
    if (p[1] - p[0] > clockwise[start][1] - clockwise[start][0]) start = i;
  });
  const ordered = [0, 1, 2, 3].map((i) => clockwise[(start + i) % 4]);
  return ordered as [LngLat, LngLat, LngLat, LngLat];
}
