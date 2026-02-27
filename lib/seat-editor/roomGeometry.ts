import type { RoomPoint, RoomPolygon } from './types';

export const CLOSE_THRESHOLD = 5;

export function isNearStart(p: RoomPoint, start: RoomPoint, threshold: number): boolean {
  return Math.hypot(p.x - start.x, p.y - start.y) < threshold;
}

// ─── 손떨림 제거: 이동평균 스무딩 ────────────────────────────────────────────
export function smoothPath(points: RoomPoint[], windowSize = 9): RoomPoint[] {
  if (points.length <= 2) return points;
  const half = Math.floor(windowSize / 2);
  return points.map((_, i) => {
    const s = Math.max(0, i - half);
    const e = Math.min(points.length - 1, i + half);
    const w = points.slice(s, e + 1);
    return {
      x: w.reduce((acc, p) => acc + p.x, 0) / w.length,
      y: w.reduce((acc, p) => acc + p.y, 0) / w.length,
    };
  });
}

// ─── 코너 추출 (높은 임계값으로 덜 민감하게) ─────────────────────────────────
function simplifyToCorners(points: RoomPoint[], angleThreshold = 50): RoomPoint[] {
  if (points.length < 3) return points;

  const MIN_DIST = 3;
  const sampled: RoomPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = sampled[sampled.length - 1];
    if (Math.hypot(points[i].x - last.x, points[i].y - last.y) >= MIN_DIST) {
      sampled.push(points[i]);
    }
  }
  if (sampled.length < 3) return sampled;

  const corners: RoomPoint[] = [sampled[0]];
  for (let i = 1; i < sampled.length - 1; i++) {
    const prev = sampled[i - 1];
    const curr = sampled[i];
    const next = sampled[i + 1];
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    const len1 = Math.hypot(v1.x, v1.y);
    const len2 = Math.hypot(v2.x, v2.y);
    if (len1 < 0.001 || len2 < 0.001) continue;
    const dot = (v1.x * v2.x + v1.y * v2.y) / (len1 * len2);
    const deg = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
    if (deg > angleThreshold) corners.push(curr);
  }
  corners.push(sampled[sampled.length - 1]);
  return mergeNearbyCorners(corners, 5);
}

function mergeNearbyCorners(points: RoomPoint[], minDist: number): RoomPoint[] {
  if (!points.length) return points;
  const result: RoomPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = result[result.length - 1];
    if (Math.hypot(points[i].x - last.x, points[i].y - last.y) >= minDist) {
      result.push(points[i]);
    }
  }
  return result;
}

// ─── 바운딩 박스 직사각형 피팅 ────────────────────────────────────────────────
function fitBoundingRect(rawPoints: RoomPoint[]): { points: RoomPoint[]; shapeType: RoomPolygon['shapeType'] } {
  const xs = rawPoints.map(p => p.x);
  const ys = rawPoints.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;
  const ratio = Math.max(w, h) / (Math.min(w, h) + 0.001);
  const shapeType: RoomPolygon['shapeType'] = ratio >= 3 ? 'corridor' : 'rectangle';
  return {
    points: [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ],
    shapeType,
  };
}

// 모든 선분을 수평/수직으로 스냅
function snapToAxisAligned(points: RoomPoint[]): RoomPoint[] {
  const result = [...points];
  const n = result.length;
  for (let i = 0; i < n; i++) {
    const curr = result[i];
    const next = result[(i + 1) % n];
    const dx = Math.abs(next.x - curr.x);
    const dy = Math.abs(next.y - curr.y);
    if (dx >= dy) {
      result[(i + 1) % n] = { ...result[(i + 1) % n], y: curr.y };
    } else {
      result[(i + 1) % n] = { ...result[(i + 1) % n], x: curr.x };
    }
  }
  return result;
}

// ─── 메인 피팅 함수 ───────────────────────────────────────────────────────────
export function fitShape(rawPoints: RoomPoint[]): { points: RoomPoint[]; shapeType: RoomPolygon['shapeType'] } {
  const smoothed = smoothPath(rawPoints, 9);
  const corners = simplifyToCorners(smoothed, 50);
  const n = corners.length;

  if (n <= 4) {
    return fitBoundingRect(rawPoints);
  }

  if (n <= 6) {
    const snapped = snapToAxisAligned(corners);
    const corrected = snapToRightAngles(snapped);
    const shapeType = classifyRoomShape(corrected);
    if (shapeType === 'l-shape') return { points: corrected, shapeType };
    return fitBoundingRect(rawPoints);
  }

  const corrected = snapToRightAngles(corners);
  return { points: corrected, shapeType: classifyRoomShape(corrected) };
}

