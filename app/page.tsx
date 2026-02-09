import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SpaceCard from '@/components/SpaceCard';
import PostCard from '@/components/PostCard';
import Button from '@/components/ui/Button';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch popular spaces
  const { data: spaces } = await supabase
    .from('spaces')
    .select(`
      *,
      seats:seats(count),
      posts:seats(posts(count))
    `)
    .order('created_at', { ascending: false })
    .limit(6);

  // Transform data to include counts
  const spacesWithCounts = spaces?.map((space) => ({
    ...space,
    seats_count: space.seats?.[0]?.count || 0,
    posts_count: space.posts?.reduce((acc: number, seat: { posts: { count: number }[] }) =>
      acc + (seat.posts?.[0]?.count || 0), 0) || 0,
  })) || [];

  // Fetch recent posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*),
      seat:seats(
        *,
        space:spaces(*)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative hero-gradient noise-overlay overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-accent/5 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-[15%] w-48 h-48 rounded-full bg-accent-light/10 blur-3xl animate-float animation-delay-300" />

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block text-sm font-medium text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
              좌석마다 다른 이야기
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight animate-fade-in-up animation-delay-150">
              공간의 시선을<br />기록하다
            </h1>
            <p className="text-lg md:text-xl text-foreground-muted mb-10 leading-relaxed animate-fade-in-up animation-delay-300">
              카페, 도서관, 공유 오피스.<br className="sm:hidden" />
              좌석마다 다른 풍경을 발견하고,
              나만의 자리를 기록하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up animation-delay-500">
              <Link href="/spaces">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-shadow">
                  공간 탐색하기
                </Button>
              </Link>
              <Link href="/spaces/new">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  공간 등록하기
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-fade-in-up animation-delay-700">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">{spacesWithCounts.length || 0}</p>
              <p className="text-sm text-foreground-muted mt-1">등록된 공간</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">{posts?.length || 0}</p>
              <p className="text-sm text-foreground-muted mt-1">기록된 시선</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background-subtle border-y border-border">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-3">How it works</h2>
            <p className="text-2xl md:text-3xl font-bold text-foreground">세 단계로 시작하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">공간을 찾아보세요</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                카페, 도서관, 공유 오피스 등<br />
                다양한 공간을 탐색해 보세요
              </p>
              {/* Connector line (hidden on mobile) */}
              <div className="hidden md:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] border-t-2 border-dashed border-accent/20" />
            </div>
            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">좌석의 시선을 확인</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                각 좌석에서 바라본 풍경과<br />
                다른 사람들의 후기를 살펴보세요
              </p>
              <div className="hidden md:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] border-t-2 border-dashed border-accent/20" />
            </div>
            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">나만의 기록을 남기세요</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                마음에 드는 자리를 발견했다면<br />
                사진과 함께 기록을 남겨보세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Spaces */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-2">Spaces</h2>
            <p className="text-2xl md:text-3xl font-bold text-foreground">인기 공간</p>
          </div>
          <Link href="/spaces" className="text-sm text-accent hover:text-accent/80 font-medium transition-colors flex items-center gap-1">
            전체 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {spacesWithCounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spacesWithCounts.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-background-subtle rounded-2xl border border-border">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-foreground-muted mb-4">아직 등록된 공간이 없습니다</p>
            <Link href="/spaces/new">
              <Button variant="secondary">첫 번째 공간 등록하기</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Recent Posts */}
      <section className="bg-background-subtle border-y border-border">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-2">Posts</h2>
              <p className="text-2xl md:text-3xl font-bold text-foreground">최근 기록</p>
            </div>
          </div>
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showSeatInfo />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-foreground-muted">아직 등록된 기록이 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative hero-gradient noise-overlay overflow-hidden">
        <div className="absolute top-10 right-[20%] w-40 h-40 rounded-full bg-accent/5 blur-3xl animate-float" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            당신만의 시선을 기록해 보세요
          </h2>
          <p className="text-foreground-muted mb-8 max-w-md mx-auto">
            매일 앉는 그 자리, 누군가에게는 특별한 공간이 될 수 있습니다.
          </p>
          <Link href="/auth">
            <Button size="lg" className="shadow-lg shadow-accent/20">
              지금 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-accent">STILLOG</span>
              <span className="text-sm text-foreground-muted">공간의 시선을 기록하다</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/spaces" className="hover:text-foreground transition-colors">공간 탐색</Link>
              <Link href="/spaces/new" className="hover:text-foreground transition-colors">공간 등록</Link>
              <Link href="/auth" className="hover:text-foreground transition-colors">로그인</Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-foreground-muted">
            &copy; 2025 STILLOG. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
