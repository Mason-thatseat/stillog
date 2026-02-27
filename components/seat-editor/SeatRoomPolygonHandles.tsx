import React from 'react';
import type { RoomPolygon } from '@/lib/seat-editor/types';

interface SeatRoomPolygonHandlesProps {
  polygon: RoomPolygon;
  onHandlePointerDown: (e: React.PointerEvent, handleType: string) => void;
}

const CORNER_CURSORS = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'];
const MID_CURSORS = ['n-resize', 'e-resize', 's-resize', 'w-resize'];

export function SeatRoomPolygonHandles({ polygon, onHandlePointerDown }: SeatRoomPolygonHandlesProps) {
  const { points, shapeType } = polygon;
  const R = 2.2;
  const STROKE = 0.7;

  const handleDown = (e: React.PointerEvent, handleType: string) => {
    e.stopPropagation();
    onHandlePointerDown(e, handleType);
  };

  if (shapeType === 'rectangle' || shapeType === 'corridor') {
    const [tl, tr, br, bl] = points;
    const mids = [
      { x: (tl.x + tr.x) / 2, y: (tl.y + tr.y) / 2 },
      { x: (tr.x + br.x) / 2, y: (tr.y + br.y) / 2 },
      { x: (br.x + bl.x) / 2, y: (br.y + bl.y) / 2 },
      { x: (bl.x + tl.x) / 2, y: (bl.y + tl.y) / 2 },
    ];

    return (
      <g>
        {points.map((p, i) => (
          <circle
            key={`corner-${i}`}
            cx={p.x}
            cy={p.y}
            r={R}
            fill="white"
            stroke="#1A1A1A"
            strokeWidth={STROKE}
            style={{ cursor: CORNER_CURSORS[i] }}
            onPointerDown={e => handleDown(e, `corner-${i}`)}
          />
        ))}
        {mids.map((p, i) => (
          <circle
            key={`mid-${i}`}
            cx={p.x}
            cy={p.y}
            r={R * 0.75}
            fill="white"
            stroke="#1A1A1A"
            strokeWidth={STROKE}
            style={{ cursor: MID_CURSORS[i] }}
            onPointerDown={e => handleDown(e, `mid-${i}`)}
          />
        ))}
      </g>
    );
  }

  return (
    <g>
      {points.map((p, i) => (
        <circle
          key={`vertex-${i}`}
          cx={p.x}
          cy={p.y}
          r={R}
          fill="white"
          stroke="#1A1A1A"
          strokeWidth={STROKE}
          style={{ cursor: 'move' }}
          onPointerDown={e => handleDown(e, `vertex-${i}`)}
        />
      ))}
    </g>
  );
}
