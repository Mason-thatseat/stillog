import { useState } from 'react';
import { useMyReviews } from '../../../hooks/useReviews';
import { supabase } from '../../../lib/supabase';
import ReportModal from '../../../components/feature/ReportModal';

// ── 타입 정의 ──────────────────────────────────────────────────────────────
interface EditReviewDTO {
  id: string;
  space: string;
  seat: string;
  rating: number;
  comment: string;
  tags: string[];
}

const RATING_LABELS = ['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요!'];

const ALL_TAGS = [
  '창가석', '콘센트 있음', '조용함', '뷰가 좋음', '소파석',
  '바 자리', '1인석', '대화하기 좋음', 'Wi-Fi 빠름', 'USB 충전 가능',
  '조명 밝음', '조명 어두움', '혼자 집중하기 좋음', '야외 테라스',
  '직원 서비스 좋음', '음식 빨리 나옴', '환기 잘 됨',
];

// ── 수정 모달 ──────────────────────────────────────────────────────────────
function EditModal({
  review,
  onSave,
  onClose,
}: {
  review: EditReviewDTO;
  onSave: (updated: Partial<EditReviewDTO>) => void;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(review.comment);
  const [tags, setTags] = useState<string[]>(review.tags);

  const displayRating = hoverRating || rating;

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave({ rating, comment, tags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 본체 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900">리뷰 수정</h3>
            <p className="text-xs text-gray-500 mt-0.5">{review.space} · {review.seat}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-500 text-lg"></i>
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* 별점 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">자리 만족도</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                >
                  <i
                    className={`ri-star-${displayRating >= star ? 'fill' : 'line'} text-3xl transition-colors ${
                      displayRating >= star ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  ></i>
                </button>
              ))}
              {displayRating > 0 && (
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {RATING_LABELS[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* 코멘트 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">한 줄 코멘트</label>
            <div className="relative">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value.slice(0, 100))}
                placeholder="이 자리에 대한 짧은 후기를 남겨주세요..."
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 resize-none transition-colors"
              />
              <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                {comment.length}/100
              </span>
            </div>
          </div>

          {/* 태그 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">
              좌석 태그
              <span className="ml-1.5 text-xs font-normal text-gray-400">복수 선택 가능</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                    tags.includes(tag)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {tags.includes(tag) && (
                    <i className="ri-check-line mr-1 text-xs"></i>
                  )}
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 삭제 확인 다이얼로그 ───────────────────────────────────────────────────
function DeleteDialog({
  review,
  onConfirm,
  onClose,
}: {
  review: EditReviewDTO;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 flex items-center justify-center bg-red-50 rounded-full mx-auto mb-4">
          <i className="ri-delete-bin-5-line text-2xl text-red-500"></i>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">리뷰를 삭제할까요?</h3>
        <p className="text-sm text-gray-500 mb-1">
          <span className="font-medium text-gray-700">{review.space}</span>의 리뷰가
        </p>
        <p className="text-sm text-gray-500 mb-6">삭제되면 복구할 수 없어요.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 토스트 알림 ────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'delete' }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
      <div
        className={`flex items-center gap-2.5 px-5 py-3 rounded-full shadow-lg text-sm font-medium text-white whitespace-nowrap ${
          type === 'success' ? 'bg-gray-900' : 'bg-red-500'
        }`}
      >
        <i className={`${type === 'success' ? 'ri-check-circle-line' : 'ri-delete-bin-line'} text-base`}></i>
        {message}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────
export default function MyReviewsTab() {
  const { reviews, loading, refresh } = useMyReviews();
  const [sortBy, setSortBy] = useState<'latest' | 'likes'>('latest');
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [deletingReview, setDeletingReview] = useState<any | null>(null);
  const [reportingReview, setReportingReview] = useState<any | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'delete' | 'report' } | null>(null);

  const showToast = (message: string, type: 'success' | 'delete' | 'report') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const sorted = [...reviews].sort((a, b) =>
    sortBy === 'likes' ? 0 : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleSaveEdit = async (updated: { rating: number; comment: string; tags: string[] }) => {
    if (!editingReview) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: updated.comment,
          rating: updated.rating,
        })
        .eq('id', editingReview.id);

      if (error) throw error;

      await refresh();
      setEditingReview(null);
      showToast('리뷰가 수정됐어요!', 'success');
    } catch (err) {
      console.error('리뷰 수정 실패:', err);
      alert('리뷰 수정에 실패했습니다.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', deletingReview.id);

      if (error) throw error;

      await refresh();
      setDeletingReview(null);
      showToast('리뷰가 삭제됐어요.', 'delete');
    } catch (err) {
      console.error('리뷰 삭제 실패:', err);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  const handleReportSubmit = (reason: string, detail: string) => {
    console.info('신고 접수:', { id: reportingReview?.id, reason, detail });
    if (reportingReview) {
      setReportedIds(prev => new Set(prev).add(reportingReview.id));
    }
  };

  const handleReportClose = () => {
    if (reportingReview && reportedIds.has(reportingReview.id)) {
      showToast('신고가 접수됐어요. 검토 후 조치할게요.', 'report');
    }
    setReportingReview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* 정렬 */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            총 <strong className="text-gray-900">{reviews.length}개</strong>의 리뷰
          </p>
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {(['latest', 'likes'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === opt
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt === 'latest' ? '최신순' : '좋아요순'}
              </button>
            ))}
          </div>
        </div>

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full">
              <i className="ri-quill-pen-line text-2xl"></i>
            </div>
            <p className="text-sm">아직 작성한 리뷰가 없어요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(review => {
              const isReported = reportedIds.has(review.id);
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* 이미지 */}
                    <div className="sm:w-36 h-40 sm:h-auto flex-shrink-0">
                      <img
                        src={review.image_url}
                        alt={review.space?.name || '매장'}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    {/* 내용 */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mt-1">
                              {review.space?.name || '알 수 없는 매장'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              <i className="ri-map-pin-2-line mr-1"></i>
                              {review.seat?.label || '좌석'}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i
                                key={i}
                                className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-sm ${
                                  i < review.rating ? 'text-amber-400' : 'text-gray-200'
                                }`}
                              ></i>
                            ))}
                          </div>
                        </div>
                        {review.content && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {review.content}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingReview(review)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 cursor-pointer transition-colors whitespace-nowrap px-2 py-1 rounded-lg hover:bg-gray-100"
                          >
                            <i className="ri-edit-line text-xs"></i>
                            수정
                          </button>
                          <button
                            onClick={() => setDeletingReview(review)}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors whitespace-nowrap px-2 py-1 rounded-lg hover:bg-red-50"
                          >
                            <i className="ri-delete-bin-line text-xs"></i>
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {editingReview && (
        <EditModal
          review={{
            id: editingReview.id,
            space: editingReview.space?.name || '매장',
            seat: editingReview.seat?.label || '좌석',
            rating: editingReview.rating,
            comment: editingReview.content || '',
            tags: [],
          }}
          onSave={handleSaveEdit}
          onClose={() => setEditingReview(null)}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deletingReview && (
        <DeleteDialog
          review={{
            id: deletingReview.id,
            space: deletingReview.space?.name || '매장',
          }}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingReview(null)}
        />
      )}

      {/* 신고 모달 */}
      {reportingReview && (
        <ReportModal
          reviewId={reportingReview.id}
          spaceName={reportingReview.space?.name || '매장'}
          onClose={handleReportClose}
          onSubmit={handleReportSubmit}
        />
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-full shadow-lg text-sm font-medium text-white whitespace-nowrap ${
              toast.type === 'success' ? 'bg-gray-900' :
              toast.type === 'report' ? 'bg-gray-800' : 'bg-red-500'
            }`}
          >
            <i className={`${
              toast.type === 'success' ? 'ri-check-circle-line' :
              toast.type === 'report' ? 'ri-shield-check-line text-green-400' : 'ri-delete-bin-line'
            } text-base`}></i>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
