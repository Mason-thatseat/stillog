import type { FloorShape, ZoneType, WizardWalls, WizardState } from './types';

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function generateWalls(shape: FloorShape, canvasRatio: number): WizardWalls {
  const r = canvasRatio;
  if (shape === 'rectangle') {
    return {
      shape,
      points: [
        { x: 10, y: 10 * r },
        { x: 90, y: 10 * r },
        { x: 90, y: 90 * r },
        { x: 10, y: 90 * r },
      ],
    };
  }
  if (shape === 'l-shape') {
    return {
      shape,
      points: [
        { x: 10, y: 10 * r },
        { x: 90, y: 10 * r },
        { x: 90, y: 50 * r },
        { x: 55, y: 50 * r },
        { x: 55, y: 90 * r },
        { x: 10, y: 90 * r },
      ],
    };
  }
  // custom
  return { shape, points: [] };
}

export function generateLabel(existingLabels: string[]): string {
  let n = 1;
  const set = new Set(existingLabels);
  while (set.has(String(n))) {
    n++;
  }
  return String(n);
}

export function getZoneColor(type: ZoneType): string {
  switch (type) {
    case 'GENERAL': return '#A78B71';
    case 'FLOOR':   return '#7BA7BC';
    case 'BAR':     return '#C49A6C';
    case 'ROOM':    return '#9B8EB0';
  }
}

export function getZoneDefaultDimensions(type: ZoneType): { width: number; height: number } {
  switch (type) {
    case 'GENERAL': return { width: 30, height: 25 };
    case 'FLOOR':   return { width: 35, height: 25 };
    case 'BAR':     return { width: 20, height: 15 };
    case 'ROOM':    return { width: 25, height: 20 };
  }
}

export function validateWizardState(state: WizardState): string[] {
  const errors: string[] = [];

  const hasEntrance = state.fixtures.some((f) => f.type === 'entrance');
  if (!hasEntrance) {
    errors.push('출입구를 최소 1개 이상 배치해 주세요');
  }

  if (state.seatUnits.length === 0) {
    errors.push('좌석 단위를 최소 1개 이상 배치해 주세요');
  }

  const labelCount = new Map<string, number>();
  for (const unit of state.seatUnits) {
    labelCount.set(unit.label, (labelCount.get(unit.label) ?? 0) + 1);
  }
  for (const [label, count] of labelCount.entries()) {
    if (count > 1) {
      errors.push(`테이블 번호가 중복되었습니다: ${label}`);
    }
  }

  return errors;
}
