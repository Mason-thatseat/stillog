export type WizardStep = 0 | 1 | 2 | 3 | 4;

export type FloorShape = 'rectangle' | 'l-shape' | 'custom';

export type ZoneType = 'GENERAL' | 'FLOOR' | 'BAR' | 'ROOM';

export type SeatUnitType = 'TABLE_1' | 'TABLE_2' | 'TABLE_4' | 'TABLE_6' | 'BAR';

export interface WizardZone {
  id: string;
  type: ZoneType;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WizardSeatUnit {
  id: string;
  zoneId: string | null;
  type: SeatUnitType;
  label: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WizardFixture {
  id: string;
  type: 'entrance' | 'kitchen' | 'counter' | 'restroom';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WizardWalls {
  shape: FloorShape;
  points: { x: number; y: number }[];
}

export interface WizardState {
  step: WizardStep;
  walls: WizardWalls;
  zones: WizardZone[];
  seatUnits: WizardSeatUnit[];
  fixtures: WizardFixture[];
  canvasRatio: number;
}
