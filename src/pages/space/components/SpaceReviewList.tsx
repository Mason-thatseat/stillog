import { useState } from 'react';
import { useReviews } from '../../../hooks/useReviews';
import ReportModal from '../../../components/feature/ReportModal';

type SortType = 'latest' | 'rating-high' | 'rating-low' | 'helpful';

interface SpaceReviewListProps {
  spaceId: string;
}

export default function SpaceReviewList({ spaceId }: SpaceReviewListProps) {
  const { reviews, loading } = useReviews(spaceId);
  const [sortType, setSortType] = useState<SortType>('latest');
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortType) {
      case 'latest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      case 'helpful':
        return 0;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* 정렬 옵션 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          리뷰 <span className="text-teal-600">{reviews.length}</span>
        </h3>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="latest">최신순</option>
          <option value="rating-high">평점 높은순</option>
          <option value="rating-low">평점 낮은순</option>
        </select>
      </div>

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
            <i className="ri-chat-3-line text-2xl"></i>
          </div>
          <p className="text-sm">아직 등록된 리뷰가 없어요</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-200">
              {/* 리뷰 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full text-teal-700 font-bold">
                    {review.user?.nickname?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.user?.nickname || '익명'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-sm ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setReportingReviewId(review.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="신고하기"
                >
                  <i className="ri-flag-line text-lg"></i>
                </button>
              </div>

              {/* 좌석 정보 */}
              {review.seat && (
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-map-pin-line text-teal-600"></i>
                  <span className="text-sm font-medium text-gray-700">
                    {review.seat.label}
                  </span>
                </div>
              )}

              {/* 리뷰 내용 */}
              {review.content && (
                <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>
              )}

              {/* 리뷰 이미지 */}
              {review.image_url && (
                <div className="mb-4">
                  <img
                    src={review.image_url}
                    alt="리뷰 이미지"
                    className="w-full max-w-md h-48 object-cover object-top rounded-lg"
                  />
                </div>
              )}

              {/* 리뷰 액션 */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors whitespace-nowrap">
                  <i className="ri-thumb-up-line"></i>
                  도움돼요
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 신고 모달 */}
      {reportingReviewId && (
        <ReportModal
          reviewId={reportingReviewId}
          onClose={() => setReportingReviewId(null)}
        />
      )}
    </div>
  );
}
