'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import Button from './ui/Button';

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();

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

          {loading ? (
            <div className="spinner ml-2" />
          ) : user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/spaces/new"
                className="text-sm text-foreground-muted hover:text-foreground hover:bg-background-subtle rounded-lg px-3 py-2 transition-colors"
              >
                공간 등록
              </Link>
              <div className="w-px h-5 bg-border mx-1" />
              <Link
                href="/profile"
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
              </Link>
              <button
                onClick={signOut}
                title="로그아웃"
                className="text-foreground-muted hover:text-foreground hover:bg-background-subtle rounded-lg p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          ) : (
            <Link href="/auth" className="ml-1">
              <Button size="sm">로그인</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
