import { useState, useCallback } from 'react';
import type {
  WizardState,
  WizardStep,
  FloorShape,
  ZoneType,
  SeatUnitType,
  WizardZone,
  WizardSeatUnit,
  WizardFixture,
} from '@/lib/floor-wizard/types';
import {
  generateId,
  generateWalls,
  getZoneColor,
  getZoneDefaultDimensions,
  validateWizardState,
} from '@/lib/floor-wizard/utils';
import { createSeatUnit, SEAT_UNIT_DEFAULTS } from '@/lib/floor-wizard/seatUnitFactory';

function makeInitialState(canvasRatio: number): WizardState {
  return {
    step: 0,
    walls: generateWalls('rectangle', canvasRatio),
    zones: [],
    seatUnits: [],
    fixtures: [],
    canvasRatio,
  };
}

export function useFloorWizard(initialCanvasRatio = 0.75, initialState?: Partial<WizardState>) {
  const [state, setState] = useState<WizardState>(() => ({
    ...makeInitialState(initialCanvasRatio),
    ...initialState,
  }));

  const setFloorShape = useCallback((shape: FloorShape) => {
    setState((prev) => ({
      ...prev,
      walls: generateWalls(shape, prev.canvasRatio),
    }));
  }, []);

  const toggleZone = useCallback((type: ZoneType, checked: boolean) => {
    setState((prev) => {
      if (!checked) {
        return { ...prev, zones: prev.zones.filter((z) => z.type !== type) };
      }
      // Already exists
      if (prev.zones.some((z) => z.type === type)) return prev;

      const dims = getZoneDefaultDimensions(type);
      const newZone: WizardZone = {
        id: generateId(),
        type,
        label: type,
        color: getZoneColor(type),
        x: 50 - dims.width / 2,
        y: (50 * prev.canvasRatio) - dims.height / 2,
        width: dims.width,
        height: dims.height,
      };
      return { ...prev, zones: [...prev.zones, newZone] };
    });
  }, []);

  const addSeatUnit = useCallback((type: SeatUnitType, x?: number, y?: number) => {
    setState((prev) => {
      const existingLabels = prev.seatUnits.map((u) => u.label);
      const defaults = SEAT_UNIT_DEFAULTS[type];
      const cx = x ?? 50 - defaults.w / 2;
      const cy = y ?? (50 * prev.canvasRatio) - defaults.h / 2;
      const unit = createSeatUnit(type, cx, cy, existingLabels);
      return { ...prev, seatUnits: [...prev.seatUnits, unit] };
    });
  }, []);

  const updateSeatUnit = useCallback((id: string, changes: Partial<WizardSeatUnit>) => {
    setState((prev) => ({
      ...prev,
      seatUnits: prev.seatUnits.map((u) => (u.id === id ? { ...u, ...changes } : u)),
    }));
  }, []);

  const removeSeatUnit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      seatUnits: prev.seatUnits.filter((u) => u.id !== id),
    }));
  }, []);

  const addFixture = useCallback((type: WizardFixture['type']) => {
    setState((prev) => {
      const newFixture: WizardFixture = {
        id: generateId(),
        type,
        x: 50 - 4,
        y: (50 * prev.canvasRatio) - 4,
        width: 8,
        height: 8,
      };
      return { ...prev, fixtures: [...prev.fixtures, newFixture] };
    });
  }, []);

  const updateFixture = useCallback((id: string, changes: Partial<WizardFixture>) => {
    setState((prev) => ({
      ...prev,
      fixtures: prev.fixtures.map((f) => (f.id === id ? { ...f, ...changes } : f)),
    }));
  }, []);

  const removeFixture = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      fixtures: prev.fixtures.filter((f) => f.id !== id),
    }));
  }, []);

  const updateZone = useCallback((id: string, changes: Partial<WizardZone>) => {
    setState((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === id ? { ...z, ...changes } : z)),
    }));
  }, []);

  const updateWalls = useCallback((points: { x: number; y: number }[]) => {
    setState((prev) => ({
      ...prev,
      walls: { ...prev.walls, points },
    }));
  }, []);

  const setCustomWalls = useCallback((points: { x: number; y: number }[]) => {
    setState(prev => ({ ...prev, walls: { shape: 'custom' as FloorShape, points } }));
  }, []);

  const clearCustomWalls = useCallback(() => {
    setState(prev => ({ ...prev, walls: { shape: 'custom' as FloorShape, points: [] } }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.min(4, prev.step + 1) as WizardStep,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(0, prev.step - 1) as WizardStep,
    }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const validate = useCallback(() => {
    return validateWizardState(state);
  }, [state]);

  return {
    state,
    setFloorShape,
    toggleZone,
    addSeatUnit,
    updateSeatUnit,
    removeSeatUnit,
    addFixture,
    updateFixture,
    removeFixture,
    updateZone,
    updateWalls,
    setCustomWalls,
    clearCustomWalls,
    nextStep,
    prevStep,
    goToStep,
    validate,
  };
}
