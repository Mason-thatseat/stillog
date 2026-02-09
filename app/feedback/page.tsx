'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';

interface FeedbackItem {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: {
    id: string;
    nickname: string;
    profile_image: string | null;
  } | null;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const { user } = useAuth();

  const fetchFeedbacks = useCallback(async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*, profile:profiles(id, nickname, profile_image)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setFeedbacks(data as FeedbackItem[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('feedback')
      .insert({ user_id: user.id, content: content.trim() });

    if (!error) {
      setContent('');
      fetchFeedbacks();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await supabase.from('feedback').delete().eq('id', id);
    fetchFeedbacks();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">의견 게시판</h1>
        <p className="text-foreground-muted">
          STILLOG에 대한 의견, 건의사항, 피드백을 자유롭게 남겨주세요.
        </p>
      </div>

      {/* Write form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="의견을 작성해 주세요..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-foreground-muted">{content.length}/500</span>
            <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
              {submitting ? '등록 중...' : '의견 등록'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-background-subtle border border-border text-center">
          <p className="text-sm text-foreground-muted">
            의견을 작성하려면{' '}
            <a href="/auth" className="text-accent hover:underline font-medium">로그인</a>
            이 필요합니다.
          </p>
        </div>
      )}

      {/* Feedback list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-16 bg-background-subtle rounded-2xl border border-border">
          <svg className="w-12 h-12 mx-auto text-foreground-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-foreground-muted">아직 등록된 의견이 없습니다</p>
          <p className="text-sm text-foreground-muted/70 mt-1">첫 번째 의견을 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-4 rounded-xl bg-white border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {fb.profile?.profile_image ? (
                    <img
                      src={fb.profile.profile_image}
                      alt={fb.profile.nickname}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-medium text-accent">
                      {fb.profile?.nickname?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {fb.profile?.nickname || '익명'}
                  </span>
                  <span className="text-xs text-foreground-muted">
                    {formatTime(fb.created_at)}
                  </span>
                </div>
                {user?.id === fb.user_id && (
                  <button
                    onClick={() => handleDelete(fb.id)}
                    className="text-xs text-foreground-muted hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {fb.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
