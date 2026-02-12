import type { Point } from './types';

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  }

  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq;
  const clamped = Math.max(0, Math.min(1, t));
  const projX = lineStart.x + clamped * dx;
  const projY = lineStart.y + clamped * dy;

  return Math.hypot(point.x - projX, point.y - projY);
}

export function douglasPeucker(points: Point[], epsilon: number = 1.5): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;

  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}
