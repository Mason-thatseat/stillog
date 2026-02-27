import React from 'react';
import type { SeatEditorTable, SeatEditorSeat } from '@/lib/seat-editor/types';

type HandleType = 'nw' | 'ne' | 'se' | 'sw';

const HANDLE_SIZE = 3;
const HALF = HANDLE_SIZE / 2;

function SeatDot({ seat, tableX, tableY, tableWidth, tableHeight }: {
  seat: SeatEditorSeat;
  tableX: number;
  tableY: number;
  tableWidth: number;
  tableHeight: number;
}) {
  const cx = tableX + seat.relX * tableWidth;
  const cy = tableY + seat.relY * tableHeight;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={2}
      fill="#FFFFFF"
      stroke="#1A1A1A"
      strokeWidth={0.6}
      pointerEvents="none"
    />
  );
}

function ResizeHandles({ table, onStartResize }: {
  table: SeatEditorTable;
  onStartResize: (e: React.PointerEvent, handle: HandleType) => void;
}) {
  const { x, y, width, height } = table;
  const handles: { key: HandleType; hx: number; hy: number }[] = [
    { key: 'nw', hx: x, hy: y },
    { key: 'ne', hx: x + width, hy: y },
    { key: 'se', hx: x + width, hy: y + height },
    { key: 'sw', hx: x, hy: y + height },
  ];
  const cursors: Record<HandleType, string> = {
    nw: 'nw-resize', ne: 'ne-resize', se: 'se-resize', sw: 'sw-resize',
  };
  return (
    <>
      {handles.map(({ key, hx, hy }) => (
        <rect
          key={key}
          x={hx - HALF}
          y={hy - HALF}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          rx={0.5}
          fill="#FFFFFF"
          stroke="#1A1A1A"
          strokeWidth={0.6}
          style={{ cursor: cursors[key] }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartResize(e, key);
          }}
        />
      ))}
    </>
  );
}

interface SeatTableItemProps {
  table: SeatEditorTable;
  isSelected: boolean;
  activeTool: string | null;
  onPointerDown: (e: React.PointerEvent, tableId: string) => void;
  onStartResize: (e: React.PointerEvent, tableId: string, handle: HandleType) => void;
  onDeleteTable: (tableId: string) => void;
  onSelectTable: (tableId: string) => void;
}

export function SeatTableItem({
  table,
  isSelected,
  activeTool,
  onPointerDown,
  onStartResize,
  onDeleteTable,
  onSelectTable,
}: SeatTableItemProps) {
  const { x, y, width, height, seats, label } = table;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      onDeleteTable(table.id);
      return;
    }
    onSelectTable(table.id);
    if (activeTool === 'select' || activeTool === null) {
      onPointerDown(e, table.id);
    }
  };

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={1.5}
        fill={isSelected ? '#EFEFEF' : '#F5F5F5'}
        stroke={isSelected ? '#555555' : '#1A1A1A'}
        strokeWidth={isSelected ? 1.8 : 1.2}
        style={{ cursor: activeTool === 'delete' ? 'pointer' : 'move' }}
        onPointerDown={handlePointerDown}
      />

      {label && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={4}
          fill="#555555"
          pointerEvents="none"
        >
          {label}
        </text>
      )}

      {isSelected && !label && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={3.5}
          fill="#888888"
          pointerEvents="none"
        >
          {seats.length}석
        </text>
      )}

      {seats.map((seat) => (
        <SeatDot
          key={seat.id}
          seat={seat}
          tableX={x}
          tableY={y}
          tableWidth={width}
          tableHeight={height}
        />
      ))}

      {isSelected && activeTool === 'select' && (
        <ResizeHandles
          table={table}
          onStartResize={(e, handle) => onStartResize(e, table.id, handle)}
        />
      )}
    </g>
  );
}
