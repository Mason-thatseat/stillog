
import { useState, useEffect, useRef } from 'react';
import { searchSpaces, createSpace, Space } from '../../../hooks/useSpaces';

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

interface KakaoSpace extends Space {
  phone?: string;
  kakaoId?: string;
  isKakao?: boolean;
}

interface SpaceSearchProps {
  onSelect: (space: Space) => void;
}

const KAKAO_API_KEY = '12c76eda3ab8499974a1a67c26033491';
const KAKAO_SEARCH_URL = 'https://htabnxfeqdkwgsxfzwlb.supabase.co/functions/v1/kakao-search';

export default function SpaceSearch({ onSelect }: SpaceSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [dbResults, setDbResults] = useState<Space[]>([]);
  const [kakaoResults, setKakaoResults] = useState<KakaoSpace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'db' | 'kakao'>('db');
  const [kakaoError, setKakaoError] = useState('');
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchKakao = async (keyword: string) => {
    if (!keyword.trim()) {
      setKakaoResults([]);
      setSearchMode('db');
      return;
    }
    setIsSearching(true);
    setKakaoError('');
    try {
      const url = `${KAKAO_SEARCH_URL}?query=${encodeURIComponent(keyword)}&category_group_code=FD6,CE7,BK9&size=15`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API 오류');
      const data = await res.json();
      const places: KakaoPlace[] = data.documents ?? [];
      const spaces: KakaoSpace[] = places.map((p) => ({
        id: `kakao_${p.id}`,
        name: p.place_name,
        address: p.road_address_name || p.address_name,
        latitude: parseFloat(p.y),
        longitude: parseFloat(p.x),
        place_id: p.id,
        created_by: '',
        created_at: '',
        phone: p.phone,
        kakaoId: p.id,
        isKakao: true,
      }));
      setKakaoResults(spaces);
      setSearchMode('kakao');
    } catch {
      setKakaoError('검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
      setKakaoResults([]);
      setSearchMode('db');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length === 0) {
      setKakaoResults([]);
      setDbResults([]);
      setSearchMode('db');
      setKakaoError('');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const [dbSpaces] = await Promise.all([
        searchSpaces(query),
        searchKakao(query),
      ]);
      setDbResults(dbSpaces);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const mergedResults: KakaoSpace[] = (() => {
    if (query.trim().length === 0) return [];
    const dbMapped: KakaoSpace[] = dbResults.map((v) => ({ ...v, isKakao: false }));
    const kakaoFiltered = kakaoResults.filter(
      (kv) => !dbResults.some((dv) => dv.name === kv.name && dv.address === kv.address)
    );
    return [...dbMapped, ...kakaoFiltered];
  })();

  const getTypeIcon = (space: KakaoSpace) => {
    if (space.name.includes('카페') || space.name.toLowerCase().includes('coffee')) return 'ri-cup-line';
    if (space.name.includes('바') || space.name.toLowerCase().includes('bar')) return 'ri-goblet-line';
    return 'ri-restaurant-line';
  };

  const handleSelect = async (space: KakaoSpace) => {
    setRegisterError('');

    // DB에 이미 등록된 매장이면 바로 선택
    if (!space.isKakao) {
      onSelect(space);
      return;
    }

    // 카카오맵 매장 → DB에 자동 등록
    setRegisteringId(space.id);
    try {
      const { data, error } = await createSpace({
        name: space.name,
        address: space.address,
        latitude: space.latitude,
        longitude: space.longitude,
        place_id: space.place_id,
      });

      if (error || !data) {
        // 이미 등록된 경우(중복) 등 에러 처리 — DB에서 다시 검색
        const existing = await searchSpaces(space.name);
        const matched = existing.find(
          (v) => v.name === space.name && v.address === space.address
        );
        if (matched) {
          onSelect(matched);
        } else {
          setRegisterError('매장 등록에 실패했어요. 다시 시도해주세요.');
        }
        return;
      }

      onSelect(data);
    } catch {
      setRegisterError('매장 등록 중 오류가 발생했어요.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">매장 선택</h2>
        <p className="text-sm text-gray-500">방문한 매장을 검색하거나 목록에서 선택하세요</p>
      </div>

      {/* 검색 입력 */}
      <div className="relative">
        <div
          className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all ${
            focused ? 'border-gray-900 bg-white' : 'border-teal-200 bg-teal-50'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center text-gray-400">
            {isSearching ? (
              <i className="ri-loader-4-line text-lg animate-spin"></i>
            ) : (
              <i className="ri-search-line text-lg"></i>
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="매장명으로 검색 (카카오맵 연동)"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          )}
        </div>

        {/* 카카오맵 연동 뱃지 */}
        {searchMode === 'kakao' && !isSearching && kakaoResults.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#FEE500', color: '#191919' }}
            >
              <svg viewBox="0 0 24 24" width="10" height="10" fill="#191919">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.08 4.03 6.53L5.1 21l4.56-2.4c.76.1 1.54.16 2.34.16 5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
              </svg>
              카카오맵
            </span>
            <span className="text-xs text-gray-400">
              실제 매장 {kakaoResults.length}개 검색됨
            </span>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {(kakaoError || registerError) && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
          <i className="ri-error-warning-line text-sm flex-shrink-0"></i>
          <span>{kakaoError || registerError}</span>
        </div>
      )}

      {/* 카카오맵 매장 자동 등록 안내 */}
      {!isSearching && kakaoResults.length > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
          <i className="ri-information-line text-sm flex-shrink-0 mt-0.5"></i>
          <span>
            <strong>카카오맵</strong> 매장을 선택하면 자동으로 등록 후 좌석 선택으로 이동해요
          </span>
        </div>
      )}

      <div className="space-y-2">
        {/* 로딩 스켈레톤 */}
        {isSearching && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-white animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                </div>
                <div className="w-12 h-5 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* 검색 결과 */}
        {!isSearching &&
          mergedResults.map((space) => {
            const isRegistering = registeringId === space.id;
            return (
              <button
                key={space.id}
                onClick={() => handleSelect(space)}
                disabled={!!registeringId}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left group ${
                  isRegistering
                    ? 'border-teal-400 bg-teal-50 shadow-md'
                    : 'border-transparent bg-white hover:border-gray-900 hover:shadow-md'
                } ${registeringId && !isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
                    isRegistering
                      ? 'bg-teal-500'
                      : 'bg-teal-100 group-hover:bg-gray-900'
                  }`}
                >
                  {isRegistering ? (
                    <i className="ri-loader-4-line text-lg text-white animate-spin"></i>
                  ) : (
                    <i
                      className={`text-lg transition-colors ${getTypeIcon(space)} text-teal-600 group-hover:text-white`}
                    ></i>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{space.name}</span>
                    {!space.isKakao && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium whitespace-nowrap">
                        등록됨
                      </span>
                    )}
                    {space.isKakao && !isRegistering && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
                        style={{ backgroundColor: '#FEE500', color: '#191919' }}
                      >
                        카카오맵
                      </span>
                    )}
                    {isRegistering && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium whitespace-nowrap animate-pulse">
                        등록 중...
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">{space.address}</div>
                  {space.phone && (
                    <div className="text-xs text-gray-400 mt-0.5">{space.phone}</div>
                  )}
                  {isRegistering && (
                    <div className="text-xs text-teal-600 mt-1 font-medium">
                      매장을 등록하고 있어요. 잠시만 기다려주세요...
                    </div>
                  )}
                </div>
                <div
                  className={`w-5 h-5 flex items-center justify-center transition-colors flex-shrink-0 ${
                    isRegistering ? 'text-teal-500' : 'text-gray-300 group-hover:text-gray-900'
                  }`}
                >
                  <i className={`text-lg ${isRegistering ? 'ri-loader-4-line animate-spin' : 'ri-arrow-right-s-line'}`}></i>
                </div>
              </button>
            );
          })}

        {/* 검색 결과 없음 */}
        {!isSearching && mergedResults.length === 0 && query.length > 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 flex items-center justify-center mx-auto mb-3 rounded-full bg-teal-50">
              <i className="ri-store-2-line text-3xl text-teal-400"></i>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              &ldquo;{query}&rdquo; 검색 결과가 없어요
            </p>
            <p className="text-xs text-gray-400 mb-5">
              찾는 매장이 목록에 없다면 직접 추가해보세요
            </p>
            <a
              href="/space-register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <i className="ri-add-line text-base"></i>
              신규 매장 추가하기
            </a>
          </div>
        )}

        {/* 초기 상태 (검색 전) */}
        {query.length === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 flex items-center justify-center mx-auto mb-3 rounded-full bg-teal-50">
              <i className="ri-search-line text-3xl text-teal-400"></i>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">매장을 검색해보세요</p>
            <p className="text-xs text-gray-400">카카오맵과 연동되어 실제 매장을 찾아드려요</p>
          </div>
        )}

        {/* 하단 추가 링크 */}
        {!isSearching && mergedResults.length > 0 && (
          <div className="pt-3 border-t border-teal-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">찾는 매장이 없나요?</span>
            <a
              href="/space-register"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <i className="ri-add-line text-xs"></i>
              </div>
              신규 매장 추가
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
