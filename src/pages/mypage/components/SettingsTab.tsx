
import { useState } from 'react';

export default function SettingsTab() {
  const [notifications, setNotifications] = useState({
    likeAlert: true,
    commentAlert: true,
    weeklyDigest: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleItem = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notifItems = [
    { key: 'likeAlert' as const, label: '좋아요 알림', desc: '내 리뷰에 좋아요가 달리면 알려드려요' },
    { key: 'commentAlert' as const, label: '댓글 알림', desc: '내 리뷰에 댓글이 달리면 알려드려요' },
    { key: 'weeklyDigest' as const, label: '주간 다이제스트', desc: '매주 인기 리뷰를 이메일로 받아보세요' },
    { key: 'marketing' as const, label: '마케팅 수신 동의', desc: '이벤트 및 혜택 정보를 받아보세요' },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      {/* 알림 설정 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-notification-3-line text-gray-500"></i>
          알림 설정
        </h3>
        <div className="space-y-4">
          {notifItems.map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleItem(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  notifications[item.key] ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 계정 설정 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-shield-user-line text-gray-500"></i>
          계정 설정
        </h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <i className="ri-lock-password-line text-gray-600 text-sm"></i>
              </div>
              <span className="text-sm text-gray-700">비밀번호 변경</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <i className="ri-mail-line text-gray-600 text-sm"></i>
              </div>
              <span className="text-sm text-gray-700">이메일 변경</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <i className="ri-link-unlink-m text-gray-600 text-sm"></i>
              </div>
              <span className="text-sm text-gray-700">소셜 계정 연동</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </button>
        </div>
      </div>

      {/* 개인정보 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-file-shield-2-line text-gray-500"></i>
          개인정보
        </h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <i className="ri-download-2-line text-gray-600 text-sm"></i>
              </div>
              <span className="text-sm text-gray-700">내 데이터 다운로드</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-50 hover:bg-red-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <i className="ri-user-unfollow-line text-red-500 text-sm"></i>
              </div>
              <span className="text-sm text-red-500">회원 탈퇴</span>
            </div>
            <i className="ri-arrow-right-s-line text-red-300"></i>
          </button>
        </div>
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-gray-900 text-white hover:bg-black'
        }`}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <i className="ri-check-line"></i> 저장됐어요!
          </span>
        ) : '설정 저장'}
      </button>
    </div>
  );
}
