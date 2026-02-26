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
      <article className="group bg-white rounded-xl overflow-hidden hover:shadow-xl hover:shadow-black/15 hover:-translate-y-0.5 transition-all duration-300">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-semibold text-white text-sm truncate leading-tight">
                {space.name}
              </h3>
              {space.address && (
                <p className="text-[11px] text-white/70 mt-0.5 truncate">
                  {space.address}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-white/60">
                <span>좌석 {space.seats_count}</span>
                <span>포스트 {space.posts_count}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
