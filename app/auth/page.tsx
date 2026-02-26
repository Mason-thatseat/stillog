'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function getAuthErrorMessage(message: string): string {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다';
  if (message.includes('Email not confirmed')) return '이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요';
  if (message.includes('User already registered')) return '이미 가입된 이메일입니다';
  if (message.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다';
  if (message.includes('Unable to validate email address')) return '올바른 이메일 형식이 아닙니다';
  if (message.includes('Email rate limit exceeded') || message.includes('Too many requests')) return '잠시 후 다시 시도해주세요';
  if (message.includes('User not found')) return '등록되지 않은 이메일입니다';
  if (message.includes('Signup requires a valid password')) return '비밀번호를 입력해주세요';
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요';
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmPending, setEmailConfirmPending] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: nickname,
            },
          },
        });
        if (error) throw error;
        // session이 null이면 이메일 인증 대기 상태
        if (!data.session) {
          setEmailConfirmPending(true);
          return;
        }
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(getAuthErrorMessage(err instanceof Error ? err.message : ''));
      setLoading(false);
    }
  };

  if (emailConfirmPending) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">이메일을 확인해주세요</h1>
          <p className="text-foreground-muted mb-2">
            <span className="font-medium text-foreground">{email}</span>으로 인증 메일을 보냈습니다.
          </p>
          <p className="text-sm text-foreground-muted mb-8">
            받은 편지함에서 인증 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <Button variant="outline" onClick={() => { setEmailConfirmPending(false); setIsLogin(true); }}>
            로그인 화면으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 bg-background-subtle">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            {isLogin ? '로그인' : '회원가입'}
          </h1>
          <p className="text-foreground-muted">
            {isLogin
              ? 'STILLOG에 오신 것을 환영합니다'
              : '새 계정을 만들어 시작하세요'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-xl shadow-black/5 p-7">
          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </Button>
            <Button
              variant="outline"
              className="w-full bg-[#FEE500] hover:bg-[#F6DC00] text-[#3C1E1E] border-0 font-semibold"
              onClick={() => handleSocialLogin('kakao')}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#3C1E1E"
                  d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.062 5.912-.135.49-.87 3.148-.896 3.363 0 0-.018.149.078.206.097.057.21.014.21.014.276-.039 3.197-2.093 3.7-2.452.604.088 1.227.134 1.846.134 5.523 0 10-3.477 10-7.777S17.523 3 12 3"
                />
              </svg>
              Kakao로 계속하기
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-foreground-muted">또는</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <Input
                id="nickname"
                label="닉네임"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                placeholder="사용할 닉네임"
              />
            )}
            <Input
              id="email"
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
            <Input
              id="password"
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold" loading={loading}>
              {isLogin ? '로그인' : '회원가입'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-muted">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent hover:text-accent/80 transition-colors duration-150"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
