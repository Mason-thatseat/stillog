import React, { useRef, useCallback, useEffect } from 'react';
import type { SeatEditorSpace, SeatEditorTable, ActiveSeatEditorTool, RoomPoint } from '@/lib/seat-editor/types';
import type { CanvasTransform } from '@/hooks/useSeatCanvasTransform';
import type { DrawRoomState } from '@/hooks/useSeatDrawRoom';
import { useSeatDragAndDrop } from '@/hooks/useSeatDragAndDrop';
import { clientToSvg } from '@/lib/seat-editor/utils';
import { resizeRect, moveVertex } from '@/lib/seat-editor/roomGeometry';

import { SeatRoomOutline } from './SeatRoomOutline';
import { SeatRoomPolygonHandles } from './SeatRoomPolygonHandles';
import { SeatTableItem } from './SeatTableItem';

type HandleType = 'nw' | 'ne' | 'se' | 'sw';

interface SeatCanvasProps {
  space: SeatEditorSpace;
  selectedTableId: string | null;
  activeTool: ActiveSeatEditorTool;
  canvasTransform: CanvasTransform;
  drawRoomState: DrawRoomState;
  onAddTable: (x: number, y: number) => void;
  onDeleteTable: (id: string) => void;
  onUpdateTable: (id: string, changes: Partial<SeatEditorTable>) => void;
  onSelectTable: (id: string | null) => void;
  onDrawRoomStart: (p: RoomPoint) => void;
  onDrawRoomSample: (p: RoomPoint) => void;
  onDrawRoomFinish: () => void;
  onUpdateRoomPolygon: (points: RoomPoint[]) => void;
}

