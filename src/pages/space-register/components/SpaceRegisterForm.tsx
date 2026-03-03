
import { useState, useRef } from 'react';
import { createSpace } from '../../../hooks/useSpaces';

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string;
  y: string;
}

interface SpaceRegisterFormProps {
  submitAddr?: string;
  onSuccess?: (spaceId: string, spaceName: string, spaceAddress: string, spaceType: string) => void;
}

const KAKAO_SEARCH_URL = 'https://htabnxfeqdkwgsxfzwlb.supabase.co/functions/v1/kakao-search';
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

export default function SpaceRegisterForm({ onSuccess }: SpaceRegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    place_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 카카오맵 검색 상태
  const [kakaoQuery, setKakaoQuery] = useState('');
  const [kakaoResults, setKakaoResults] = useState<KakaoPlace[]>([]);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [kakaoError, setKakaoError] = useState('');
  const [showKakaoResults, setShowKakaoResults] = useState(false);
  const [selectedFromKakao, setSelectedFromKakao] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchKakao = async (keyword: string) => {
    if (!keyword.trim()) {
      setKakaoResults([]);
      setShowKakaoResults(false);
      return;
    }
    setKakaoLoading(true);
    setKakaoError('');
    try {
      const url = `${KAKAO_SEARCH_URL}?query=${encodeURIComponent(keyword)}&size=10`;
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) throw new Error('API 오류');
      const data = await res.json();
      setKakaoResults(data.documents ?? []);
      setShowKakaoResults(true);
    } catch {
      setKakaoError('카카오맵 검색 중 오류가 발생했어요.');
      setKakaoResults([]);
    } finally {
      setKakaoLoading(false);
    }
  };

  const handleKakaoQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKakaoQuery(val);
    setSelectedFromKakao(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchKakao(val), 400);
  };

  const handleKakaoSelect = (place: KakaoPlace) => {
    setFormData({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      latitude: place.y,
      longitude: place.x,
      place_id: place.id,
    });
    setKakaoQuery(place.place_name);
    setShowKakaoResults(false);
    setSelectedFromKakao(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      setError('매장명과 주소는 필수 입력 항목입니다');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: submitError } = await createSpace({
      name: formData.name,
      address: formData.address,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      place_id: formData.place_id || undefined,
    });

    setLoading(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    if (onSuccess && data?.id) {
      onSuccess(data.id, formData.name, formData.address, '카페');
    } else if (data?.id) {
      window.REACT_APP_NAVIGATE(`/space/${data.id}`);
    } else {
      window.REACT_APP_NAVIGATE('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* 카카오맵 자동 검색 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카카오맵에서 매장 검색
        </label>
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={kakaoQuery}
              onChange={handleKakaoQueryChange}
              onFocus={() => kakaoResults.length > 0 && setShowKakaoResults(true)}
              placeholder="매장명으로 검색하면 자동으로 입력돼요"
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-teal-50 focus:bg-white transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              {kakaoLoading ? (
                <i className="ri-loader-4-line text-teal-500 animate-spin text-sm"></i>
              ) : (
                <i className="ri-search-line text-gray-400 text-sm"></i>
              )}
            </div>
            {selectedFromKakao && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-checkbox-circle-fill text-teal-500 text-sm"></i>
              </div>
            )}
          </div>

          {/* 카카오맵 검색 결과 드롭다운 */}
          {showKakaoResults && kakaoResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#FEE500', color: '#191919' }}
                >
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="#191919">
                    <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.08 4.03 6.53L5.1 21l4.56-2.4c.76.1 1.54.16 2.34.16 5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
                  </svg>
                  카카오맵
                </span>
                <span className="text-xs text-gray-400">{kakaoResults.length}개 검색됨</span>
              </div>
              {kakaoResults.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleKakaoSelect(place)}
                  className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 text-sm">{place.place_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {place.road_address_name || place.address_name}
                  </div>
                  {place.phone && (
                    <div className="text-xs text-gray-400 mt-0.5">{place.phone}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {kakaoError && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <i className="ri-error-warning-line"></i>{kakaoError}
          </p>
        )}
        {selectedFromKakao && (
          <p className="mt-1.5 text-xs text-teal-600 flex items-center gap-1">
            <i className="ri-checkbox-circle-line"></i>카카오맵 정보가 자동으로 입력됐어요
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">또는 직접 입력</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <i className="ri-error-warning-line text-red-600 text-xl"></i>
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            매장명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
            placeholder="매장 이름을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주소 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
            placeholder="매장 주소를 입력하세요"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">위도</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
              placeholder="37.5665"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">경도</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
              placeholder="126.9780"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카카오맵 Place ID</label>
          <input
            type="text"
            name="place_id"
            value={formData.place_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
            placeholder="카카오맵 검색 시 자동 입력"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium whitespace-nowrap text-sm"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                등록 중...
              </>
            ) : (
              '매장 등록'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
