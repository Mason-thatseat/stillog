'use client';

import { getHandlePositions, type HandlePosition } from '@/lib/editor-utils';
import type { EditorShape } from '@/lib/types';

interface ResizeHandlesProps {
  shape: EditorShape;
  onResizeStart: (e: React.PointerEvent, handle: HandlePosition) => void;
  onRotateStart: (e: React.PointerEvent) => void;
  scale?: number;
}

const CURSOR_MAP: Record<HandlePosition, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

export default function ResizeHandles({ shape, onResizeStart, onRotateStart, scale = 1 }: ResizeHandlesProps) {
  const handles = getHandlePositions(shape);
  const handleSize = 1.8 / scale;
  const touchTargetSize = 6 / scale;

  const cx = shape.x_percent + shape.width_percent / 2;
  const topY = shape.y_percent;
  const rotateHandleOffset = 4 / scale;
  const rotateHandleR = 1.2 / scale;

  // Apply rotation transform to the whole group
  const rotation = shape.rotation || 0;
  const shapeCx = shape.x_percent + shape.width_percent / 2;
  const shapeCy = shape.y_percent + shape.height_percent / 2;

  return (
    <g transform={rotation ? `rotate(${rotation}, ${shapeCx}, ${shapeCy})` : undefined}>
      {/* Selection border */}
      <rect
        x={shape.x_percent}
        y={shape.y_percent}
        width={shape.width_percent}
        height={shape.height_percent}
        fill="none"
        stroke="#4A90D9"
        strokeWidth={0.3 / scale}
        strokeDasharray="1 0.5"
        pointerEvents="none"
      />

      {/* Rotation handle line */}
      <line
        x1={cx}
        y1={topY}
        x2={cx}
        y2={topY - rotateHandleOffset}
        stroke="#4A90D9"
        strokeWidth={0.2 / scale}
        pointerEvents="none"
      />

      {/* Rotation handle circle (touch target) */}
      <circle
        cx={cx}
        cy={topY - rotateHandleOffset}
        r={touchTargetSize / 2}
        fill="transparent"
        style={{ cursor: 'grab' }}
        onPointerDown={onRotateStart}
      />
      {/* Rotation handle circle (visible) */}
      <circle
        cx={cx}
        cy={topY - rotateHandleOffset}
        r={rotateHandleR}
        fill="white"
        stroke="#4A90D9"
        strokeWidth={0.25 / scale}
        pointerEvents="none"
      />
      {/* Rotation arrow icon inside */}
      <path
        d={`M ${cx - rotateHandleR * 0.4} ${topY - rotateHandleOffset - rotateHandleR * 0.3} A ${rotateHandleR * 0.5} ${rotateHandleR * 0.5} 0 1 1 ${cx + rotateHandleR * 0.4} ${topY - rotateHandleOffset - rotateHandleR * 0.3}`}
        fill="none"
        stroke="#4A90D9"
        strokeWidth={0.15 / scale}
        pointerEvents="none"
      />

      {/* Resize handles */}
      {handles.map(({ pos, x, y }) => (
        <g key={pos}>
          {/* Invisible touch target (larger hit area for touch) */}
          <rect
            x={x - touchTargetSize / 2}
            y={y - touchTargetSize / 2}
            width={touchTargetSize}
            height={touchTargetSize}
            fill="transparent"
            style={{ cursor: CURSOR_MAP[pos] }}
            onPointerDown={(e) => onResizeStart(e, pos)}
          />
          {/* Visible handle */}
          <rect
            x={x - handleSize / 2}
            y={y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="#4A90D9"
            strokeWidth={0.25 / scale}
            rx={0.3 / scale}
            style={{ cursor: CURSOR_MAP[pos] }}
            pointerEvents="none"
          />
        </g>
      ))}
    </g>
  );
}
