'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import type { Post } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, profile:profiles(*), seat:seats(*, space:spaces(*))')
        .eq('id', id)
        .single();

      if (!cancelled) {
        setPost(data);
        setLoading(false);
      }
    };

    fetchPost();
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!post || !user || user.id !== post.user_id) return;
    setDeleting(true);

    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (!error) {
      const spaceId = post.seat?.space?.id;
      const seatId = post.seat_id;
      if (spaceId && seatId) {
        router.push(`/spaces/${spaceId}/seats/${seatId}`);
      } else {
        router.push('/');
      }
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">포스트를 찾을 수 없습니다</h1>
        <Button onClick={() => router.back()}>뒤로 가기</Button>
      </div>
    );
  }

  const space = post.seat?.space;
  const seat = post.seat;
  const isOwner = user?.id === post.user_id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/spaces" className="hover:text-foreground">공간</Link>
        {space && (
          <>
            <span>/</span>
            <Link href={`/spaces/${space.id}`} className="hover:text-foreground">
              {space.name}
            </Link>
          </>
        )}
        {seat && space && (
          <>
            <span>/</span>
            <Link href={`/spaces/${space.id}/seats/${post.seat_id}`} className="hover:text-foreground">
              {seat.label || '좌석'}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">포스트</span>
      </nav>

      {/* Image */}
      <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-background-subtle mb-6 border border-border">
        <Image
          src={post.image_url}
          alt={post.content ? post.content.substring(0, 50) : `${space?.name || ''} 좌석에서 본 풍경`}
          fill
          className="object-cover"
          priority
        />
        {post.rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-foreground">{post.rating}</span>
          </div>
        )}
      </div>

      {/* Author & meta */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.profile?.profile_image ? (
            <Image
              src={post.profile.profile_image}
              alt={post.profile.nickname}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-sm font-medium text-accent">
              {post.profile?.nickname?.[0] || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{post.profile?.nickname}</p>
            <time className="text-xs text-foreground-muted">{formatDateTime(post.created_at)}</time>
          </div>
        </div>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
          >
            삭제
          </Button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}
    </div>
  );
}
