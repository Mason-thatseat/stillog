import { useState, useCallback, useRef } from 'react';
import { useSeatCanvasTransform } from '@/hooks/useSeatCanvasTransform';
import { clientToSvg } from '@/lib/seat-editor/utils';
import type { WizardZone, WizardSeatUnit, WizardFixture } from '@/lib/floor-wizard/types';

type DragTargetType = 'zone' | 'seatUnit' | 'fixture';
type Corner = 'nw' | 'ne' | 'sw' | 'se';

interface DragTarget {
  type: DragTargetType;
  id: string;
}

interface ResizeTarget {
  type: 'zone' | 'seatUnit';
  id: string;
  corner: Corner;
}

interface DragState {
  targetType: DragTargetType;
  targetId: string;
  isResize: boolean;
  corner?: Corner;
  startSvgX: number;
  startSvgY: number;
  startObjX: number;
  startObjY: number;
  startObjW: number;
  startObjH: number;
}

const MIN_SIZE = 4;

export function useWizardInteraction(
  canvasRatio: number,
  updateZone: (id: string, changes: Partial<WizardZone>) => void,
  updateSeatUnit: (id: string, changes: Partial<WizardSeatUnit>) => void,
  updateFixture: (id: string, changes: Partial<WizardFixture>) => void
) {
  const transform = useSeatCanvasTransform(canvasRatio);

  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);
  const [resizeTarget, setResizeTarget] = useState<ResizeTarget | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const startDrag = useCallback(
    (
      e: React.PointerEvent,
      type: DragTargetType,
      id: string,
      objX: number,
      objY: number,
      objW: number,
      objH: number
    ) => {
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const svgPos = clientToSvg(
        e.clientX, e.clientY, svg,
        transform.panX, transform.panY, transform.vbW, transform.vbH
      );
      dragStateRef.current = {
        targetType: type,
        targetId: id,
        isResize: false,
        startSvgX: svgPos.x,
        startSvgY: svgPos.y,
        startObjX: objX,
        startObjY: objY,
        startObjW: objW,
        startObjH: objH,
      };
      setDragTarget({ type, id });
    },
    [transform.panX, transform.panY, transform.vbW, transform.vbH]
  );

  const startResize = useCallback(
    (
      e: React.PointerEvent,
      type: 'zone' | 'seatUnit',
      id: string,
      corner: Corner,
      objX: number,
      objY: number,
      objW: number,
      objH: number
    ) => {
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const svgPos = clientToSvg(
        e.clientX, e.clientY, svg,
        transform.panX, transform.panY, transform.vbW, transform.vbH
      );
      dragStateRef.current = {
        targetType: type,
        targetId: id,
        isResize: true,
        corner,
        startSvgX: svgPos.x,
        startSvgY: svgPos.y,
        startObjX: objX,
        startObjY: objY,
        startObjW: objW,
        startObjH: objH,
      };
      setResizeTarget({ type, id, corner });
    },
    [transform.panX, transform.panY, transform.vbW, transform.vbH]
  );

  const onSvgMouseMove = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      const svg = svgRef.current;
      if (!svg) return;

      const svgPos = clientToSvg(
        e.clientX, e.clientY, svg,
        transform.panX, transform.panY, transform.vbW, transform.vbH
      );
      const dx = svgPos.x - ds.startSvgX;
      const dy = svgPos.y - ds.startSvgY;

      if (!ds.isResize) {
        const newX = ds.startObjX + dx;
        const newY = ds.startObjY + dy;
        if (ds.targetType === 'zone') updateZone(ds.targetId, { x: newX, y: newY });
        else if (ds.targetType === 'seatUnit') updateSeatUnit(ds.targetId, { x: newX, y: newY });
        else if (ds.targetType === 'fixture') updateFixture(ds.targetId, { x: newX, y: newY });
      } else {
        const corner = ds.corner!;
        let newX = ds.startObjX;
        let newY = ds.startObjY;
        let newW = ds.startObjW;
        let newH = ds.startObjH;

        if (corner === 'nw') {
          newX = ds.startObjX + dx;
          newY = ds.startObjY + dy;
          newW = ds.startObjW - dx;
          newH = ds.startObjH - dy;
        } else if (corner === 'ne') {
          newY = ds.startObjY + dy;
          newW = ds.startObjW + dx;
          newH = ds.startObjH - dy;
        } else if (corner === 'se') {
          newW = ds.startObjW + dx;
          newH = ds.startObjH + dy;
        } else if (corner === 'sw') {
          newX = ds.startObjX + dx;
          newW = ds.startObjW - dx;
          newH = ds.startObjH + dy;
        }

        if (newW < MIN_SIZE) {
          if (corner === 'nw' || corner === 'sw') {
            newX = ds.startObjX + ds.startObjW - MIN_SIZE;
          }
          newW = MIN_SIZE;
        }
        if (newH < MIN_SIZE) {
          if (corner === 'nw' || corner === 'ne') {
            newY = ds.startObjY + ds.startObjH - MIN_SIZE;
          }
          newH = MIN_SIZE;
        }

        if (ds.targetType === 'zone') {
          updateZone(ds.targetId, { x: newX, y: newY, width: newW, height: newH });
        } else if (ds.targetType === 'seatUnit') {
          updateSeatUnit(ds.targetId, { x: newX, y: newY, width: newW, height: newH });
        }
      }
    },
    [transform.panX, transform.panY, transform.vbW, transform.vbH, updateZone, updateSeatUnit, updateFixture]
  );

  const onSvgMouseUp = useCallback(() => {
    dragStateRef.current = null;
    setDragTarget(null);
    setResizeTarget(null);
  }, []);

  const isDragging = dragStateRef.current !== null;

  return {
    transform,
    svgRef,
    dragTarget,
    resizeTarget,
    isDragging,
    startDrag,
    startResize,
    onSvgMouseMove,
    onSvgMouseUp,
  };
}
