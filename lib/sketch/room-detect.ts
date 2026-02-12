import type { Point, Wall, DetectedRoom } from './types';

const MIN_ROOM_AREA = 10;
const ENDPOINT_MERGE_EPSILON = 0.01;

interface GraphNode {
  point: Point;
  // Sorted adjacency: list of neighbor indices, sorted by angle from this node
  neighbors: number[];
}

function pointKey(p: Point): string {
  return `${Math.round(p.x * 100)},${Math.round(p.y * 100)}`;
}

function angleBetween(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

// Shoelace formula for signed area
function signedArea(polygon: Point[]): number {
  let area = 0;
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  return area / 2;
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

function buildGraph(walls: Wall[]): GraphNode[] {
  // Collect unique points
  const pointMap = new Map<string, number>();
  const nodes: GraphNode[] = [];

  function getOrCreateNode(p: Point): number {
    const key = pointKey(p);
    if (pointMap.has(key)) {
      return pointMap.get(key)!;
    }
    const idx = nodes.length;
    nodes.push({ point: { x: p.x, y: p.y }, neighbors: [] });
    pointMap.set(key, idx);
    return idx;
  }

  for (const wall of walls) {
    const startIdx = getOrCreateNode(wall.start);
    const endIdx = getOrCreateNode(wall.end);
    if (startIdx === endIdx) continue;

    if (!nodes[startIdx].neighbors.includes(endIdx)) {
      nodes[startIdx].neighbors.push(endIdx);
    }
    if (!nodes[endIdx].neighbors.includes(startIdx)) {
      nodes[endIdx].neighbors.push(startIdx);
    }
  }

  // Sort neighbors by angle for planar traversal
  for (const node of nodes) {
    node.neighbors.sort((a, b) => {
      const angleA = angleBetween(node.point, nodes[a].point);
      const angleB = angleBetween(node.point, nodes[b].point);
      return angleA - angleB;
    });
  }

  return nodes;
}

function findMinimalCycles(nodes: GraphNode[], walls: Wall[]): DetectedRoom[] {
  const visitedEdges = new Set<string>();
  const rooms: DetectedRoom[] = [];
  let roomId = 0;

  function edgeKey(from: number, to: number): string {
    return `${from}->${to}`;
  }

  // For each directed edge, do a left-turn traversal
  for (let startNode = 0; startNode < nodes.length; startNode++) {
    for (const firstNeighbor of nodes[startNode].neighbors) {
      const directedKey = edgeKey(startNode, firstNeighbor);
      if (visitedEdges.has(directedKey)) continue;

      // Traverse: always take the "next edge" after turning left
      const cycle: number[] = [startNode];
      let current = firstNeighbor;
      let prev = startNode;
      let valid = true;

      for (let step = 0; step < nodes.length + 1; step++) {
        cycle.push(current);
        visitedEdges.add(edgeKey(prev, current));

        if (current === startNode) break;

        const node = nodes[current];
        if (node.neighbors.length === 0) {
          valid = false;
          break;
        }

        // Find the index of the edge we came from (prev -> current means we look for prev in current's neighbors)
        const incomingAngle = angleBetween(node.point, nodes[prev].point);

        // Find the next edge after the incoming edge in sorted order (left turn = next clockwise)
        let bestIdx = -1;
        let bestAngleDiff = Infinity;

        for (let i = 0; i < node.neighbors.length; i++) {
          const neighbor = node.neighbors[i];
          if (neighbor === prev && node.neighbors.length > 1) {
            // Skip going back unless it's the only option
            continue;
          }
          const outAngle = angleBetween(node.point, nodes[neighbor].point);
          // We want the first edge clockwise from the incoming direction
          let diff = incomingAngle - outAngle;
          if (diff <= ENDPOINT_MERGE_EPSILON) diff += 2 * Math.PI;
          if (diff < bestAngleDiff) {
            bestAngleDiff = diff;
            bestIdx = i;
          }
        }

        if (bestIdx === -1) {
          // Only neighbor is prev, go back
          bestIdx = node.neighbors.indexOf(prev);
          if (bestIdx === -1) { valid = false; break; }
        }

        prev = current;
        current = node.neighbors[bestIdx];
      }

      if (!valid || cycle.length < 4 || cycle[cycle.length - 1] !== startNode) continue;

      // Remove the repeated start node at the end
      const polygon = cycle.slice(0, -1).map(idx => nodes[idx].point);
      const area = Math.abs(signedArea(polygon));

      if (area < MIN_ROOM_AREA) continue;

      const bb = boundingBox(polygon);
      const aspectRatio = bb.width > 0 && bb.height > 0
        ? Math.max(bb.width, bb.height) / Math.min(bb.width, bb.height)
        : 1;

      // Find which walls form this room's boundary
      const roomWallIds: string[] = [];
      for (let i = 0; i < cycle.length - 1; i++) {
        const pA = nodes[cycle[i]].point;
        const pB = nodes[cycle[i + 1]].point;
        for (const wall of walls) {
          const matchForward =
            Math.abs(wall.start.x - pA.x) < 0.1 && Math.abs(wall.start.y - pA.y) < 0.1 &&
            Math.abs(wall.end.x - pB.x) < 0.1 && Math.abs(wall.end.y - pB.y) < 0.1;
          const matchReverse =
            Math.abs(wall.start.x - pB.x) < 0.1 && Math.abs(wall.start.y - pB.y) < 0.1 &&
            Math.abs(wall.end.x - pA.x) < 0.1 && Math.abs(wall.end.y - pA.y) < 0.1;
          if ((matchForward || matchReverse) && !roomWallIds.includes(wall.id)) {
            roomWallIds.push(wall.id);
          }
        }
      }

      rooms.push({
        id: `room-${roomId++}`,
        wallIds: roomWallIds,
        polygon,
        boundingBox: bb,
        area,
        aspectRatio,
      });
    }
  }

  // Deduplicate rooms that share the same set of walls
  const unique: DetectedRoom[] = [];
  const seen = new Set<string>();
  for (const room of rooms) {
    const key = [...room.wallIds].sort().join(',');
    if (!seen.has(key) && key.length > 0) {
      seen.add(key);
      unique.push(room);
    }
  }

  return unique;
}

export function detectRooms(walls: Wall[]): DetectedRoom[] {
  if (walls.length < 3) return [];

  const nodes = buildGraph(walls);
  return findMinimalCycles(nodes, walls);
}
