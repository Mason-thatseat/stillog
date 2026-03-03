import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupModal from './SignupModal';
import LoginModal from './LoginModal';
import { useAuthStore } from '../../../store/authStore';

interface NavigationProps {
  scrolled: boolean;
}

const getRoleName = (role: string): string => {
  const roleNames: Record<string, string> = {
    user: '일반 회원',
    owner: '매장 오너',
    admin: '관리자'
  };
  return roleNames[role] || '회원';
};

const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    user: 'bg-blue-100 text-blue-700',
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700'
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};

export default function Navigation({ scrolled }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();

  const openLogin = () => { setSignupOpen(false); setLoginOpen(true); };
  const openSignup = () => { setLoginOpen(false); setSignupOpen(true); };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <img
                src="https://static.readdy.ai/image/cc9e82def12023b7995899e43f92dbd6/e86db5a38ffdb2df4649ee0d6ea04809.svg"
                alt="Stillog"
                className="h-7 sm:h-8 w-auto cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#service" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                서비스 소개
              </a>
              <a href="#b2b" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                B2B 솔루션
              </a>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'owner' && (
                    <button
                      onClick={() => navigate('/owner-dashboard')}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      오너 대시보드
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/mypage')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-gray-400 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <div className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden bg-gray-100">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-600">{user.nickname.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user.nickname}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    로그인
                  </button>
                  <button
                    onClick={openSignup}
                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <i className={`text-2xl text-gray-900 ${menuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl flex flex-col pt-20 px-6 gap-6"
            onClick={e => e.stopPropagation()}
          >
            <a href="#service" onClick={() => setMenuOpen(false)} className="text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer">서비스 소개</a>
            <a href="#b2b" onClick={() => setMenuOpen(false)} className="text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer">B2B 솔루션</a>

            {isAuthenticated && user ? (
              <>
                {user.role === 'owner' && (
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/owner-dashboard'); }}
                    className="text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer text-left whitespace-nowrap"
                  >
                    오너 대시보드
                  </button>
                )}
                <button
                  onClick={() => { setMenuOpen(false); navigate('/mypage'); }}
                  className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer text-left"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-gray-100">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-600">{user.nickname.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user.nickname}</div>
                    <div className={`text-xs ${getRoleBadgeColor(user.role).split(' ')[1]}`}>
                      {getRoleName(user.role)}
                    </div>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-base font-medium text-gray-500 hover:text-gray-800 cursor-pointer text-left whitespace-nowrap"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMenuOpen(false); openLogin(); }}
                  className="text-base font-medium text-gray-700 hover:text-gray-900 cursor-pointer text-left whitespace-nowrap"
                >
                  로그인
                </button>
                <button
                  onClick={() => { setMenuOpen(false); openSignup(); }}
                  className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {loginOpen && (
        <LoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
        />
      )}
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} onSwitchToLogin={openLogin} />}
    </>
  );
}