import type { ZoneType, WizardZone } from '@/lib/floor-wizard/types';
import { getZoneColor } from '@/lib/floor-wizard/utils';

interface Props {
  zones: WizardZone[];
  onToggle: (type: ZoneType, checked: boolean) => void;
}

const ZONE_OPTIONS: { type: ZoneType; label: string; desc: string }[] = [
  { type: 'FLOOR', label: '좌식',   desc: '바닥 좌석 구역' },
  { type: 'BAR',   label: '바',     desc: '바 카운터 구역' },
  { type: 'ROOM',  label: '룸',     desc: '독립 룸 구역' },
];

export default function Step2ZoneSetup({ zones, onToggle }: Props) {
  const activeTypes = new Set(zones.map((z) => z.type));

  return (
    <div className="p-4 flex flex-col gap-2">
      <p className="wizard-panel-section">구역 설정</p>
      <p className="text-xs text-foreground-muted px-2 pt-1 pb-2">
        일반 구역 외 특별 구역이 있다면 추가하세요. 캔버스에서 위치와 크기를 조정할 수 있습니다.
      </p>
      <div className="flex flex-col gap-2 px-2">
        {ZONE_OPTIONS.map(({ type, label, desc }) => {
          const checked = activeTypes.has(type);
          const color = getZoneColor(type);
          return (
            <label
              key={type}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer hover:bg-background-subtle transition-colors"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(type, e.target.checked)}
                className="w-4 h-4 accent-[#A78B71] flex-shrink-0"
              />
              <span
                className="zone-color-chip flex-shrink-0"
                style={{ background: color }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-foreground-muted">{desc}</p>
              </div>
            </label>
          );
        })}
      </div>
      {zones.length > 0 && (
        <p className="text-xs text-foreground-muted px-2 pt-1">
          {zones.length}개 구역 추가됨 — 캔버스에서 드래그로 위치를 조정하세요.
        </p>
      )}
    </div>
  );
}
