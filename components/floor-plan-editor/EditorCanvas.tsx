'use client';

import { useRef, useCallback, useState } from 'react';
import type { EditorShape, ShapeType } from '@/lib/types';
import { hitTestShape, snapToGrid } from '@/lib/editor-utils';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import ShapeRenderer from './ShapeRenderer';
import ResizeHandles from './ResizeHandles';

interface EditorCanvasProps {
  shapes: EditorShape[];
  selectedId: string | null;
  activeTool: ShapeType | null;
  onSelectShape: (id: string | null) => void;
  onAddShape: (type: ShapeType, x: number, y: number, width?: number, height?: number) => void;
  updateShape: (id: string, updates: Partial<EditorShape>) => void;
  pushSnapshot: () => void;
  gridSnap?: boolean;
  gridSize?: number;
  canvasRatio?: number; // height / width (e.g. 1 = square, 0.75 = landscape 4:3)
}

interface DragDrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const MIN_DRAG_SIZE = 3;

export default function EditorCanvas({
  shapes,
  selectedId,
  activeTool,
  onSelectShape,
  onAddShape,
  updateShape,
  pushSnapshot,
  gridSnap = false,
  gridSize = 5,
  canvasRatio = 1,
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragDraw, setDragDraw] = useState<DragDrawState | null>(null);
  const dragDrawRef = useRef<DragDrawState | null>(null);

  const viewBoxHeight = Math.round(100 * canvasRatio);

  const { startMove, startResize, onPointerMove, onPointerUp, isDragging, didMove } = useDragAndDrop({
    svgRef,
    shapes,
    updateShape,
    pushSnapshot,
    gridSnap,
    gridSize,
    viewBoxHeight,
  });

  const sortedShapes = [...shapes].sort((a, b) => a.z_index - b.z_index);

  const snapVal = useCallback((v: number) => {
    return gridSnap ? snapToGrid(v, gridSize) : v;
  }, [gridSnap, gridSize]);

  const updateDragDraw = useCallback((value: DragDrawState | null) => {
    dragDrawRef.current = value;
    setDragDraw(value);
  }, []);

  // Convert pointer to SVG percent, respecting custom viewBox height
  const pointerToPercent = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * viewBoxHeight;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(viewBoxHeight, y)),
    };
  }, [viewBoxHeight]);

  // All tools: pointer down starts drag-draw on canvas
  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || !activeTool) return;

    const { x, y } = pointerToPercent(e);
    const sx = snapVal(x);
    const sy = snapVal(y);
    updateDragDraw({ startX: sx, startY: sy, currentX: sx, currentY: sy });
    svgRef.current.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [activeTool, snapVal, updateDragDraw, pointerToPercent]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Handle drag-draw preview
    if (dragDrawRef.current && svgRef.current) {
      const { x, y } = pointerToPercent(e);
      updateDragDraw({ ...dragDrawRef.current, currentX: snapVal(x), currentY: snapVal(y) });
      e.preventDefault();
      return;
    }

    // Normal drag/resize
    onPointerMove(e);
  }, [snapVal, onPointerMove, updateDragDraw, pointerToPercent]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const dd = dragDrawRef.current;
    if (dd && activeTool) {
      const w = Math.abs(dd.currentX - dd.startX);
      const h = Math.abs(dd.currentY - dd.startY);
      updateDragDraw(null);

      if (w >= MIN_DRAG_SIZE && h >= MIN_DRAG_SIZE) {
        // Dragged enough → create with custom size
        const x = Math.min(dd.startX, dd.currentX);
        const y = Math.min(dd.startY, dd.currentY);
        onAddShape(activeTool, x, y, w, h);
      } else {
        // Just a click → place at default size
        const cx = snapVal(dd.startX);
        const cy = snapVal(dd.startY);
        onAddShape(activeTool, cx, cy);
      }
      return;
    }

    onPointerUp();
  }, [activeTool, onAddShape, onPointerUp, updateDragDraw, snapVal]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    if (didMove()) return;
    // When a tool is active, pointer handlers already deal with placement
    if (activeTool) return;

    const { x, y } = pointerToPercent(e as unknown as React.PointerEvent);

    // Hit test shapes (reverse order for top-most first)
    for (let i = sortedShapes.length - 1; i >= 0; i--) {
      if (hitTestShape(x, y, sortedShapes[i])) {
        onSelectShape(sortedShapes[i].id);
        return;
      }
    }

    // Click on empty space → deselect
    onSelectShape(null);
  }, [activeTool, sortedShapes, onSelectShape, didMove, pointerToPercent]);

  const handleShapePointerDown = useCallback((e: React.PointerEvent, shapeId: string) => {
    if (activeTool) return; // Don't drag when placing
    onSelectShape(shapeId);
    startMove(e, shapeId);
  }, [activeTool, onSelectShape, startMove]);

  const selectedShape = shapes.find(s => s.id === selectedId);

  // Compute drag-draw preview rect
  const previewRect = dragDraw ? {
    x: Math.min(dragDraw.startX, dragDraw.currentX),
    y: Math.min(dragDraw.startY, dragDraw.currentY),
    w: Math.abs(dragDraw.currentX - dragDraw.startX),
    h: Math.abs(dragDraw.currentY - dragDraw.startY),
  } : null;

  return (
    <div
      className="editor-canvas-wrapper w-full bg-white rounded-xl border border-border shadow-sm overflow-hidden"
      style={{ aspectRatio: `1 / ${canvasRatio}` }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 100 ${viewBoxHeight}`}
        className={`w-full h-full ${activeTool ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={handleCanvasClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Grid background */}
        <defs>
          <pattern id="editorGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r={gridSnap ? 0.25 : 0.15} fill={gridSnap ? '#CBD5E1' : '#E5E7EB'} />
          </pattern>
        </defs>
        <rect width="100" height={viewBoxHeight} fill="#FEFCFA" />
        <rect width="100" height={viewBoxHeight} fill="url(#editorGrid)" />

        {/* Border lines */}
        <rect x="0" y="0" width="100" height={viewBoxHeight} fill="none" stroke="#E5E7EB" strokeWidth="0.2" />

        {/* Shapes */}
        {sortedShapes.map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            allShapes={shapes}
            isSelected={shape.id === selectedId}
            onPointerDown={(e) => handleShapePointerDown(e, shape.id)}
          />
        ))}

        {/* Drag-draw preview rectangle */}
        {previewRect && previewRect.w > 0 && previewRect.h > 0 && (
          <rect
            x={previewRect.x}
            y={previewRect.y}
            width={previewRect.w}
            height={previewRect.h}
            fill="rgba(255, 248, 240, 0.5)"
            stroke="#5C4033"
            strokeWidth={0.3}
            strokeDasharray="1 0.5"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Resize handles for selected shape */}
        {selectedShape && !dragDrawRef.current && (
          <ResizeHandles
            shape={selectedShape}
            onResizeStart={(e, handle) => startResize(e, selectedShape.id, handle)}
          />
        )}
      </svg>
    </div>
  );
}
