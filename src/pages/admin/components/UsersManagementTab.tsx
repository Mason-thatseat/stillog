import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

type Role = 'user' | 'owner' | 'admin';
type Gender = 'male' | 'female' | 'other';

interface UserProfile {
  id: string;
  nickname: string | null;
  email: string | null;
  profile_image: string | null;
  role: Role | null;
  birth_year: number | null;
  gender: Gender | null;
  created_at: string;
}

interface EditForm {
  birth_year: string;
  gender: Gender | '';
  role: Role;
}

const ROLE_LABELS: Record<Role, string> = { user: '일반회원', owner: '오너', admin: '관리자' };
const GENDER_LABELS: Record<Gender, string> = { male: '남성', female: '여성', other: '기타' };

const roleBadge = (role: Role | null) => {
  if (!role) return <span className="text-xs text-gray-400">-</span>;
  const styles: Record<Role, string> = {
    user: 'bg-blue-100 text-blue-700',
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
};

type RoleFilter = 'all' | Role;

export default function UsersManagementTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<EditForm>({ birth_year: '', gender: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, email, profile_image, role, birth_year, gender, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as UserProfile[]) || []);
    } catch {
      showToast('error', '회원 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEdit = (u: UserProfile) => {
    setEditTarget(u);
    setForm({
      birth_year: u.birth_year ? String(u.birth_year) : '',
      gender: u.gender ?? '',
      role: u.role ?? 'user',
    });
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const patch: { birth_year: number | null; gender: Gender | null; role: Role } = {
        birth_year: form.birth_year ? parseInt(form.birth_year, 10) : null,
        gender: form.gender || null,
        role: form.role,
      };

      const { error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', editTarget.id);

      if (error) throw error;

      setUsers(prev =>
        prev.map(u => u.id === editTarget.id ? { ...u, ...patch } : u)
      );
      showToast('success', `${editTarget.nickname ?? '회원'} 정보가 저장되었습니다.`);
      setEditTarget(null);
    } catch {
      showToast('error', '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (u.nickname ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const filterButtons: { id: RoleFilter; label: string }[] = [
    { id: 'all', label: '전체' },
    { id: 'user', label: '일반회원' },
    { id: 'owner', label: '오너' },
    { id: 'admin', label: '관리자' },
  ];

  return (
    <div>
      {/* 토스트 */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-teal-500' : 'bg-red-500'
        }`}>
          <i className={toast.type === 'success' ? 'ri-check-circle-line text-lg' : 'ri-error-warning-line text-lg'}></i>
          {toast.message}
        </div>
      )}

      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">총 <strong className="text-gray-900">{users.length}</strong>명</span>
          <div className="flex gap-1 ml-2">
            {filterButtons.map(btn => (
              <button
                key={btn.id}
                onClick={() => setRoleFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  roleFilter === btn.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="닉네임, 이메일 검색"
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 w-64"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-10">번호</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">닉네임</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">이메일</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">출생연도</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">성별</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">역할</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">가입일</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">수정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-400">
                  <i className="ri-user-line text-4xl mb-3 block"></i>
                  {searchQuery || roleFilter !== 'all' ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                </td>
              </tr>
            ) : (
              filtered.map((u, idx) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {u.profile_image ? (
                        <img src={u.profile_image} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <i className="ri-user-line text-gray-400 text-xs"></i>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{u.nickname ?? '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">{u.email ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{u.birth_year ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {u.gender ? GENDER_LABELS[u.gender] : '-'}
                  </td>
                  <td className="px-4 py-4">{roleBadge(u.role)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => openEdit(u)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-edit-line"></i>
                      수정
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 수정 모달 */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">회원 정보 수정</h3>
                <button
                  onClick={() => setEditTarget(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-5">
                <span className="font-medium text-gray-800">{editTarget.nickname}</span>
                {editTarget.email && <span className="ml-1">({editTarget.email})</span>}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">출생연도</label>
                  <input
                    type="number"
                    value={form.birth_year}
                    onChange={e => setForm(f => ({ ...f, birth_year: e.target.value }))}
                    placeholder="예: 1995"
                    min={1900}
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">성별</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender | '' }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white cursor-pointer"
                  >
                    <option value="">선택 안 함</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">역할</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white cursor-pointer"
                  >
                    <option value="user">일반회원</option>
                    <option value="owner">오너</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditTarget(null)}
                  disabled={saving}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>저장 중...
                    </span>
                  ) : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
