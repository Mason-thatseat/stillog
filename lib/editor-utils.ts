import type { ShapeType, EditorShape } from './types';
import { isBlockType, BLOCK_REGISTRY } from './block-definitions';

// Convert mouse/pointer event to SVG percentage coordinates
export function pointerToSvgPercent(
  e: React.PointerEvent | PointerEvent,
  svgEl: SVGSVGElement
): { x: number; y: number } {
  const rect = svgEl.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Snap to grid (optional)
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

// Hit test: check if a point is inside a shape
export function hitTestShape(
  px: number,
  py: number,
  shape: EditorShape
): boolean {
  const { x_percent: x, y_percent: y, width_percent: w, height_percent: h, shape_type } = shape;

  switch (shape_type) {
    case 'circle':
    case 'block_table_round':
    case 'block_dispenser': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const rx = w / 2;
      const ry = h / 2;
      return ((px - cx) ** 2) / (rx ** 2) + ((py - cy) ** 2) / (ry ** 2) <= 1;
    }
    case 'line':
      return distanceToLine(px, py, x, y, x + w, y + h) < 1.5;
    default:
      // Rectangle, triangle, block types — bounding box check
      return px >= x && px <= x + w && py >= y && py <= y + h;
  }
}

function distanceToLine(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Room edge visibility for wall merging
export interface EdgeVisibility {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export function getRoomEdgeVisibility(
  room: EditorShape,
  allRooms: EditorShape[]
): EdgeVisibility {
  const vis: EdgeVisibility = { top: true, right: true, bottom: true, left: true };
  const TOLERANCE = 0.5;

  const rLeft = room.x_percent;
  const rRight = room.x_percent + room.width_percent;
  const rTop = room.y_percent;
  const rBottom = room.y_percent + room.height_percent;

  for (const other of allRooms) {
    if (other.id === room.id) continue;
    if (other.shape_type !== 'block_room') continue;

    const oLeft = other.x_percent;
    const oRight = other.x_percent + other.width_percent;
    const oTop = other.y_percent;
    const oBottom = other.y_percent + other.height_percent;

    // Check TOP edge: other's bottom aligns with room's top, and horizontal overlap
    if (Math.abs(oBottom - rTop) < TOLERANCE) {
      const overlapLeft = Math.max(rLeft, oLeft);
      const overlapRight = Math.min(rRight, oRight);
      if (overlapRight - overlapLeft > TOLERANCE) {
        // Check if overlap covers the full edge
        if (overlapLeft <= rLeft + TOLERANCE && overlapRight >= rRight - TOLERANCE) {
          vis.top = false;
        }
      }
    }

    // Check BOTTOM edge: other's top aligns with room's bottom
    if (Math.abs(oTop - rBottom) < TOLERANCE) {
      const overlapLeft = Math.max(rLeft, oLeft);
      const overlapRight = Math.min(rRight, oRight);
      if (overlapRight - overlapLeft > TOLERANCE) {
        if (overlapLeft <= rLeft + TOLERANCE && overlapRight >= rRight - TOLERANCE) {
          vis.bottom = false;
        }
      }
    }

    // Check LEFT edge: other's right aligns with room's left
    if (Math.abs(oRight - rLeft) < TOLERANCE) {
      const overlapTop = Math.max(rTop, oTop);
      const overlapBottom = Math.min(rBottom, oBottom);
      if (overlapBottom - overlapTop > TOLERANCE) {
        if (overlapTop <= rTop + TOLERANCE && overlapBottom >= rBottom - TOLERANCE) {
          vis.left = false;
        }
      }
    }

    // Check RIGHT edge: other's left aligns with room's right
    if (Math.abs(oLeft - rRight) < TOLERANCE) {
      const overlapTop = Math.max(rTop, oTop);
      const overlapBottom = Math.min(rBottom, oBottom);
      if (overlapBottom - overlapTop > TOLERANCE) {
        if (overlapTop <= rTop + TOLERANCE && overlapBottom >= rBottom - TOLERANCE) {
          vis.right = false;
        }
      }
    }
  }

  return vis;
}

// Resize handle positions (8 directions)
export type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function getHandlePositions(shape: EditorShape): Array<{
  pos: HandlePosition;
  x: number;
  y: number;
}> {
  const { x_percent: x, y_percent: y, width_percent: w, height_percent: h } = shape;
  return [
    { pos: 'nw', x, y },
    { pos: 'n', x: x + w / 2, y },
    { pos: 'ne', x: x + w, y },
    { pos: 'e', x: x + w, y: y + h / 2 },
    { pos: 'se', x: x + w, y: y + h },
    { pos: 's', x: x + w / 2, y: y + h },
    { pos: 'sw', x, y: y + h },
    { pos: 'w', x, y: y + h / 2 },
  ];
}

// Calculate new shape bounds after resize handle drag
export function calcResize(
  handle: HandlePosition,
  dx: number,
  dy: number,
  original: { x: number; y: number; w: number; h: number }
): { x: number; y: number; w: number; h: number } {
  let { x, y, w, h } = original;

  switch (handle) {
    case 'nw': x += dx; y += dy; w -= dx; h -= dy; break;
    case 'n': y += dy; h -= dy; break;
    case 'ne': w += dx; y += dy; h -= dy; break;
    case 'e': w += dx; break;
    case 'se': w += dx; h += dy; break;
    case 's': h += dy; break;
    case 'sw': x += dx; w -= dx; h += dy; break;
    case 'w': x += dx; w -= dx; break;
  }

  // Minimum size
  if (w < 3) { w = 3; }
  if (h < 3) { h = 3; }

  return { x: clamp(x, 0, 97), y: clamp(y, 0, 97), w: clamp(w, 3, 100), h: clamp(h, 3, 100) };
}

// Shape factory: create default shapes
let tempIdCounter = 0;

export function createShape(
  type: ShapeType,
  x: number,
  y: number,
  spaceId: string,
  width?: number,
  height?: number
): EditorShape {
  const base = {
    id: `temp-${Date.now()}-${tempIdCounter++}`,
    space_id: spaceId,
    shape_type: type,
    x_percent: x,
    y_percent: y,
    rotation: 0,
    opacity: 1,
    z_index: 0,
    label: null,
    created_at: new Date().toISOString(),
    isNew: true,
  };

  switch (type) {
    case 'rectangle':
      return {
        ...base,
        width_percent: 12,
        height_percent: 8,
        fill_color: '#E8D5C0',
        stroke_color: '#A78B71',
        stroke_width: 1,
      };
    case 'circle':
      return {
        ...base,
        width_percent: 10,
        height_percent: 10,
        fill_color: '#D4C4B5',
        stroke_color: '#A78B71',
        stroke_width: 1,
      };
    case 'triangle':
      return {
        ...base,
        width_percent: 12,
        height_percent: 10,
        fill_color: '#F0E4D7',
        stroke_color: '#A78B71',
        stroke_width: 1,
      };
    case 'line':
      return {
        ...base,
        width_percent: 15,
        height_percent: 0.5,
        fill_color: 'transparent',
        stroke_color: '#A78B71',
        stroke_width: 2,
      };
    default: {
      // Block types
      if (isBlockType(type)) {
        const def = BLOCK_REGISTRY[type];
        return {
          ...base,
          width_percent: width ?? def.defaultWidth,
          height_percent: height ?? def.defaultHeight,
          fill_color: def.defaultFill,
          stroke_color: def.defaultStroke,
          stroke_width: 1,
          label: def.createsSeat ? def.label : null,
        };
      }
      // Fallback
      return {
        ...base,
        width_percent: 10,
        height_percent: 10,
        fill_color: '#E8D5C0',
        stroke_color: '#A78B71',
        stroke_width: 1,
      };
    }
  }
}

// Color palette for editor
export const COLOR_PALETTE = [
  { name: 'cream', value: '#FFF8F0' },
  { name: 'latte', value: '#F5E6D3' },
  { name: 'mocha', value: '#E8D5C0' },
  { name: 'caramel', value: '#D4C4B5' },
  { name: 'vanilla', value: '#F0E4D7' },
  { name: 'walnut', value: '#A78B71' },
  { name: 'espresso', value: '#6B5B4D' },
  { name: 'sand', value: '#E8DDD3' },
  { name: 'rose', value: '#F2D9D5' },
  { name: 'sage', value: '#D5DDD5' },
  { name: 'sky', value: '#D5DEE8' },
  { name: 'white', value: '#FFFFFF' },
  { name: 'transparent', value: 'transparent' },
];

export const STROKE_PALETTE = [
  { name: 'walnut', value: '#A78B71' },
  { name: 'espresso', value: '#6B5B4D' },
  { name: 'dark', value: '#3D3229' },
  { name: 'gray', value: '#9CA3AF' },
  { name: 'light', value: '#D4C4B5' },
  { name: 'none', value: 'transparent' },
];
