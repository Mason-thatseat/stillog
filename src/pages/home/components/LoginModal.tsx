import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
}

const SOCIAL_BUTTONS = [
  {
    key: 'kakao',
    label: '카카오로 계속하기',
    bg: 'bg-[#FEE500]',
    text: 'text-[#191919]',
    border: '',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 3C6.134 3 3 5.462 3 8.5c0 1.946 1.168 3.657 2.938 4.71l-.748 2.79 3.25-2.14c.506.07 1.025.107 1.56.107 3.866 0 7-2.462 7-5.5S13.866 3 10 3z" fill="#191919"/>
      </svg>
    ),
  },
  {
    key: 'naver',
    label: '네이버로 계속하기',
    bg: 'bg-[#03C75A]',
    text: 'text-white',
    border: '',
    icon: (
      <span className="font-extrabold text-white text-base leading-none">N</span>
    ),
  },
  {
    key: 'google',
    label: 'Google로 계속하기',
    bg: 'bg-white',
    text: 'text-gray-800',
    border: 'border border-gray-200',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.39a4.6 4.6 0 01-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.31z" fill="#4285F4"/>
        <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.07v2.58A10 10 0 0010 20z" fill="#34A853"/>
        <path d="M4.41 11.91A6.01 6.01 0 014.1 10c0-.66.11-1.3.31-1.91V5.51H1.07A10 10 0 000 10c0 1.61.38 3.13 1.07 4.49l3.34-2.58z" fill="#FBBC05"/>
        <path d="M10 3.97c1.47 0 2.79.5 3.83 1.5l2.86-2.86C14.96.99 12.7 0 10 0A10 10 0 001.07 5.51l3.34 2.58C5.2 5.73 7.4 3.97 10 3.97z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    key: 'apple',
    label: 'Apple로 계속하기',
    bg: 'bg-black',
    text: 'text-white',
    border: '',
    icon: (
      <i className="ri-apple-fill text-white text-lg leading-none"></i>
    ),
  },
];

type Tab = 'social' | 'email';

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [tab, setTab] = useState<Tab>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithOAuth } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTab('social');
      setEmail('');
      setPassword('');
      setError('');
      setShowPw(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    try {
      setLoading(true);
      setError('');
      await loginWithOAuth(provider);
      // OAuth는 리다이렉트되므로 여기서 onClose 호출 안 함
    } catch (err: any) {
      setError(err.message || '소셜 로그인에 실패했어요.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (!password.trim()) { setError('비밀번호를 입력해주세요.'); return; }

    setLoading(true);
    try {
      await login(email.trim(), password);
      onClose();
    } catch (err: any) {
      setError(err.message || '이메일 또는 비밀번호가 올바르지 않아요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="https://static.readdy.ai/image/cc9e82def12023b7995899e43f92dbd6/e86db5a38ffdb2df4649ee0d6ea04809.svg"
            alt="Stillog"
            className="h-7 w-auto mb-1"
          />
          <h2 className="text-lg font-semibold text-gray-900">로그인 / 회원가입</h2>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => { setTab('social'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${tab === 'social' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            소셜 로그인
          </button>
          <button
            onClick={() => { setTab('email'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${tab === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            이메일 로그인
          </button>
        </div>

        {/* Social Tab */}
        {tab === 'social' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500 text-center -mt-2">소셜 계정으로 간편하게 시작하세요</p>
            {SOCIAL_BUTTONS.map(btn => (
              <button
                key={btn.key}
                onClick={() => {
                  if (btn.key === 'google') handleSocialLogin('google');
                  else if (btn.key === 'kakao') handleSocialLogin('kakao');
                  else setError('해당 소셜 로그인은 준비 중이에요.');
                }}
                disabled={loading}
                className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer whitespace-nowrap ${btn.bg} ${btn.text} ${btn.border} hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {btn.icon}
                </span>
                <span className="flex-1 text-center">{btn.label}</span>
              </button>
            ))}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-error-warning-line text-red-500 text-sm"></i>
                </div>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Email Tab */}
        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 -mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="비밀번호 입력"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5 flex items-center justify-center"
                >
                  <i className={showPw ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-error-warning-line text-red-500 text-sm"></i>
                </div>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <><i className="ri-loader-4-line animate-spin text-sm"></i> 로그인 중...</>
              ) : '로그인'}
            </button>

            {onSwitchToSignup && (
              <p className="text-xs text-gray-400 text-center">
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="underline cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                >
                  회원가입
                </button>
              </p>
            )}
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center leading-relaxed -mt-2">
          계속 진행하면 Stillog의{' '}
          <span className="underline cursor-pointer hover:text-gray-600">이용약관</span>
          {' '}및{' '}
          <span className="underline cursor-pointer hover:text-gray-600">개인정보 처리방침</span>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}