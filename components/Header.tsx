'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Button from './ui/Button';

export default function Header() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [stats, setStats] = useState({ posts: 0, spaces: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fetch user stats when dropdown opens
  useEffect(() => {
    if (!showDropdown || !user) return;
    const supabase = createClient();

    const fetchStats = async () => {
      const [{ count: postsCount }, { count: spacesCount }] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('spaces').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
      ]);
      setStats({ posts: postsCount || 0, spaces: spacesCount || 0 });
    };

    fetchStats();
  }, [showDropdown, user]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <>
    <header className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-accent tracking-tight">
          STILLOG
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/spaces"
            className="text-sm text-foreground-muted hover:text-foreground rounded-md px-3 py-1.5 transition-colors duration-150"
          >
            공간 탐색
          </Link>
          <Link
            href="/feedback"
            className="text-sm text-foreground-muted hover:text-foreground rounded-md px-3 py-1.5 transition-colors duration-150"
          >
            의견
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/spaces/new"
                className="text-sm text-foreground-muted hover:text-foreground rounded-md px-3 py-1.5 transition-colors duration-150"
              >
                공간 등록
              </Link>
              <div className="w-px h-5 bg-border mx-1" />

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-subtle rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  {profile?.profile_image ? (
                    <Image
                      src={profile.profile_image}
                      alt={profile.nickname}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent">
                      {profile?.nickname?.[0] || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline font-medium">{profile?.nickname}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-border shadow-xl shadow-black/8 py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-foreground text-sm">{profile?.nickname}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{profile?.email}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 px-4 py-3 border-b border-border">
                      <div className="text-center flex-1">
                        <p className="text-lg font-bold text-foreground">{stats.posts}</p>
                        <p className="text-xs text-foreground-muted">게시물</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-lg font-bold text-foreground">{stats.spaces}</p>
                        <p className="text-xs text-foreground-muted">등록 공간</p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-background-subtle transition-colors"
                      >
                        <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        내 프로필
                      </Link>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          signOut();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : !authLoading ? (
            <Link href="/auth" className="ml-1">
              <Button size="sm">로그인</Button>
            </Link>
          ) : (
            <div className="w-16 h-8" />
          )}
        </nav>
      </div>
    </header>

    {/* Mobile bottom tab bar */}
    <nav className="mobile-tabbar md:hidden flex items-center justify-around h-16 px-2">
      {[
        {
          href: '/',
          label: '홈',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          ),
        },
        {
          href: '/spaces',
          label: '공간',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          ),
        },
        {
          href: '/feedback',
          label: '의견',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          ),
        },
        {
          href: user ? '/profile' : '/auth',
          label: user ? '프로필' : '로그인',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          ),
        },
      ].map(({ href, label, icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 flex-1 text-[10px] font-medium leading-none transition-colors duration-150 ${
              isActive ? 'text-accent' : 'text-foreground-muted'
            }`}
          >
            {icon}
            {label}
          </Link>
        );
      })}
    </nav>
    </>
  );
}
