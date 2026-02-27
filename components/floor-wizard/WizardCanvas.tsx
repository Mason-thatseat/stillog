'use client';

import { useEffect } from 'react';
import type { WizardState } from '@/lib/floor-wizard/types';
import type { useWizardInteraction } from '@/hooks/useWizardInteraction';
import { clientToSvg } from '@/lib/seat-editor/utils';
import WizardZoneItem from './WizardZoneItem';
import WizardFixtureItem from './WizardFixtureItem';
import WizardSeatUnitItem from './WizardSeatUnitItem';

type InteractionHandlers = ReturnType<typeof useWizardInteraction>;

interface Props {
  state: WizardState;
  interaction: InteractionHandlers;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  readonly?: boolean;
  isCustomDrawMode?: boolean;
  draftPoints?: { x: number; y: number }[];
  onCanvasDrawStart?: (pt: { x: number; y: number }) => void;
  onCanvasDrawMove?: (pt: { x: number; y: number }) => void;
  onCanvasDrawEnd?: () => void;
}

export default function WizardCanvas({
  state,
  interaction,
  selectedId,
  onSelect,
  readonly,
  isCustomDrawMode = false,
  draftPoints,
  onCanvasDrawStart,
  onCanvasDrawMove,
  onCanvasDrawEnd,
}: Props) {
  const { walls, zones, fixtures, seatUnits, canvasRatio } = state;
  const { transform, svgRef, startDrag, startResize, onSvgMouseMove, onSvgMouseUp } = interaction;

  const vbHeight = 100 * canvasRatio;
  const viewBox = transform.viewBox;

  // Wheel zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      transform.handleWheel(e, svg);
    };
    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, [transform, svgRef]);

  const getSvgPoint = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    return clientToSvg(e.clientX, e.clientY, svg, transform.panX, transform.panY, transform.vbW, transform.vbH);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (readonly) return;
    if (isCustomDrawMode) {
      const pt = getSvgPoint(e);
      if (pt) onCanvasDrawStart?.(pt);
      return;
    }
    // Start pan only on background (no drag state set by items)
    const svg = svgRef.current;
    if (!svg) return;
    transform.startPan(e.nativeEvent as PointerEvent, svg);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (readonly) return;
    if (isCustomDrawMode) {
      const pt = getSvgPoint(e);
      if (pt) onCanvasDrawMove?.(pt);
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    // Try item drag first
    onSvgMouseMove(e);
    // Then pan
    transform.updatePan(e.nativeEvent as PointerEvent, svg);
  };

  const handlePointerUp = () => {
    if (readonly) return;
    if (isCustomDrawMode) {
      onCanvasDrawEnd?.();
      return;
    }
    onSvgMouseUp();
    transform.endPan();
  };

  const wallPoints = walls.points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="floor-wizard-canvas">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="seat-editor canvas-svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => onSelect?.(null)}
      >
        <defs>
          <pattern id="wizard-grid" x="0" y="0" width="5" height={5 * canvasRatio} patternUnits="userSpaceOnUse">
            <path
              d={`M 5 0 L 0 0 0 ${5 * canvasRatio}`}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="0.15"
            />
          </pattern>
        </defs>

        {/* Grid background */}
        <rect x="0" y="0" width="100" height={vbHeight} fill="url(#wizard-grid)" />

        {/* Canvas border */}
        <rect
          x="0" y="0" width="100" height={vbHeight}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="0.2"
        />

        {/* Walls polygon */}
        {wallPoints && (
          <polygon
            points={wallPoints}
            fill="#FAFAF8"
            stroke="#374151"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        )}

        {/* Custom draw mode: draft polyline preview */}
        {isCustomDrawMode && draftPoints && draftPoints.length >= 2 && (
          <polyline
            points={draftPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#A78B71"
            strokeWidth={0.5}
            strokeDasharray="1 0.5"
            pointerEvents="none"
          />
        )}

        {/* Custom draw mode: completed walls polygon when drawing */}
        {isCustomDrawMode && walls.points.length >= 3 && (!draftPoints || draftPoints.length === 0) && (
          <polygon
            points={walls.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(167,139,113,0.1)"
            stroke="#A78B71"
            strokeWidth={0.6}
            pointerEvents="none"
          />
        )}

        {/* Zones (below seat units) */}
        {zones.map((zone) => (
          <WizardZoneItem
            key={zone.id}
            zone={zone}
            selected={selectedId === zone.id}
            readonly={readonly}
            onSelect={() => onSelect?.(zone.id)}
            onStartDrag={
              !readonly
                ? (e) => {
                    startDrag(e, 'zone', zone.id, zone.x, zone.y, zone.width, zone.height);
                  }
                : undefined
            }
            onStartResize={
              !readonly
                ? (e, corner) => {
                    startResize(e, 'zone', zone.id, corner, zone.x, zone.y, zone.width, zone.height);
                  }
                : undefined
            }
          />
        ))}

        {/* Fixtures */}
        {fixtures.map((fixture) => (
          <WizardFixtureItem
            key={fixture.id}
            fixture={fixture}
            selected={selectedId === fixture.id}
            readonly={readonly}
            onSelect={() => onSelect?.(fixture.id)}
            onStartDrag={
              !readonly
                ? (e) => {
                    startDrag(e, 'fixture', fixture.id, fixture.x, fixture.y, fixture.width, fixture.height);
                  }
                : undefined
            }
          />
        ))}

        {/* SeatUnits (top layer) */}
        {seatUnits.map((unit) => (
          <WizardSeatUnitItem
            key={unit.id}
            unit={unit}
            selected={selectedId === unit.id}
            readonly={readonly}
            onSelect={() => onSelect?.(unit.id)}
            onStartDrag={
              !readonly
                ? (e) => {
                    startDrag(e, 'seatUnit', unit.id, unit.x, unit.y, unit.width, unit.height);
                  }
                : undefined
            }
            onStartResize={
              !readonly
                ? (e, corner) => {
                    startResize(e, 'seatUnit', unit.id, corner, unit.x, unit.y, unit.width, unit.height);
                  }
                : undefined
            }
          />
        ))}
      </svg>
    </div>
  );
}
