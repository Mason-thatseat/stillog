import { type SeatData, type ZoneData } from '../../../mocks/reviewData';

interface SpaceStatsProps {
  spaceId: string;
  reviews?: Array<{
    id: string;
    seatId: string;
    rating: number;
    tags: string[];
    weather: string;
    verified: boolean;
    photoVerified?: boolean;
    locationVerified?: boolean;
  }>;
  totalRating?: number;
  totalReviews?: number;
}

export default function SpaceStats({ spaceId, reviews = [], totalRating, totalReviews }: SpaceStatsProps) {
  const safeRating = typeof totalRating === 'number' && !isNaN(totalRating) ? totalRating : 0;
  const safeReviews = typeof totalReviews === 'number' ? totalReviews : 0;

  // spaceLayouts는 Supabase에서 불러온 데이터 사용
  const data = {
    zones: [] as ZoneData[],
    seats: [] as SeatData[]
  };

  // 평점 분포
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));
  const maxCount = Math.max(...ratingDist.map(d => d.count), 1);

  // 인기 태그 Top 5
  const tagCount: Record<string, number> = {};
  reviews.forEach(r => r.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 구역별 평균 평점
  const zoneStats = data.zones.map((zone: ZoneData) => {
    const seats = data.seats.filter((s: SeatData) => s.zone === zone.id);
    const avg = seats.length ? seats.reduce((sum, s) => sum + s.rating, 0) / seats.length : 0;
    const reviewCount = reviews.filter(r => seats.some((s: SeatData) => s.id === r.seatId)).length;
    return { zone, avg, reviewCount };
  });

  // 날씨별 방문
  const weatherCount: Record<string, number> = {};
  reviews.forEach(r => { weatherCount[r.weather] = (weatherCount[r.weather] || 0) + 1; });
  const topWeather = Object.entries(weatherCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // 인증 비율
  const verifiedCount = reviews.filter(r => r.verified).length;
  const photoVerifiedCount = reviews.filter(r => r.photoVerified).length;
  const locationVerifiedCount = reviews.filter(r => r.locationVerified).length;

  return (
    <div className="space-y-5">
      {/* 종합 평점 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">종합 평점</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black text-gray-900">{safeRating.toFixed(1)}</span>
            <div className="flex items-center gap-0.5 mt-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-4 h-4 flex items-center justify-center">
                  <i className={`text-sm ${i <= Math.round(safeRating) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-200'}`}></i>
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-400 mt-1">{safeReviews}개 리뷰</span>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-star-fill text-amber-400 text-[10px]"></i>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 구역별 평점 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">구역별 평점</h3>
        <div className="space-y-2.5">
          {zoneStats.map(({ zone, avg, reviewCount }) => (
            <div key={zone.id} className="flex items-center gap-3">
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${zone.bgColor} ${zone.color} flex-shrink-0`}>
                <i className={`${zone.icon} text-xs`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{zone.label}</span>
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-amber-400 text-[10px]"></i>
                    <span className="text-xs font-bold text-gray-900">{avg.toFixed(1)}</span>
                    <span className="text-[10px] text-gray-400">({reviewCount})</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${(avg / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인기 태그 */}
      {topTags.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-3">자주 언급된 특징</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium rounded-full"
              >
                {tag}
                <span className="px-1.5 py-0.5 bg-stone-200 text-stone-600 text-[10px] font-bold rounded-full">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 날씨별 방문 */}
      {topWeather.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-3">날씨별 방문</h3>
          <div className="grid grid-cols-2 gap-2">
            {topWeather.map(([weather, count]) => (
              <div key={weather} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                <span className="text-lg">{weather.split(' ')[1] || '🌡️'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{weather.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400">{count}회 방문</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 인증 현황 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">리뷰 신뢰도</h3>
        <div className="space-y-2.5">
          {[
            { label: '인증 리뷰', count: verifiedCount, icon: 'ri-shield-check-line', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: '날짜 인증', count: photoVerifiedCount, icon: 'ri-camera-line', color: 'text-sky-500', bg: 'bg-sky-50' },
            { label: '위치 인증', count: locationVerifiedCount, icon: 'ri-map-pin-line', color: 'text-rose-500', bg: 'bg-rose-50' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${item.bg} flex-shrink-0`}>
                <i className={`${item.icon} text-xs ${item.color}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{item.label}</span>
                  <span className="text-xs font-bold text-gray-900">
                    {reviews.length > 0 ? Math.round((item.count / reviews.length) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${reviews.length > 0 ? (item.count / reviews.length) * 100 : 0}%`,
                      background: item.color.includes('emerald') ? '#10b981' : item.color.includes('sky') ? '#0ea5e9' : '#f43f5e',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
