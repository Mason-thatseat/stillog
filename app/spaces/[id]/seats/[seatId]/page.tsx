'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import PostCard from '@/components/PostCard';
import Button from '@/components/ui/Button';
import type { Space, Seat, Post } from '@/lib/types';

export default function SeatDetailPage({
  params,
}: {
  params: Promise<{ id: string; seatId: string }>;
}) {
  const { id, seatId } = use(params);
  const [space, setSpace] = useState<Space | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [id, seatId]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch space
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single();

    setSpace(spaceData);

    // Fetch seat
    const { data: seatData } = await supabase
      .from('seats')
      .select('*')
      .eq('id', seatId)
      .single();

    setSeat(seatData);

    // Fetch posts
    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('seat_id', seatId)
      .order('created_at', { ascending: false });

    setPosts(postsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!space || !seat) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">좌석을 찾을 수 없습니다</h1>
        <Button onClick={() => router.push('/spaces')}>공간 목록으로</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/spaces" className="hover:text-foreground">
          공간
        </Link>
        <span>/</span>
        <Link href={`/spaces/${id}`} className="hover:text-foreground">
          {space.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{seat.label || '좌석'}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {seat.label || '좌석'}
          </h1>
          <p className="text-foreground-muted mt-1">
            {space.name}에서 본 풍경 {posts.length}개
          </p>
        </div>
        {user && (
          <Link href={`/posts/new?spaceId=${id}&seatId=${seatId}`}>
            <Button>포스트 작성</Button>
          </Link>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-background-subtle rounded-xl">
          <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            아직 포스트가 없습니다
          </h3>
          <p className="text-foreground-muted mb-6">
            이 좌석에서 본 풍경을 첫 번째로 공유해보세요!
          </p>
          {user ? (
            <Link href={`/posts/new?spaceId=${id}&seatId=${seatId}`}>
              <Button>포스트 작성하기</Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button>로그인하고 작성하기</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
