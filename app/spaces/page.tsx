import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SpaceCard from '@/components/SpaceCard';
import Button from '@/components/ui/Button';

export default async function SpacesPage() {
  const supabase = await createClient();

  const { data: spaces } = await supabase
    .from('spaces')
    .select(`
      *,
      seats:seats(count),
      posts:seats(posts(count))
    `)
    .order('created_at', { ascending: false });

  const spacesWithCounts = spaces?.map((space) => ({
    ...space,
    seats_count: space.seats?.[0]?.count || 0,
    posts_count: space.posts?.reduce((acc: number, seat: { posts: { count: number }[] }) =>
      acc + (seat.posts?.[0]?.count || 0), 0) || 0,
  })) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">공간 탐색</h1>
          <p className="text-foreground-muted mt-1">
            다양한 공간의 좌석별 풍경을 탐색해보세요
          </p>
        </div>
        <Link href="/spaces/new">
          <Button>공간 등록</Button>
        </Link>
      </div>

      {spacesWithCounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spacesWithCounts.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-background-subtle rounded-xl">
          <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            아직 등록된 공간이 없습니다
          </h3>
          <p className="text-foreground-muted mb-6">
            첫 번째 공간을 등록해보세요!
          </p>
          <Link href="/spaces/new">
            <Button>공간 등록하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