export function SeatCanvas({
  space,
  selectedTableId,
  activeTool,
  canvasTransform,
  drawRoomState,
  onAddTable,
  onDeleteTable,
  onUpdateTable,
  onSelectTable,
  onDrawRoomStart,
  onDrawRoomSample,
  onDrawRoomFinish,
  onUpdateRoomPolygon,
}: SeatCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const polygonDragRef = useRef<{ handleType: string } | null>(null);
  const { viewBox, panX, panY, vbW, vbH } = canvasTransform;

  const dnd = useSeatDragAndDrop();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      canvasTransform.handleWheel(e, svg);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [canvasTransform]);

  const getTransformArgs = useCallback((): [SVGSVGElement, number, number, number, number] | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    return [svg, panX, panY, vbW, vbH];
  }, [panX, panY, vbW, vbH]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const svgPos = clientToSvg(e.clientX, e.clientY, svg, panX, panY, vbW, vbH);

      if (activeTool === 'draw_room') {
        e.currentTarget.setPointerCapture(e.pointerId);
        onDrawRoomStart(svgPos);
        return;
      }

      if (activeTool === 'add_table') {
        onAddTable(svgPos.x - 7, svgPos.y - 5);
        return;
      }

      if (activeTool === 'select' || activeTool === null) {
        onSelectTable(null);
        canvasTransform.startPan(e.nativeEvent, svg);
      }
    },
    [activeTool, canvasTransform, onAddTable, onSelectTable, onDrawRoomStart, panX, panY, vbW, vbH]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const args = getTransformArgs();
      if (!args) return;
      const [svg, vbX, vbY, vbWc, vbHc] = args;

      if (polygonDragRef.current && space.roomPolygon) {
        const svgPos = clientToSvg(e.clientX, e.clientY, svg, vbX, vbY, vbWc, vbHc);
        const { handleType } = polygonDragRef.current;
        let newPoints: RoomPoint[];
        if (handleType.startsWith('vertex-')) {
          const idx = parseInt(handleType.split('-')[1]);
          newPoints = moveVertex(space.roomPolygon.points, idx, svgPos);
        } else {
          newPoints = resizeRect(space.roomPolygon.points, handleType, svgPos.x, svgPos.y);
        }
        onUpdateRoomPolygon(newPoints);
        return;
      }

      if (activeTool === 'draw_room' && drawRoomState.isDrawing) {
        const svgPos = clientToSvg(e.clientX, e.clientY, svg, vbX, vbY, vbWc, vbHc);
        onDrawRoomSample(svgPos);
        return;
      }

      if (dnd.isDragging) {
        dnd.onPointerMove(e, svg, vbX, vbY, vbWc, vbHc, space, onUpdateTable);
      } else if (canvasTransform.isPanning) {
        canvasTransform.updatePan(e.nativeEvent, svg);
      }
    },
    [activeTool, canvasTransform, dnd, drawRoomState.isDrawing, getTransformArgs, onDrawRoomSample, onUpdateRoomPolygon, onUpdateTable, space]
  );

  const handlePointerUp = useCallback(() => {
    if (polygonDragRef.current) {
      polygonDragRef.current = null;
      return;
    }
    if (activeTool === 'draw_room' && drawRoomState.isDrawing) {
      onDrawRoomFinish();
      return;
    }
    dnd.onPointerUp();
    canvasTransform.endPan();
  }, [activeTool, canvasTransform, dnd, drawRoomState.isDrawing, onDrawRoomFinish]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (e.touches.length === 2) {
        const svg = svgRef.current;
        if (!svg) return;
        canvasTransform.handlePinchStart(e.touches as unknown as TouchList, svg);
      }
    },
    [canvasTransform]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (e.touches.length === 2) {
        const svg = svgRef.current;
        if (!svg) return;
        e.preventDefault();
        canvasTransform.handlePinchMove(e.touches as unknown as TouchList, svg);
      }
    },
    [canvasTransform]
  );

  const handleTablePointerDown = useCallback(
    (e: React.PointerEvent, tableId: string) => {
      const args = getTransformArgs();
      if (!args) return;
      const [svg, vbX, vbY, vbWc, vbHc] = args;
      const table = space.tables.find(t => t.id === tableId);
      if (!table) return;
      dnd.startMove(e, tableId, table, svg, vbX, vbY, vbWc, vbHc);
    },
    [dnd, getTransformArgs, space.tables]
  );

  const handleStartResize = useCallback(
    (e: React.PointerEvent, tableId: string, handle: HandleType) => {
      const args = getTransformArgs();
      if (!args) return;
      const [svg, vbX, vbY, vbWc, vbHc] = args;
      const table = space.tables.find(t => t.id === tableId);
      if (!table) return;
      dnd.startResize(e, tableId, table, handle, svg, vbX, vbY, vbWc, vbHc);
    },
    [dnd, getTransformArgs, space.tables]
  );

  const handlePolygonHandleDown = useCallback(
    (e: React.PointerEvent, handleType: string) => {
      const svg = svgRef.current;
      if (!svg) return;
      svg.setPointerCapture(e.pointerId);
      polygonDragRef.current = { handleType };
    },
    []
  );

  const cursorStyle =
    activeTool === 'draw_room'
      ? 'crosshair'
      : activeTool === 'add_table'
      ? 'crosshair'
      : activeTool === 'delete'
      ? 'not-allowed'
      : canvasTransform.isPanning
      ? 'grabbing'
      : 'grab';

  return (
    <svg
      ref={svgRef}
      className="canvas-svg"
      viewBox={viewBox}
      style={{ cursor: cursorStyle, flex: 1, display: 'block', touchAction: 'none', userSelect: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <defs>
        <pattern id="seat-dotgrid" x={panX % 5} y={panY % 5} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.3" fill="#DCDCDC" />
        </pattern>
      </defs>

      <rect x={panX} y={panY} width={vbW} height={vbH} fill="#FAFAFA" />
      <rect x={panX} y={panY} width={vbW} height={vbH} fill="url(#seat-dotgrid)" pointerEvents="none" />

      <SeatRoomOutline
        roomX={space.roomX}
        roomY={space.roomY}
        roomWidth={space.roomWidth}
        roomHeight={space.roomHeight}
        roomPolygon={space.roomPolygon}
        draftPoints={drawRoomState.draftPoints}
      />

      {space.roomPolygon && activeTool === 'select' && (
        <SeatRoomPolygonHandles
          polygon={space.roomPolygon}
          onHandlePointerDown={handlePolygonHandleDown}
        />
      )}

      {[...space.tables]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(table => (
          <SeatTableItem
            key={table.id}
            table={table}
            isSelected={table.id === selectedTableId}
            activeTool={activeTool}
            onPointerDown={handleTablePointerDown}
            onStartResize={handleStartResize}
            onDeleteTable={onDeleteTable}
            onSelectTable={onSelectTable}
          />
        ))}
    </svg>
  );
}
