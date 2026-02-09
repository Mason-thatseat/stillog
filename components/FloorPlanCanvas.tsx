'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import SeatMarker from './SeatMarker';
import type { Seat } from '@/lib/types';

interface FloorPlanCanvasProps {
  floorPlanUrl: string;
  floorPlanWidth: number;
  floorPlanHeight: number;
  seats: Seat[];
  selectedSeatId?: string | null;
  isEditing?: boolean;
  onSeatClick?: (seat: Seat) => void;
  onAddSeat?: (xPercent: number, yPercent: number) => void;
  onDeleteSeat?: (seatId: string) => void;
}

export default function FloorPlanCanvas({
  floorPlanUrl,
  floorPlanWidth,
  floorPlanHeight,
  seats,
  selectedSeatId,
  isEditing = false,
  onSeatClick,
  onAddSeat,
  onDeleteSeat,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const aspectRatio = floorPlanWidth / floorPlanHeight;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !onAddSeat || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddSeat(x, y);
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-background-subtle">
      <div
        ref={containerRef}
        className={`floor-plan-container relative w-full ${isEditing ? 'cursor-crosshair' : ''}`}
        style={{ aspectRatio }}
        onClick={handleCanvasClick}
      >
        <Image
          src={floorPlanUrl}
          alt="도면"
          fill
          className="object-contain"
          onLoad={() => setImageLoaded(true)}
          priority
        />

        {imageLoaded && seats.map((seat) => (
          <div
            key={seat.id}
            className="absolute"
            style={{
              left: `${seat.x_percent}%`,
              top: `${seat.y_percent}%`,
            }}
          >
            <SeatMarker
              label={seat.label}
              postsCount={seat.posts_count}
              isSelected={seat.id === selectedSeatId}
              isEditing={isEditing}
              onClick={() => onSeatClick?.(seat)}
              onDelete={isEditing ? () => onDeleteSeat?.(seat.id) : undefined}
            />
          </div>
        ))}

        {isEditing && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            클릭하여 좌석 추가
          </div>
        )}
      </div>
    </div>
  );
}
