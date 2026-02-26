'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';

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
  const formattedDate = formatDate(post.created_at);

  return (
    <article className="group bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer relative">
      {/* Stretched link covers the whole card; inner links sit above it via relative z-10 */}
      <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10" aria-label="포스트 상세 보기" />
      <div className="aspect-square relative bg-background-subtle overflow-hidden">
        <Image
          src={post.image_url}
          alt={post.content ? post.content.substring(0, 50) : '좌석에서 본 풍경'}
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
        {/* Instagram-style hover overlay */}
        <div className="post-card-overlay pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
            {showSeatInfo && post.seat?.space && (
              <p className="text-[11px] text-white/80 font-medium mb-0.5 truncate">
                {post.seat.space.name} · {post.seat.label || '좌석'}
              </p>
            )}
            {post.content && (
              <p className="text-xs text-white leading-snug line-clamp-2">{post.content}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-white/70 font-medium">{post.profile?.nickname}</span>
              <time className="text-[11px] text-white/60">{formattedDate}</time>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
