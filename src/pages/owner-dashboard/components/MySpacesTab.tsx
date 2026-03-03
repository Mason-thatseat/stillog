import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';

interface SpaceWithStats {
  id: string;
  name: string;
  address: string;
  reviewCount: number;
  avgRating: number;
  favoriteCount: number;
  created_at: string;
}

export default function MySpacesTab() {
  const { user } = useAuthStore();
  const [spaces, setSpaces] = useState<SpaceWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMySpaces();
    }
  }, [user]);

  const fetchMySpaces = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 내 매장 목록 조회
      const { data: spacesData, error: spacesError } = await supabase
        .from('spaces')
        .select('id, name, address, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (spacesError) throw spacesError;

      if (!spacesData || spacesData.length === 0) {
        setSpaces([]);
        setLoading(false);
        return;
      }

      // 각 매장의 통계 계산
      const spacesWithStats = await Promise.all(
        spacesData.map(async (space) => {
          // 리뷰 수와 평균 평점 계산
          const { data: seats } = await supabase
            .from('seats')
            .select('id')
            .eq('space_id', space.id);

          const seatIds = seats?.map((s) => s.id) || [];

          let reviewCount = 0;
          let avgRating = 0;

          if (seatIds.length > 0) {
            const { data: posts } = await supabase
              .from('posts')
              .select('rating')
              .in('seat_id', seatIds);

            reviewCount = posts?.length || 0;
            if (reviewCount > 0) {
              const totalRating = posts?.reduce((sum, p) => sum + p.rating, 0) || 0;
              avgRating = totalRating / reviewCount;
            }
          }

          // 저장 수 계산
          const { count: favoriteCount } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('space_id', space.id);

          return {
            id: space.id,
            name: space.name,
            address: space.address,
            reviewCount,
            avgRating,
            favoriteCount: favoriteCount || 0,
            created_at: space.created_at,
          };
        })
      );

      setSpaces(spacesWithStats);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="flex gap-6">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <i className="ri-store-2-line text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 매장이 없습니다</h3>
        <p className="text-gray-600 mb-6">첫 매장을 등록하고 리뷰를 받아보세요!</p>
        <Link
          to="/space-register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          매장 등록하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {spaces.map((space) => (
        <div key={space.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-teal-500 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{space.name}</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <i className="ri-map-pin-line"></i>
                {space.address}
              </p>
            </div>
            <Link
              to={`/space/${space.id}`}
              className="px-4 py-2 text-teal-500 border border-teal-500 rounded-lg hover:bg-teal-50 transition-colors whitespace-nowrap"
            >
              매장 보기
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <i className="ri-star-fill text-yellow-400"></i>
              <span className="font-semibold text-gray-900">
                {space.avgRating > 0 ? space.avgRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-gray-500">평점</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-chat-3-line text-gray-400"></i>
              <span className="font-semibold text-gray-900">{space.reviewCount}</span>
              <span className="text-gray-500">리뷰</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-bookmark-line text-gray-400"></i>
              <span className="font-semibold text-gray-900">{space.favoriteCount}</span>
              <span className="text-gray-500">저장</span>
            </div>
            <div className="flex items-center gap-2 ml-auto text-gray-500">
              <i className="ri-calendar-line"></i>
              <span>{new Date(space.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
