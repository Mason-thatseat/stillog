import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import SpaceApprovalTab from './components/SpaceApprovalTab';
import ReportedReviewsTab from './components/ReportedReviewsTab';

type TabType = 'dashboard' | 'spaces' | 'reports' | 'users' | 'stats';

interface AdminStats {
  pendingSpaces: number;
  newSpacesThisWeek: number;
  reportedReviews: number;
  newReportsThisWeek: number;
  totalUsers: number;
  newUsersThisWeek: number;
  totalReviews: number;
  newReviewsThisWeek: number;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    pendingSpaces: 0,
    newSpacesThisWeek: 0,
    reportedReviews: 0,
    newReportsThisWeek: 0,
    totalUsers: 0,
    newUsersThisWeek: 0,
    totalReviews: 0,
    newReviewsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        const { count: pendingSpacesCount } = await supabase
          .from('spaces')
          .select('*', { count: 'exact', head: true })
          .eq('approval_status', 'pending');

        const { count: newSpacesCount } = await supabase
          .from('spaces')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgoISO);

        const { count: reportedReviewsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gt('report_count', 0)
          .eq('report_status', 'pending');

        const { data: reportsThisWeek } = await supabase
          .from('posts')
          .select('report_count')
          .gt('report_count', 0)
          .gte('created_at', oneWeekAgoISO);

        const newReportsCount = reportsThisWeek?.reduce((sum, post) => sum + (post.report_count || 0), 0) || 0;

        const { count: totalUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: newUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgoISO);

        const { count: totalReviewsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });

        const { count: newReviewsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgoISO);

        setStats({
          pendingSpaces: pendingSpacesCount || 0,
          newSpacesThisWeek: newSpacesCount || 0,
          reportedReviews: reportedReviewsCount || 0,
          newReportsThisWeek: newReportsCount,
          totalUsers: totalUsersCount || 0,
          newUsersThisWeek: newUsersCount || 0,
          totalReviews: totalReviewsCount || 0,
          newReviewsThisWeek: newReviewsCount || 0,
        });
      } catch (error) {
        console.error('통계 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // 관리자가 아니면 홈으로 리다이렉트 (useEffect 이후에 배치)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { id: 'dashboard' as TabType, icon: 'ri-dashboard-line', label: '대시보드 홈' },
    { id: 'spaces' as TabType, icon: 'ri-store-line', label: '매장 승인 관리' },
    { id: 'reports' as TabType, icon: 'ri-alarm-warning-line', label: '신고 댓글 검열' },
    { id: 'users' as TabType, icon: 'ri-user-line', label: '회원 관리' },
    { id: 'stats' as TabType, icon: 'ri-bar-chart-line', label: '통계' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">{user.name}</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${item.icon} text-lg`}></i>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <i className="ri-home-line text-lg"></i>
            홈으로 돌아가기
          </a>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">대시보드 홈</h2>

            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                    <i className="ri-store-line text-2xl text-blue-600"></i>
                  </div>
                  {loading ? (
                    <div className="h-5 w-12 bg-gray-100 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                      +{stats.newSpacesThisWeek}건
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">신규 매장 신청</h3>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingSpaces}</p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-lg">
                    <i className="ri-alarm-warning-line text-2xl text-red-600"></i>
                  </div>
                  {loading ? (
                    <div className="h-5 w-12 bg-gray-100 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full whitespace-nowrap">
                      +{stats.newReportsThisWeek}건
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">신고된 댓글</h3>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.reportedReviews}</p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg">
                    <i className="ri-user-add-line text-2xl text-green-600"></i>
                  </div>
                  {loading ? (
                    <div className="h-5 w-12 bg-gray-100 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">
                      +{stats.newUsersThisWeek}명
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">신규 가입자</h3>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">
                    <i className="ri-chat-3-line text-2xl text-purple-600"></i>
                  </div>
                  {loading ? (
                    <div className="h-5 w-12 bg-gray-100 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full whitespace-nowrap">
                      +{stats.newReviewsThisWeek}개
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">총 리뷰 수</h3>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                )}
              </div>
            </div>

            {/* 빠른 액세스 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">빠른 액세스</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('spaces')}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                    <i className="ri-store-line text-xl text-blue-600"></i>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">매장 승인 대기</p>
                    <p className="text-sm text-gray-500">{stats.pendingSpaces}건의 신청이 대기중입니다</p>
                  </div>
                  <i className="ri-arrow-right-line text-xl text-gray-400"></i>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg">
                    <i className="ri-alarm-warning-line text-xl text-red-600"></i>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">신고 댓글 검토</p>
                    <p className="text-sm text-gray-500">{stats.reportedReviews}건의 신고가 접수되었습니다</p>
                  </div>
                  <i className="ri-arrow-right-line text-xl text-gray-400"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spaces' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">매장 승인 관리</h2>
            <SpaceApprovalTab />
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">신고 댓글 검열</h2>
            <ReportedReviewsTab />
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">회원 관리</h2>
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <i className="ri-user-line text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">회원 관리 기능은 준비중입니다</p>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">통계</h2>
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <i className="ri-bar-chart-line text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">통계 기능은 준비중입니다</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}