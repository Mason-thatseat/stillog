import { useState, useCallback, useRef } from 'react';
import type { SeatEditorSpace, SeatEditorTable } from '@/lib/seat-editor/types';
import { clamp, clientToSvg } from '@/lib/seat-editor/utils';

const MIN_TABLE_WIDTH = 8;
const MIN_TABLE_HEIGHT = 6;

type HandleType = 'nw' | 'ne' | 'se' | 'sw';

interface DragState {
  type: 'move' | 'resize';
  tableId: string;
  startClientX: number;
  startClientY: number;
  startTableX: number;
  startTableY: number;
  startTableW: number;
  startTableH: number;
  handle?: HandleType;
}

interface DragAndDrop {
  startMove: (
    e: React.PointerEvent,
    tableId: string,
    table: SeatEditorTable,
    svgEl: SVGSVGElement,
    vbX: number,
    vbY: number,
    vbW: number,
    vbH: number
  ) => void;
  startResize: (
    e: React.PointerEvent,
    tableId: string,
    table: SeatEditorTable,
    handle: HandleType,
    svgEl: SVGSVGElement,
    vbX: number,
    vbY: number,
    vbW: number,
    vbH: number
  ) => void;
  onPointerMove: (
    e: React.PointerEvent,
    svgEl: SVGSVGElement,
    vbX: number,
    vbY: number,
    vbW: number,
    vbH: number,
    space: SeatEditorSpace,
    updateTable: (id: string, changes: Partial<SeatEditorTable>) => void
  ) => void;
  onPointerUp: () => void;
  isDragging: boolean;
}

export function useSeatDragAndDrop(): DragAndDrop {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);
  const startSvgRef = useRef<{ x: number; y: number } | null>(null);

  const startMove = useCallback(
    (
      e: React.PointerEvent,
      tableId: string,
      table: SeatEditorTable,
      svgEl: SVGSVGElement,
      vbX: number,
      vbY: number,
      vbW: number,
      vbH: number
    ) => {
      e.stopPropagation();
      const svgPos = clientToSvg(e.clientX, e.clientY, svgEl, vbX, vbY, vbW, vbH);
      startSvgRef.current = svgPos;
      dragStateRef.current = {
        type: 'move',
        tableId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startTableX: table.x,
        startTableY: table.y,
        startTableW: table.width,
        startTableH: table.height,
      };
      setIsDragging(true);
    },
    []
  );

  const startResize = useCallback(
    (
      e: React.PointerEvent,
      tableId: string,
      table: SeatEditorTable,
      handle: HandleType,
      svgEl: SVGSVGElement,
      vbX: number,
      vbY: number,
      vbW: number,
      vbH: number
    ) => {
      e.stopPropagation();
      const svgPos = clientToSvg(e.clientX, e.clientY, svgEl, vbX, vbY, vbW, vbH);
      startSvgRef.current = svgPos;
      dragStateRef.current = {
        type: 'resize',
        tableId,
        handle,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startTableX: table.x,
        startTableY: table.y,
        startTableW: table.width,
        startTableH: table.height,
      };
      setIsDragging(true);
    },
    []
  );

  const onPointerMove = useCallback(
    (
      e: React.PointerEvent,
      svgEl: SVGSVGElement,
      vbX: number,
      vbY: number,
      vbW: number,
      vbH: number,
      space: SeatEditorSpace,
      updateTable: (id: string, changes: Partial<SeatEditorTable>) => void
    ) => {
      const ds = dragStateRef.current;
      if (!ds || !startSvgRef.current) return;

      const curSvgPos = clientToSvg(e.clientX, e.clientY, svgEl, vbX, vbY, vbW, vbH);
      const dx = curSvgPos.x - startSvgRef.current.x;
      const dy = curSvgPos.y - startSvgRef.current.y;

      if (ds.type === 'move') {
        const newX = clamp(
          ds.startTableX + dx,
          space.roomX,
          space.roomX + space.roomWidth - ds.startTableW
        );
        const newY = clamp(
          ds.startTableY + dy,
          space.roomY,
          space.roomY + space.roomHeight - ds.startTableH
        );
        updateTable(ds.tableId, { x: newX, y: newY });
      } else if (ds.type === 'resize' && ds.handle) {
        const handle = ds.handle;
        let newX = ds.startTableX;
        let newY = ds.startTableY;
        let newW = ds.startTableW;
        let newH = ds.startTableH;

        if (handle === 'nw') {
          newX = ds.startTableX + dx;
          newY = ds.startTableY + dy;
          newW = ds.startTableW - dx;
          newH = ds.startTableH - dy;
        } else if (handle === 'ne') {
          newY = ds.startTableY + dy;
          newW = ds.startTableW + dx;
          newH = ds.startTableH - dy;
        } else if (handle === 'se') {
          newW = ds.startTableW + dx;
          newH = ds.startTableH + dy;
        } else if (handle === 'sw') {
          newX = ds.startTableX + dx;
          newW = ds.startTableW - dx;
          newH = ds.startTableH + dy;
        }

        if (newW < MIN_TABLE_WIDTH) {
          if (handle === 'nw' || handle === 'sw') {
            newX = ds.startTableX + ds.startTableW - MIN_TABLE_WIDTH;
          }
          newW = MIN_TABLE_WIDTH;
        }
        if (newH < MIN_TABLE_HEIGHT) {
          if (handle === 'nw' || handle === 'ne') {
            newY = ds.startTableY + ds.startTableH - MIN_TABLE_HEIGHT;
          }
          newH = MIN_TABLE_HEIGHT;
        }

        newX = clamp(newX, space.roomX, space.roomX + space.roomWidth - newW);
        newY = clamp(newY, space.roomY, space.roomY + space.roomHeight - newH);

        updateTable(ds.tableId, { x: newX, y: newY, width: newW, height: newH });
      }
    },
    []
  );

  const onPointerUp = useCallback(() => {
    dragStateRef.current = null;
    startSvgRef.current = null;
    setIsDragging(false);
  }, []);

  return { startMove, startResize, onPointerMove, onPointerUp, isDragging };
}
