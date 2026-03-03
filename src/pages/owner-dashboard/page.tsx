import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import MySpacesTab from './components/MySpacesTab';
import ReviewStatusTab from './components/ReviewStatusTab';

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'spaces' | 'reviews'>('spaces');
  const [stats, setStats] = useState({
    totalSpaces: 0,
    weeklyReviews: 0,
    avgRating: 0,
    totalFavorites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 총 매장 수
      const { count: totalSpaces } = await supabase
        .from('spaces')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // 내 매장 목록
      const { data: spaces } = await supabase
        .from('spaces')
        .select('id')
        .eq('created_by', user.id);

      const spaceIds = spaces?.map((s) => s.id) || [];

      let weeklyReviews = 0;
      let totalRating = 0;
      let totalReviewCount = 0;

      if (spaceIds.length > 0) {
        // 각 매장의 좌석 조회
        const { data: seats } = await supabase
          .from('seats')
          .select('id')
          .in('space_id', spaceIds);

        const seatIds = seats?.map((s) => s.id) || [];

        if (seatIds.length > 0) {
          // 이번 주 리뷰 수
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const { count: weeklyCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .in('seat_id', seatIds)
            .gte('created_at', oneWeekAgo.toISOString());

          weeklyReviews = weeklyCount || 0;

          // 평균 평점 계산
          const { data: allPosts } = await supabase
            .from('posts')
            .select('rating')
            .in('seat_id', seatIds);

          if (allPosts && allPosts.length > 0) {
            totalReviewCount = allPosts.length;
            totalRating = allPosts.reduce((sum, p) => sum + p.rating, 0);
          }
        }
      }

      // 총 저장 수
      let totalFavorites = 0;
      if (spaceIds.length > 0) {
        const { count: favCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .in('space_id', spaceIds);

        totalFavorites = favCount || 0;
      }

      setStats({
        totalSpaces: totalSpaces || 0,
        weeklyReviews,
        avgRating: totalReviewCount > 0 ? totalRating / totalReviewCount : 0,
        totalFavorites,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">오너 대시보드</h1>
          <p className="text-gray-600">내 매장과 리뷰를 관리하세요</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 통계 카드 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <i className="ri-store-2-line text-2xl text-teal-500"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 매장</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSpaces}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-chat-3-line text-2xl text-blue-500"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">이번 주 리뷰</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weeklyReviews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="ri-star-fill text-2xl text-yellow-500"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">평균 평점</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0.0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <i className="ri-bookmark-line text-2xl text-pink-500"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 저장</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('spaces')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'spaces'
                  ? 'text-teal-500 border-b-2 border-teal-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-store-2-line mr-2"></i>
              내 매장
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'text-teal-500 border-b-2 border-teal-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-chat-3-line mr-2"></i>
              리뷰 현황
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'spaces' && <MySpacesTab />}
            {activeTab === 'reviews' && <ReviewStatusTab />}
          </div>
        </div>
      </div>
    </div>
  );
}