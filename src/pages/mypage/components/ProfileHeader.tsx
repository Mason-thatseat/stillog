import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useProfile } from '../../../hooks/useProfile';

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

export default function ProfileHeader() {
  const authUser = useAuthStore((state) => state.user);
  const { stats, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(authUser?.nickname || '');
  const [tempNickname, setTempNickname] = useState(authUser?.nickname || '');
  const navigate = useNavigate();

  const handleSave = () => {
    setNickname(tempNickname);
    setIsEditing(false);
  };

  if (!authUser) {
    return null;
  }

  // 가입일 포맷팅
  const joinDate = authUser.created_at 
    ? new Date(authUser.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    : '';

  // 생년 추출 (임시로 이메일 기반 또는 기본값)
  const birthYear = new Date().getFullYear() - 25;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            {authUser.profile_image ? (
              <img src={authUser.profile_image} alt={nickname} className="w-full h-full object-cover object-top" />
            ) : (
              <span className="text-3xl font-bold text-gray-500">{nickname.charAt(0)}</span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
            <i className="ri-camera-line text-white text-xs"></i>
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 w-full text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
            {isEditing ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input
                  type="text"
                  value={tempNickname}
                  onChange={e => setTempNickname(e.target.value)}
                  maxLength={20}
                  className="text-xl font-bold text-gray-900 border-b-2 border-gray-900 outline-none bg-transparent w-40"
                  autoFocus
                />
                <button onClick={handleSave} className="text-xs px-3 py-1 bg-gray-900 text-white rounded-full cursor-pointer whitespace-nowrap hover:bg-gray-700">저장</button>
                <button onClick={() => { setTempNickname(nickname); setIsEditing(false); }} className="text-xs px-3 py-1 border border-gray-300 text-gray-600 rounded-full cursor-pointer whitespace-nowrap hover:bg-gray-50">취소</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{nickname}</h2>
                <button onClick={() => setIsEditing(true)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors">
                  <i className="ri-pencil-line text-sm"></i>
                </button>
                {authUser && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(authUser.role)}`}>
                    {getRoleName(authUser.role)}
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-1">{authUser.email}</p>
          <p className="text-xs text-gray-400 mb-4">
            {birthYear}년생 · {joinDate} 가입
          </p>

          {/* Admin Button */}
          {authUser?.role === 'admin' && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-shield-star-line"></i>
                관리자 페이지
              </button>
            </div>
          )}

          {/* Owner Dashboard Button */}
          {authUser?.role === 'owner' && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/owner-dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-store-2-line"></i>
                매장 오너 대시보드
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center sm:justify-start gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {loading ? '...' : stats.reviewCount}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">리뷰</div>
            </div>
            <div className="w-px bg-gray-100"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {loading ? '...' : stats.likeCount}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">받은 좋아요</div>
            </div>
            <div className="w-px bg-gray-100"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {loading ? '...' : stats.followingCount}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">팔로잉</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}