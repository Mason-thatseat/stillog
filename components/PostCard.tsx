'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  showSeatInfo?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 star ${star <= rating ? 'filled' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function PostCard({ post, showSeatInfo = false }: PostCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[4/3] relative bg-background-subtle overflow-hidden">
        <Image
          src={post.image_url}
          alt="좌석에서 본 풍경"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {post.rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium text-foreground">{post.rating}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        {showSeatInfo && post.seat?.space && (
          <Link
            href={`/spaces/${post.seat.space.id}`}
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium mb-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {post.seat.space.name} · {post.seat.label || '좌석'}
          </Link>
        )}

        {post.content && (
          <p className="text-sm text-foreground leading-relaxed line-clamp-2">
            {post.content}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {post.profile?.profile_image ? (
              <img
                src={post.profile.profile_image}
                alt={post.profile.nickname}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent">
                {post.profile?.nickname?.[0] || 'U'}
              </div>
            )}
            <span className="text-xs text-foreground-muted font-medium">
              {post.profile?.nickname}
            </span>
          </div>
          <time className="text-xs text-foreground-muted">{formattedDate}</time>
        </div>
      </div>
    </article>
  );
}
