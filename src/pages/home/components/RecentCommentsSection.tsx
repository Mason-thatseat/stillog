
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface RecentReview {
  id: string;
  content: string;
  rating: number;
  created_at: string;
  image_url: string | null;
  seat_id: string;
  user_id: string;
  profiles: {
    nickname: string;
    profile_image?: string;
  } | null;
  spaceName: string;
  spaceId: string;
  seatLabel: string;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
        <div className="h-6 w-12 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3.5 bg-gray-100 rounded w-32 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function RecentCommentsSection() {
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            rating,
            created_at,
            image_url,
            seat_id,
            user_id,
            profiles:user_id (nickname, profile_image)
          `)
          .order('created_at', { ascending: false })
          .limit(6);

        if (postsError) throw postsError;
        if (!posts || posts.length === 0) {
          setReviews([]);
          return;
        }

        const seatIds = posts.map((p) => p.seat_id).filter(Boolean);
        const { data: seats, error: seatsError } = await supabase
          .from('seats')
          .select(`id, label, space_id, spaces:space_id (id, name)`)
          .in('id', seatIds);

        if (seatsError) throw seatsError;

        const seatMap: Record<string, { spaceId: string; spaceName: string; seatLabel: string }> = {};
        (seats || []).forEach((seat: any) => {
          seatMap[seat.id] = {
            spaceId: seat.spaces?.id || '',
            spaceName: seat.spaces?.name || '매장명 없음',
            seatLabel: seat.label || '',
          };
        });

        const merged: RecentReview[] = posts.map((post: any) => ({
          id: post.id,
          content: post.content,
          rating: post.rating,
          created_at: post.created_at,
          image_url: post.image_url || null,
          seat_id: post.seat_id,
          user_id: post.user_id,
          profiles: post.profiles,
          spaceName: seatMap[post.seat_id]?.spaceName || '매장명 없음',
          spaceId: seatMap[post.seat_id]?.spaceId || '',
          seatLabel: seatMap[post.seat_id]?.seatLabel || '',
        }));

        setReviews(merged);
      } catch (err) {
        console.error('Failed to fetch recent reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-block text-teal-600 text-sm font-semibold tracking-widest uppercase mb-3">
            Real-time Reviews
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">최근 리뷰</h2>
          <p className="text-gray-500 text-base">실시간으로 올라오는 생생한 좌석 후기를 확인하세요</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
              <i className="ri-chat-3-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 text-base">아직 등록된 리뷰가 없어요</p>
            <p className="text-gray-400 text-sm mt-1">첫 번째 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                {review.image_url && (
                  <div className="w-full h-44 overflow-hidden">
                    <img
                      src={review.image_url}
                      alt="리뷰 이미지"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {review.profiles?.profile_image ? (
                          <img
                            src={review.profiles.profile_image}
                            alt="프로필"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <i className="ri-user-line text-teal-500 text-sm"></i>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">
                          {review.profiles?.nickname || '익명'}
                        </p>
                        <p className="text-xs text-gray-400">{timeAgo(review.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
                      <i className="ri-star-fill text-amber-400 text-xs"></i>
                      <span className="text-xs font-bold text-amber-600">{review.rating}.0</span>
                    </div>
                  </div>

                  <a
                    href={review.spaceId ? `/space/${review.spaceId}` : '#'}
                    className="flex items-center gap-1.5 mb-2.5 group/link"
                  >
                    <i className="ri-map-pin-2-line text-teal-500 text-xs"></i>
                    <span className="text-teal-600 font-medium text-xs hover:underline group-hover/link:text-teal-700">
                      {review.spaceName}
                    </span>
                    {review.seatLabel && (
                      <>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-gray-400 text-xs">{review.seatLabel}</span>
                      </>
                    )}
                  </a>

                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
