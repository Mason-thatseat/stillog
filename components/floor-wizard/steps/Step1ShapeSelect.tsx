import type { FloorShape } from '@/lib/floor-wizard/types';

interface Props {
  currentShape: FloorShape;
  onSelect: (shape: FloorShape) => void;
  hasCustomPoints?: boolean;
  onClearCustom?: () => void;
}

const SHAPES: { value: FloorShape; label: string; desc: string; svgPath: string }[] = [
  {
    value: 'rectangle',
    label: '직사각형',
    desc: '일반적인 사각형 구조',
    svgPath: 'M8 8 H72 V52 H8 Z',
  },
  {
    value: 'l-shape',
    label: 'L자형',
    desc: '꺾인 구조 (복합 공간)',
    svgPath: 'M8 8 H72 V30 H42 V52 H8 Z',
  },
  {
    value: 'custom',
    label: '직접 그리기',
    desc: '자유롭게 외곽선 지정',
    svgPath: 'M40 8 L72 20 L65 52 L20 50 L8 28 Z',
  },
];

export default function Step1ShapeSelect({ currentShape, onSelect, hasCustomPoints, onClearCustom }: Props) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <p className="wizard-panel-section">공간 구조 선택</p>
      <div className="flex flex-col gap-2 p-2">
        {SHAPES.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`wizard-card flex items-center gap-3 p-3 text-left ${
              currentShape === s.value ? 'wizard-card--selected' : ''
            }`}
            onClick={() => onSelect(s.value)}
          >
            <svg
              viewBox="0 0 80 60"
              className="w-16 h-12 flex-shrink-0"
              style={{ minWidth: '4rem' }}
            >
              <rect width="80" height="60" fill="#F9FAFB" rx="2" />
              <path
                d={s.svgPath}
                fill={currentShape === s.value ? 'rgba(167,139,113,0.15)' : 'rgba(0,0,0,0.04)'}
                stroke={currentShape === s.value ? '#A78B71' : '#9CA3AF'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-foreground-muted leading-snug">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {currentShape === 'custom' && (
        <div className="px-2">
          {hasCustomPoints ? (
            <button
              type="button"
              onClick={onClearCustom}
              className="w-full py-2 rounded-xl border border-border text-sm text-foreground-muted hover:bg-background-subtle transition-colors"
            >
              다시 그리기
            </button>
          ) : (
            <p className="text-xs text-foreground-muted text-center py-1">
              캔버스에 외곽선을 직접 그려주세요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
