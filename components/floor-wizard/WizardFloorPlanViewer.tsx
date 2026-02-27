'use client';

import type {
  WizardWalls,
  WizardZone,
  WizardFixture,
  WizardSeatUnit,
} from '@/lib/floor-wizard/types';
import WizardZoneItem from './WizardZoneItem';
import WizardFixtureItem from './WizardFixtureItem';
import WizardSeatUnitItem from './WizardSeatUnitItem';

interface Props {
  walls: WizardWalls;
  zones: WizardZone[];
  fixtures: WizardFixture[];
  seatUnits: WizardSeatUnit[];
  canvasRatio: number;
  className?: string;
  onSeatUnitClick?: (id: string) => void;
}

export default function WizardFloorPlanViewer({
  walls,
  zones,
  fixtures,
  seatUnits,
  canvasRatio,
  className,
  onSeatUnitClick,
}: Props) {
  const vbHeight = 100 * canvasRatio;
  const wallPoints = walls.points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className={className} style={{ width: '100%', aspectRatio: `100/${vbHeight}` }}>
      <svg
        viewBox={`0 0 100 ${vbHeight}`}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <pattern id="viewer-grid" x="0" y="0" width="5" height={5 * canvasRatio} patternUnits="userSpaceOnUse">
            <path
              d={`M 5 0 L 0 0 0 ${5 * canvasRatio}`}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="0.15"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="100" height={vbHeight} fill="url(#viewer-grid)" />
        <rect x="0" y="0" width="100" height={vbHeight} fill="none" stroke="#D1D5DB" strokeWidth="0.2" />

        {wallPoints && (
          <polygon
            points={wallPoints}
            fill="#FAFAF8"
            stroke="#374151"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        )}

        {zones.map((zone) => (
          <WizardZoneItem
            key={zone.id}
            zone={zone}
            selected={false}
            readonly
            onSelect={() => {}}
          />
        ))}

        {fixtures.map((fixture) => (
          <WizardFixtureItem
            key={fixture.id}
            fixture={fixture}
            selected={false}
            readonly
            onSelect={() => {}}
          />
        ))}

        {seatUnits.map((unit) => (
          <WizardSeatUnitItem
            key={unit.id}
            unit={unit}
            selected={false}
            readonly={!onSeatUnitClick}
            onSelect={() => onSeatUnitClick?.(unit.id)}
          />
        ))}
      </svg>
    </div>
  );
}
