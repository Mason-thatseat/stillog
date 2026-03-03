import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface LiveStats {
  totalReviews: number | null;
  totalSpaces: number | null;
  avgRating: number | null;
  activeUsers: number | null;
}

function formatCount(n: number): string {
  if (n >= 10000) return (Math.floor(n / 1000) / 10).toFixed(1) + 'k';
  return n.toLocaleString();
}

export default function StatsSection() {
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalReviews: null,
    totalSpaces: null,
    avgRating: null,
    activeUsers: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [reviewsRes, spacesRes, usersRes] = await Promise.all([
        supabase.from('posts').select('rating', { count: 'exact' }),
        supabase.from('spaces').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      // 평균 평점 계산
      let avgRating = 0;
      if (reviewsRes.data && reviewsRes.data.length > 0) {
        const sum = reviewsRes.data.reduce((acc, post) => acc + (post.rating || 0), 0);
        avgRating = sum / reviewsRes.data.length;
      }

      setLiveStats({
        totalReviews: reviewsRes.count ?? 0,
        totalSpaces: spacesRes.count ?? 0,
        avgRating: avgRating,
        activeUsers: usersRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const reviewDisplay = liveStats.totalReviews !== null ? formatCount(liveStats.totalReviews) : '0';
  const spaceDisplay = liveStats.totalSpaces !== null ? formatCount(liveStats.totalSpaces) : '0';
  const ratingDisplay = liveStats.avgRating !== null ? liveStats.avgRating.toFixed(1) : '0.0';
  const usersDisplay = liveStats.activeUsers !== null ? formatCount(liveStats.activeUsers) : '0';

  return (
    <section className="py-16 sm:py-24 bg-primary-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 mb-10 sm:mb-16">
          <div className="lg:col-span-3">
            <div className="text-sm text-gray-600 font-medium">실시간 데이터</div>
          </div>
          <div className="lg:col-span-9">
            <p className="text-lg sm:text-2xl text-gray-700 leading-relaxed font-light">
              Stillog는 매일 수천 개의 좌석 경험 데이터를 수집하고 있습니다.
              이 데이터는 공간 운영자에게 실질적인 인사이트를 제공합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            {liveStats.totalReviews === null ? (
              <div className="h-10 sm:h-14 w-24 bg-gray-100 rounded-lg animate-pulse mb-2 sm:mb-3" />
            ) : (
              <div className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                {reviewDisplay}+
              </div>
            )}
            <div className="text-xs sm:text-sm text-gray-600">누적 리뷰 수</div>
          </div>
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            {liveStats.totalSpaces === null ? (
              <div className="h-10 sm:h-14 w-24 bg-gray-100 rounded-lg animate-pulse mb-2 sm:mb-3" />
            ) : (
              <div className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                {spaceDisplay}+
              </div>
            )}
            <div className="text-xs sm:text-sm text-gray-600">등록된 매장</div>
          </div>
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            {liveStats.avgRating === null ? (
              <div className="h-10 sm:h-14 w-24 bg-gray-100 rounded-lg animate-pulse mb-2 sm:mb-3" />
            ) : (
              <div className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                {ratingDisplay}
              </div>
            )}
            <div className="text-xs sm:text-sm text-gray-600">평균 평점</div>
          </div>
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            {liveStats.activeUsers === null ? (
              <div className="h-10 sm:h-14 w-24 bg-gray-100 rounded-lg animate-pulse mb-2 sm:mb-3" />
            ) : (
              <div className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                {usersDisplay}+
              </div>
            )}
            <div className="text-xs sm:text-sm text-gray-600">활성 사용자</div>
          </div>
        </div>
      </div>
    </section>
  );
}