import type { SeatUnitType, WizardSeatUnit } from './types';
import { generateId, generateLabel } from './utils';

export const SEAT_UNIT_DEFAULTS: Record<SeatUnitType, { w: number; h: number; cap: number }> = {
  TABLE_1: { w: 8,  h: 8,  cap: 1 },
  TABLE_2: { w: 10, h: 8,  cap: 2 },
  TABLE_4: { w: 14, h: 10, cap: 4 },
  TABLE_6: { w: 18, h: 10, cap: 6 },
  BAR:     { w: 20, h: 6,  cap: 4 },
};

export function createSeatUnit(
  type: SeatUnitType,
  x: number,
  y: number,
  existingLabels: string[]
): WizardSeatUnit {
  const defaults = SEAT_UNIT_DEFAULTS[type];
  return {
    id: generateId(),
    zoneId: null,
    type,
    label: generateLabel(existingLabels),
    capacity: defaults.cap,
    x,
    y,
    width: defaults.w,
    height: defaults.h,
  };
}
