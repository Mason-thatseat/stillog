import type { WizardFixture } from '@/lib/floor-wizard/types';

interface Props {
  fixtures: WizardFixture[];
  onAdd: (type: WizardFixture['type']) => void;
  onRemove: (id: string) => void;
}

const FIXTURE_BUTTONS: { type: WizardFixture['type']; icon: string; label: string }[] = [
  { type: 'entrance', icon: '🚪', label: '출입구' },
  { type: 'kitchen',  icon: '🍳', label: '주방' },
  { type: 'counter',  icon: '🏧', label: '계산대' },
  { type: 'restroom', icon: '🚻', label: '화장실' },
];

const FIXTURE_LABEL: Record<WizardFixture['type'], string> = {
  entrance: '출입구',
  kitchen:  '주방',
  counter:  '계산대',
  restroom: '화장실',
};

const FIXTURE_ICON: Record<WizardFixture['type'], string> = {
  entrance: '🚪',
  kitchen:  '🍳',
  counter:  '🏧',
  restroom: '🚻',
};

export default function Step3Fixtures({ fixtures, onAdd, onRemove }: Props) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <p className="wizard-panel-section">설비 배치</p>
      <p className="text-xs text-foreground-muted px-2 pt-1">
        클릭하면 캔버스 중앙에 배치됩니다. 배치 후 드래그로 이동하세요.
      </p>
      <div className="grid grid-cols-2 gap-2 px-2">
        {FIXTURE_BUTTONS.map(({ type, icon, label }) => (
          <button
            key={type}
            type="button"
            className="fixture-drag-btn"
            onClick={() => onAdd(type)}
          >
            <span className="text-2xl">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {fixtures.length > 0 && (
        <div className="px-2">
          <p className="text-xs font-medium text-foreground-muted mb-2">배치된 설비</p>
          <div className="flex flex-col gap-1">
            {fixtures.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-background-subtle border border-border"
              >
                <span className="text-sm text-foreground flex items-center gap-2">
                  <span>{FIXTURE_ICON[f.type]}</span>
                  <span>{FIXTURE_LABEL[f.type]}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  className="text-foreground-muted hover:text-red-500 transition-colors p-1"
                  aria-label="삭제"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
