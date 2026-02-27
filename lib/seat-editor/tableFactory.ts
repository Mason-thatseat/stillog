import type { SeatEditorTable, SeatEditorSeat } from './types';
import { generateId } from './utils';

export function createTable(x: number, y: number, spaceId: string): SeatEditorTable {
  const id = generateId();
  const width = 14;
  const height = 10;
  const seats: SeatEditorSeat[] = [
    { id: generateId(), tableId: id, relX: 0.15, relY: 0.2, label: '1' },
    { id: generateId(), tableId: id, relX: 0.85, relY: 0.2, label: '2' },
    { id: generateId(), tableId: id, relX: 0.15, relY: 0.8, label: '3' },
    { id: generateId(), tableId: id, relX: 0.85, relY: 0.8, label: '4' },
  ];
  return { id, spaceId, x, y, width, height, label: null, seats, zIndex: 0 };
}
