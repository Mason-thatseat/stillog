import type { CleanedStructure, Wall, DetectedRoom, DetectedObject, Point } from './types';
import type { EditorShape, ShapeType } from '@/lib/types';

let sketchShapeCounter = 0;

function makeId(): string {
  return `sketch-${Date.now()}-${sketchShapeCounter++}`;
}

// Ray-casting point-in-polygon test
function pointInPolygon(x: number, y: number, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Cluster nearby values into a single representative (average)
function clusterValues(values: number[], threshold: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const clusters: number[] = [];
  let i = 0;
  while (i < sorted.length) {
    let sum = sorted[i];
    let count = 1;
    while (i + count < sorted.length && sorted[i + count] - sorted[i] < threshold) {
      sum += sorted[i + count];
      count++;
    }
    clusters.push(Math.round((sum / count) * 10) / 10);
    i += count;
  }
  return clusters;
}

// Decompose a non-rectangular polygon into axis-aligned rectangles
function decomposeToRects(polygon: Point[]): Array<{ x: number; y: number; width: number; height: number }> {
  const CLUSTER_THRESHOLD = 3;
  const rawXs = polygon.map(p => p.x);
  const rawYs = polygon.map(p => p.y);
  const xs = clusterValues(rawXs, CLUSTER_THRESHOLD);
  const ys = clusterValues(rawYs, CLUSTER_THRESHOLD);

  if (xs.length < 2 || ys.length < 2) {
    return [boundingBox(polygon)];
  }

  const cols = xs.length - 1;
  const rows = ys.length - 1;
  const grid: boolean[][] = [];
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      const cx = (xs[i] + xs[i + 1]) / 2;
      const cy = (ys[j] + ys[j + 1]) / 2;
      grid[i][j] = pointInPolygon(cx, cy, polygon);
    }
  }

  const used: boolean[][] = grid.map(col => col.map(() => false));
  const rects: Array<{ x: number; y: number; width: number; height: number }> = [];

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (!grid[i][j] || used[i][j]) continue;

      let maxI = i;
      while (maxI + 1 < cols && grid[maxI + 1][j] && !used[maxI + 1][j]) {
        maxI++;
      }

      let maxJ = j;
      let canExtend = true;
      while (canExtend && maxJ + 1 < rows) {
        for (let ii = i; ii <= maxI; ii++) {
          if (!grid[ii][maxJ + 1] || used[ii][maxJ + 1]) {
            canExtend = false;
            break;
          }
        }
        if (canExtend) maxJ++;
      }

      for (let ii = i; ii <= maxI; ii++) {
        for (let jj = j; jj <= maxJ; jj++) {
          used[ii][jj] = true;
        }
      }

      rects.push({
        x: xs[i],
        y: ys[j],
        width: xs[maxI + 1] - xs[i],
        height: ys[maxJ + 1] - ys[j],
      });
    }
  }

  return rects.length > 0 ? rects : [boundingBox(polygon)];
}

