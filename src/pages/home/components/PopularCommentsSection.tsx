
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface PopularPost {
  id: string;
  content: string;
  rating: number;
  image_url: string | null;
  created_at: string;
  seat_label: string;
  space_name: string;
  user_nickname: string;
  user_avatar: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '오늘';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

const FALLBACK_IMAGE = 'https://readdy.ai/api/search-image?query=cozy%20cafe%20interior%20warm%20lighting%20wooden%20table%20minimalist%20aesthetic%20soft%20bokeh%20background%20inviting%20atmosphere&width=600&height=400&seq=popular-fallback&orientation=landscape';

export default function PopularCommentsSection() {
  const [posts, setPosts] = useState<PopularPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTopPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          rating,
          image_url,
          created_at,
          seats (
            label,
            spaces (
              name
            )
          ),
          profiles (
            nickname,
            profile_image
          )
        `)
        .order('rating', { ascending: false })
        .limit(3);

      if (!error && data) {
        const mapped: PopularPost[] = data.map((p: any) => ({
          id: p.id,
          content: p.content ?? '',
          rating: p.rating ?? 0,
          image_url: p.image_url ?? null,
          created_at: p.created_at,
          seat_label: p.seats?.label ?? '좌석 정보 없음',
          space_name: p.seats?.spaces?.name ?? '매장 정보 없음',
          user_nickname: p.profiles?.nickname ?? '익명',
          user_avatar: p.profiles?.profile_image ?? null,
        }));
        setPosts(mapped);
      }
      setLoading(false);
    };

    fetchTopPosts();
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [featured, ...rest] = posts;

  if (loading) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
                이번 주 베스트
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">가장 인기 많은 리뷰</h2>
              <p className="text-gray-500 text-sm">좋아요를 가장 많이 받은 자리 이야기를 모았어요</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${i === 0 ? 'lg:col-span-3' : ''} rounded-2xl bg-gray-100 animate-pulse h-64`}></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
                이번 주 베스트
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">가장 인기 많은 리뷰</h2>
              <p className="text-gray-500 text-sm">좋아요를 가장 많이 받은 자리 이야기를 모았어요</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <i className="ri-chat-3-line text-4xl"></i>
            </div>
            <p className="text-sm">아직 등록된 리뷰가 없어요</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
              이번 주 베스트
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">가장 인기 많은 리뷰</h2>
            <p className="text-gray-500 text-sm">별점이 가장 높은 자리 이야기를 모았어요</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="ri-trophy-line text-accent-500"></i>
            <span>TOP 3</span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6">
          {/* Featured card */}
          {featured && (
            <div className="lg:col-span-3 rounded-3xl overflow-hidden bg-primary-50 border border-primary-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col">
              <div className="relative h-52 sm:h-64 overflow-hidden">
                <img
                  src={featured.image_url ?? FALLBACK_IMAGE}
                  alt={featured.space_name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-accent-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                  <i className="ri-trophy-fill"></i>
                  1위
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-accent-500">
                  <i className="ri-star-fill"></i>
                  {featured.rating}점
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                    {featured.user_avatar ? (
                      <img src={featured.user_avatar} alt={featured.user_nickname} className="w-full h-full object-cover object-top" />
                    ) : (
                      <i className="ri-user-line text-gray-400"></i>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{featured.user_nickname}</div>
                    <div className="text-xs text-gray-400">{timeAgo(featured.created_at)}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className={`ri-star-fill text-xs sm:text-sm ${i < featured.rating ? 'text-yellow-400' : 'text-gray-200'}`}></i>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
                  <div className="w-4 h-4 flex items-center justify-center text-accent-500 flex-shrink-0">
                    <i className="ri-store-2-line text-sm"></i>
                  </div>
                  <span className="text-xs text-gray-600 font-medium truncate">{featured.space_name}</span>
                  <span className="text-gray-300 flex-shrink-0">·</span>
                  <span className="text-xs text-accent-500 font-semibold whitespace-nowrap">{featured.seat_label}</span>
                </div>

                <p className="text-gray-700 leading-relaxed text-sm flex-1">{featured.content}</p>

                <div className="flex items-center justify-between pt-3 border-t border-primary-100">
                  <div className="text-xs text-gray-400">{new Date(featured.created_at).toLocaleDateString('ko-KR')}</div>
                  <button
                    onClick={() => toggleLike(featured.id)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      likedIds.has(featured.id) ? 'text-accent-500' : 'text-gray-400 hover:text-accent-400'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={likedIds.has(featured.id) ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                    </div>
                    좋아요
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Side cards */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            {rest.map((c, idx) => (
              <div
                key={c.id}
                className="rounded-2xl overflow-hidden bg-primary-50 border border-primary-100 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
              >
                <div className="relative h-36 sm:h-40 overflow-hidden">
                  <img
                    src={c.image_url ?? FALLBACK_IMAGE}
                    alt={c.space_name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-accent-500/90 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                    <i className="ri-medal-line"></i>
                    {idx + 2}위
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-accent-500">
                    <i className="ri-star-fill"></i>
                    {c.rating}점
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                      {c.user_avatar ? (
                        <img src={c.user_avatar} alt={c.user_nickname} className="w-full h-full object-cover object-top" />
                      ) : (
                        <i className="ri-user-line text-gray-400 text-xs"></i>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{c.user_nickname}</div>
                      <div className="text-xs text-gray-400">{timeAgo(c.created_at)}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`ri-star-fill text-xs ${i < c.rating ? 'text-yellow-400' : 'text-gray-200'}`}></i>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5">
                    <div className="w-3 h-3 flex items-center justify-center text-accent-500 flex-shrink-0">
                      <i className="ri-store-2-line text-xs"></i>
                    </div>
                    <span className="text-xs text-gray-600 font-medium truncate">{c.space_name}</span>
                    <span className="text-gray-300 flex-shrink-0">·</span>
                    <span className="text-xs text-accent-500 font-semibold whitespace-nowrap">{c.seat_label}</span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{c.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-primary-100">
                    <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('ko-KR')}</div>
                    <button
                      onClick={() => toggleLike(c.id)}
                      className={`flex items-center gap-1 text-xs transition-colors cursor-pointer whitespace-nowrap ${
                        likedIds.has(c.id) ? 'text-accent-500' : 'text-gray-400 hover:text-accent-400'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={likedIds.has(c.id) ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                      </div>
                      좋아요
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
