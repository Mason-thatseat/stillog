'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatDateTime, transformSpacesWithCounts } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import PostCard from '@/components/PostCard';
import SpaceCard from '@/components/SpaceCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Post, Space, Feedback } from '@/lib/types';

type TabType = 'writings' | 'activity' | 'info';

interface TimelineItem {
  id: string;
  type: 'post' | 'space' | 'feedback';
  title: string;
  description: string;
  created_at: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('writings');
  const [posts, setPosts] = useState<Post[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [contentLoading, setContentLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

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

    try {
      const [postsResult, spacesResult, feedbackResult] = await Promise.all([
        supabase
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
          .order('created_at', { ascending: false }),

        supabase
          .from('spaces')
          .select(`
            *,
            seats:seats(count),
            posts:seats(posts(count))
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setPosts(postsResult.data || []);
      setSpaces(transformSpacesWithCounts(spacesResult.data));
      setFeedbacks(feedbackResult.data || []);
    } finally {
      setContentLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);
    setProfileError('');

    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id);

    if (!error) {
      setIsEditing(false);
      router.refresh();
    } else {
      setProfileError('닉네임 저장에 실패했습니다. 다시 시도해주세요.');
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
      setProfileError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    }

    setSaving(false);
  };

  const timeline = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [
      ...posts.map((post) => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        title: '포스트 작성',
        description: post.content || '(내용 없음)',
        created_at: post.created_at,
      })),
      ...spaces.map((space) => ({
        id: `space-${space.id}`,
        type: 'space' as const,
        title: '공간 등록',
        description: space.name,
        created_at: space.created_at,
      })),
      ...feedbacks.map((fb) => ({
        id: `feedback-${fb.id}`,
        type: 'feedback' as const,
        title: '피드백 작성',
        description: fb.content,
        created_at: fb.created_at,
      })),
    ];
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, spaces, feedbacks]);

  const ratedPosts = posts.filter(p => p.rating != null && p.rating > 0);
  const avgRating = ratedPosts.length > 0
    ? ratedPosts.reduce((sum, p) => sum + p.rating!, 0) / ratedPosts.length
    : 0;


  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </div>
    );
  }

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

  const tabs: { key: TabType; label: string }[] = [
    { key: 'writings', label: '입력한 글' },
    { key: 'activity', label: '활동' },
    { key: 'info', label: '내 정보' },
  ];

  const timelineTypeIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'post':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'space':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'feedback':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  const timelineTypeColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-600';
      case 'space': return 'bg-green-100 text-green-600';
      case 'feedback': return 'bg-purple-100 text-purple-600';
    }
  };

  const timelineTypeLabel = (type: TimelineItem['type']) => {
    switch (type) {
      case 'post': return '포스트';
      case 'space': return '공간';
      case 'feedback': return '피드백';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-0 pb-24">
      {/* Profile Header — 전체 너비 배너 */}
      <div className="bg-background-subtle border-b border-border px-4 pt-10 pb-8 mb-0 -mx-4">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          {profile?.profile_image ? (
            <Image
              src={profile.profile_image}
              alt={displayName}
              width={96}
              height={96}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-4 ring-white"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent-light flex items-center justify-center text-xl font-semibold text-accent ring-4 ring-white">
              {displayInitial}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{displayName}</h1>
            <p className="text-foreground-muted text-sm mt-0.5">{displayEmail}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {contentLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* 탭 1: 입력한 글 */}
          {activeTab === 'writings' && (
            <div className="space-y-8">
              {/* 포스트 섹션 */}
              <section>
                <h2 className="text-base font-semibold text-foreground mb-4">
                  포스트 <span className="text-foreground-muted font-normal text-sm">({posts.length})</span>
                </h2>
                {posts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} showSeatInfo />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-background-subtle rounded-xl">
                    <p className="text-foreground-muted mb-4">아직 작성한 포스트가 없습니다</p>
                    <Button onClick={() => router.push('/spaces')}>
                      공간 탐색하기
                    </Button>
                  </div>
                )}
              </section>

              {/* 등록한 공간 섹션 */}
              <section>
                <h2 className="text-base font-semibold text-foreground mb-4">
                  등록한 공간 <span className="text-foreground-muted font-normal text-sm">({spaces.length})</span>
                </h2>
                {spaces.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {spaces.map((space) => (
                      <SpaceCard key={space.id} space={space} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-background-subtle rounded-xl">
                    <p className="text-foreground-muted mb-4">아직 등록한 공간이 없습니다</p>
                    <Button onClick={() => router.push('/spaces/new')}>
                      공간 등록하기
                    </Button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* 탭 2: 활동 */}
          {activeTab === 'activity' && (
            <div className="space-y-8">
              {/* 요약 통계 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-background-subtle rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold tabular-nums text-foreground">{posts.length}</p>
                  <p className="text-xs text-foreground-muted mt-1">총 포스트</p>
                </div>
                <div className="bg-background-subtle rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">평균 평점</p>
                </div>
                <div className="bg-background-subtle rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold tabular-nums text-foreground">{spaces.length}</p>
                  <p className="text-xs text-foreground-muted mt-1">등록 공간</p>
                </div>
                <div className="bg-background-subtle rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold tabular-nums text-foreground">{feedbacks.length}</p>
                  <p className="text-xs text-foreground-muted mt-1">피드백</p>
                </div>
              </div>

              {/* 타임라인 */}
              <section>
                <h2 className="text-base font-semibold text-foreground mb-4">활동 타임라인</h2>
                {timeline.length > 0 ? (
                  <div className="space-y-3">
                    {timeline.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 bg-white rounded-2xl border border-border/50 p-4 hover:border-border transition-colors duration-150"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${timelineTypeColor(item.type)}`}>
                          {timelineTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">{item.title}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${timelineTypeColor(item.type)}`}>
                              {timelineTypeLabel(item.type)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground-muted truncate">{item.description}</p>
                          <p className="text-xs text-foreground-muted mt-1">{formatDateTime(item.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-background-subtle rounded-xl">
                    <p className="text-foreground-muted">아직 활동 내역이 없습니다</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* 탭 3: 내 정보 */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-xl border border-border p-6 space-y-6">
              {/* 프로필 이미지 변경 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">프로필 이미지</label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {profile?.profile_image ? (
                    <Image
                      src={profile.profile_image}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center text-2xl font-semibold text-accent">
                      {displayInitial}
                    </div>
                  )}
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      loading={saving}
                    >
                      이미지 변경
                    </Button>
                    {profileError && !isEditing && (
                      <p className="text-sm text-red-500 mt-2">{profileError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 닉네임 수정 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">닉네임</label>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                    {profileError && (
                      <p className="text-sm text-red-500">{profileError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} loading={saving} size="sm">
                        저장
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setIsEditing(false);
                        setNickname(profile?.nickname || '');
                        setProfileError('');
                      }}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">{displayName}</span>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      수정
                    </Button>
                  </div>
                )}
              </div>

              {/* 이메일 (읽기전용) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">이메일</label>
                <p className="text-foreground-muted">{displayEmail || '-'}</p>
              </div>

              {/* 가입일 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">가입일</label>
                <p className="text-foreground-muted">
                  {profile?.created_at ? formatDate(profile.created_at) : '-'}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