function boundingBox(polygon: Point[]): { x: number; y: number; width: number; height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Convex hull (Andrew's monotone chain)
function convexHull(points: Point[]): Point[] {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length <= 2) return pts;

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Point[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function makeRoomShape(
  rect: { x: number; y: number; width: number; height: number },
  spaceId: string,
  zIndex: number,
): EditorShape {
  return {
    id: makeId(),
    space_id: spaceId,
    shape_type: 'block_room',
    x_percent: rect.x,
    y_percent: rect.y,
    width_percent: rect.width,
    height_percent: rect.height,
    rotation: 0,
    fill_color: '#FFF8F0',
    stroke_color: '#5C4033',
    stroke_width: 1,
    opacity: 1,
    z_index: zIndex,
    label: null,
    created_at: new Date().toISOString(),
    isNew: true,
  };
}

function roomToShapes(room: DetectedRoom, spaceId: string, startZ: number): { shapes: EditorShape[]; nextZ: number } {
  const isSimpleRect = room.polygon.length <= 4;

  if (isSimpleRect) {
    const shape = makeRoomShape(room.boundingBox, spaceId, startZ);
    return { shapes: [shape], nextZ: startZ + 1 };
  }

  const rects = decomposeToRects(room.polygon);
  const shapes: EditorShape[] = [];
  let z = startZ;
  for (const rect of rects) {
    shapes.push(makeRoomShape(rect, spaceId, z++));
  }
  return { shapes, nextZ: z };
}

// Collect all unique endpoints from walls
function collectWallEndpoints(walls: Wall[]): Point[] {
  const pts: Point[] = [];
  for (const wall of walls) {
    pts.push(wall.start, wall.end);
  }
  return pts;
}

// Classify a detected object into a table block type based on drawn size
function classifyTableType(obj: DetectedObject): { type: ShapeType; fill: string; stroke: string } {
  const maxDim = Math.max(obj.boundingBox.width, obj.boundingBox.height);
  const ar = obj.aspectRatio;

  // Roughly circular (aspect ratio close to 1) and small → round table
  if (ar <= 1.4 && maxDim < 12) {
    return { type: 'block_table_round', fill: '#F5E6D3', stroke: '#A78B71' };
  }

  // Size-based classification
  if (maxDim < 9) {
    return { type: 'block_table_2', fill: '#E8D5C0', stroke: '#A78B71' };
  }
  if (maxDim < 15) {
    return { type: 'block_table_4', fill: '#E8D5C0', stroke: '#A78B71' };
  }
  return { type: 'block_table_6', fill: '#E8D5C0', stroke: '#A78B71' };
}

function objectToShape(obj: DetectedObject, spaceId: string, zIndex: number): EditorShape {
  const { type, fill, stroke } = classifyTableType(obj);
  const bb = obj.boundingBox;

  // Use drawn size, but enforce minimum dimensions
  const width = Math.max(bb.width, 5);
  const height = Math.max(bb.height, 5);

  return {
    id: makeId(),
    space_id: spaceId,
    shape_type: type,
    x_percent: bb.x,
    y_percent: bb.y,
    width_percent: width,
    height_percent: height,
    rotation: 0,
    fill_color: fill,
    stroke_color: stroke,
    stroke_width: 1,
    opacity: 1,
    z_index: zIndex,
    label: null,
    created_at: new Date().toISOString(),
    isNew: true,
  };
}

export function sketchToShapes(structure: CleanedStructure, spaceId: string): EditorShape[] {
  const shapes: EditorShape[] = [];
  let z = 0;

  // 1. Detected rooms → block_room (decomposed if non-rectangular)
  for (const room of structure.rooms) {
    const result = roomToShapes(room, spaceId, z);
    shapes.push(...result.shapes);
    z = result.nextZ;
  }

  // 2. Walls not part of any room → try to form a room from their hull
  const roomWallIds = new Set<string>();
  for (const room of structure.rooms) {
    for (const wid of room.wallIds) {
      roomWallIds.add(wid);
    }
  }
  const leftoverWalls = structure.walls.filter(w => !roomWallIds.has(w.id));

  if (leftoverWalls.length > 0) {
    const endpoints = collectWallEndpoints(leftoverWalls);
    if (endpoints.length >= 3) {
      const hull = convexHull(endpoints);
      if (hull.length >= 3) {
        const rects = decomposeToRects(hull);
        for (const rect of rects) {
          if (rect.width > 1 && rect.height > 1) {
            shapes.push(makeRoomShape(rect, spaceId, z++));
          }
        }
      }
    } else if (endpoints.length >= 2) {
      const bb = boundingBox(endpoints);
      if (bb.width < 3) bb.width = 3;
      if (bb.height < 3) bb.height = 3;
      shapes.push(makeRoomShape(bb, spaceId, z++));
    }
  }

  // 3. Detected objects → table blocks (on top of rooms)
  for (const obj of structure.objects) {
    shapes.push(objectToShape(obj, spaceId, z++));
  }

  return shapes;
}
