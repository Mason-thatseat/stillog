'use client';

import { useRef, useCallback } from 'react';
import type { EditorShape } from '@/lib/types';

interface ViewDirectionHandleProps {
  shape: EditorShape;
  clientToSvg: (clientX: number, clientY: number) => { x: number; y: number };
  onDirectionChange: (direction: number) => void;
}

export default function ViewDirectionHandle({
  shape,
  clientToSvg,
  onDirectionChange,
}: ViewDirectionHandleProps) {
  const dragging = useRef(false);

  const cx = shape.x_percent + shape.width_percent / 2;
  const cy = shape.y_percent + shape.height_percent / 2;
  const direction = shape.view_direction ?? 0;
  const arrowLength = Math.max(shape.width_percent, shape.height_percent) * 0.7;

  // 0° = up (north), 90° = right (east), clockwise
  const rad = ((direction - 90) * Math.PI) / 180;
  const endX = cx + Math.cos(rad) * arrowLength;
  const endY = cy + Math.sin(rad) * arrowLength;

  // Arrowhead
  const headLen = arrowLength * 0.25;
  const headAngle = 0.4;
  const ax1 = endX - headLen * Math.cos(rad - headAngle);
  const ay1 = endY - headLen * Math.sin(rad - headAngle);
  const ax2 = endX - headLen * Math.cos(rad + headAngle);
  const ay2 = endY - headLen * Math.sin(rad + headAngle);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragging.current = true;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const { x: svgX, y: svgY } = clientToSvg(e.clientX, e.clientY);
    const dx = svgX - cx;
    const dy = svgY - cy;
    // atan2 gives angle from east=0; we want north=0
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    angle = ((angle % 360) + 360) % 360;
    angle = Math.round(angle / 15) * 15;
    onDirectionChange(angle);
  }, [clientToSvg, cx, cy, onDirectionChange]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const rotation = shape.rotation || 0;

  return (
    <g transform={rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined}>
      {/* Direction arrow line */}
      <line
        x1={cx} y1={cy} x2={endX} y2={endY}
        stroke="#E85D3A" strokeWidth={0.35} strokeLinecap="round" opacity={0.8}
        pointerEvents="none"
      />
      {/* Arrowhead */}
      <polygon
        points={`${endX},${endY} ${ax1},${ay1} ${ax2},${ay2}`}
        fill="#E85D3A" opacity={0.8} pointerEvents="none"
      />
      {/* Draggable handle at arrow tip */}
      <circle
        cx={endX} cy={endY} r={1.5}
        fill="white" stroke="#E85D3A" strokeWidth={0.3}
        style={{ cursor: 'crosshair' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {/* Larger invisible touch target */}
      <circle
        cx={endX} cy={endY} r={3}
        fill="transparent" style={{ cursor: 'crosshair' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </g>
  );
}
