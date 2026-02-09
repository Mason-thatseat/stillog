'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Space } from '@/lib/types';

interface SpaceCardProps {
  space: Space;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${space.id}`}>
      <article className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
        <div className="aspect-[4/3] relative bg-background-subtle overflow-hidden">
          {space.floor_plan_url ? (
            <Image
              src={space.floor_plan_url}
              alt={space.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#F0E4D7]">
              <svg className="w-16 h-16 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 10h16M4 15h16M10 4v16M15 4v16" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
            {space.name}
          </h3>
          {space.address && (
            <p className="text-sm text-foreground-muted mt-1 truncate flex items-center gap-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {space.address}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 text-xs text-foreground-muted">
            {space.seats_count !== undefined && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                좌석 {space.seats_count}
              </span>
            )}
            {space.posts_count !== undefined && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                포스트 {space.posts_count}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
