import type { DetectedRoom, SpaceClassification, SpaceLayoutType } from './types';

const CANVAS_AREA = 100 * 100; // 100x100 SVG space
const LARGE_ROOM_RATIO = 0.4;

export function classifySpace(rooms: DetectedRoom[]): SpaceClassification {
  const roomCount = rooms.length;

  if (roomCount === 0) {
    return {
      layoutType: 'unknown',
      confidence: 0.3,
      roomCount: 0,
    };
  }

  if (roomCount >= 2) {
    return {
      layoutType: 'multi_room',
      confidence: 0.8,
      roomCount,
      suggestion: '다중 공간이 감지되었습니다',
    };
  }

  // Single room analysis
  const room = rooms[0];
  const vertexCount = room.polygon.length;
  const ar = room.aspectRatio;
  const areaRatio = room.area / CANVAS_AREA;

  // Corridor: very elongated
  if (ar > 3.0 || ar < 0.33) {
    return {
      layoutType: 'corridor',
      confidence: 0.75,
      roomCount: 1,
      suggestion: '복도형 구조입니다',
    };
  }

  // Cafe/open: large single room
  if (areaRatio > LARGE_ROOM_RATIO) {
    return {
      layoutType: 'cafe_open',
      confidence: 0.7,
      roomCount: 1,
      suggestion: '이 공간은 카페형 구조로 보입니다. 기본 좌석 배치를 생성할까요?',
    };
  }

  // L-shape: many vertices
  if (vertexCount >= 6) {
    return {
      layoutType: 'l_shape',
      confidence: 0.65,
      roomCount: 1,
      suggestion: 'L자형 공간입니다',
    };
  }

  // Rectangle: simple shape with moderate aspect ratio
  if (vertexCount <= 5 && ar >= 0.5 && ar <= 2.0) {
    return {
      layoutType: 'rectangle',
      confidence: 0.85,
      roomCount: 1,
      suggestion: '직사각형 공간입니다',
    };
  }

  return {
    layoutType: 'unknown',
    confidence: 0.4,
    roomCount: 1,
  };
}
