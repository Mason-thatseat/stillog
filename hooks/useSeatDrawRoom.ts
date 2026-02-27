import { useState, useCallback } from 'react';
import type { RoomPoint, RoomPolygon } from '@/lib/seat-editor/types';
import { fitShape } from '@/lib/seat-editor/roomGeometry';

export interface DrawRoomState {
  isDrawing: boolean;
  draftPoints: RoomPoint[];
}

const MIN_SAMPLE_DIST = 1.5;

export function useSeatDrawRoom() {
  const [state, setState] = useState<DrawRoomState>({
    isDrawing: false,
    draftPoints: [],
  });

  const startDrag = useCallback((p: RoomPoint) => {
    setState({ isDrawing: true, draftPoints: [p] });
  }, []);

  const samplePoint = useCallback((p: RoomPoint) => {
    setState(prev => {
      if (!prev.isDrawing || prev.draftPoints.length === 0) return prev;
      const last = prev.draftPoints[prev.draftPoints.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < MIN_SAMPLE_DIST) return prev;
      return { ...prev, draftPoints: [...prev.draftPoints, p] };
    });
  }, []);

  const finishDrag = useCallback((): RoomPolygon | null => {
    let result: RoomPolygon | null = null;

    setState(prev => {
      if (!prev.isDrawing || prev.draftPoints.length < 6) {
        return { isDrawing: false, draftPoints: [] };
      }

      const { points, shapeType } = fitShape(prev.draftPoints);
      if (points.length < 3) {
        return { isDrawing: false, draftPoints: [] };
      }

      result = { points, shapeType };
      return { isDrawing: false, draftPoints: [] };
    });

    return result;
  }, []);

  const cancelDrawing = useCallback(() => {
    setState({ isDrawing: false, draftPoints: [] });
  }, []);

  return { state, startDrag, samplePoint, finishDrag, cancelDrawing };
}
