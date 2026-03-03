import { useState } from 'react';
import { type SeatData, type ZoneData } from '../../../mocks/reviewData';

interface SpaceSeatMapProps {
  spaceId: string;
  reviews: Array<{
    id: string;
    seatId: string;
    rating: number;
    tags: string[];
  }>;
  onSeatSelect: (seatId: string) => void;
  selectedSeatId: string | null;
}

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

export default function SpaceSeatMap({ spaceId, reviews = [], onSeatSelect, selectedSeatId }: SpaceSeatMapProps) {
  const [hoveredSeat, setHoveredSeat] = useState<SeatData | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // spaceLayouts는 Supabase에서 불러온 데이터 사용
  const data = {
    width: 620,
    height: 500,
    windowSide: 'top' as const,
    entranceSide: 'bottom' as const,
    windows: [],
    entrances: [],
    fixtures: [],
    zones: [],
    seats: []
  };

  const reviewCountBySeat: Record<string, number> = {};
  reviews.forEach(r => {
    reviewCountBySeat[r.seatId] = (reviewCountBySeat[r.seatId] || 0) + 1;
  });

  const zoneAvgRating = (zoneId: string) => {
    const seats = data.seats.filter(s => s.zone === zoneId);
    if (!seats.length) return 0;
    return seats.reduce((sum, s) => sum + s.rating, 0) / seats.length;
  };

  const renderWindows = () => {
    const wins = data.windows || [];
    return wins.map(win => {
      const isHoriz = win.side === 'top' || win.side === 'bottom';
      const style: React.CSSProperties = isHoriz
        ? { left: `${(win.offset / data.width) * 100}%`, [win.side]: 0, width: `${(win.length / data.width) * 100}%`, height: 6 }
        : { top: `${(win.offset / data.height) * 100}%`, [win.side]: 0, width: 6, height: `${(win.length / data.height) * 100}%` };
      return (
        <div key={win.id} className="absolute z-10 bg-sky-300 flex items-center justify-center overflow-hidden" style={style}>
          {win.length > 60 && (
            <span className="text-sky-800 font-semibold pointer-events-none whitespace-nowrap" style={{ fontSize: 8, writingMode: isHoriz ? 'horizontal-tb' : 'vertical-rl' }}>
              <i className="ri-sun-line"></i> {win.label}
            </span>
          )}
        </div>
      );
    });
  };

  const renderEntrances = () => {
    const ents = data.entrances || [];
    return ents.map(en => {
      const isHoriz = en.side === 'top' || en.side === 'bottom';
      const bgColor = en.isMain ? 'bg-emerald-400' : 'bg-orange-400';
      const style: React.CSSProperties = isHoriz
        ? { left: `${(en.offset / data.width) * 100}%`, [en.side]: 0, width: `${(en.length / data.width) * 100}%`, height: 10 }
        : { top: `${(en.offset / data.height) * 100}%`, [en.side]: 0, width: 10, height: `${(en.length / data.height) * 100}%` };
      return (
        <div key={en.id} className={`absolute z-10 ${bgColor} flex items-center justify-center overflow-hidden`} style={style}>
          {en.length > 40 && (
            <span className="text-white font-bold pointer-events-none whitespace-nowrap" style={{ fontSize: 7, writingMode: isHoriz ? 'horizontal-tb' : 'vertical-rl' }}>
              {en.isMain ? '▶' : '▷'} {en.label}
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* 구역 필터 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
        {data.zones.map((zone: ZoneData) => {
          const avg = zoneAvgRating(zone.id);
          const isActive = selectedZone === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(isActive ? null : zone.id)}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white shadow-md scale-105'
                  : `${zone.borderColor} ${zone.bgColor} ${zone.color} hover:scale-105 hover:shadow-sm`
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${zone.icon} text-sm`}></i>
              </div>
              <span className="text-[9px] font-bold whitespace-nowrap">{zone.label}</span>
              <span className={`text-[8px] font-medium ${isActive ? 'text-white/70' : 'text-gray-400'}`}>★ {avg.toFixed(1)}</span>
            </button>
          );
        })}
      </div>

      {/* 히트맵 토글 + 범례 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[9px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block"></span>인기</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-300 inline-block"></span>높음</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-200 inline-block"></span>보통</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 inline-block"></span>낮음</span>
        </div>
        <button
          onClick={() => setShowHeatmap(v => !v)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            showHeatmap ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <i className="ri-fire-line"></i>
          히트맵 {showHeatmap ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* 평면도 */}
      <div className="relative w-full overflow-x-auto">
        <div
          className="relative bg-stone-50 rounded-2xl border-2 border-stone-200 overflow-hidden"
          style={{ width: '100%', paddingBottom: `${(data.height / data.width) * 100}%` }}
        >
          <div className="absolute inset-0">
            {renderWindows()}
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
              const isSelected = selectedSeatId === seat.id;
              const hasPlug = seat.tags.includes('콘센트 있음') || seat.tags.includes('USB 충전 가능');
              const hasReview = (reviewCountBySeat[seat.id] || 0) > 0;

              return (
                <button
                  key={seat.id}
                  onClick={() => !isFiltered && onSeatSelect(seat.id)}
                  onMouseEnter={() => setHoveredSeat(seat)}
                  onMouseLeave={() => setHoveredSeat(null)}
                  className={`absolute rounded-lg border-2 flex flex-col items-center justify-center transition-all z-20 cursor-pointer ${
                    isFiltered
                      ? 'opacity-10 cursor-not-allowed'
                      : isSelected
                      ? 'scale-110 shadow-xl z-30 ring-2 ring-offset-1 ring-gray-900'
                      : isHovered
                      ? 'scale-110 shadow-lg z-30'
                      : 'hover:scale-110 hover:shadow-md hover:z-30'
                  } ${
                    isSelected
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : showHeatmap && !isFiltered
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
                  {hasReview && !isFiltered && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm z-10">
                      <i className="ri-chat-1-fill text-[7px] text-white"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 호버 툴팁 */}
      {hoveredSeat && (
        <div className="bg-gray-900 text-white rounded-xl p-3 text-sm space-y-1.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`${typeIcon[hoveredSeat.type]} text-sm`}></i>
              </div>
              <span className="font-bold text-sm truncate">{hoveredSeat.id}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <i className="ri-star-fill text-yellow-400 text-xs"></i>
              <span className="font-semibold text-sm">{hoveredSeat.rating.toFixed(1)}</span>
              <span className="text-white/50 text-xs">({reviewCountBySeat[hoveredSeat.id] || 0}개 리뷰)</span>
            </div>
          </div>
          {hoveredSeat.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hoveredSeat.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}
          <p className="text-white/50 text-xs">클릭하면 이 자리로 리뷰를 작성해요</p>
        </div>
      )}

      {/* 범례 */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-rose-500 rounded-full inline-flex items-center justify-center">
            <i className="ri-chat-1-fill text-[7px] text-white"></i>
          </span>
          리뷰 있음
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-yellow-400 rounded-full inline-flex items-center justify-center">
            <i className="ri-plug-line text-[7px] text-white"></i>
          </span>
          콘센트
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-sky-300 inline-block"></span>창문
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-emerald-400 inline-block"></span>출입구
        </span>
      </div>
    </div>
  );
}
