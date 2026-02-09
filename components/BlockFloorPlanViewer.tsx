'use client';

import { useMemo } from 'react';
import type { FloorPlanShape, Seat } from '@/lib/types';
import { isSeatBlock } from '@/lib/block-definitions';
import { hitTestShape } from '@/lib/editor-utils';
import ShapeRenderer from './floor-plan-editor/ShapeRenderer';

interface BlockFloorPlanViewerProps {
  shapes: FloorPlanShape[];
  seats: Seat[];
  onSeatClick?: (seat: Seat) => void;
}

export default function BlockFloorPlanViewer({
  shapes,
  seats,
  onSeatClick,
}: BlockFloorPlanViewerProps) {
  const sortedShapes = useMemo(
    () => [...shapes].sort((a, b) => a.z_index - b.z_index),
    [shapes]
  );

  const allShapesAsEditor = useMemo(
    () => shapes.map(s => ({ ...s, isNew: false })),
    [shapes]
  );

  // Map shape_id to seat for stats lookup
  const seatByShapeId = useMemo(() => {
    const map = new Map<string, Seat>();
    seats.forEach((seat) => {
      if (seat.shape_id) {
        map.set(seat.shape_id, seat);
      }
    });
    return map;
  }, [seats]);

  const handleShapeClick = (shapeId: string) => {
    const seat = seatByShapeId.get(shapeId);
    if (seat && onSeatClick) {
      onSeatClick(seat);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Hit test in reverse z-order
    for (let i = sortedShapes.length - 1; i >= 0; i--) {
      const shape = sortedShapes[i];
      if (hitTestShape(x, y, { ...shape, isNew: false })) {
        if (isSeatBlock(shape.shape_type)) {
          handleShapeClick(shape.id);
        }
        return;
      }
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <svg
        viewBox="0 0 100 100"
        className="w-full aspect-square"
        onClick={handleCanvasClick}
        style={{ touchAction: 'none' }}
      >
        {/* Background */}
        <rect width="100" height="100" fill="#FEFCFA" />

        {/* Shapes */}
        {sortedShapes.map((shape) => {
          const seat = seatByShapeId.get(shape.id);
          return (
            <ShapeRenderer
              key={shape.id}
              shape={{ ...shape, isNew: false }}
              allShapes={allShapesAsEditor}
              isViewer
              avgRating={undefined}
              postsCount={seat?.posts_count}
            />
          );
        })}
      </svg>
    </div>
  );
}
