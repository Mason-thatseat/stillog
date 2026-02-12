export interface Point {
  x: number;
  y: number;
}

export interface SketchStroke {
  id: string;
  points: Point[];
  timestamp: number;
}

export interface CleanedSegment {
  start: Point;
  end: Point;
  angle: number;
  length: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
}

export interface DetectedRoom {
  id: string;
  wallIds: string[];
  polygon: Point[];
  boundingBox: { x: number; y: number; width: number; height: number };
  area: number;
  aspectRatio: number;
}

export type SpaceLayoutType =
  | 'rectangle'
  | 'l_shape'
  | 'corridor'
  | 'cafe_open'
  | 'multi_room'
  | 'unknown';

export interface SpaceClassification {
  layoutType: SpaceLayoutType;
  confidence: number;
  roomCount: number;
  suggestion?: string;
}

export interface DetectedObject {
  id: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  aspectRatio: number;
  area: number;
}

export interface CleanedStructure {
  walls: Wall[];
  rooms: DetectedRoom[];
  objects: DetectedObject[];
  classification: SpaceClassification;
}

export type SketchTool = 'pen' | 'eraser';
