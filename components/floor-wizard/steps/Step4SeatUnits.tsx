import type { SeatUnitType, WizardSeatUnit } from '@/lib/floor-wizard/types';
import { SEAT_UNIT_DEFAULTS } from '@/lib/floor-wizard/seatUnitFactory';

interface Props {
  seatUnits: WizardSeatUnit[];
  selectedId: string | null;
  onAdd: (type: SeatUnitType) => void;
  onUpdate: (id: string, changes: Partial<WizardSeatUnit>) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string | null) => void;
}

const SEAT_UNIT_BUTTONS: { type: SeatUnitType; label: string; desc: string }[] = [
  { type: 'TABLE_1', label: '1인석',   desc: '1명 테이블' },
  { type: 'TABLE_2', label: '2인석',   desc: '2명 테이블' },
  { type: 'TABLE_4', label: '4인석',   desc: '4명 테이블' },
  { type: 'TABLE_6', label: '6인석',   desc: '6명 테이블' },
  { type: 'BAR',     label: '바 테이블', desc: '4명 바 카운터' },
];

export default function Step4SeatUnits({
  seatUnits,
  selectedId,
  onAdd,
  onUpdate,
  onRemove,
  onSelect,
}: Props) {
  const selectedUnit = seatUnits.find((u) => u.id === selectedId) ?? null;
  const totalSeats = seatUnits.reduce((sum, u) => sum + u.capacity, 0);

  return (
    <div className="p-4 flex flex-col gap-3">
      <p className="wizard-panel-section">좌석 배치</p>
      <div className="flex flex-col gap-1 px-2">
        {SEAT_UNIT_BUTTONS.map(({ type, label, desc }) => (
          <button
            key={type}
            type="button"
            className="wizard-tool-btn rounded-lg"
            onClick={() => onAdd(type)}
          >
            <span className="text-xs font-semibold w-14 text-left text-foreground">{label}</span>
            <span className="text-xs text-foreground-muted">{desc}</span>
            <span className="ml-auto text-xs text-foreground-muted">
              {SEAT_UNIT_DEFAULTS[type].cap}석
            </span>
          </button>
        ))}
      </div>

      {selectedUnit && (
        <div className="px-2 py-2 border-t border-border">
          <p className="text-xs font-medium text-foreground-muted mb-2">선택된 테이블</p>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs text-foreground-muted flex-shrink-0">번호</label>
            <input
              type="text"
              value={selectedUnit.label}
              onChange={(e) => onUpdate(selectedUnit.id, { label: e.target.value })}
              className="flex-1 text-sm border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onRemove(selectedUnit.id);
              onSelect(null);
            }}
            className="w-full py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors"
          >
            테이블 삭제
          </button>
        </div>
      )}

      {seatUnits.length > 0 && (
        <div className="px-2 pt-1 border-t border-border">
          <div className="flex justify-between text-xs text-foreground-muted">
            <span>테이블 {seatUnits.length}개</span>
            <span>총 {totalSeats}석</span>
          </div>
        </div>
      )}
    </div>
  );
}
