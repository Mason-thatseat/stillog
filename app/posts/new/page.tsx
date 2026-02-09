'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import type { Space, Seat } from '@/lib/types';

function NewPostForm() {
  const searchParams = useSearchParams();
  const spaceId = searchParams.get('spaceId');
  const seatId = searchParams.get('seatId');

  const [space, setSpace] = useState<Space | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    if (spaceId && seatId) {
      fetchSeatInfo();
    }
  }, [spaceId, seatId]);

  const fetchSeatInfo = async () => {
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .single();

    setSpace(spaceData);

    const { data: seatData } = await supabase
      .from('seats')
      .select('*')
      .eq('id', seatId)
      .single();

    setSeat(seatData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다');
      return;
    }

    setImageFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth');
      return;
    }

    if (!imageFile) {
      setError('사진을 업로드해주세요');
      return;
    }

    if (!seatId) {
      setError('좌석을 선택해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      // Create post
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          seat_id: seatId,
          user_id: user.id,
          image_url: publicUrl,
          content: content || null,
          rating: rating || null,
        });

      if (insertError) throw insertError;

      router.push(`/spaces/${spaceId}/seats/${seatId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">로그인이 필요합니다</h1>
        <p className="text-foreground-muted mb-6">포스트를 작성하려면 먼저 로그인해주세요.</p>
        <Button onClick={() => router.push('/auth')}>로그인하기</Button>
      </div>
    );
  }

  if (!spaceId || !seatId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">좌석을 선택해주세요</h1>
        <p className="text-foreground-muted mb-6">포스트를 작성할 공간과 좌석을 먼저 선택해주세요.</p>
        <Button onClick={() => router.push('/spaces')}>공간 탐색하기</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      {space && seat && (
        <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
          <Link href={`/spaces/${spaceId}`} className="hover:text-foreground">
            {space.name}
          </Link>
          <span>/</span>
          <Link href={`/spaces/${spaceId}/seats/${seatId}`} className="hover:text-foreground">
            {seat.label || '좌석'}
          </Link>
          <span>/</span>
          <span className="text-foreground">새 포스트</span>
        </nav>
      )}

      <h1 className="text-2xl font-bold text-foreground mb-2">포스트 작성</h1>
      <p className="text-foreground-muted mb-8">
        이 좌석에서 본 풍경을 공유해주세요
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            사진
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative rounded-lg border border-border overflow-hidden">
              <div className="aspect-[4/3] relative bg-background-subtle">
                <Image
                  src={imagePreview}
                  alt="미리보기"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-accent transition-colors"
            >
              <svg className="w-12 h-12 text-foreground-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-foreground-muted">
                클릭하여 사진 업로드
              </span>
              <span className="text-xs text-foreground-muted mt-1">
                좌석에서 본 풍경을 찍어주세요
              </span>
            </button>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            별점 (선택)
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? 0 : star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1"
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-accent'
                      : 'text-border'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-foreground mb-1.5">
            후기 (선택)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이 자리에서의 경험을 공유해주세요..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          포스트 작성하기
        </Button>
      </form>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </div>
    }>
      <NewPostForm />
    </Suspense>
  );
}
