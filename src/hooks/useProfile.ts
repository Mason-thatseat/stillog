import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface ProfileStats {
  reviewCount: number;
  likeCount: number;
  followingCount: number;
}

export function useProfile() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<ProfileStats>({
    reviewCount: 0,
    likeCount: 0,
    followingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // 리뷰 수 조회
        const { count: reviewCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 받은 좋아요 수는 임시로 0 (추후 likes 테이블 추가 시 구현)
        const likeCount = 0;

        // 팔로잉 수는 임시로 0 (추후 follows 테이블 추가 시 구현)
        const followingCount = 0;

        setStats({
          reviewCount: reviewCount || 0,
          likeCount,
          followingCount,
        });
      } catch (error) {
        console.error('프로필 통계 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return { stats, loading };
}