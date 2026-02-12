import type { Point, CleanedSegment } from './types';

const SNAP_THRESHOLD_DEG = 5;
const PARALLEL_THRESHOLD_DEG = 3;
const CARDINAL_ANGLES = [0, 90, 180, 270];

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalizeAngle(deg: number): number {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

function segmentAngle(start: Point, end: Point): number {
  return normalizeAngle(toDeg(Math.atan2(end.y - start.y, end.x - start.x)));
}

function segmentLength(start: Point, end: Point): number {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function snapToCardinal(angleDeg: number): number {
  for (const cardinal of CARDINAL_ANGLES) {
    const diff = Math.abs(normalizeAngle(angleDeg - cardinal));
    if (diff <= SNAP_THRESHOLD_DEG || diff >= 360 - SNAP_THRESHOLD_DEG) {
      return cardinal;
    }
  }
  return angleDeg;
}

export function pointsToSegments(points: Point[]): CleanedSegment[] {
  const segments: CleanedSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const angle = segmentAngle(start, end);
    const length = segmentLength(start, end);
    segments.push({ start, end, angle, length });
  }
  return segments;
}

export function snapSegmentAngles(segments: CleanedSegment[]): CleanedSegment[] {
  return segments.map((seg) => {
    const snappedAngle = snapToCardinal(seg.angle);
    if (snappedAngle === seg.angle) return seg;

    // Reconstruct end point with snapped angle, preserving length
    const rad = toRad(snappedAngle);
    const newEnd: Point = {
      x: seg.start.x + Math.cos(rad) * seg.length,
      y: seg.start.y + Math.sin(rad) * seg.length,
    };

    return { start: seg.start, end: newEnd, angle: snappedAngle, length: seg.length };
  });
}

export function alignParallelSegments(segments: CleanedSegment[]): CleanedSegment[] {
  // Group segments by similar angle
  const groups: CleanedSegment[][] = [];

  for (const seg of segments) {
    let found = false;
    for (const group of groups) {
      const refAngle = group[0].angle;
      const diff = Math.abs(normalizeAngle(seg.angle - refAngle));
      if (diff <= PARALLEL_THRESHOLD_DEG || diff >= 360 - PARALLEL_THRESHOLD_DEG) {
        group.push(seg);
        found = true;
        break;
      }
    }
    if (!found) {
      groups.push([seg]);
    }
  }

  const result: CleanedSegment[] = [];

  for (const group of groups) {
    if (group.length <= 1) {
      result.push(...group);
      continue;
    }

    // Length-weighted average angle
    let totalWeight = 0;
    let weightedSin = 0;
    let weightedCos = 0;
    for (const seg of group) {
      const rad = toRad(seg.angle);
      weightedSin += Math.sin(rad) * seg.length;
      weightedCos += Math.cos(rad) * seg.length;
      totalWeight += seg.length;
    }
    const avgAngle = normalizeAngle(toDeg(Math.atan2(weightedSin / totalWeight, weightedCos / totalWeight)));

    // Rebuild segments with unified angle
    for (const seg of group) {
      const rad = toRad(avgAngle);
      const newEnd: Point = {
        x: seg.start.x + Math.cos(rad) * seg.length,
        y: seg.start.y + Math.sin(rad) * seg.length,
      };
      result.push({ start: seg.start, end: newEnd, angle: avgAngle, length: seg.length });
    }
  }

  return result;
}
