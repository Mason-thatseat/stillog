import { useState } from 'react';
import { spaceLayouts, seatTagCategories, type SeatData, type ZoneData, type WindowData, type EntranceData } from '../../../mocks/reviewData';

interface SeatingMapProps {
  spaceId: string;
  spaceName: string;
  onSelect: (seat: SeatData & { selectedTags: string[] }) => void;
}

const typeLabel: Record<string, string> = {
  window: '창가석',
  bar: '바 자리',
  group: '단체석',
  sofa: '소파석',
  normal: '일반석',
};

const typeIcon: Record<string, string> = {
  window: 'ri-sun-line',
  bar: 'ri-goblet-line',
  group: 'ri-group-line',
  sofa: 'ri-sofa-line',
  normal: 'ri-armchair-line',
};

function getRatingColor(rating: number) {
  if (rating >= 4.7) return { bg: 'bg-red-400', border: 'border-red-500', text: 'text-white' };
  if (rating >= 4.3) return { bg: 'bg-orange-300', border: 'border-orange-400', text: 'text-white' };
  if (rating >= 4.0) return { bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-gray-800' };
  if (rating >= 3.7) return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-gray-700' };
  return { bg: 'bg-white', border: 'border-gray-300', text: 'text-gray-500' };
}

// ── 태그 선택 패널 ──────────────────────────────────────────────────────────
interface TagSelectorProps {
  seat: SeatData;
  onConfirm: (tags: string[]) => void;
  onCancel: () => void;
}

function TagSelector({ seat, onConfirm, onCancel }: TagSelectorProps) {
  const [selected, setSelected] = useState<string[]>([...seat.tags]);

  const toggle = (tag: string) => {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* 헤더 */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 text-white flex-shrink-0">
                <i className={`${typeIcon[seat.type]} text-xs`}></i>
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{seat.id} — {typeLabel[seat.type]}</span>
            </div>
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors flex-shrink-0">
              <i className="ri-close-line text-gray-500 text-lg"></i>
            </button>
          </div>
          <p className="text-xs text-gray-500 ml-9">이 자리의 특징을 선택해 주세요 (복수 선택 가능)</p>
        </div>

        {/* 태그 카테고리 */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
          {seatTagCategories.map(cat => (
            <div key={cat.category}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                  <i className={`${cat.icon} text-sm`}></i>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cat.category}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {cat.tags.map(tag => {
                  const isOn = selected.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggle(tag)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                        isOn
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {isOn && <i className="ri-check-line mr-1 text-[10px]"></i>}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 태그 미리보기 + 확인 버튼 */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50">
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selected.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-3">선택된 태그가 없습니다. 태그 없이도 계속할 수 있어요.</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              취소
            </button>
            <button
              onClick={() => onConfirm(selected)}
              className="flex-2 flex-grow-[2] py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              이 자리로 리뷰 작성 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 SeatingMap ─────────────────────────────────────────────────────────
export default function SeatingMap({ spaceId, spaceName, onSelect }: SeatingMapProps) {
  const [hoveredSeat, setHoveredSeat] = useState<SeatData | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [tagTargetSeat, setTagTargetSeat] = useState<SeatData | null>(null);

  const data = spaceLayouts[spaceId] || spaceLayouts['v1'];

  const zoneAvgRating = (zoneId: string) => {
    const seats = data.seats.filter(s => s.zone === zoneId);
    if (!seats.length) return 0;
    return seats.reduce((sum, s) => sum + s.rating, 0) / seats.length;
  };

  const handleSeatClick = (seat: SeatData) => {
    if (selectedZone && seat.zone !== selectedZone) return;
    setTagTargetSeat(seat);
  };

  const handleTagConfirm = (tags: string[]) => {
    if (!tagTargetSeat) return;
    onSelect({ ...tagTargetSeat, selectedTags: tags });
    setTagTargetSeat(null);
  };

  // ── 창문 렌더링 (windows 배열 기반) ──────────────────────────────────────
  const renderWindows = () => {
    const wins: WindowData[] = data.windows || [];
    // 레거시 windowSide 지원 (windows 배열이 비어있을 때)
    if (wins.length === 0 && data.windowSide !== 'none') {
      const side = data.windowSide;
      const isHoriz = side === 'top' || side === 'bottom';
      const baseStyle: React.CSSProperties = isHoriz
        ? { left: 0, right: 0, height: 6, [side]: 0 }
        : { top: 0, bottom: 0, width: 6, [side]: 0 };
      return (
        <div
          className="absolute z-10 bg-gradient-to-r from-sky-200 via-sky-100 to-sky-200 flex items-center justify-center"
          style={baseStyle}
        >
          <span className="text-[8px] text-sky-600 font-semibold tracking-widest">창문</span>
        </div>
      );
    }

    return wins.map(win => {
      const isHoriz = win.side === 'top' || win.side === 'bottom';
      const THICKNESS = 6;
      const style: React.CSSProperties = isHoriz
        ? {
            left: `${(win.offset / data.width) * 100}%`,
            [win.side]: 0,
            width: `${(win.length / data.width) * 100}%`,
            height: THICKNESS,
          }
        : {
            top: `${(win.offset / data.height) * 100}%`,
            [win.side]: 0,
            width: THICKNESS,
            height: `${(win.length / data.height) * 100}%`,
          };

      return (
        <div
          key={`view-win-${win.id}`}
          className="absolute z-10 bg-sky-300 flex items-center justify-center overflow-hidden"
          style={style}
          title={win.label}
        >
          {win.length > 60 && (
            <span
              className="text-sky-800 font-semibold pointer-events-none whitespace-nowrap"
              style={{
                fontSize: 8,
                writingMode: isHoriz ? 'horizontal-tb' : 'vertical-rl',
              }}
            >
              <i className="ri-sun-line"></i> {win.label}
            </span>
          )}
        </div>
      );
    });
  };

  // ── 출입구 렌더링 (entrances 배열 기반) ──────────────────────────────────
  const renderEntrances = () => {
    const ents: EntranceData[] = data.entrances || [];
    // 레거시 entranceSide 지원 (entrances 배열이 비어있을 때)
    if (ents.length === 0) {
      const side = data.entranceSide;
      const isHoriz = side === 'top' || side === 'bottom';
      const baseStyle: React.CSSProperties = isHoriz
        ? { left: '50%', transform: 'translateX(-50%)', width: 64, height: 10, [side]: 0 }
        : { top: '50%', transform: 'translateY(-50%)', width: 10, height: 64, [side]: 0 };
      return (
        <div
          className="absolute z-10 bg-emerald-400 rounded-sm flex items-center justify-center"
          style={baseStyle}
        >
          <span className="text-white font-bold pointer-events-none" style={{ fontSize: 7 }}>입구</span>
        </div>
      );
    }

    return ents.map(en => {
      const isHoriz = en.side === 'top' || en.side === 'bottom';
      const THICKNESS = 10;
      const bgColor = en.isMain ? 'bg-emerald-400' : 'bg-orange-400';
      const style: React.CSSProperties = isHoriz
        ? {
            left: `${(en.offset / data.width) * 100}%`,
            [en.side]: 0,
            width: `${(en.length / data.width) * 100}%`,
            height: THICKNESS,
          }
        : {
            top: `${(en.offset / data.height) * 100}%`,
            [en.side]: 0,
            width: THICKNESS,
            height: `${(en.length / data.height) * 100}%`,
          };

      return (
        <div
          key={`view-ent-${en.id}`}
          className={`absolute z-10 ${bgColor} flex items-center justify-center overflow-hidden`}
          style={style}
          title={en.label}
        >
          {en.length > 40 && (
            <span
              className="text-white font-bold pointer-events-none whitespace-nowrap"
              style={{
                fontSize: 7,
                writingMode: isHoriz ? 'horizontal-tb' : 'vertical-rl',
              }}
            >
              {en.isMain ? '▶' : '▷'} {en.label}
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-1">좌석 선택</h2>
          <p className="text-xs sm:text-sm text-gray-500">{spaceName} — 앉았던 자리를 클릭하세요</p>
        </div>

        {/* 구역 필터 카드 */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 sm:grid-cols-5">
          {data.zones.map((zone: ZoneData) => {
            const avg = zoneAvgRating(zone.id);
            const isActive = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(isActive ? null : zone.id)}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-gray-900 bg-gray-900 text-white shadow-md scale-105'
                    : `${zone.borderColor} ${zone.bgColor} ${zone.color} hover:scale-105 hover:shadow-sm`
                }`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  <i className={`${zone.icon} text-sm sm:text-base`}></i>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap">{zone.label}</span>
                <span className={`text-[8px] sm:text-[9px] font-medium ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                  ★ {avg.toFixed(1)}
                </span>
              </button>
            );
          })}
        </div>

        {/* 히트맵 토글 + 범례 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[9px] sm:text-[10px] text-gray-500 flex-wrap">
            <span className="flex items-center gap-0.5 sm:gap-1"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-red-400 inline-block"></span>인기</span>
            <span className="flex items-center gap-0.5 sm:gap-1"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-orange-300 inline-block"></span>높음</span>
            <span className="flex items-center gap-0.5 sm:gap-1"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-yellow-200 inline-block"></span>보통</span>
            <span className="flex items-center gap-0.5 sm:gap-1"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-emerald-100 inline-block"></span>낮음</span>
          </div>
          <button
            onClick={() => setShowHeatmap(v => !v)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              showHeatmap ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <i className="ri-fire-line"></i>
            히트맵 {showHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* 평면도 범례 */}
        <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-sky-300 inline-block"></span>창문
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-emerald-400 inline-block"></span>주출입구
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-orange-400 inline-block"></span>보조출입구
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 bg-yellow-400 rounded-full inline-flex items-center justify-center">
              <i className="ri-plug-line text-[7px] text-white"></i>
            </span>
            콘센트
          </span>
        </div>

        {/* 평면도 */}
        <div className="relative w-full overflow-x-auto">
          <div
            className="relative bg-stone-50 rounded-2xl border-2 border-stone-200 overflow-hidden"
            style={{ width: '100%', paddingBottom: `${(data.height / data.width) * 100}%` }}
          >
            <div className="absolute inset-0">
              {/* 창문 렌더링 */}
              {renderWindows()}
              {/* 출입구 렌더링 */}
              {renderEntrances()}

              {/* 고정 시설물 */}
              {data.fixtures.map(fix => (
                <div
                  key={fix.id}
                  className={`absolute ${fix.color} rounded-lg flex flex-col items-center justify-center z-10 gap-0.5`}
                  style={{
                    left: `${(fix.x / data.width) * 100}%`,
                    top: `${(fix.y / data.height) * 100}%`,
                    width: `${(fix.width / data.width) * 100}%`,
                    height: `${(fix.height / data.height) * 100}%`,
                  }}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${fix.icon} text-stone-600 text-xs`}></i>
                  </div>
                  <span className="text-[8px] text-stone-600 font-semibold">{fix.label}</span>
                </div>
              ))}

              {/* 구역 배경 */}
              {data.zones.map((zone: ZoneData) => (
                <div
                  key={zone.id}
                  className={`absolute rounded-xl border transition-all ${
                    selectedZone === zone.id
                      ? 'border-gray-900 border-2 opacity-100'
                      : selectedZone
                      ? `${zone.borderColor} opacity-25`
                      : `${zone.borderColor} opacity-60`
                  }`}
                  style={{
                    left: `${(zone.x / data.width) * 100}%`,
                    top: `${(zone.y / data.height) * 100}%`,
                    width: `${(zone.width / data.width) * 100}%`,
                    height: `${(zone.height / data.height) * 100}%`,
                  }}
                >
                  <div className={`absolute top-1 left-2 flex items-center gap-1 ${zone.color}`}>
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`${zone.icon} text-[10px]`}></i>
                    </div>
                    <span className="text-[9px] font-bold">{zone.label}</span>
                  </div>
                </div>
              ))}

              {/* 좌석 버튼 */}
              {data.seats.map((seat: SeatData) => {
                const colors = getRatingColor(seat.rating);
                const isFiltered = !!(selectedZone && seat.zone !== selectedZone);
                const isHovered = hoveredSeat?.id === seat.id;
                const hasPlug = seat.tags.includes('콘센트 있음') || seat.tags.includes('USB 충전 가능');

                return (
                  <button
                    key={seat.id}
                    onClick={() => !isFiltered && handleSeatClick(seat)}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    onTouchStart={() => setHoveredSeat(seat)}
                    onTouchEnd={() => setHoveredSeat(null)}
                    className={`absolute rounded-lg border-2 flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
                      isFiltered
                        ? 'opacity-10 cursor-not-allowed'
                        : isHovered
                        ? 'scale-110 shadow-lg z-30'
                        : 'hover:scale-110 hover:shadow-md hover:z-30'
                    } ${
                      showHeatmap && !isFiltered
                        ? `${colors.bg} ${colors.border} ${colors.text}`
                        : isFiltered
                        ? 'bg-gray-100 border-gray-200 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
                    }`}
                    style={{
                      left: `${(seat.x / data.width) * 100}%`,
                      top: `${(seat.y / data.height) * 100}%`,
                      width: `${(seat.width / data.width) * 100}%`,
                      height: `${(seat.height / data.height) * 100}%`,
                    }}
                  >
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`${typeIcon[seat.type]} text-[9px]`}></i>
                    </div>
                    <span className="text-[8px] font-bold leading-none mt-0.5">{seat.id}</span>
                    {showHeatmap && (
                      <span className="text-[7px] opacity-80 leading-none">{seat.rating.toFixed(1)}</span>
                    )}
                    {hasPlug && !isFiltered && (
                      <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm z-10">
                        <i className="ri-plug-line text-[7px] text-white"></i>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 호버/터치 툴팁 */}
        {hoveredSeat && (
          <div className="bg-gray-900 text-white rounded-xl p-3 sm:p-4 text-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className={`${typeIcon[hoveredSeat.type]} text-sm`}></i>
                </div>
                <span className="font-bold text-sm truncate">{hoveredSeat.id} — {typeLabel[hoveredSeat.type]}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <i className="ri-star-fill text-yellow-400 text-xs"></i>
                <span className="font-semibold text-sm">{hoveredSeat.rating.toFixed(1)}</span>
                <span className="text-white/50 text-xs hidden sm:inline">({hoveredSeat.reviewCount}개 리뷰)</span>
              </div>
            </div>
            {hoveredSeat.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {hoveredSeat.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{tag}</span>
                ))}
              </div>
            )}
            <p className="text-white/50 text-xs">클릭하면 태그를 선택하고 리뷰를 작성합니다</p>
          </div>
        )}

        {/* 선택된 구역 안내 */}
        {selectedZone && (
          <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className={`${data.zones.find((z: ZoneData) => z.id === selectedZone)?.icon} text-sm`}></i>
              </div>
              <span className="font-semibold whitespace-nowrap">{data.zones.find((z: ZoneData) => z.id === selectedZone)?.label}</span>
              <span className="text-white/60 text-xs truncate hidden sm:inline">— {data.zones.find((z: ZoneData) => z.id === selectedZone)?.description}</span>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        )}
      </div>

      {/* 태그 선택 바텀시트 */}
      {tagTargetSeat && (
        <TagSelector
          seat={tagTargetSeat}
          onConfirm={handleTagConfirm}
          onCancel={() => setTagTargetSeat(null)}
        />
      )}
    </>
  );
}
