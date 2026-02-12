import type { SketchStroke, CleanedStructure, Point, DetectedObject } from './types';
import { douglasPeucker } from './douglas-peucker';
import { pointsToSegments, snapSegmentAngles, alignParallelSegments } from './angle-snap';
import { connectWalls } from './wall-connect';
import { detectRooms } from './room-detect';
import { classifySpace } from './space-classify';

// Max bounding box dimension for a stroke to be considered furniture (SVG units, 0-100)
const OBJECT_MAX_DIM = 20;
// A stroke is "closed" if start/end are within this distance
const CLOSED_THRESHOLD = 5;

function strokeBoundingBox(points: Point[]): { x: number; y: number; width: number; height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function totalLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

function isObjectStroke(stroke: SketchStroke): boolean {
  if (stroke.points.length < 3) return false;

  const bb = strokeBoundingBox(stroke.points);
  const maxDim = Math.max(bb.width, bb.height);

  // Too large to be furniture
  if (maxDim > OBJECT_MAX_DIM) return false;

  // Check if roughly closed (start near end)
  const first = stroke.points[0];
  const last = stroke.points[stroke.points.length - 1];
  const gap = Math.hypot(last.x - first.x, last.y - first.y);
  const isClosed = gap < CLOSED_THRESHOLD;

  // Check compactness: total length shouldn't be way longer than perimeter
  const perimeter = 2 * (bb.width + bb.height);
  const len = totalLength(stroke.points);
  const isCompact = perimeter > 0 && len < perimeter * 2.5;

  return isClosed && isCompact;
}

function detectObjects(strokes: SketchStroke[]): DetectedObject[] {
  const objects: DetectedObject[] = [];
  let id = 0;

  for (const stroke of strokes) {
    const bb = strokeBoundingBox(stroke.points);
    const w = bb.width;
    const h = bb.height;
    const ar = w > 0 && h > 0 ? Math.max(w, h) / Math.min(w, h) : 1;

    objects.push({
      id: `obj-${id++}`,
      boundingBox: bb,
      aspectRatio: ar,
      area: w * h,
    });
  }

  return objects;
}

export function analyzeSketch(strokes: SketchStroke[]): CleanedStructure {
  if (strokes.length === 0) {
    return {
      walls: [],
      rooms: [],
      objects: [],
      classification: { layoutType: 'unknown', confidence: 0, roomCount: 0 },
    };
  }

  // Separate strokes: small closed shapes = objects, rest = walls
  const wallStrokes: SketchStroke[] = [];
  const objectStrokes: SketchStroke[] = [];

  for (const stroke of strokes) {
    if (isObjectStroke(stroke)) {
      objectStrokes.push(stroke);
    } else {
      wallStrokes.push(stroke);
    }
  }

  // Process wall strokes through the wall pipeline
  const allSegments = wallStrokes.flatMap((stroke) => {
    const simplified = douglasPeucker(stroke.points, 1.5);
    return pointsToSegments(simplified);
  });

  let walls = [] as CleanedStructure['walls'];
  let rooms = [] as CleanedStructure['rooms'];

  if (allSegments.length > 0) {
    const snapped = snapSegmentAngles(allSegments);
    const aligned = alignParallelSegments(snapped);
    walls = connectWalls(aligned);
    rooms = detectRooms(walls);
  }

  // Detect furniture objects
  const objects = detectObjects(objectStrokes);

  const classification = classifySpace(rooms);

  return { walls, rooms, objects, classification };
}
