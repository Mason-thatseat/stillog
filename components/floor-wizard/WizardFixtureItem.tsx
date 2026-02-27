import type { WizardFixture } from '@/lib/floor-wizard/types';

interface Props {
  fixture: WizardFixture;
  selected: boolean;
  readonly?: boolean;
  onSelect: () => void;
  onStartDrag?: (e: React.PointerEvent) => void;
}

const FIXTURE_ICON: Record<WizardFixture['type'], string> = {
  entrance: '🚪',
  kitchen:  '🍳',
  counter:  '🏧',
  restroom: '🚻',
};

const FIXTURE_COLOR: Record<WizardFixture['type'], string> = {
  entrance: '#A78B71',
  kitchen:  '#E58B6A',
  counter:  '#6A9EC4',
  restroom: '#7BA7BC',
};

export default function WizardFixtureItem({
  fixture,
  selected,
  readonly,
  onSelect,
  onStartDrag,
}: Props) {
  const { x, y, width, height, type } = fixture;
  const color = FIXTURE_COLOR[type];
  const icon = FIXTURE_ICON[type];

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
        fill={selected ? `${color}22` : '#F9FAFB'}
        stroke={color}
        strokeWidth={selected ? 0.5 : 0.35}
        rx={1}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={width * 0.45}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {icon}
      </text>
    </g>
  );
}
