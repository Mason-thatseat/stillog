import type { WizardZone } from '@/lib/floor-wizard/types';

interface Props {
  zone: WizardZone;
  selected: boolean;
  readonly?: boolean;
  onSelect: () => void;
  onStartDrag?: (e: React.PointerEvent) => void;
  onStartResize?: (e: React.PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
}

const HANDLE_SIZE = 2;

export default function WizardZoneItem({
  zone,
  selected,
  readonly,
  onSelect,
  onStartDrag,
  onStartResize,
}: Props) {
  const { x, y, width, height, color, label } = zone;

  // Parse hex color for fill with opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 167, g: 139, b: 113 };
  };
  const rgb = hexToRgb(color);
  const fillColor = `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`;
  const strokeColor = selected ? color : `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`;
  const strokeWidth = selected ? 0.4 : 0.3;

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
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={selected ? undefined : '1 0.5'}
        rx={0.5}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={2.5}
        fill={color}
        fontWeight="500"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>

      {selected && !readonly && onStartResize && (
        <>
          {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
            const cx =
              corner === 'nw' || corner === 'sw' ? x : x + width;
            const cy =
              corner === 'nw' || corner === 'ne' ? y : y + height;
            return (
              <rect
                key={corner}
                x={cx - HANDLE_SIZE / 2}
                y={cy - HANDLE_SIZE / 2}
                width={HANDLE_SIZE}
                height={HANDLE_SIZE}
                fill="#FFFFFF"
                stroke={color}
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
