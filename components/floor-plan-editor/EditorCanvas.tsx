'use client';

import { useRef, useCallback } from 'react';
import type { EditorShape, ShapeType } from '@/lib/types';
import { pointerToSvgPercent, hitTestShape, snapToGrid } from '@/lib/editor-utils';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import ShapeRenderer from './ShapeRenderer';
import ResizeHandles from './ResizeHandles';

interface EditorCanvasProps {
  shapes: EditorShape[];
  selectedId: string | null;
  activeTool: ShapeType | null;
  onSelectShape: (id: string | null) => void;
  onAddShape: (type: ShapeType, x: number, y: number) => void;
  updateShape: (id: string, updates: Partial<EditorShape>) => void;
  pushSnapshot: () => void;
  gridSnap?: boolean;
  gridSize?: number;
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

  const { startMove, startResize, onPointerMove, onPointerUp, isDragging, didMove } = useDragAndDrop({
    svgRef,
    shapes,
    updateShape,
    pushSnapshot,
    gridSnap,
    gridSize,
  });

  const sortedShapes = [...shapes].sort((a, b) => a.z_index - b.z_index);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    if (didMove()) return;

    const rect = svgRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    // If tool is active, place a new shape
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
  }, [activeTool, sortedShapes, onSelectShape, onAddShape, didMove, gridSnap, gridSize]);

  const handleShapePointerDown = useCallback((e: React.PointerEvent, shapeId: string) => {
    if (activeTool) return; // Don't drag when placing
    onSelectShape(shapeId);
    startMove(e, shapeId);
  }, [activeTool, onSelectShape, startMove]);

  const selectedShape = shapes.find(s => s.id === selectedId);

  return (
    <div className="editor-canvas-wrapper w-full aspect-square bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className={`w-full h-full ${activeTool ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={handleCanvasClick}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
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
            isSelected={shape.id === selectedId}
            onPointerDown={(e) => handleShapePointerDown(e, shape.id)}
          />
        ))}

        {/* Resize handles for selected shape */}
        {selectedShape && (
          <ResizeHandles
            shape={selectedShape}
            onResizeStart={(e, handle) => startResize(e, selectedShape.id, handle)}
          />
        )}
      </svg>
    </div>
  );
}
