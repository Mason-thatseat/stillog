
type ToolPanelProps = {
  onAddSeat: (type: string) => void;
  onAddFixture: (type: string) => void;
  onAddZone: () => void;
  onAddWindow: (side: 'top' | 'bottom' | 'left' | 'right') => void;
  onAddEntrance: (side: 'top' | 'bottom' | 'left' | 'right', isMain: boolean) => void;
};

export default function ToolPanel({ onAddSeat, onAddFixture, onAddZone, onAddWindow, onAddEntrance }: ToolPanelProps) {
  const seatTypes = [
    { id: 'window', label: '창가석', icon: 'ri-sun-line', color: 'bg-sky-100 text-sky-700' },
    { id: 'bar', label: '바 자리', icon: 'ri-goblet-line', color: 'bg-amber-100 text-amber-700' },
    { id: 'sofa', label: '소파석', icon: 'ri-sofa-line', color: 'bg-rose-100 text-rose-700' },
    { id: 'group', label: '단체석', icon: 'ri-group-line', color: 'bg-orange-100 text-orange-700' },
    { id: 'regular', label: '일반석', icon: 'ri-armchair-line', color: 'bg-gray-100 text-gray-700' },
  ];

  const fixtures = [
    { id: 'counter', label: '카운터', icon: 'ri-store-2-line' },
    { id: 'kitchen', label: '주방', icon: 'ri-restaurant-line' },
    { id: 'bar', label: '바', icon: 'ri-beer-line' },
    { id: 'reception', label: '리셉션', icon: 'ri-service-line' },
  ];

  const wallSides = [
    { id: 'top' as const, label: '상단 벽' },
    { id: 'bottom' as const, label: '하단 벽' },
    { id: 'left' as const, label: '좌측 벽' },
    { id: 'right' as const, label: '우측 벽' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">

        {/* 창문 섹션 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-sun-line text-sky-500"></i>
            창문 추가
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {wallSides.map((side) => (
              <button
                key={side.id}
                onClick={() => onAddWindow(side.id)}
                className="px-2.5 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer whitespace-nowrap border border-sky-200"
              >
                <i className="ri-add-line text-xs"></i>
                {side.label}
              </button>
            ))}
          </div>
        </div>

        {/* 출입구 섹션 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-door-open-line text-emerald-500"></i>
            주출입구 추가
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {wallSides.map((side) => (
              <button
                key={side.id}
                onClick={() => onAddEntrance(side.id, true)}
                className="px-2.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer whitespace-nowrap border border-emerald-200"
              >
                <i className="ri-add-line text-xs"></i>
                {side.label}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mt-4 mb-3 flex items-center gap-2">
            <i className="ri-door-line text-orange-500"></i>
            보조출입구 추가
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {wallSides.map((side) => (
              <button
                key={side.id}
                onClick={() => onAddEntrance(side.id, false)}
                className="px-2.5 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer whitespace-nowrap border border-orange-200"
              >
                <i className="ri-add-line text-xs"></i>
                {side.label}
              </button>
            ))}
          </div>
        </div>

        {/* 좌석 섹션 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-armchair-line text-teal-600"></i>
            좌석 추가
          </h3>
          <div className="space-y-1.5">
            {seatTypes.map((seat) => (
              <button
                key={seat.id}
                onClick={() => onAddSeat(seat.id)}
                className={`w-full px-3 py-2.5 rounded-lg ${seat.color} hover:opacity-80 transition-opacity flex items-center gap-2 text-sm font-medium cursor-pointer whitespace-nowrap`}
              >
                <i className={seat.icon}></i>
                {seat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 시설물 섹션 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-building-line text-teal-600"></i>
            시설물 추가
          </h3>
          <div className="space-y-1.5">
            {fixtures.map((fixture) => (
              <button
                key={fixture.id}
                onClick={() => onAddFixture(fixture.id)}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                <i className={fixture.icon}></i>
                {fixture.label}
              </button>
            ))}
          </div>
        </div>

        {/* 구역 섹션 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-layout-grid-line text-teal-600"></i>
            구역 추가
          </h3>
          <button
            onClick={onAddZone}
            className="w-full px-3 py-2.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            새 구역 만들기
          </button>
        </div>
      </div>

      {/* 사용 방법 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">사용 방법</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start gap-1"><span className="text-sky-500 mt-0.5">■</span> 창문 — 드래그로 이동, 양 끝 핸들로 크기 조절</li>
          <li className="flex items-start gap-1"><span className="text-emerald-500 mt-0.5">■</span> 주출입구 — 초록색 표시</li>
          <li className="flex items-start gap-1"><span className="text-orange-500 mt-0.5">■</span> 보조출입구 — 주황색 표시</li>
          <li className="flex items-start gap-1"><span className="text-gray-400 mt-0.5">■</span> 요소 드래그로 이동</li>
          <li className="flex items-start gap-1"><span className="text-gray-400 mt-0.5">■</span> Delete 키로 삭제</li>
        </ul>
      </div>
    </div>
  );
}
