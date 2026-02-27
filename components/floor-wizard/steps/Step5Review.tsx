import type { WizardState } from '@/lib/floor-wizard/types';

interface Props {
  state: WizardState;
  errors: string[];
}

const SHAPE_LABEL: Record<string, string> = {
  rectangle: '직사각형',
  'l-shape':  'L자형',
  custom:    '직접 그리기',
};

const FIXTURE_LABEL: Record<string, string> = {
  entrance: '출입구',
  kitchen:  '주방',
  counter:  '계산대',
  restroom: '화장실',
};

export default function Step5Review({ state, errors }: Props) {
  const totalSeats = state.seatUnits.reduce((sum, u) => sum + u.capacity, 0);

  const fixtureSummary = state.fixtures.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});

  const isValid = errors.length === 0;

  return (
    <div className="p-4 flex flex-col gap-3">
      <p className="wizard-panel-section">배치 요약</p>

      <div className="px-2 flex flex-col gap-2">
        <div className="rounded-xl border border-border bg-background p-3 flex flex-col gap-2">
          <SummaryRow label="구조" value={SHAPE_LABEL[state.walls.shape] ?? state.walls.shape} />
          <SummaryRow label="구역" value={`${state.zones.length}개`} />
          <SummaryRow
            label="설비"
            value={
              Object.entries(fixtureSummary)
                .map(([type, cnt]) => `${FIXTURE_LABEL[type] ?? type} ${cnt}`)
                .join(', ') || '없음'
            }
          />
          <SummaryRow label="테이블" value={`${state.seatUnits.length}개`} />
          <SummaryRow label="총 좌석" value={`${totalSeats}석`} />
        </div>

        {isValid ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-medium text-green-700 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              배치도가 완성되었습니다. 저장을 눌러 완료하세요.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex flex-col gap-1.5">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
                {err}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-foreground-muted">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
