import { useProfile } from '../../../hooks/useProfile';

interface Badge {
  id: string;
  label: string;
  desc: string;
  icon: string;
  color: string;
  requirement: number;
  type: 'review' | 'like';
}

const BADGE_LIST: Badge[] = [
  { id: 'first-review', label: '첫 리뷰', desc: '첫 리뷰 작성', icon: 'ri-quill-pen-fill', color: 'bg-emerald-100 text-emerald-600', requirement: 1, type: 'review' },
  { id: 'review-5', label: '리뷰 5개', desc: '리뷰 5개 작성', icon: 'ri-file-list-3-fill', color: 'bg-blue-100 text-blue-600', requirement: 5, type: 'review' },
  { id: 'review-10', label: '리뷰 10개', desc: '리뷰 10개 작성', icon: 'ri-medal-fill', color: 'bg-purple-100 text-purple-600', requirement: 10, type: 'review' },
  { id: 'review-20', label: '리뷰 20개', desc: '리뷰 20개 작성', icon: 'ri-trophy-fill', color: 'bg-amber-100 text-amber-600', requirement: 20, type: 'review' },
  { id: 'review-50', label: '리뷰 50개', desc: '리뷰 50개 작성', icon: 'ri-vip-crown-fill', color: 'bg-red-100 text-red-600', requirement: 50, type: 'review' },
  { id: 'like-10', label: '좋아요 10개', desc: '좋아요 10개 받기', icon: 'ri-heart-fill', color: 'bg-pink-100 text-pink-600', requirement: 10, type: 'like' },
  { id: 'like-50', label: '좋아요 50개', desc: '좋아요 50개 받기', icon: 'ri-heart-2-fill', color: 'bg-rose-100 text-rose-600', requirement: 50, type: 'like' },
  { id: 'like-100', label: '좋아요 100개', desc: '좋아요 100개 받기', icon: 'ri-heart-3-fill', color: 'bg-red-100 text-red-600', requirement: 100, type: 'like' },
];

export default function BadgesTab() {
  const { stats, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const badgesWithStatus = BADGE_LIST.map(badge => ({
    ...badge,
    earned: badge.type === 'review' 
      ? stats.reviewCount >= badge.requirement 
      : stats.likeCount >= badge.requirement,
  }));

  const earned = badgesWithStatus.filter(b => b.earned);
  const notEarned = badgesWithStatus.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      {/* 획득한 뱃지 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          획득한 뱃지 <span className="text-gray-400 font-normal">({earned.length}개)</span>
        </h3>
        {earned.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
              <i className="ri-award-line text-xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 text-sm">아직 획득한 뱃지가 없어요</p>
            <p className="text-gray-400 text-xs mt-1">리뷰를 작성하고 뱃지를 획득해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {earned.map(badge => (
              <div key={badge.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${badge.color}`}>
                  <i className={`${badge.icon} text-xl`}></i>
                </div>
                <p className="text-sm font-semibold text-gray-900 text-center">{badge.label}</p>
                <p className="text-xs text-gray-400 text-center leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 미획득 뱃지 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          도전 중인 뱃지 <span className="text-gray-400 font-normal">({notEarned.length}개)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {notEarned.map(badge => {
            const currentCount = badge.type === 'review' ? stats.reviewCount : stats.likeCount;
            const progress = Math.min((currentCount / badge.requirement) * 100, 100);

            return (
              <div key={badge.id} className="bg-white rounded-2xl border border-dashed border-gray-200 p-4 flex flex-col items-center gap-2 opacity-60">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                  <i className={`${badge.icon} text-xl text-gray-400`}></i>
                </div>
                <p className="text-sm font-semibold text-gray-500 text-center">{badge.label}</p>
                <p className="text-xs text-gray-400 text-center leading-relaxed">{badge.desc}</p>
                <div className="w-full mt-1">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-300 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    {currentCount} / {badge.requirement}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}