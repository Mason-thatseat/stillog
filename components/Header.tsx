'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Button from './ui/Button';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [stats, setStats] = useState({ posts: 0, spaces: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Delay showing auth UI to let auth resolve first
  useEffect(() => {
    const timer = setTimeout(() => setShowAuth(true), 400);
    return () => clearTimeout(timer);
  }, []);

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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-accent tracking-tight">
          STILLOG
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/spaces"
            className="text-sm text-foreground-muted hover:text-foreground hover:bg-background-subtle rounded-lg px-3 py-2 transition-colors"
          >
            공간 탐색
          </Link>
          <Link
            href="/feedback"
            className="text-sm text-foreground-muted hover:text-foreground hover:bg-background-subtle rounded-lg px-3 py-2 transition-colors"
          >
            의견
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/spaces/new"
                className="text-sm text-foreground-muted hover:text-foreground hover:bg-background-subtle rounded-lg px-3 py-2 transition-colors"
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
                    <img
                      src={profile.profile_image}
                      alt={profile.nickname}
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
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border shadow-lg py-2 z-50">
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
          ) : showAuth ? (
            <Link href="/auth" className="ml-1">
              <Button size="sm">로그인</Button>
            </Link>
          ) : (
            <div className="w-16 h-8" />
          )}
        </nav>
      </div>
    </header>
  );
}
