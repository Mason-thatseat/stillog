export interface SeatEditorSeat {
  id: string;
  tableId: string;
  relX: number; // 0~1
  relY: number; // 0~1
  label: string | null;
}

export interface SeatEditorTable {
  id: string;
  spaceId: string;
  x: number; // viewBox 좌표계
  y: number;
  width: number;
  height: number;
  label: string | null;
  seats: SeatEditorSeat[];
  zIndex: number;
}

export interface RoomPoint {
  x: number;
  y: number;
}

export interface RoomPolygon {
  points: RoomPoint[];
  shapeType: 'rectangle' | 'l-shape' | 'corridor' | 'custom';
}

export type ActiveSeatEditorTool = 'select' | 'add_table' | 'delete' | 'draw_room' | null;

// drag-and-drop 경계 계산용 공간 타입
export interface SeatEditorSpace {
  canvasRatio: number;
  roomX: number;
  roomY: number;
  roomWidth: number;
  roomHeight: number;
  tables: SeatEditorTable[];
  roomPolygon?: RoomPolygon;
}
