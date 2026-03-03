
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReviewCompleteProps {
  spaceName: string;
  seatId: string;
  rating: number;
  onWriteAnother: () => void;
  isFirstSeatReviewer?: boolean;
  isFirstSpaceReviewer?: boolean;
  reviewStreak?: number;
}

interface Badge {
  id: string;
  icon: string;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  isNew: boolean;
}

export default function ReviewComplete({
  spaceName,
  seatId,
  rating,
  onWriteAnother,
  isFirstSeatReviewer = true,
  isFirstSpaceReviewer = false,
  reviewStreak = 3,
}: ReviewCompleteProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [badgesVisible, setBadgesVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setBadgesVisible(true), 600);
    const t3 = setTimeout(() => setShowConfetti(isFirstSeatReviewer || isFirstSpaceReviewer), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isFirstSeatReviewer, isFirstSpaceReviewer]);

  const badges: Badge[] = [
    ...(isFirstSeatReviewer ? [{
      id: 'first-seat',
      icon: 'ri-map-pin-2-fill',
      label: '첫 번째 좌석 등록자',
      desc: `${seatId} 자리의 첫 리뷰어예요!`,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      isNew: true,
    }] : []),
    ...(isFirstSpaceReviewer ? [{
      id: 'first-space',
      icon: 'ri-store-2-fill',
      label: '매장 개척자',
      desc: `${spaceName}의 첫 번째 리뷰어예요!`,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      isNew: true,
    }] : []),
    ...(reviewStreak >= 3 ? [{
      id: 'streak',
      icon: 'ri-fire-fill',
      label: `${reviewStreak}회 연속 리뷰`,
      desc: '꾸준한 리뷰어예요!',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      isNew: reviewStreak === 3,
    }] : []),
    {
      id: 'contributor',
      icon: 'ri-database-2-fill',
      label: '데이터 기여자',
      desc: '히트맵 데이터에 기여했어요',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      isNew: false,
    },
  ];

  const confettiItems = Array.from({ length: 18 }, (_, i) => i);

  const handleCopyLink = async () => {
    const shareText = `${spaceName} ${seatId} 자리 리뷰를 작성했어요! ⭐${'★'.repeat(rating)} — SeatReview에서 확인해보세요.`;
    const shareUrl = window.location.origin;
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    } catch {
      const el = document.createElement('textarea');
      el.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const handleKakaoShare = () => {
    const shareText = `${spaceName} ${seatId} 자리 리뷰를 작성했어요! ⭐${'★'.repeat(rating)}\nSeatReview에서 확인해보세요.`;
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=12c76eda3ab8499974a1a67c26033491&text=${encodeURIComponent(shareText)}`;
    window.open(kakaoUrl, '_blank', 'width=500,height=600');
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `${spaceName} 좌석 리뷰`,
      text: `${spaceName} ${seatId} 자리 리뷰를 작성했어요! ⭐${'★'.repeat(rating)}`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 사용자가 취소한 경우 무시
      }
    }
  };

  return (
    <div className={`flex flex-col items-center text-center space-y-5 py-6 transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`}>

      {/* 컨페티 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {confettiItems.map(i => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm opacity-0"
              style={{
                left: `${(i / confettiItems.length) * 100}%`,
                top: '-8px',
                backgroundColor: ['#FCD34D','#F87171','#34D399','#60A5FA','#A78BFA','#FB923C'][i % 6],
                animation: `confettiFall ${0.8 + (i % 5) * 0.2}s ease-in ${i * 0.06}s forwards`,
                transform: `rotate(${i * 20}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* 성공 아이콘 */}
      <div className="relative">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
          isFirstSeatReviewer
            ? 'bg-gradient-to-br from-amber-100 to-amber-200'
            : 'bg-gradient-to-br from-primary-100 to-primary-200'
        }`}>
          <i className={`text-4xl ${isFirstSeatReviewer ? 'ri-trophy-fill text-amber-600' : 'ri-check-line text-primary-700'}`}></i>
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow">
          <i className="ri-star-fill text-white text-xs"></i>
        </div>
      </div>

      {/* 타이틀 */}
      <div className="space-y-1.5">
        {isFirstSeatReviewer ? (
          <>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-700 text-xs font-bold mb-1">
              <i className="ri-award-fill text-sm"></i>
              이 매장의 첫 번째 좌석 등록자예요!
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">리뷰 등록 완료!</h2>
            <p className="text-gray-500 text-xs">{spaceName} · {seatId} 자리의 첫 리뷰어가 되셨어요 🎉</p>
          </>
        ) : isFirstSpaceReviewer ? (
          <>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border border-rose-300 rounded-full text-rose-700 text-xs font-bold mb-1">
              <i className="ri-store-2-fill text-sm"></i>
              이 매장의 첫 번째 리뷰어예요!
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">리뷰 등록 완료!</h2>
            <p className="text-gray-500 text-xs">새로운 매장을 개척하셨어요 🗺️</p>
          </>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-bold text-gray-900">리뷰 등록 완료!</h2>
            <p className="text-gray-500 text-xs">소중한 리뷰가 저장되었습니다</p>
          </>
        )}
      </div>

      {/* 리뷰 요약 */}
      <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-left">
            <div className="text-[10px] text-gray-400 mb-0.5">매장</div>
            <div className="font-semibold text-gray-900 text-sm">{spaceName}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 mb-0.5">좌석</div>
            <div className="font-semibold text-gray-900 text-sm">{seatId}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-center pt-2 border-t border-gray-200">
          {[1, 2, 3, 4, 5].map(s => (
            <i key={s} className={`ri-star-${s <= rating ? 'fill' : 'line'} text-xl ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
          ))}
        </div>
      </div>

      {/* 획득 뱃지 */}
      <div className={`w-full transition-all duration-500 ${badgesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-2 mb-2.5">
          <i className="ri-award-line text-gray-500 text-sm"></i>
          <span className="text-xs font-semibold text-gray-700">획득한 뱃지</span>
          {badges.filter(b => b.isNew).length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-full font-bold">
              NEW {badges.filter(b => b.isNew).length}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {badges.map((badge, idx) => (
            <div
              key={badge.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${badge.bg} ${badge.border}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className={`w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm flex-shrink-0`}>
                <i className={`${badge.icon} text-base ${badge.color}`}></i>
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className={`text-xs font-bold ${badge.color}`}>{badge.label}</div>
                <div className="text-[10px] text-gray-500 truncate">{badge.desc}</div>
              </div>
              {badge.isNew && (
                <span className="text-[9px] px-1.5 py-0.5 bg-white border border-current rounded-full font-bold flex-shrink-0 text-red-500 border-red-300">
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 자동 수집 */}
      <div className="w-full bg-gray-900 rounded-xl p-3.5 text-left">
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-magic-line text-yellow-400 text-sm"></i>
          <span className="text-white text-xs font-semibold">자동 수집 완료</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['방문 시간', '날씨 정보', '요일 데이터', '위치 확인'].map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/10 text-white/80 rounded-full">
              {tag} ✓
            </span>
          ))}
        </div>
      </div>

      {/* SNS 공유 섹션 */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-share-line text-gray-500 text-sm"></i>
          <span className="text-xs font-semibold text-gray-700">리뷰 공유하기</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleKakaoShare}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FEE500] shadow-sm group-hover:scale-110 transition-transform">
              <i className="ri-kakao-talk-fill text-[#3C1E1E] text-base"></i>
            </div>
            <span className="text-[10px] font-semibold text-yellow-800 whitespace-nowrap">카카오톡</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform">
              <i className={`text-base ${copyToast ? 'ri-check-line text-emerald-500' : 'ri-links-line text-gray-600'}`}></i>
            </div>
            <span className={`text-[10px] font-semibold whitespace-nowrap ${copyToast ? 'text-emerald-600' : 'text-gray-700'}`}>
              {copyToast ? '복사됨!' : '링크 복사'}
            </span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform">
              <i className="ri-share-forward-line text-gray-600 text-base"></i>
            </div>
            <span className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">더 보기</span>
          </button>
        </div>

        <div className={`mt-2.5 flex items-center gap-2 justify-center py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200 transition-all duration-300 ${
          copyToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}>
          <i className="ri-check-double-line text-emerald-500 text-sm"></i>
          <span className="text-xs text-emerald-700 font-medium">링크가 클립보드에 복사되었어요!</span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="w-full space-y-2.5">
        <button
          onClick={onWriteAnother}
          className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
        >
          다른 자리 리뷰 작성하기
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:border-gray-900 transition-all whitespace-nowrap cursor-pointer"
        >
          홈으로 돌아가기
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
