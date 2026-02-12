'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import type { EditorShape, ShapeType } from '@/lib/types';
import { hitTestShape, snapToGrid, clamp } from '@/lib/editor-utils';
import { isSeatBlock } from '@/lib/block-definitions';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type { CanvasTransform } from '@/hooks/useCanvasTransform';
import ShapeRenderer from './ShapeRenderer';
import ResizeHandles from './ResizeHandles';
import ViewDirectionHandle from './ViewDirectionHandle';

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
  canvasRatio?: number;
  canvasTransform: CanvasTransform;
  onStartPan: (clientX: number, clientY: number) => void;
  onUpdatePan: (clientX: number, clientY: number) => boolean;
  onEndPan: () => void;
  isPanning: () => boolean;
  onWheel: (e: React.WheelEvent) => void;
  onStartPinch: (distance: number) => void;
  onUpdatePinch: (distance: number) => void;
  onEndPinch: () => void;
}

interface DragDrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const MIN_DRAG_SIZE = 3;

function getTouchDistance(touches: React.TouchList | TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[1].clientX - touches[0].clientX;
  const dy = touches[1].clientY - touches[0].clientY;
  return Math.hypot(dx, dy);
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
  canvasRatio = 1,
  canvasTransform,
  onStartPan,
  onUpdatePan,
  onEndPan,
  isPanning,
  onWheel,
  onStartPinch,
  onUpdatePinch,
  onEndPinch,
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragDraw, setDragDraw] = useState<DragDrawState | null>(null);
  const dragDrawRef = useRef<DragDrawState | null>(null);
  const touchCountRef = useRef(0);

  // Track SVG pixel dimensions via ResizeObserver
  const [svgDims, setSvgDims] = useState({ w: 1, h: 1 });
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSvgDims({ w: width, h: height });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseVbHeight = Math.round(100 * canvasRatio);
  const { scale, translateX, translateY } = canvasTransform;

  // Compute dynamic viewBox from zoom/pan state
  const vbW = 100 / scale;
  const vbH = baseVbHeight / scale;
  // Center-zoom: when zooming, keep center of canvas centered
  const centerZoomX = (100 - vbW) / 2;
  const centerZoomY = (baseVbHeight - vbH) / 2;
  // Convert pixel pan offset to SVG units
  const panSvgX = svgDims.w > 0 ? (translateX / svgDims.w) * vbW : 0;
  const panSvgY = svgDims.h > 0 ? (translateY / svgDims.h) * vbH : 0;
  const vbX = centerZoomX - panSvgX;
  const vbY = centerZoomY - panSvgY;
  const dynamicViewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;

  // Convert client (mouse/touch) coordinates to SVG coordinates
  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = vbX + ((clientX - rect.left) / rect.width) * vbW;
    const y = vbY + ((clientY - rect.top) / rect.height) * vbH;
    return {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, baseVbHeight),
    };
  }, [vbX, vbY, vbW, vbH, baseVbHeight]);

  const { startMove, startResize, startRotate, onPointerMove, onPointerUp, isDragging, didMove } = useDragAndDrop({
    svgRef,
    shapes,
    updateShape,
    pushSnapshot,
    gridSnap,
    gridSize,
    viewBoxHeight: baseVbHeight,
    clientToSvg,
  });

  const sortedShapes = [...shapes].sort((a, b) => a.z_index - b.z_index);

  const snapVal = useCallback((v: number) => {
    return gridSnap ? snapToGrid(v, gridSize) : v;
  }, [gridSnap, gridSize]);

  const updateDragDraw = useCallback((value: DragDrawState | null) => {
    dragDrawRef.current = value;
    setDragDraw(value);
  }, []);

  // Pointer down: drag-draw (when tool active) or pan (when empty area)
  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    if (activeTool) {
      const { x, y } = clientToSvg(e.clientX, e.clientY);
      const sx = snapVal(x);
      const sy = snapVal(y);
      updateDragDraw({ startX: sx, startY: sy, currentX: sx, currentY: sy });
      svgRef.current.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    // No tool — check if clicking empty area to start pan
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    let hitShape = false;
    for (let i = sortedShapes.length - 1; i >= 0; i--) {
      if (hitTestShape(x, y, sortedShapes[i])) {
        hitShape = true;
        break;
      }
    }
    if (!hitShape) {
      onStartPan(e.clientX, e.clientY);
      svgRef.current.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  }, [activeTool, snapVal, updateDragDraw, clientToSvg, sortedShapes, onStartPan]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning()) {
      onUpdatePan(e.clientX, e.clientY);
      e.preventDefault();
      return;
    }
    if (dragDrawRef.current && svgRef.current) {
      const { x, y } = clientToSvg(e.clientX, e.clientY);
      updateDragDraw({ ...dragDrawRef.current, currentX: snapVal(x), currentY: snapVal(y) });
      e.preventDefault();
      return;
    }
    onPointerMove(e);
  }, [snapVal, onPointerMove, updateDragDraw, clientToSvg, isPanning, onUpdatePan]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning()) {
      onEndPan();
      return;
    }
    const dd = dragDrawRef.current;
    if (dd && activeTool) {
      const w = Math.abs(dd.currentX - dd.startX);
      const h = Math.abs(dd.currentY - dd.startY);
      updateDragDraw(null);
      if (w >= MIN_DRAG_SIZE && h >= MIN_DRAG_SIZE) {
        onAddShape(activeTool, Math.min(dd.startX, dd.currentX), Math.min(dd.startY, dd.currentY), w, h);
      } else {
        onAddShape(activeTool, snapVal(dd.startX), snapVal(dd.startY));
      }
      return;
    }
    onPointerUp();
  }, [activeTool, onAddShape, onPointerUp, updateDragDraw, snapVal, isPanning, onEndPan]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    if (didMove()) return;
    if (activeTool) return;
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    for (let i = sortedShapes.length - 1; i >= 0; i--) {
      if (hitTestShape(x, y, sortedShapes[i])) {
        onSelectShape(sortedShapes[i].id);
        return;
      }
    }
    onSelectShape(null);
  }, [activeTool, sortedShapes, onSelectShape, didMove, clientToSvg]);

  const handleShapePointerDown = useCallback((e: React.PointerEvent, shapeId: string) => {
    if (activeTool) return;
    onSelectShape(shapeId);
    startMove(e, shapeId);
  }, [activeTool, onSelectShape, startMove]);

  // Touch events for pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchCountRef.current = e.touches.length;
    if (e.touches.length === 2) {
      e.preventDefault();
      onStartPinch(getTouchDistance(e.touches));
    }
  }, [onStartPinch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      onUpdatePinch(getTouchDistance(e.touches));
    }
  }, [onUpdatePinch]);

  const handleTouchEnd = useCallback(() => {
    touchCountRef.current = 0;
    onEndPinch();
  }, [onEndPinch]);

  const handleViewDirectionChange = useCallback((shapeId: string, direction: number) => {
    pushSnapshot();
    updateShape(shapeId, { view_direction: direction });
  }, [pushSnapshot, updateShape]);

  const selectedShape = shapes.find(s => s.id === selectedId);

  const previewRect = dragDraw ? {
    x: Math.min(dragDraw.startX, dragDraw.currentX),
    y: Math.min(dragDraw.startY, dragDraw.currentY),
    w: Math.abs(dragDraw.currentX - dragDraw.startX),
    h: Math.abs(dragDraw.currentY - dragDraw.startY),
  } : null;

  // Scale-aware stroke widths for UI overlays
  const uiStroke = 0.3 / scale;

  return (
    <div
      className="editor-canvas-wrapper w-full bg-white rounded-xl border border-border shadow-sm overflow-hidden"
      style={{ aspectRatio: `1 / ${canvasRatio}` }}
    >
      <svg
        ref={svgRef}
        viewBox={dynamicViewBox}
        className={`w-full h-full ${activeTool ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={handleCanvasClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={onWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <defs>
          <pattern id="editorGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r={gridSnap ? 0.25 : 0.15} fill={gridSnap ? '#CBD5E1' : '#E5E7EB'} />
          </pattern>
        </defs>

        {/* Grid background */}
        <rect width="100" height={baseVbHeight} fill="#FEFCFA" />
        <rect width="100" height={baseVbHeight} fill="url(#editorGrid)" />
        <rect x="0" y="0" width="100" height={baseVbHeight} fill="none" stroke="#E5E7EB" strokeWidth={uiStroke} />

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

        {/* Drag-draw preview */}
        {previewRect && previewRect.w > 0 && previewRect.h > 0 && (
          <rect
            x={previewRect.x} y={previewRect.y}
            width={previewRect.w} height={previewRect.h}
            fill="rgba(255, 248, 240, 0.5)"
            stroke="#5C4033" strokeWidth={uiStroke}
            strokeDasharray="1 0.5"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Resize + rotation handles */}
        {selectedShape && !dragDrawRef.current && (
          <ResizeHandles
            shape={selectedShape}
            onResizeStart={(e, handle) => startResize(e, selectedShape.id, handle)}
            onRotateStart={(e) => startRotate(e, selectedShape.id)}
            scale={scale}
          />
        )}

        {/* View direction handle for seat blocks */}
        {selectedShape && isSeatBlock(selectedShape.shape_type) && !dragDrawRef.current && (
          <ViewDirectionHandle
            shape={selectedShape}
            clientToSvg={clientToSvg}
            onDirectionChange={(dir) => handleViewDirectionChange(selectedShape.id, dir)}
          />
        )}
      </svg>
    </div>
  );
}
