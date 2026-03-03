import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // 앱 시작 시 세션 확인
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // profiles 테이블에서 사용자 정보 가져오기
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              set({
                user: {
                  id: profile.id,
                  email: profile.email || session.user.email || '',
                  nickname: profile.nickname,
                  profileImage: profile.profile_image || undefined,
                  role: 'user',
                },
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // 세션은 있지만 프로필 없는 경우 (OAuth 첫 로그인 등) 자동 생성
              const supabaseUser = session.user;
              const nickname =
                supabaseUser.user_metadata?.full_name ||
                supabaseUser.user_metadata?.name ||
                supabaseUser.email?.split('@')[0] ||
                `사용자${Math.floor(Math.random() * 10000)}`;
              const profileImage =
                supabaseUser.user_metadata?.avatar_url ||
                supabaseUser.user_metadata?.picture ||
                undefined;

              await supabase.from('profiles').insert({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                nickname,
                profile_image: profileImage || null,
              });

              set({
                user: {
                  id: supabaseUser.id,
                  email: supabaseUser.email || '',
                  nickname,
                  profileImage,
                  role: 'user',
                },
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } else {
            set({ isAuthenticated: false, isLoading: false });
          }

          // 인증 상태 변화 감지
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profile) {
                set({
                  user: {
                    id: profile.id,
                    email: profile.email || session.user.email || '',
                    nickname: profile.nickname,
                    profileImage: profile.profile_image || undefined,
                    role: 'user',
                  },
                  isAuthenticated: true,
                });
              } else {
                // OAuth 첫 로그인 시 프로필 자동 생성
                const supabaseUser = session.user;
                const nickname =
                  supabaseUser.user_metadata?.full_name ||
                  supabaseUser.user_metadata?.name ||
                  supabaseUser.email?.split('@')[0] ||
                  `사용자${Math.floor(Math.random() * 10000)}`;
                const profileImage =
                  supabaseUser.user_metadata?.avatar_url ||
                  supabaseUser.user_metadata?.picture ||
                  undefined;

                await supabase.from('profiles').insert({
                  id: supabaseUser.id,
                  email: supabaseUser.email || '',
                  nickname,
                  profile_image: profileImage || null,
                });

                set({
                  user: {
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    nickname,
                    profileImage,
                    role: 'user',
                  },
                  isAuthenticated: true,
                });
              }
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, isAuthenticated: false });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isAuthenticated: false, isLoading: false });
        }
      },

      // 이메일 로그인
      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile) {
            set({
              user: {
                id: profile.id,
                email: profile.email || data.user.email || '',
                nickname: profile.nickname,
                profileImage: profile.profile_image || undefined,
                role: 'user',
              },
              isAuthenticated: true,
            });
          }
        }
      },

      // 소셜 로그인
      loginWithOAuth: async (provider: 'google' | 'kakao') => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) throw error;
      },

      // 회원가입
      signup: async (email: string, password: string, nickname?: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // profiles 테이블에 사용자 정보 저장
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              nickname: nickname || `사용자${Math.floor(Math.random() * 10000)}`,
            });

          if (profileError) throw profileError;

          set({
            user: {
              id: data.user.id,
              email: data.user.email || email,
              nickname: nickname || `사용자${Math.floor(Math.random() * 10000)}`,
              role: 'user',
            },
            isAuthenticated: true,
          });
        }
      },

      // 로그아웃
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      // 사용자 정보 업데이트
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