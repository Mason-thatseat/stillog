
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface Space {
  id: string;
  name: string;
  address: string | null;
  created_by: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  ownerNickname?: string;
}

export default function SpaceApprovalTab() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('id, name, address, created_by, created_at, latitude, longitude')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 소유자 닉네임 조회
      const spacesWithOwner: Space[] = await Promise.all(
        (data || []).map(async (space) => {
          if (!space.created_by) return { ...space, ownerNickname: '알 수 없음' };
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', space.created_by)
            .maybeSingle();
          return { ...space, ownerNickname: profile?.nickname ?? '알 수 없음' };
        })
      );

      setSpaces(spacesWithOwner);
    } catch {
      showToast('error', '매장 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setSpaces(prev => prev.filter(s => s.id !== deleteTarget.id));
      showToast('success', `"${deleteTarget.name}" 매장이 삭제되었습니다.`);
      setDeleteTarget(null);
    } catch {
      showToast('error', '매장 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const filtered = spaces.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.address ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.ownerNickname ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">총 <strong className="text-gray-900">{spaces.length}</strong>개 매장</span>
        </div>
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="매장명, 주소, 등록자 검색"
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 w-64"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">매장명</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">주소</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">등록자</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">등록일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <i className="ri-store-line text-4xl mb-3 block"></i>
                  {searchQuery ? '검색 결과가 없습니다.' : '등록된 매장이 없습니다.'}
                </td>
              </tr>
            ) : (
              filtered.map(space => (
                <tr key={space.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{space.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {space.address ?? '주소 없음'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{space.ownerNickname}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{formatDate(space.created_at)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteTarget(space)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="w-14 h-14 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">매장 삭제</h3>
              <p className="text-gray-600 text-center text-sm leading-relaxed mb-1">
                아래 매장을 삭제하시겠습니까?
              </p>
              <p className="text-center font-semibold text-gray-900 mb-2">"{deleteTarget.name}"</p>
              <p className="text-red-500 text-xs text-center mb-6">
                삭제된 매장과 관련된 좌석, 리뷰 데이터도 함께 삭제될 수 있습니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>삭제 중...
                    </span>
                  ) : '삭제 확인'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
