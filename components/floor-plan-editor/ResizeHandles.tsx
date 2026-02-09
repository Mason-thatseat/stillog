'use client';

import { getHandlePositions, type HandlePosition } from '@/lib/editor-utils';
import type { EditorShape } from '@/lib/types';

interface ResizeHandlesProps {
  shape: EditorShape;
  onResizeStart: (e: React.PointerEvent, handle: HandlePosition) => void;
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

export default function ResizeHandles({ shape, onResizeStart }: ResizeHandlesProps) {
  const handles = getHandlePositions(shape);
  const handleSize = 1.8;
  const touchTargetSize = 4;

  return (
    <g>
      {/* Selection border */}
      <rect
        x={shape.x_percent}
        y={shape.y_percent}
        width={shape.width_percent}
        height={shape.height_percent}
        fill="none"
        stroke="#4A90D9"
        strokeWidth={0.3}
        strokeDasharray="1 0.5"
        pointerEvents="none"
      />
      {/* Handles */}
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
            strokeWidth={0.25}
            rx={0.3}
            style={{ cursor: CURSOR_MAP[pos] }}
            pointerEvents="none"
          />
        </g>
      ))}
    </g>
  );
}
