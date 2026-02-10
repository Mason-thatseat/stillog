'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import PostCard from '@/components/PostCard';
import SpaceCard from '@/components/SpaceCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Post, Space } from '@/lib/types';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'spaces'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [contentLoading, setContentLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchUserContent();
    }
  }, [user]);

  const fetchUserContent = async () => {
    if (!user) return;

    setContentLoading(true);

    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(*),
        seat:seats(
          *,
          space:spaces(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setPosts(postsData || []);

    const { data: spacesData } = await supabase
      .from('spaces')
      .select(`
        *,
        seats:seats(count),
        posts:seats(posts(count))
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    const spacesWithCounts = spacesData?.map((space) => ({
      ...space,
      seats_count: space.seats?.[0]?.count || 0,
      posts_count: space.posts?.reduce((acc: number, seat: { posts: { count: number }[] }) =>
        acc + (seat.posts?.[0]?.count || 0), 0) || 0,
    })) || [];

    setSpaces(spacesWithCounts);
    setContentLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id);

    if (!error) {
      setIsEditing(false);
      router.refresh();
    }

    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', user.id);

      router.refresh();
    } catch (err) {
      console.error('Avatar upload failed:', err);
    }

    setSaving(false);
  };

  // Auth 로딩 중이면 빈 화면 (깜빡임 방지)
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  // 진짜로 로그인이 안 된 경우만 로그인 안내
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-foreground-muted mb-4">로그인이 필요합니다</p>
          <Button onClick={() => router.push('/auth')}>로그인하기</Button>
        </div>
      </div>
    );
  }

  const displayName = profile?.nickname || '사용자';
  const displayEmail = profile?.email || '';
  const displayInitial = displayName[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {profile?.profile_image ? (
              <img
                src={profile.profile_image}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center text-2xl font-semibold text-accent">
                {displayInitial}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-background-subtle transition-colors"
            >
              <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  id="nickname"
                  label="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile} loading={saving}>
                    저장
                  </Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-bold text-foreground">
                    {displayName}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    편집
                  </Button>
                </div>
                <p className="text-foreground-muted text-sm">{displayEmail}</p>
                <div className="flex gap-4 mt-4 text-sm">
                  <span>
                    <strong className="text-foreground">{posts.length}</strong>{' '}
                    <span className="text-foreground-muted">포스트</span>
                  </span>
                  <span>
                    <strong className="text-foreground">{spaces.length}</strong>{' '}
                    <span className="text-foreground-muted">등록 공간</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'posts'
              ? 'border-accent text-accent'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          내 포스트
        </button>
        <button
          onClick={() => setActiveTab('spaces')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'spaces'
              ? 'border-accent text-accent'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          등록한 공간
        </button>
      </div>

      {/* Content */}
      {contentLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : activeTab === 'posts' ? (
        posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showSeatInfo />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-background-subtle rounded-xl">
            <p className="text-foreground-muted mb-4">아직 작성한 포스트가 없습니다</p>
            <Button onClick={() => router.push('/spaces')}>
              공간 탐색하기
            </Button>
          </div>
        )
      ) : spaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-background-subtle rounded-xl">
          <p className="text-foreground-muted mb-4">아직 등록한 공간이 없습니다</p>
          <Button onClick={() => router.push('/spaces/new')}>
            공간 등록하기
          </Button>
        </div>
      )}
    </div>
  );
}
