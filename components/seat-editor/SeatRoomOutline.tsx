import type { RoomPoint, RoomPolygon } from '@/lib/seat-editor/types';

interface SeatRoomOutlineProps {
  roomX: number;
  roomY: number;
  roomWidth: number;
  roomHeight: number;
  roomPolygon?: RoomPolygon;
  draftPoints?: RoomPoint[];
}

export function SeatRoomOutline({
  roomX,
  roomY,
  roomWidth,
  roomHeight,
  roomPolygon,
  draftPoints = [],
}: SeatRoomOutlineProps) {
  const isDrawing = draftPoints.length > 0;

  if (roomPolygon && !isDrawing) {
    const pointsStr = roomPolygon.points.map(p => `${p.x},${p.y}`).join(' ');
    return (
      <polygon
        points={pointsStr}
        fill="#F0F0F0"
        stroke="#1A1A1A"
        strokeWidth={1.5}
        pointerEvents="none"
      />
    );
  }

  if (isDrawing) {
    const pathStr = draftPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    return (
      <g pointerEvents="none">
        <path
          d={pathStr}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />
        <circle
          cx={draftPoints[0].x}
          cy={draftPoints[0].y}
          r={2}
          fill="#1A1A1A"
          opacity={0.6}
        />
      </g>
    );
  }

  return (
    <rect
      x={roomX}
      y={roomY}
      width={roomWidth}
      height={roomHeight}
      rx={2}
      fill="#F0F0F0"
      stroke="#1A1A1A"
      strokeWidth={1.5}
      pointerEvents="none"
    />
  );
}
