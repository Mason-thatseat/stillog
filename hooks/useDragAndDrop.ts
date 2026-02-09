import { useRef, useCallback } from 'react';
import type { EditorShape } from '@/lib/types';
import { pointerToSvgPercent, calcResize, clamp, snapToGrid, type HandlePosition } from '@/lib/editor-utils';

type DragMode = 'move' | 'resize' | 'create';

interface DragState {
  mode: DragMode;
  shapeId: string;
  startX: number;
  startY: number;
  originalShape: { x: number; y: number; w: number; h: number };
  handle?: HandlePosition;
}

interface UseDragAndDropProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  shapes: EditorShape[];
  updateShape: (id: string, updates: Partial<EditorShape>) => void;
  pushSnapshot: () => void;
  gridSnap?: boolean;
  gridSize?: number;
}

export function useDragAndDrop({ svgRef, shapes, updateShape, pushSnapshot, gridSnap = false, gridSize = 5 }: UseDragAndDropProps) {
  const dragState = useRef<DragState | null>(null);
  const hasMoved = useRef(false);

  const snap = useCallback((v: number) => {
    return gridSnap ? snapToGrid(v, gridSize) : v;
  }, [gridSnap, gridSize]);

  const startMove = useCallback((e: React.PointerEvent, shapeId: string) => {
    if (!svgRef.current) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);

    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;

    const { x, y } = pointerToSvgPercent(e, svgRef.current);
    pushSnapshot();
    hasMoved.current = false;

    dragState.current = {
      mode: 'move',
      shapeId,
      startX: x,
      startY: y,
      originalShape: {
        x: shape.x_percent,
        y: shape.y_percent,
        w: shape.width_percent,
        h: shape.height_percent,
      },
    };
  }, [svgRef, shapes, pushSnapshot]);

  const startResize = useCallback((e: React.PointerEvent, shapeId: string, handle: HandlePosition) => {
    if (!svgRef.current) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);

    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;

    const { x, y } = pointerToSvgPercent(e, svgRef.current);
    pushSnapshot();
    hasMoved.current = false;

    dragState.current = {
      mode: 'resize',
      shapeId,
      startX: x,
      startY: y,
      handle,
      originalShape: {
        x: shape.x_percent,
        y: shape.y_percent,
        w: shape.width_percent,
        h: shape.height_percent,
      },
    };
  }, [svgRef, shapes, pushSnapshot]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current || !svgRef.current) return;
    hasMoved.current = true;

    const { x, y } = pointerToSvgPercent(e, svgRef.current);
    const ds = dragState.current;
    const dx = x - ds.startX;
    const dy = y - ds.startY;

    if (ds.mode === 'move') {
      const rawX = ds.originalShape.x + dx;
      const rawY = ds.originalShape.y + dy;
      const newX = clamp(snap(rawX), 0, 100 - ds.originalShape.w);
      const newY = clamp(snap(rawY), 0, 100 - ds.originalShape.h);
      updateShape(ds.shapeId, { x_percent: newX, y_percent: newY });
    } else if (ds.mode === 'resize' && ds.handle) {
      const result = calcResize(ds.handle, dx, dy, ds.originalShape);
      updateShape(ds.shapeId, {
        x_percent: snap(result.x),
        y_percent: snap(result.y),
        width_percent: snap(result.w),
        height_percent: snap(result.h),
      });
    }
  }, [svgRef, updateShape, snap]);

  const onPointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  const isDragging = useCallback(() => {
    return dragState.current !== null;
  }, []);

  const didMove = useCallback(() => {
    return hasMoved.current;
  }, []);

  return {
    startMove,
    startResize,
    onPointerMove,
    onPointerUp,
    isDragging,
    didMove,
  };
}
