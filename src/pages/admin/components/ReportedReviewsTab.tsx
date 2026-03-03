import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

type ReportStatus = 'all' | 'pending' | 'reviewed';

interface ReportedReview {
  id: string;
  content: string | null;
  rating: number | null;
  image_url: string;
  report_count: number;
  report_status: string;
  created_at: string;
  user_id: string | null;
  seat_id: string | null;
  authorNickname?: string;
  spaceName?: string;
  seatName?: string;
}

export default function ReportedReviewsTab() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('all');
  const [selectedReport, setSelectedReport] = useState<ReportedReview | null>(null);
  const [reports, setReports] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, rating, image_url, report_count, report_status, created_at, user_id, seat_id')
        .gt('report_count', 0)
        .order('report_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 작성자, 매장, 좌석 정보 조회
      const reportsWithDetails: ReportedReview[] = await Promise.all(
        (data || []).map(async (post) => {
          let authorNickname = '알 수 없음';
          let spaceName = '알 수 없음';
          let seatName = '알 수 없음';

          if (post.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('nickname')
              .eq('id', post.user_id)
              .maybeSingle();
            if (profile) authorNickname = profile.nickname;
          }

          if (post.seat_id) {
            const { data: seat } = await supabase
              .from('seats')
              .select('name, space_id')
              .eq('id', post.seat_id)
              .maybeSingle();

            if (seat) {
              seatName = seat.name || '알 수 없음';
              if (seat.space_id) {
                const { data: space } = await supabase
                  .from('spaces')
                  .select('name')
                  .eq('id', seat.space_id)
                  .maybeSingle();
                if (space) spaceName = space.name;
              }
            }
          }

          return {
            ...post,
            authorNickname,
            spaceName,
            seatName,
          };
        })
      );

      setReports(reportsWithDetails);
    } catch (error) {
      console.error('신고 댓글 조회 실패:', error);
      showToast('error', '신고 댓글을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports.filter((report) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return report.report_status === 'pending' || report.report_status === 'none';
    return report.report_status === 'reviewed' || report.report_status === 'deleted' || report.report_status === 'warned';
  });

  const pendingCount = reports.filter((r) => r.report_status === 'pending' || r.report_status === 'none').length;
  const resolvedCount = reports.filter((r) => r.report_status === 'reviewed' || r.report_status === 'deleted' || r.report_status === 'warned').length;

  const handleResolve = async (reportId: string, action: 'deleted' | 'warned' | 'reviewed') => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ report_status: action })
        .eq('id', reportId);

      if (error) throw error;

      // 삭제 액션인 경우 실제로 댓글 삭제
      if (action === 'deleted') {
        const { error: deleteError } = await supabase
          .from('posts')
          .delete()
          .eq('id', reportId);

        if (deleteError) throw deleteError;
      }

      await fetchReports();
      setSelectedReport(null);
      
      const actionText = action === 'deleted' ? '삭제' : action === 'warned' ? '경고 처리' : '무시 처리';
      showToast('success', `댓글이 ${actionText}되었습니다.`);
    } catch (error) {
      console.error('신고 처리 실패:', error);
      showToast('error', '신고 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'none':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">미처리</span>;
      case 'deleted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 whitespace-nowrap">삭제됨</span>;
      case 'warned':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 whitespace-nowrap">경고됨</span>;
      case 'reviewed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">무시됨</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">알 수 없음</span>;
    }
  };

  return (
    <div>
      {/* 토스트 알림 */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-teal-500' : 'bg-red-500'
        }`}>
          <i className={toast.type === 'success' ? 'ri-check-circle-line text-lg' : 'ri-error-warning-line text-lg'}></i>
          {toast.message}
        </div>
      )}

      {/* 탭 필터 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            statusFilter === 'all'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          전체 ({reports.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            statusFilter === 'pending'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          미처리 ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter('reviewed')}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            statusFilter === 'reviewed'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          처리완료 ({resolvedCount})
        </button>
      </div>

      {/* 신고 목록 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                댓글 내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                신고 횟수
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                매장
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                접수일
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <i className="ri-file-list-3-line text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">신고된 댓글이 없습니다</p>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 line-clamp-2">{report.content || '내용 없음'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-red-600 whitespace-nowrap">{report.report_count}회</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 whitespace-nowrap">{report.authorNickname}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 whitespace-nowrap">{report.spaceName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(report.report_status)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors whitespace-nowrap"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상세보기 모달 */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">신고 댓글 상세</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 신고 정보 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="ri-alarm-warning-line text-2xl text-red-600 mt-0.5"></i>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
                        {selectedReport.report_count}회 신고됨
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      접수일: {new Date(selectedReport.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 댓글 내용 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">댓글 내용</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`ri-star-${
                            i < (selectedReport.rating || 0) ? 'fill' : 'line'
                          } text-sm ${i < (selectedReport.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({selectedReport.rating || 0}.0)</span>
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap mb-3">{selectedReport.content || '내용 없음'}</p>
                  {selectedReport.image_url && (
                    <img 
                      src={selectedReport.image_url} 
                      alt="리뷰 이미지" 
                      className="w-full max-w-sm rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              </div>

              {/* 작성자 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">작성자</h4>
                  <p className="text-sm text-gray-900">{selectedReport.authorNickname}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">매장</h4>
                  <p className="text-sm text-gray-900">{selectedReport.spaceName}</p>
                  <p className="text-xs text-gray-500 mt-1">좌석: {selectedReport.seatName}</p>
                </div>
              </div>

              {/* 처리 내역 (처리완료인 경우) */}
              {(selectedReport.report_status === 'reviewed' || 
                selectedReport.report_status === 'deleted' || 
                selectedReport.report_status === 'warned') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-line text-2xl text-green-600 mt-0.5"></i>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 mb-1">
                        {selectedReport.report_status === 'deleted' ? '댓글 삭제됨' : 
                         selectedReport.report_status === 'warned' ? '경고 처리됨' : '신고 무시됨'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 처리 버튼 (미처리인 경우) */}
              {(selectedReport.report_status === 'pending' || selectedReport.report_status === 'none') && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleResolve(selectedReport.id, 'deleted')}
                    disabled={processing}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap disabled:opacity-60"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    댓글 삭제
                  </button>
                  <button
                    onClick={() => handleResolve(selectedReport.id, 'warned')}
                    disabled={processing}
                    className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap disabled:opacity-60"
                  >
                    <i className="ri-error-warning-line mr-2"></i>
                    경고 처리
                  </button>
                  <button
                    onClick={() => handleResolve(selectedReport.id, 'reviewed')}
                    disabled={processing}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors whitespace-nowrap disabled:opacity-60"
                  >
                    <i className="ri-close-circle-line mr-2"></i>
                    신고 무시
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}