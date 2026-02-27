'use client';

import { useState } from 'react';
import type { WizardState, WizardStep } from '@/lib/floor-wizard/types';
import { useFloorWizard } from '@/hooks/useFloorWizard';
import { useWizardInteraction } from '@/hooks/useWizardInteraction';
import { useSeatDrawRoom } from '@/hooks/useSeatDrawRoom';
import { fitShape } from '@/lib/seat-editor/roomGeometry';
import WizardStepIndicator from './WizardStepIndicator';
import WizardCanvas from './WizardCanvas';
import Step1ShapeSelect from './steps/Step1ShapeSelect';
import Step2ZoneSetup from './steps/Step2ZoneSetup';
import Step3Fixtures from './steps/Step3Fixtures';
import Step4SeatUnits from './steps/Step4SeatUnits';
import Step5Review from './steps/Step5Review';

interface Props {
  spaceId?: string;
  canvasRatio?: number;
  initialState?: Partial<WizardState>;
  onComplete: (state: WizardState) => Promise<void>;
  saving?: boolean;
}

export default function FloorWizard({
  canvasRatio = 0.75,
  initialState,
  onComplete,
  saving = false,
}: Props) {
  const wizard = useFloorWizard(canvasRatio, initialState);
  const {
    state,
    setFloorShape,
    toggleZone,
    addSeatUnit,
    updateSeatUnit,
    removeSeatUnit,
    addFixture,
    updateFixture,
    removeFixture,
    setCustomWalls,
    clearCustomWalls,
    nextStep,
    prevStep,
    goToStep,
    validate,
  } = wizard;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const drawRoom = useSeatDrawRoom();

  const interaction = useWizardInteraction(
    state.canvasRatio,
    (id, changes) => wizard.updateZone(id, changes),
    updateSeatUnit,
    updateFixture
  );

  const step = state.step;
  const errors = step === 4 ? validate() : [];
  const canComplete = step === 4 && errors.length === 0;

  const handleNext = () => {
    nextStep();
    setSelectedId(null);
  };

  const handlePrev = () => {
    prevStep();
    setSelectedId(null);
  };

  const handleGoToStep = (s: WizardStep) => {
    if (s > step) return; // don't skip ahead
    goToStep(s);
    setSelectedId(null);
  };

  const handleComplete = async () => {
    const errs = validate();
    if (errs.length > 0) return;
    await onComplete(state);
  };

  const renderPanel = () => {
    switch (step) {
      case 0:
        return (
          <Step1ShapeSelect
            currentShape={state.walls.shape}
            onSelect={(shape) => {
              setFloorShape(shape);
              drawRoom.cancelDrawing();
            }}
            hasCustomPoints={state.walls.shape === 'custom' ? state.walls.points.length > 0 : undefined}
            onClearCustom={() => {
              clearCustomWalls();
              drawRoom.cancelDrawing();
            }}
          />
        );
      case 1:
        return (
          <Step2ZoneSetup
            zones={state.zones}
            onToggle={toggleZone}
          />
        );
      case 2:
        return (
          <Step3Fixtures
            fixtures={state.fixtures}
            onAdd={addFixture}
            onRemove={removeFixture}
          />
        );
      case 3:
        return (
          <Step4SeatUnits
            seatUnits={state.seatUnits}
            selectedId={selectedId}
            onAdd={addSeatUnit}
            onUpdate={updateSeatUnit}
            onRemove={removeSeatUnit}
            onSelect={setSelectedId}
          />
        );
      case 4:
        return (
          <Step5Review
            state={state}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="floor-wizard">
      {/* Step indicator */}
      <WizardStepIndicator
        currentStep={step}
        onGoToStep={handleGoToStep}
      />

      {/* Body: panel + canvas */}
      <div className="floor-wizard-body">
        <div className="floor-wizard-panel">
          {renderPanel()}
        </div>
        <WizardCanvas
          state={state}
          interaction={interaction}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            // Sync panel selection for seat units on step 3
          }}
          readonly={step === 4}
          isCustomDrawMode={step === 0 && state.walls.shape === 'custom' && state.walls.points.length === 0}
          draftPoints={drawRoom.state.draftPoints}
          onCanvasDrawStart={(pt) => drawRoom.startDrag(pt)}
          onCanvasDrawMove={(pt) => drawRoom.samplePoint(pt)}
          onCanvasDrawEnd={() => {
            const pts = drawRoom.state.draftPoints;
            drawRoom.cancelDrawing();
            if (pts.length >= 6) {
              const { points } = fitShape(pts);
              if (points.length >= 3) {
                setCustomWalls(points.map(p => ({ x: p.x, y: p.y })));
              }
            }
          }}
        />
      </div>

      {/* Footer navigation */}
      <div className="floor-wizard-footer">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 0}
          className="px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:bg-background-subtle transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          이전
        </button>

        <span className="text-xs text-foreground-muted">
          {step + 1} / 5
        </span>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!canComplete || saving}
            className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="spinner" style={{ borderTopColor: 'white' }} />
                저장 중...
              </>
            ) : '저장'}
          </button>
        )}
      </div>
    </div>
  );
}
