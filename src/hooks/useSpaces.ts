import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Space {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  place_id: string;
  created_by: string;
  created_at: string;
  floor_plan_url?: string;
  floor_plan_width?: number;
  floor_plan_height?: number;
  room_polygon?: any;
  canvas_width?: number;
  canvas_height?: number;
  review_count?: number;
  avg_rating?: number;
}

export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = async () => {
    try {
      setLoading(true);

      // spaces 테이블에서 매장 목록 조회
      const { data: spacesData, error: spacesError } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (spacesError) throw spacesError;

      // 각 매장의 리뷰 수와 평균 평점 계산
      // posts 테이블은 seat_id만 있으므로 seats 테이블을 통해 조인
      const spacesWithStats = await Promise.all(
        (spacesData || []).map(async (space) => {
          const { data: seats } = await supabase
            .from('seats')
            .select('id')
            .eq('space_id', space.id);

          const seatIds = (seats || []).map((s) => s.id);

          let reviewCount = 0;
          let avgRating = 0;

          if (seatIds.length > 0) {
            const { data: reviews } = await supabase
              .from('posts')
              .select('rating')
              .in('seat_id', seatIds);

            reviewCount = reviews?.length || 0;
            avgRating = reviewCount > 0
              ? reviews!.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
              : 0;
          }

          return {
            ...space,
            review_count: reviewCount,
            avg_rating: avgRating,
          };
        })
      );

      setSpaces(spacesWithStats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  return { spaces, loading, error, refetch: fetchSpaces };
};

export const useSpace = (id: string) => {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('spaces')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        // 리뷰 수와 평균 평점 계산 (seats 조인)
        if (data) {
          const { data: seats } = await supabase
            .from('seats')
            .select('id')
            .eq('space_id', data.id);

          const seatIds = (seats || []).map((s) => s.id);

          let reviewCount = 0;
          let avgRating = 0;

          if (seatIds.length > 0) {
            const { data: reviews } = await supabase
              .from('posts')
              .select('rating')
              .in('seat_id', seatIds);

            reviewCount = reviews?.length || 0;
            avgRating = reviewCount > 0
              ? reviews!.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
              : 0;
          }

          setSpace({
            ...data,
            review_count: reviewCount,
            avg_rating: avgRating,
          });
        } else {
          setSpace(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSpace();
    }
  }, [id]);

  return { space, loading, error };
};

export const searchSpaces = async (query: string): Promise<Space[]> => {
  try {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // 각 매장의 리뷰 수와 평균 평점 계산 (seats 조인)
    const spacesWithStats = await Promise.all(
      (data || []).map(async (space) => {
        const { data: seats } = await supabase
          .from('seats')
          .select('id')
          .eq('space_id', space.id);

        const seatIds = (seats || []).map((s) => s.id);

        let reviewCount = 0;
        let avgRating = 0;

        if (seatIds.length > 0) {
          const { data: reviews } = await supabase
            .from('posts')
            .select('rating')
            .in('seat_id', seatIds);

          reviewCount = reviews?.length || 0;
          avgRating = reviewCount > 0
            ? reviews!.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
            : 0;
        }

        return {
          ...space,
          review_count: reviewCount,
          avg_rating: avgRating,
        };
      })
    );

    return spacesWithStats;
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
};

export const createSpace = async (spaceData: {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다');

    const { data, error } = await supabase
      .from('spaces')
      .insert([
        {
          ...spaceData,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
};
