import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';

interface SpaceReview {
  id: string;
  spaceName: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  seatName: string;
}

interface SpaceStats {
  spaceId: string;
  spaceName: string;
  totalReviews: number;
  avgRating: number;
  ratingDistribution: { [key: number]: number };
}

export default function ReviewStatusTab() {
  const { user } = useAuthStore();
  const [selectedSpace, setSelectedSpace] = useState<string>('all');
  const [spaces, setSpaces] = useState<SpaceStats[]>([]);
  const [reviews, setReviews] = useState<SpaceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSpacesAndReviews();
    }
  }, [user]);

  useEffect(() => {
    if (spaces.length > 0) {
      fetchReviews();
    }
  }, [selectedSpace, spaces]);

  const fetchSpacesAndReviews = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 내 매장 목록 조회
      const { data: spaces, error: spacesError } = await supabase
        .from('spaces')
        .select('id, name')
        .eq('created_by', user.id);

      if (spacesError) throw spacesError;

      if (!spaces || spaces.length === 0) {
        setSpaces([]);
        setReviews([]);
        setLoading(false);
        return;
      }

      // 각 매장의 리뷰 통계 계산
      const spaceStats = await Promise.all(
        spaces.map(async (space) => {
          const { data: seats } = await supabase
            .from('seats')
            .select('id')
            .eq('space_id', space.id);

          const seatIds = seats?.map((s) => s.id) || [];

          let totalReviews = 0;
          let avgRating = 0;
          const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

          if (seatIds.length > 0) {
            const { data: posts } = await supabase
              .from('posts')
              .select('rating')
              .in('seat_id', seatIds);

            totalReviews = posts?.length || 0;

            if (totalReviews > 0) {
              const totalRating = posts?.reduce((sum, p) => sum + p.rating, 0) || 0;
              avgRating = totalRating / totalReviews;

              posts?.forEach((post) => {
                ratingDistribution[post.rating] = (ratingDistribution[post.rating] || 0) + 1;
              });
            }
          }

          return {
            spaceId: space.id,
            spaceName: space.name,
            totalReviews,
            avgRating,
            ratingDistribution,
          };
        })
      );

      setSpaces(spaceStats);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!user || spaces.length === 0) return;

    try {
      const spaceIds = selectedSpace === 'all'
        ? spaces.map((v) => v.spaceId)
        : [selectedSpace];

      // 선택된 매장들의 좌석 조회
      const { data: seats } = await supabase
        .from('seats')
        .select('id, space_id, name')
        .in('space_id', spaceIds);

      if (!seats || seats.length === 0) {
        setReviews([]);
        return;
      }

      const seatIds = seats.map((s) => s.id);

      // 리뷰 조회
      const { data: posts } = await supabase
        .from('posts')
        .select('id, seat_id, user_id, rating, content, image_url, created_at')
        .in('seat_id', seatIds)
        .order('created_at', { ascending: false });

      if (!posts || posts.length === 0) {
        setReviews([]);
        return;
      }

      // 유저 정보 조회
      const userIds = [...new Set(posts.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .in('id', userIds);

      // 매장 정보 매핑
      const spaceMap = new Map(spaces.map((v) => [v.spaceId, v.spaceName]));
      const seatMap = new Map(seats.map((s) => [s.id, { name: s.name, spaceId: s.space_id }]));
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const reviewsWithDetails: SpaceReview[] = posts.map((post) => {
        const seat = seatMap.get(post.seat_id);
        const profile = profileMap.get(post.user_id);
        const spaceName = seat ? spaceMap.get(seat.spaceId) || '알 수 없음' : '알 수 없음';

        return {
          id: post.id,
          spaceName,
          userName: profile?.nickname || '익명',
          userAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`,
          rating: post.rating,
          content: post.content,
          imageUrl: post.image_url,
          createdAt: post.created_at,
          seatName: seat?.name || '알 수 없음',
        };
      });

      setReviews(reviewsWithDetails);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const currentStats = selectedSpace === 'all'
    ? {
        totalReviews: spaces.reduce((sum, v) => sum + v.totalReviews, 0),
        avgRating: spaces.length > 0
          ? spaces.reduce((sum, v) => sum + v.avgRating * v.totalReviews, 0) /
            spaces.reduce((sum, v) => sum + v.totalReviews, 0)
          : 0,
        ratingDistribution: spaces.reduce(
          (acc, v) => {
            Object.entries(v.ratingDistribution).forEach(([rating, count]) => {
              acc[Number(rating)] = (acc[Number(rating)] || 0) + count;
            });
            return acc;
          },
          { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as { [key: number]: number }
        ),
      }
    : spaces.find((v) => v.spaceId === selectedSpace) || {
        totalReviews: 0,
        avgRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <i className="ri-chat-3-line text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 매장이 없습니다</h3>
        <p className="text-gray-600">매장을 먼저 등록해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 매장 선택 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">매장 선택</label>
        <select
          value={selectedSpace}
          onChange={(e) => setSelectedSpace(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">전체 매장</option>
          {spaces.map((space) => (
            <option key={space.spaceId} value={space.spaceId}>
              {space.spaceName}
            </option>
          ))}
        </select>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <i className="ri-chat-3-line text-2xl text-teal-500"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 리뷰</p>
              <p className="text-2xl font-bold text-gray-900">{currentStats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ri-star-fill text-2xl text-yellow-500"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">평균 평점</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.avgRating > 0 ? currentStats.avgRating.toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">별점 분포</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = currentStats.ratingDistribution[rating] || 0;
              const percentage = currentStats.totalReviews > 0 ? (count / currentStats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{rating}점</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">최근 리뷰</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reviews.length === 0 ? (
            <div className="p-12 text-center">
              <i className="ri-chat-3-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">아직 리뷰가 없습니다.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.userName}</p>
                        <p className="text-sm text-gray-600">
                          {review.spaceName} · {review.seatName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`ri-star-fill text-sm ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    {review.imageUrl && (
                      <img
                        src={review.imageUrl}
                        alt="리뷰 이미지"
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}