// ─── 직사각형 핸들 리사이즈 ──────────────────────────────────────────────────
export function resizeRect(
  points: RoomPoint[],
  handleType: string,
  newX: number,
  newY: number,
  minSize = 5
): RoomPoint[] {
  let left = Math.min(points[0].x, points[3].x);
  let right = Math.max(points[1].x, points[2].x);
  let top = Math.min(points[0].y, points[1].y);
  let bottom = Math.max(points[2].y, points[3].y);

  switch (handleType) {
    case 'corner-0': left = newX; top = newY; break;
    case 'corner-1': right = newX; top = newY; break;
    case 'corner-2': right = newX; bottom = newY; break;
    case 'corner-3': left = newX; bottom = newY; break;
    case 'mid-0': top = newY; break;
    case 'mid-1': right = newX; break;
    case 'mid-2': bottom = newY; break;
    case 'mid-3': left = newX; break;
  }

  if (right - left < minSize) {
    if (handleType === 'corner-0' || handleType === 'corner-3' || handleType === 'mid-3') {
      left = right - minSize;
    } else {
      right = left + minSize;
    }
  }
  if (bottom - top < minSize) {
    if (handleType === 'corner-0' || handleType === 'corner-1' || handleType === 'mid-0') {
      top = bottom - minSize;
    } else {
      bottom = top + minSize;
    }
  }

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

// ─── 일반 다각형 버텍스 이동 ──────────────────────────────────────────────────
export function moveVertex(points: RoomPoint[], index: number, newPos: RoomPoint): RoomPoint[] {
  return points.map((p, i) => (i === index ? newPos : p));
}

// ─── 직각 보정 ────────────────────────────────────────────────────────────────
export function snapToRightAngles(points: RoomPoint[]): RoomPoint[] {
  if (points.length < 3) return points;
  let pts = [...points];
  const n = pts.length;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const curr = pts[i];
      const next = pts[(i + 1) % n];
      const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
      const v2 = { x: next.x - curr.x, y: next.y - curr.y };
      const len1 = Math.hypot(v1.x, v1.y);
      const len2 = Math.hypot(v2.x, v2.y);
      if (len1 < 0.001 || len2 < 0.001) continue;
      const dot = v1.x * v2.x + v1.y * v2.y;
      const cosAngle = dot / (len1 * len2);
      const angleDeg = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
      if (angleDeg < 67.5 || angleDeg > 112.5) continue;
      const unit1 = { x: v1.x / len1, y: v1.y / len1 };
      const unit2 = { x: v2.x / len2, y: v2.y / len2 };
      if (len1 >= len2) {
        const perp = { x: -unit1.y, y: unit1.x };
        const projSign = perp.x * v2.x + perp.y * v2.y >= 0 ? 1 : -1;
        pts[(i + 1) % n] = {
          x: curr.x + perp.x * projSign * len2,
          y: curr.y + perp.y * projSign * len2,
        };
      } else {
        const perp = { x: -unit2.y, y: unit2.x };
        const projSign = perp.x * v1.x + perp.y * v1.y >= 0 ? 1 : -1;
        pts[(i - 1 + n) % n] = {
          x: curr.x + perp.x * projSign * len1,
          y: curr.y + perp.y * projSign * len1,
        };
      }
    }
  }
  return pts;
}

// ─── 공간 형태 분류 ───────────────────────────────────────────────────────────
export function classifyRoomShape(points: RoomPoint[]): RoomPolygon['shapeType'] {
  const n = points.length;
  if (n === 4) {
    const angles: number[] = [];
    for (let i = 0; i < 4; i++) {
      const prev = points[(i - 1 + 4) % 4];
      const curr = points[i];
      const next = points[(i + 1) % 4];
      const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
      const v2 = { x: next.x - curr.x, y: next.y - curr.y };
      const len1 = Math.hypot(v1.x, v1.y);
      const len2 = Math.hypot(v2.x, v2.y);
      if (len1 < 0.001 || len2 < 0.001) { angles.push(90); continue; }
      const dot = v1.x * v2.x + v1.y * v2.y;
      const angle = Math.acos(Math.max(-1, Math.min(1, dot / (len1 * len2)))) * (180 / Math.PI);
      angles.push(angle);
    }
    const allRight = angles.every(a => Math.abs(a - 90) < 15);
    if (!allRight) return 'custom';
    const dx1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const dy1 = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
    const ratio = Math.max(dx1, dy1) / (Math.min(dx1, dy1) + 0.001);
    if (ratio >= 3) return 'corridor';
    return 'rectangle';
  }
  if (n === 6) {
    let concaveCount = 0;
    for (let i = 0; i < 6; i++) {
      const prev = points[(i - 1 + 6) % 6];
      const curr = points[i];
      const next = points[(i + 1) % 6];
      const cross = (curr.x - prev.x) * (next.y - prev.y) - (curr.y - prev.y) * (next.x - prev.x);
      if (cross < 0) concaveCount++;
    }
    if (concaveCount === 1 || concaveCount === 5) return 'l-shape';
  }
  return 'custom';
}
