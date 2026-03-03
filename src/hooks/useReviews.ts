import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Review {
  id: string;
  seat_id: string;
  user_id: string;
  image_url: string;
  content: string | null;
  rating: number;
  created_at: string;
  // 조인된 데이터
  seat?: {
    id: string;
    label: string;
    space_id: string;
  };
  user?: {
    id: string;
    nickname: string;
  };
  space?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface CreateReviewData {
  seat_id: string;
  image_url: string;
  content?: string;
  rating: number;
}

export function useReviews(spaceId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('posts')
        .select(`
          *,
          seats!inner(id, label, space_id, spaces(id, name, address)),
          profiles(id, nickname)
        `)
        .order('created_at', { ascending: false });

      if (spaceId) {
        query = query.eq('seats.space_id', spaceId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        seat_id: item.seat_id,
        user_id: item.user_id,
        image_url: item.image_url,
        content: item.content,
        rating: item.rating,
        created_at: item.created_at,
        seat: item.seats ? {
          id: item.seats.id,
          label: item.seats.label,
          space_id: item.seats.space_id,
        } : undefined,
        user: item.profiles ? {
          id: item.profiles.id,
          nickname: item.profiles.nickname,
        } : undefined,
        space: item.seats?.spaces ? {
          id: item.seats.spaces.id,
          name: item.seats.spaces.name,
          address: item.seats.spaces.address,
        } : undefined,
      }));

      setReviews(formatted);
    } catch (err) {
      console.error('리뷰 조회 실패:', err);
      setError(err instanceof Error ? err.message : '리뷰를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [spaceId]);

  const createReview = async (data: CreateReviewData): Promise<Review | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const { data: newReview, error: insertError } = await supabase
        .from('posts')
        .insert({
          seat_id: data.seat_id,
          user_id: user.id,
          image_url: data.image_url,
          content: data.content || null,
          rating: data.rating,
        })
        .select(`
          *,
          seats(id, label, space_id, spaces(id, name, address)),
          profiles(id, nickname)
        `)
        .maybeSingle();

      if (insertError) throw insertError;
      if (!newReview) throw new Error('리뷰 생성 실패');

      const formatted: Review = {
        id: newReview.id,
        seat_id: newReview.seat_id,
        user_id: newReview.user_id,
        image_url: newReview.image_url,
        content: newReview.content,
        rating: newReview.rating,
        created_at: newReview.created_at,
        seat: newReview.seats ? {
          id: newReview.seats.id,
          label: newReview.seats.label,
          space_id: newReview.seats.space_id,
        } : undefined,
        user: newReview.profiles ? {
          id: newReview.profiles.id,
          nickname: newReview.profiles.nickname,
        } : undefined,
        space: newReview.seats?.spaces ? {
          id: newReview.seats.spaces.id,
          name: newReview.seats.spaces.name,
          address: newReview.seats.spaces.address,
        } : undefined,
      };

      await fetchReviews();
      return formatted;
    } catch (err) {
      console.error('리뷰 생성 실패:', err);
      setError(err instanceof Error ? err.message : '리뷰를 등록할 수 없습니다');
      return null;
    }
  };

  const updateReview = async (id: string, updates: Partial<CreateReviewData>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: updates.content,
          rating: updates.rating,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchReviews();
      return true;
    } catch (err) {
      console.error('리뷰 수정 실패:', err);
      setError(err instanceof Error ? err.message : '리뷰를 수정할 수 없습니다');
      return false;
    }
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchReviews();
      return true;
    } catch (err) {
      console.error('리뷰 삭제 실패:', err);
      setError(err instanceof Error ? err.message : '리뷰를 삭제할 수 없습니다');
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      setError(err instanceof Error ? err.message : '이미지를 업로드할 수 없습니다');
      return null;
    }
  };

  return {
    reviews,
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    uploadImage,
    refresh: fetchReviews,
  };
}

export function useMyReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          seats(id, label, space_id, spaces(id, name, address)),
          profiles(id, nickname)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        seat_id: item.seat_id,
        user_id: item.user_id,
        image_url: item.image_url,
        content: item.content,
        rating: item.rating,
        created_at: item.created_at,
        seat: item.seats ? {
          id: item.seats.id,
          label: item.seats.label,
          space_id: item.seats.space_id,
        } : undefined,
        user: item.profiles ? {
          id: item.profiles.id,
          nickname: item.profiles.nickname,
        } : undefined,
        space: item.seats?.spaces ? {
          id: item.seats.spaces.id,
          name: item.seats.spaces.name,
          address: item.seats.spaces.address,
        } : undefined,
      }));

      setReviews(formatted);
    } catch (err) {
      console.error('내 리뷰 조회 실패:', err);
      setError(err instanceof Error ? err.message : '리뷰를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  return {
    reviews,
    loading,
    error,
    refresh: fetchMyReviews,
  };
}