import { useState } from 'react';

interface ReportModalProps {
  reviewId: string;
  onClose: () => void;
}

type ReportReason = '스팸/광고' | '욕설/비방' | '허위정보' | '기타';

export default function ReportModal({ reviewId, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reasons: ReportReason[] = ['스팸/광고', '욕설/비방', '허위정보', '기타'];

  const handleSubmit = () => {
    if (!selectedReason) return;

    // 실제로는 여기서 API 호출
    console.log('신고 제출:', {
      reviewId,
      reason: selectedReason,
      additionalInfo,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-3xl text-green-600"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">신고가 접수되었습니다</h3>
          <p className="text-gray-600">
            검토 후 적절한 조치를 취하겠습니다.
            <br />
            신고해 주셔서 감사합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">리뷰 신고하기</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 안내 메시지 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <i className="ri-information-line text-xl text-amber-600 mt-0.5"></i>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  부적절한 리뷰를 신고해 주시면 검토 후 적절한 조치를 취하겠습니다.
                  허위 신고는 제재 대상이 될 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 신고 사유 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              신고 사유 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all whitespace-nowrap ${
                    selectedReason === reason
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all ${
                      selectedReason === reason
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedReason === reason && (
                      <i className="ri-check-line text-xs text-white"></i>
                    )}
                  </div>
                  <span className={`font-medium ${
                    selectedReason === reason ? 'text-teal-700' : 'text-gray-700'
                  }`}>
                    {reason}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 추가 설명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              추가 설명 (선택)
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="신고 사유에 대한 추가 설명을 입력해 주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {additionalInfo.length}/500
            </p>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedReason
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              신고하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}