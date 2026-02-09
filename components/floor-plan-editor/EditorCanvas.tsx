'use client';

import { useRef, useCallback, useState } from 'react';
import type { EditorShape, ShapeType } from '@/lib/types';
import { pointerToSvgPercent, hitTestShape, snapToGrid } from '@/lib/editor-utils';
import { isDragDrawBlock } from '@/lib/block-definitions';
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
}

interface DragDrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

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
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragDraw, setDragDraw] = useState<DragDrawState | null>(null);

  const { startMove, startResize, onPointerMove, onPointerUp, isDragging, didMove } = useDragAndDrop({
    svgRef,
    shapes,
    updateShape,
    pushSnapshot,
    gridSnap,
    gridSize,
  });

  const sortedShapes = [...shapes].sort((a, b) => a.z_index - b.z_index);

  const isDragDrawTool = activeTool ? isDragDrawBlock(activeTool) : false;

  const snapVal = useCallback((v: number) => {
    return gridSnap ? snapToGrid(v, gridSize) : v;
  }, [gridSnap, gridSize]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    // Drag-draw mode for room blocks
    if (activeTool && isDragDrawTool) {
      const { x, y } = pointerToSvgPercent(e, svgRef.current);
      const sx = snapVal(x);
      const sy = snapVal(y);
      setDragDraw({ startX: sx, startY: sy, currentX: sx, currentY: sy, active: true });
      (e.target as Element).setPointerCapture?.(e.pointerId);
      e.preventDefault();
      return;
    }
  }, [activeTool, isDragDrawTool, snapVal]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Handle drag-draw preview
    if (dragDraw?.active && svgRef.current) {
      const { x, y } = pointerToSvgPercent(e, svgRef.current);
      setDragDraw(prev => prev ? { ...prev, currentX: snapVal(x), currentY: snapVal(y) } : null);
      e.preventDefault();
      return;
    }

    // Normal drag/resize
    onPointerMove(e);
  }, [dragDraw, snapVal, onPointerMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Finish drag-draw
    if (dragDraw?.active && activeTool) {
      const x = Math.min(dragDraw.startX, dragDraw.currentX);
      const y = Math.min(dragDraw.startY, dragDraw.currentY);
      const w = Math.abs(dragDraw.currentX - dragDraw.startX);
      const h = Math.abs(dragDraw.currentY - dragDraw.startY);

      setDragDraw(null);

      // Minimum size check (5x5)
      if (w >= 5 && h >= 5) {
        onAddShape(activeTool, x, y, w, h);
      }
      return;
    }

    onPointerUp();
  }, [dragDraw, activeTool, onAddShape, onPointerUp]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    if (didMove()) return;
    // Don't handle click if we just finished a drag-draw
    if (isDragDrawTool) return;

    const rect = svgRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    // If tool is active (non-drag-draw), place a new shape
    if (activeTool) {
      if (gridSnap) {
        x = snapToGrid(x - 6, gridSize);
        y = snapToGrid(y - 5, gridSize);
      } else {
        x = x - 6;
        y = y - 5;
      }
      onAddShape(activeTool, x, y);
      return;
    }

    // Hit test shapes (reverse order for top-most first)
    for (let i = sortedShapes.length - 1; i >= 0; i--) {
      if (hitTestShape(x, y, sortedShapes[i])) {
        onSelectShape(sortedShapes[i].id);
        return;
      }
    }

    // Click on empty space → deselect
    onSelectShape(null);
  }, [activeTool, isDragDrawTool, sortedShapes, onSelectShape, onAddShape, didMove, gridSnap, gridSize]);

  const handleShapePointerDown = useCallback((e: React.PointerEvent, shapeId: string) => {
    if (activeTool) return; // Don't drag when placing
    onSelectShape(shapeId);
    startMove(e, shapeId);
  }, [activeTool, onSelectShape, startMove]);

  const selectedShape = shapes.find(s => s.id === selectedId);

  // Compute drag-draw preview rect
  const previewRect = dragDraw?.active ? {
    x: Math.min(dragDraw.startX, dragDraw.currentX),
    y: Math.min(dragDraw.startY, dragDraw.currentY),
    w: Math.abs(dragDraw.currentX - dragDraw.startX),
    h: Math.abs(dragDraw.currentY - dragDraw.startY),
  } : null;

  return (
    <div className="editor-canvas-wrapper w-full aspect-square bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
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
        <rect width="100" height="100" fill="#FEFCFA" />
        <rect width="100" height="100" fill="url(#editorGrid)" />

        {/* Border lines for visual reference */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="#E5E7EB" strokeWidth="0.2" />
        <line x1="100" y1="0" x2="100" y2="100" stroke="#E5E7EB" strokeWidth="0.2" />
        <line x1="100" y1="100" x2="0" y2="100" stroke="#E5E7EB" strokeWidth="0.2" />
        <line x1="0" y1="100" x2="0" y2="0" stroke="#E5E7EB" strokeWidth="0.2" />

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
        {selectedShape && !dragDraw?.active && (
          <ResizeHandles
            shape={selectedShape}
            onResizeStart={(e, handle) => startResize(e, selectedShape.id, handle)}
          />
        )}
      </svg>
    </div>
  );
}
