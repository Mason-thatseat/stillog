import type { WizardStep } from '@/lib/floor-wizard/types';

interface Props {
  currentStep: WizardStep;
  onGoToStep?: (step: WizardStep) => void;
}

const STEPS: { label: string; shortLabel: string }[] = [
  { label: '구조',  shortLabel: '1' },
  { label: '구역',  shortLabel: '2' },
  { label: '설비',  shortLabel: '3' },
  { label: '좌석',  shortLabel: '4' },
  { label: '확인',  shortLabel: '5' },
];

export default function WizardStepIndicator({ currentStep, onGoToStep }: Props) {
  return (
    <div className="floor-wizard-indicator">
      <ol className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const step = i as WizardStep;
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          const isFuture = i > currentStep;

          const circleClass = isDone
            ? 'bg-foreground text-background'
            : isCurrent
            ? 'bg-accent text-white'
            : 'bg-background-subtle text-foreground-muted border border-border';

          const labelClass = isDone
            ? 'text-foreground-muted'
            : isCurrent
            ? 'text-accent font-semibold'
            : 'text-foreground-muted';

          return (
            <li key={i} className="flex items-center">
              <button
                type="button"
                onClick={() => onGoToStep?.(step)}
                disabled={isFuture}
                className="flex flex-col items-center gap-1 group disabled:cursor-default"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${circleClass}`}
                >
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.shortLabel
                  )}
                </span>
                <span className={`text-xs hidden md:block ${labelClass}`}>{s.label}</span>
              </button>

              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 md:w-12 mx-1 transition-colors ${
                    isDone ? 'bg-foreground' : 'bg-border'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
