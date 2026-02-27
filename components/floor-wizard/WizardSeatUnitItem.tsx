import type { WizardSeatUnit } from '@/lib/floor-wizard/types';

interface Props {
  unit: WizardSeatUnit;
  selected: boolean;
  readonly?: boolean;
  onSelect: () => void;
  onStartDrag?: (e: React.PointerEvent) => void;
  onStartResize?: (e: React.PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
}

const HANDLE_SIZE = 2;

// Seat dot positions per type (relative 0-1 coords within unit rect)
const SEAT_POSITIONS: Record<WizardSeatUnit['type'], { rx: number; ry: number }[]> = {
  TABLE_1: [{ rx: 0.5, ry: 0.2 }],
  TABLE_2: [{ rx: 0.25, ry: 0.2 }, { rx: 0.75, ry: 0.2 }],
  TABLE_4: [
    { rx: 0.2,  ry: 0.15 }, { rx: 0.8,  ry: 0.15 },
    { rx: 0.2,  ry: 0.85 }, { rx: 0.8,  ry: 0.85 },
  ],
  TABLE_6: [
    { rx: 0.17, ry: 0.2 }, { rx: 0.5,  ry: 0.2 }, { rx: 0.83, ry: 0.2 },
    { rx: 0.17, ry: 0.8 }, { rx: 0.5,  ry: 0.8 }, { rx: 0.83, ry: 0.8 },
  ],
  BAR: [
    { rx: 0.1, ry: 0.3 }, { rx: 0.3, ry: 0.3 },
    { rx: 0.5, ry: 0.3 }, { rx: 0.7, ry: 0.3 },
  ],
};

export default function WizardSeatUnitItem({
  unit,
  selected,
  readonly,
  onSelect,
  onStartDrag,
  onStartResize,
}: Props) {
  const { x, y, width, height, label, type } = unit;
  const seats = SEAT_POSITIONS[type] || [];
  const seatR = Math.min(width, height) * 0.08;

  return (
    <g
      onPointerDown={(e) => {
        if (readonly) return;
        e.stopPropagation();
        onSelect();
        onStartDrag?.(e);
      }}
      style={{ cursor: readonly ? 'default' : 'move' }}
    >
      {/* Table body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={selected ? '#FFF8F3' : '#FFFFFF'}
        stroke={selected ? '#A78B71' : '#1A1A1A'}
        strokeWidth={selected ? 0.5 : 0.3}
        rx={0.6}
      />

      {/* Seat dots */}
      {seats.map((s, i) => (
        <circle
          key={i}
          cx={x + s.rx * width}
          cy={y + s.ry * height}
          r={seatR}
          fill={selected ? '#A78B71' : '#BBBBBB'}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* Label */}
      <text
        x={x + width / 2}
        y={y + height / 2 + 0.3}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(width, height) * 0.28}
        fill={selected ? '#A78B71' : '#1F2937'}
        fontWeight={selected ? '600' : '400'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>

      {/* Resize handles */}
      {selected && !readonly && onStartResize && (
        <>
          {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
            const cx = corner === 'nw' || corner === 'sw' ? x : x + width;
            const cy = corner === 'nw' || corner === 'ne' ? y : y + height;
            return (
              <rect
                key={corner}
                x={cx - HANDLE_SIZE / 2}
                y={cy - HANDLE_SIZE / 2}
                width={HANDLE_SIZE}
                height={HANDLE_SIZE}
                fill="#FFFFFF"
                stroke="#A78B71"
                strokeWidth={0.3}
                rx={0.3}
                style={{ cursor: `${corner}-resize` }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onStartResize(e, corner);
                }}
              />
            );
          })}
        </>
      )}
    </g>
  );
}
