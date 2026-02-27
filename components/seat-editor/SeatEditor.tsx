'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSeatCanvasTransform } from '@/hooks/useSeatCanvasTransform';
import { useSeatDrawRoom } from '@/hooks/useSeatDrawRoom';
import { SeatToolbar } from './SeatToolbar';
import { SeatCanvas } from './SeatCanvas';
import { createTable } from '@/lib/seat-editor/tableFactory';
import type {
  SeatEditorTable,
  SeatEditorSpace,
  RoomPoint,
  RoomPolygon,
  ActiveSeatEditorTool,
} from '@/lib/seat-editor/types';

interface SeatEditorProps {
  spaceId: string;
  initialTables?: SeatEditorTable[];
  initialRoomPolygon?: RoomPolygon | null;
  canvasRatio?: number;
  onSave: (
    tables: SeatEditorTable[],
    roomPolygon: RoomPolygon | null,
    canvasRatio: number
  ) => Promise<void>;
  saving?: boolean;
}

export default function SeatEditor({
  spaceId,
  initialTables = [],
  initialRoomPolygon = null,
  canvasRatio = 0.75,
  onSave,
  saving = false,
}: SeatEditorProps) {
  const [tables, setTables] = useState<SeatEditorTable[]>(initialTables);
  const [roomPolygon, setRoomPolygon] = useState<RoomPolygon | null>(initialRoomPolygon ?? null);
  const [activeTool, setActiveTool] = useState<ActiveSeatEditorTool>('select');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const canvasTransform = useSeatCanvasTransform(canvasRatio);
  const drawRoom = useSeatDrawRoom();

  useEffect(() => {
    if (activeTool !== 'draw_room') {
      drawRoom.cancelDrawing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  const space: SeatEditorSpace = {
    canvasRatio,
    roomX: 0,
    roomY: 0,
    roomWidth: 100,
    roomHeight: Math.round(100 * canvasRatio),
    tables,
    roomPolygon: roomPolygon ?? undefined,
  };

  const addTable = useCallback((x: number, y: number) => {
    const table = createTable(x, y, spaceId);
    setTables(prev => [...prev, table]);
  }, [spaceId]);

  const updateTable = useCallback((id: string, changes: Partial<SeatEditorTable>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
  }, []);

  const deleteTable = useCallback((id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    setSelectedTableId(prev => prev === id ? null : prev);
  }, []);

  const handleDrawRoomStart = useCallback((p: RoomPoint) => {
    drawRoom.startDrag(p);
  }, [drawRoom]);

  const handleDrawRoomSample = useCallback((p: RoomPoint) => {
    drawRoom.samplePoint(p);
  }, [drawRoom]);

  const handleDrawRoomFinish = useCallback(() => {
    const polygon: RoomPolygon | null = drawRoom.finishDrag();
    if (polygon) {
      setRoomPolygon(polygon);
      setActiveTool('select');
    }
  }, [drawRoom]);

  const handleUpdateRoomPolygon = useCallback((points: RoomPoint[]) => {
    setRoomPolygon(prev => prev ? { ...prev, points } : null);
  }, []);

  const handleSave = useCallback(() => {
    onSave(tables, roomPolygon, canvasRatio);
  }, [tables, roomPolygon, canvasRatio, onSave]);

  return (
    <div className="seat-editor">
      <SeatToolbar
        activeTool={activeTool}
        onSetTool={setActiveTool}
        onZoomIn={canvasTransform.zoomIn}
        onZoomOut={canvasTransform.zoomOut}
        onReset={canvasTransform.resetTransform}
        onSave={handleSave}
        saving={saving}
      />
      <SeatCanvas
        space={space}
        selectedTableId={selectedTableId}
        activeTool={activeTool}
        canvasTransform={canvasTransform}
        drawRoomState={drawRoom.state}
        onAddTable={addTable}
        onDeleteTable={deleteTable}
        onUpdateTable={updateTable}
        onSelectTable={setSelectedTableId}
        onDrawRoomStart={handleDrawRoomStart}
        onDrawRoomSample={handleDrawRoomSample}
        onDrawRoomFinish={handleDrawRoomFinish}
        onUpdateRoomPolygon={handleUpdateRoomPolygon}
      />
    </div>
  );
}
