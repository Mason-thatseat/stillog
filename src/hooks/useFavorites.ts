
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface FavoriteSpace {
  id: string;
  space_id: string;
  created_at: string;
  space: {
    id: string;
    name: string;
    address: string;
    floor_plan_url: string | null;
  };
}

export function useFavorites() {
  const user = useAuthStore((state) => state.user);
  const [favorites, setFavorites] = useState<FavoriteSpace[]>([]);
  const [loading, setLoading] = useState(true);

  /** Fetch the list of favorite spaces for the logged‑in user */
  const fetchFavorites = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        // Using a plain string (single line) avoids back‑tick parsing issues
        .select(
          `id,
           space_id,
           created_at,
           spaces (
             id,
             name,
             address,
             floor_plan_url
           )`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase types are loosely typed here; cast safely
      setFavorites((data as FavoriteSpace[]) ?? []);
    } catch (err) {
      console.error('저장 공간 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re‑fetch whenever the authenticated user changes
  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /** Add a space to the user's favorites */
  const addFavorite = async (spaceId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, space_id: spaceId });

      if (error) throw error;

      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('공간 저장 실패:', err);
      return false;
    }
  };

  /** Remove a space from the user's favorites */
  const removeFavorite = async (favoriteId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('저장 공간 삭제 실패:', err);
      return false;
    }
  };

  /** Check if a space is already favorited */
  const isFavorite = (spaceId: string) => {
    return favorites.some((fav) => fav.space_id === spaceId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}
