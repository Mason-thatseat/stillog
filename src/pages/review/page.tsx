import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SpaceSearch from './components/SpaceSearch';
import SeatingMap from './components/SeatingMap';
import ReviewForm, { ReviewData } from './components/ReviewForm';
import ReviewComplete from './components/ReviewComplete';
import NoSeatMap from './components/NoSeatMap';
import { useReviews } from '../../hooks/useReviews';
import { supabase } from '../../lib/supabase';

type Step = 'space' | 'seat' | 'no-seat' | 'form' | 'complete';

interface Space {
  id: string;
  name: string;
  type: string;
  address: string;
}

interface Seat {
  id: string;
  type: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'space', label: '매장 선택', icon: 'ri-store-2-line' },
  { key: 'seat', label: '좌석 선택', icon: 'ri-armchair-line' },
  { key: 'form', label: '리뷰 작성', icon: 'ri-edit-line' },
  { key: 'complete', label: '완료', icon: 'ri-check-line' },
];

export default function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createReview } = useReviews();

  const getInitialState = (): { step: Step; space: Space | null; seat: Seat | null } => {
    const spaceId = searchParams.get('spaceId');
    const spaceName = searchParams.get('spaceName');
    const spaceType = searchParams.get('spaceType');
    const spaceAddress = searchParams.get('spaceAddress');
    const seatId = searchParams.get('seatId');

    if (spaceId && spaceName && spaceType && spaceAddress) {
      const space = { id: spaceId, name: spaceName, type: spaceType, address: spaceAddress };
      if (seatId) {
        return { step: 'form', space, seat: { id: seatId, type: 'normal', tags: [], rating: 0, reviewCount: 0 } };
      }
      return { step: 'seat', space, seat: null };
    }
    return { step: 'space', space: null, seat: null };
  };

  const initial = getInitialState();
  const [step, setStep] = useState<Step>(initial.step);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(initial.space);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(initial.seat);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [isFirstSeatReviewer, setIsFirstSeatReviewer] = useState(false);
  const [isFirstSpaceReviewer, setIsFirstSpaceReviewer] = useState(false);
  const [reviewStreak, setReviewStreak] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const spaceId = searchParams.get('spaceId');
    const spaceName = searchParams.get('spaceName');
    const spaceType = searchParams.get('spaceType');
    const spaceAddress = searchParams.get('spaceAddress');
    const seatId = searchParams.get('seatId');

    if (spaceId && spaceName && spaceType && spaceAddress) {
      const space = { id: spaceId, name: spaceName, type: spaceType, address: spaceAddress };
      setSelectedSpace(space);

      if (seatId) {
        setSelectedSeat({ id: seatId, type: 'normal', tags: [], rating: 0, reviewCount: 0 });
        setStep('form');
        return;
      }
      setStep('seat');
    }
  }, [searchParams]);

  const handleSpaceSelect = (space: Space) => {
    setSelectedSpace(space);
    setStep('seat');
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setStep('form');
  };

  const handleReviewSubmit = async (data: ReviewData) => {
    if (!selectedSeat || !selectedSpace || submitting) return;

    setSubmitting(true);
    try {
      const newReview = await createReview({
        seat_id: selectedSeat.id,
        image_url: data.photoPreview || 'https://readdy.ai/api/search-image?query=modern%20cafe%20restaurant%20interior%20cozy%20warm%20lighting%20table%20seat%20view%20Seoul%20Korea%20aesthetic%20minimal&width=600&height=400&seq=default-review&orientation=landscape',
        content: data.comment || undefined,
        rating: data.rating,
      });

      if (newReview) {
        setReviewData(data);
        setIsFirstSeatReviewer(selectedSeat.reviewCount === 0);
        setIsFirstSpaceReviewer(false);
        setReviewStreak(1);
        setStep('complete');
      } else {
        alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('리뷰 제출 실패:', err);
      alert('리뷰 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'no-seat') {
      setStep('space');
      setSelectedSpace(null);
    } else if (step === 'form') {
      const seatId = searchParams.get('seatId');
      const fromSpaceId = searchParams.get('spaceId');
      if (seatId && fromSpaceId) {
        navigate(`/space/${fromSpaceId}`);
      } else {
        setStep('seat');
      }
    } else if (step === 'seat') {
      const fromSpaceId = searchParams.get('spaceId');
      if (fromSpaceId) {
        navigate(`/space/${fromSpaceId}`);
      } else {
        setStep('space');
      }
    } else if (step === 'complete') {
      setStep('space');
      setSelectedSpace(null);
      setSelectedSeat(null);
      setReviewData(null);
    }
  };

  const handleWriteAnother = () => {
    setStep('space');
    setSelectedSpace(null);
    setSelectedSeat(null);
    setReviewData(null);
  };

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-primary-50 font-sans">
      {/* 상단 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary-100 shadow-sm">
        <div className="max-w-lg mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => step === 'space' ? navigate('/') : handleBack()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-lg text-gray-700"></i>
          </button>

          <a href="/" className="flex items-center">
            <img
              src="https://static.readdy.ai/image/cc9e82def12023b7995899e43f92dbd6/e86db5a38ffdb2df4649ee0d6ea04809.svg"
              alt="Stillog"
              className="h-6 w-auto"
            />
          </a>

          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100">
            <i className="ri-user-line text-sm text-primary-600"></i>
          </div>
        </div>
      </header>

      {/* 스텝 인디케이터 */}
      {step !== 'complete' && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-primary-100">
          <div className="max-w-lg mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {STEPS.filter(s => s.key !== 'complete').map((s, idx) => {
                const isActive = s.key === step;
                const isDone = currentStepIndex > idx;
                return (
                  <div key={s.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                        isDone ? 'bg-gray-900 text-white' :
                        isActive ? 'bg-gray-900 text-white ring-2 sm:ring-4 ring-gray-200' :
                        'bg-primary-100 text-gray-400'
                      }`}>
                        {isDone ? <i className="ri-check-line text-xs"></i> : idx + 1}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap truncate ${
                        isActive ? 'text-gray-900' : isDone ? 'text-gray-500' : 'text-gray-400'
                      }`}>{s.label}</span>
                    </div>
                    {idx < 2 && (
                      <div className={`h-0.5 flex-1 mx-0.5 sm:mx-1 rounded-full transition-all min-w-[8px] ${
                        isDone ? 'bg-gray-900' : 'bg-primary-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 매장 + 좌석 자동 선택 안내 배너 */}
      {step === 'form' && selectedSpace && selectedSeat && searchParams.get('seatId') && (
        <div className="fixed top-[104px] sm:top-[112px] left-0 right-0 z-30">
          <div className="max-w-lg mx-auto px-3 sm:px-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl shadow-md">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-armchair-line text-xs"></i>
              </div>
              <span className="truncate">
                <strong>{selectedSpace.name}</strong> · <strong>{selectedSeat.id}</strong> 자리가 자동 선택됐어요
              </span>
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 ml-auto">
                <i className="ri-check-line text-xs text-emerald-400"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 매장만 자동 선택 안내 배너 */}
      {step === 'seat' && selectedSpace && searchParams.get('spaceId') && !searchParams.get('seatId') && (
        <div className="fixed top-[104px] sm:top-[112px] left-0 right-0 z-30">
          <div className="max-w-lg mx-auto px-3 sm:px-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl shadow-md">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-store-2-fill text-xs"></i>
              </div>
              <span className="truncate">
                <strong>{selectedSpace.name}</strong>이(가) 자동 선택됐어요
              </span>
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 ml-auto">
                <i className="ri-check-line text-xs text-emerald-400"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className={`max-w-lg mx-auto px-3 sm:px-4 pb-10 sm:pb-12 ${
        step !== 'complete'
          ? ((step === 'form' && searchParams.get('seatId')) || (step === 'seat' && searchParams.get('spaceId')))
            ? 'pt-40 sm:pt-44'
            : 'pt-32 sm:pt-36'
          : 'pt-18 sm:pt-20'
      }`}>
        <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-4 sm:p-6">
          {step === 'space' && (
            <SpaceSearch onSelect={handleSpaceSelect} />
          )}
          {step === 'no-seat' && selectedSpace && (
            <NoSeatMap
              space={selectedSpace}
              onSelectSeat={handleSeatSelect}
              onSkip={handleSeatSelect}
            />
          )}
          {step === 'seat' && selectedSpace && (
            <SeatingMap
              spaceId={selectedSpace.id}
              spaceName={selectedSpace.name}
              onSelect={handleSeatSelect}
            />
          )}
          {step === 'form' && selectedSpace && selectedSeat && (
            <ReviewForm
              spaceName={selectedSpace.name}
              spaceAddress={selectedSpace.address}
              seat={selectedSeat}
              onSubmit={handleReviewSubmit}
            />
          )}
          {step === 'complete' && selectedSpace && selectedSeat && reviewData && (
            <ReviewComplete
              spaceName={selectedSpace.name}
              seatId={selectedSeat.id}
              rating={reviewData.rating}
              onWriteAnother={handleWriteAnother}
              isFirstSeatReviewer={isFirstSeatReviewer}
              isFirstSpaceReviewer={isFirstSpaceReviewer}
              reviewStreak={reviewStreak}
            />
          )}
        </div>

        {step !== 'complete' && (
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <i className="ri-shield-check-line"></i>
            <span>개인정보는 안전하게 보호됩니다</span>
          </div>
        )}
      </main>
    </div>
  );
}
