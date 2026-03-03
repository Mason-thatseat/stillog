import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from './components/ProfileHeader';
import MyReviewsTab from './components/MyReviewsTab';
import SavedSpacesTab from './components/SavedSpacesTab';
import BadgesTab from './components/BadgesTab';
import SettingsTab from './components/SettingsTab';

type TabId = 'reviews' | 'saved' | 'badges' | 'settings';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'reviews', label: '내 리뷰', icon: 'ri-quill-pen-line' },
  { id: 'saved', label: '저장한 공간', icon: 'ri-bookmark-line' },
  { id: 'badges', label: '뱃지', icon: 'ri-award-line' },
  { id: 'settings', label: '설정', icon: 'ri-settings-3-line' },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('reviews');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img
                src="https://static.readdy.ai/image/cc9e82def12023b7995899e43f92dbd6/e86db5a38ffdb2df4649ee0d6ea04809.svg"
                alt="Stillog"
                className="h-7 w-auto"
              />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/review')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i>
                리뷰 작성
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
              >
                <i className="ri-logout-box-r-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* 프로필 헤더 배경 */}
        <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-white pb-0">
          <div className="container mx-auto px-4 sm:px-6 pt-8 pb-0">
            <ProfileHeader />
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={`${tab.icon} text-base`}></i>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeTab === 'reviews' && <MyReviewsTab />}
          {activeTab === 'saved' && <SavedSpacesTab />}
          {activeTab === 'badges' && <BadgesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}