import type { Point, CleanedSegment, Wall } from './types';

const MERGE_THRESHOLD = 4.0;
const MIN_WALL_LENGTH = 0.5;

// Union-Find data structure
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;

    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb;
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra;
    } else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
  }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function connectWalls(segments: CleanedSegment[]): Wall[] {
  // Collect all endpoints
  const endpoints: Point[] = [];
  for (const seg of segments) {
    endpoints.push(seg.start, seg.end);
  }

  if (endpoints.length === 0) return [];

  // Union-Find: merge close endpoints
  const uf = new UnionFind(endpoints.length);

  for (let i = 0; i < endpoints.length; i++) {
    for (let j = i + 1; j < endpoints.length; j++) {
      if (distance(endpoints[i], endpoints[j]) <= MERGE_THRESHOLD) {
        uf.union(i, j);
      }
    }
  }

  // Compute group averages
  const groupPoints = new Map<number, Point[]>();
  for (let i = 0; i < endpoints.length; i++) {
    const root = uf.find(i);
    if (!groupPoints.has(root)) {
      groupPoints.set(root, []);
    }
    groupPoints.get(root)!.push(endpoints[i]);
  }

  const mergedCoords = new Map<number, Point>();
  for (const [root, points] of groupPoints) {
    const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    mergedCoords.set(root, { x: avgX, y: avgY });
  }

  // Build walls from segments with merged endpoints
  const walls: Wall[] = [];
  let wallId = 0;

  for (let i = 0; i < segments.length; i++) {
    const startIdx = i * 2;
    const endIdx = i * 2 + 1;
    const startRoot = uf.find(startIdx);
    const endRoot = uf.find(endIdx);

    const start = mergedCoords.get(startRoot)!;
    const end = mergedCoords.get(endRoot)!;

    // Skip degenerate walls
    const len = distance(start, end);
    if (len < MIN_WALL_LENGTH) continue;

    walls.push({
      id: `wall-${wallId++}`,
      start,
      end,
      thickness: 2,
    });
  }

  return walls;
}
