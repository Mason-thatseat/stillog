import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'kakao') => Promise<void>;
  signup: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// 세션으로부터 유저 정보 세팅 (프로필 조회 → 없으면 upsert → 항상 로그인 처리)
async function resolveUserFromSession(session: Session): Promise<User> {
  const supabaseUser = session.user;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .maybeSingle();

  if (profile) {
    return {
      id: profile.id,
      email: profile.email || supabaseUser.email || '',
      nickname: profile.nickname,
      profileImage: profile.profile_image || undefined,
      role: (profile.role as UserRole) || 'user',
    };
  }

  // 프로필 없으면 생성 (upsert — 중복 키 오류 방지)
  const nickname =
    supabaseUser.user_metadata?.full_name ||
    supabaseUser.user_metadata?.name ||
    supabaseUser.email?.split('@')[0] ||
    `사용자${Math.floor(Math.random() * 10000)}`;
  const profileImage =
    supabaseUser.user_metadata?.avatar_url ||
    supabaseUser.user_metadata?.picture ||
    undefined;

  await supabase.from('profiles').upsert({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    nickname,
    profile_image: profileImage || null,
  });

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    nickname,
    profileImage,
    role: 'user',
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        // onAuthStateChange가 모든 세션 상태를 처리
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
            try {
              const user = await resolveUserFromSession(session);
              set({ user, isAuthenticated: true, isLoading: false });
            } catch (error) {
              console.error('Profile resolve error:', error);
              // 프로필 오류여도 세션 기반으로 최소한 로그인 처리
              set({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                  nickname: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '사용자',
                  profileImage: session.user.user_metadata?.avatar_url || undefined,
                  role: 'user',
                },
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else if (!session) {
            set({ isLoading: false });
          }
        });
      },

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          const user = await resolveUserFromSession(data.session);
          set({ user, isAuthenticated: true });
        }
      },

      loginWithOAuth: async (provider: 'google' | 'kakao') => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
      },

      signup: async (email: string, password: string, nickname?: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const generatedNickname = nickname || `사용자${Math.floor(Math.random() * 10000)}`;
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email || email,
            nickname: generatedNickname,
          });
          if (profileError) throw profileError;

          set({
            user: {
              id: data.user.id,
              email: data.user.email || email,
              nickname: generatedNickname,
              role: 'user',
            },
            isAuthenticated: true,
          });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
