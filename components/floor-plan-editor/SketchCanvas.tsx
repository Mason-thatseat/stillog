'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import type { Point, SketchStroke, SketchTool } from '@/lib/sketch/types';
import type { EditorShape, ShapeType } from '@/lib/types';
import type { CanvasTransform } from '@/hooks/useCanvasTransform';
import ShapeRenderer from './ShapeRenderer';

interface SketchCanvasProps {
  strokes: SketchStroke[];
  currentPoints: Point[] | null;
  tool: SketchTool | null;
  shapes: EditorShape[];
  activeTool: ShapeType | null;
  onAddShape: (type: ShapeType, x: number, y: number) => void;
  onBeginStroke: (point: Point) => void;
  onAddPoint: (point: Point) => void;
  onEndStroke: () => void;
  onEraseStroke: (id: string) => void;
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

function getTouchDistance(touches: React.TouchList | TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[1].clientX - touches[0].clientX;
  const dy = touches[1].clientY - touches[0].clientY;
  return Math.hypot(dx, dy);
}

function pointsToPathD(points: Point[]): string {
  if (points.length === 0) return '';
  const parts = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${points[i].x} ${points[i].y}`);
  }
  return parts.join(' ');
}

// Simple bounding box hit test for eraser
function hitTestStroke(x: number, y: number, stroke: SketchStroke, threshold: number): boolean {
  for (const p of stroke.points) {
    if (Math.abs(p.x - x) < threshold && Math.abs(p.y - y) < threshold) {
      return true;
    }
  }
  return false;
}

export default function SketchCanvas({
  strokes,
  currentPoints,
  tool,
  shapes,
  activeTool,
  onAddShape,
  onBeginStroke,
  onAddPoint,
  onEndStroke,
  onEraseStroke,
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
}: SketchCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawing = useRef(false);
  const touchCountRef = useRef(0);

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

  const vbW = 100 / scale;
  const vbH = baseVbHeight / scale;
  const centerZoomX = (100 - vbW) / 2;
  const centerZoomY = (baseVbHeight - vbH) / 2;
  const panSvgX = svgDims.w > 0 ? (translateX / svgDims.w) * vbW : 0;
  const panSvgY = svgDims.h > 0 ? (translateY / svgDims.h) * vbH : 0;
  const vbX = centerZoomX - panSvgX;
  const vbY = centerZoomY - panSvgY;
  const dynamicViewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = vbX + ((clientX - rect.left) / rect.width) * vbW;
    const y = vbY + ((clientY - rect.top) / rect.height) * vbH;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(baseVbHeight, y)),
    };
  }, [vbX, vbY, vbW, vbH, baseVbHeight]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    if (touchCountRef.current >= 2) return;

    const { x, y } = clientToSvg(e.clientX, e.clientY);

    // Block placement mode
    if (activeTool) {
      onAddShape(activeTool, x, y);
      e.preventDefault();
      return;
    }

    if (tool === 'pen') {
      isDrawing.current = true;
      onBeginStroke({ x, y });
      svgRef.current.setPointerCapture(e.pointerId);
      e.preventDefault();
    } else if (tool === 'eraser') {
      const eraserThreshold = 2.0 / scale;
      for (let i = strokes.length - 1; i >= 0; i--) {
        if (hitTestStroke(x, y, strokes[i], eraserThreshold)) {
          onEraseStroke(strokes[i].id);
          break;
        }
      }
      e.preventDefault();
    }
  }, [tool, activeTool, clientToSvg, onBeginStroke, onAddShape, onEraseStroke, strokes, scale]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning()) {
      onUpdatePan(e.clientX, e.clientY);
      e.preventDefault();
      return;
    }

    if (tool === 'pen' && isDrawing.current) {
      const { x, y } = clientToSvg(e.clientX, e.clientY);
      onAddPoint({ x, y });
      e.preventDefault();
    }
  }, [tool, clientToSvg, onAddPoint, isPanning, onUpdatePan]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning()) {
      onEndPan();
      return;
    }

    if (tool === 'pen' && isDrawing.current) {
      isDrawing.current = false;
      onEndStroke();
    }
  }, [tool, onEndStroke, isPanning, onEndPan]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchCountRef.current = e.touches.length;
    if (e.touches.length === 2) {
      // Cancel any in-progress drawing
      if (isDrawing.current) {
        isDrawing.current = false;
        onEndStroke();
      }
      e.preventDefault();
      // Start pan + pinch
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      onStartPan(midX, midY);
      onStartPinch(getTouchDistance(e.touches));
    }
  }, [onStartPan, onStartPinch, onEndStroke]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      onUpdatePan(midX, midY);
      onUpdatePinch(getTouchDistance(e.touches));
    }
  }, [onUpdatePan, onUpdatePinch]);

  const handleTouchEnd = useCallback(() => {
    touchCountRef.current = 0;
    onEndPan();
    onEndPinch();
  }, [onEndPan, onEndPinch]);

  const uiStroke = 0.4 / scale;

  return (
    <div
      className="editor-canvas-wrapper w-full bg-white rounded-xl border border-border shadow-sm overflow-hidden"
      style={{ aspectRatio: `1 / ${canvasRatio}` }}
    >
      <svg
        ref={svgRef}
        viewBox={dynamicViewBox}
        className={`w-full h-full ${activeTool ? 'cursor-crosshair' : tool === 'pen' ? 'cursor-crosshair' : tool === 'eraser' ? 'cursor-pointer' : 'cursor-default'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={onWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {/* Background */}
        <rect width="100" height={baseVbHeight} fill="#FEFCFA" />
        {/* Light dot grid */}
        <defs>
          <pattern id="sketchGrid" width={5} height={5} patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r={0.15} fill="#E5E7EB" />
          </pattern>
        </defs>
        <rect width="100" height={baseVbHeight} fill="url(#sketchGrid)" />
        <rect x="0" y="0" width="100" height={baseVbHeight} fill="none" stroke="#E5E7EB" strokeWidth={0.3 / scale} />

        {/* Completed strokes */}
        {strokes.map((stroke) => (
          <path
            key={stroke.id}
            d={pointsToPathD(stroke.points)}
            fill="none"
            stroke="#5C4033"
            strokeWidth={uiStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pointerEvents: tool === 'eraser' ? 'stroke' : 'none' }}
          />
        ))}

        {/* Current drawing stroke */}
        {currentPoints && currentPoints.length > 1 && (
          <path
            d={pointsToPathD(currentPoints)}
            fill="none"
            stroke="#5C4033"
            strokeWidth={uiStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Placed shapes (blocks) */}
        {[...shapes].sort((a, b) => a.z_index - b.z_index).map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            allShapes={shapes}
          />
        ))}
      </svg>
    </div>
  );
}
