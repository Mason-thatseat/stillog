import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

const QUICK_TABS = [
  { label: '🔥 지금 뜨는 매장', id: 'trending' },
  { label: '🕐 최근 리뷰', id: 'recent' },
  { label: '❤️ 인기 리뷰', id: 'popular' },
];

const POPULAR_TAGS = ['강남 카페', '홍대 음식점', '성수 루프탑'];

const KAKAO_API_KEY = '12c76eda3ab8499974a1a67c26033491';

interface SpaceSuggestion {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  isKakao?: boolean;
}

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
}

function getCategoryLabel(categoryName: string): string {
  if (categoryName.includes('카페')) return '카페';
  if (
    categoryName.includes('음식점') ||
    categoryName.includes('한식') ||
    categoryName.includes('일식') ||
    categoryName.includes('중식') ||
    categoryName.includes('양식') ||
    categoryName.includes('분식')
  ) return '레스토랑';
  if (categoryName.includes('술집') || categoryName.includes('바')) return '바';
  if (categoryName.includes('호텔') || categoryName.includes('라운지')) return '라운지';
  return '기타';
}

export default function HeroSection() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localFiltered, setLocalFiltered] = useState<SpaceSuggestion[]>([]);
  const [kakaoResults, setKakaoResults] = useState<SpaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allLocalSpaces: SpaceSuggestion[] = [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 카카오 API 검색
  const searchKakao = async (keyword: string) => {
    if (!keyword.trim()) {
      setKakaoResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&category_group_code=FD6,CE7,BK9&size=8`;
      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
      });
      if (!res.ok) throw new Error('API 오류');
      const data = await res.json();
      const places: KakaoPlace[] = data.documents ?? [];
      const spaces: SpaceSuggestion[] = places.map(p => ({
        id: `kakao_${p.id}`,
        name: p.place_name,
        type: getCategoryLabel(p.category_name),
        address: p.road_address_name || p.address_name,
        phone: p.phone,
        isKakao: true,
      }));
      setKakaoResults(spaces);
    } catch {
      setKakaoResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const q = query.trim();
    if (q) {
      const results = allLocalSpaces.filter(v =>
        v.name.includes(q) || v.address.includes(q) || v.type.includes(q)
      );
      setLocalFiltered(results);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => searchKakao(q), 400);
    } else {
      setLocalFiltered([]);
      setKakaoResults([]);
      setIsSearching(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // 중복 제거: 로컬 + 카카오 합산 (로컬 우선)
  const mergedResults: SpaceSuggestion[] = (() => {
    const q = query.trim();
    if (!q) return allLocalSpaces;
    const localNames = new Set(localFiltered.map(v => v.name));
    const kakaoOnly = kakaoResults.filter(v => !localNames.has(v.name));
    return [...localFiltered, ...kakaoOnly];
  })();

  const handleSelectSpace = (space: SpaceSuggestion) => {
    setQuery(space.name);
    setShowSuggestions(false);
    navigate(`/space/${space.id}`);
  };

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    const exact = mergedResults.find(v => v.name === q);
    if (exact) { navigate(`/space/${exact.id}`); return; }
    if (mergedResults.length > 0) { navigate(`/space/${mergedResults[0].id}`); return; }
    navigate(`/review?q=${encodeURIComponent(q)}`);
  };

  const handleTagSearch = (tag: string) => {
    navigate(`/review?q=${encodeURIComponent(tag)}`);
  };

  const handleRegisterSpace = () => {
    setShowSuggestions(false);
    navigate(`/space-register?q=${encodeURIComponent(query)}`);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getTypeIcon = (type: string) => {
    if (type === '카페') return 'ri-cup-line';
    if (type === '라운지') return 'ri-hotel-line';
    if (type === '바') return 'ri-goblet-line';
    return 'ri-restaurant-line';
  };

  const displaySuggestions = mergedResults;
  const hasKakaoResults = kakaoResults.length > 0 && query.trim().length > 0;

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50">
      <Navigation scrolled={scrolled} />

      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left */}
          <div className="flex-1 w-full space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                자리 하나가<br />
                <span className="text-accent-500">공간의 가치</span>를<br />
                바꿉니다
              </h1>
              <p className="text-base sm:text-xl text-gray-500 font-sans leading-relaxed max-w-xl pt-3 sm:pt-4">
                음식이 아닌 <strong className="text-gray-700">내 자리에서의 경험</strong>을 기록하는<br className="hidden sm:block" />
                좌석 기반 리뷰 플랫폼
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-lg">
              <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-visible">
                <div className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center pl-3 sm:pl-4 flex-shrink-0">
                  {isSearching
                    ? <i className="ri-loader-4-line text-gray-400 text-lg sm:text-xl animate-spin"></i>
                    : <i className="ri-search-line text-gray-400 text-lg sm:text-xl"></i>
                  }
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="매장명, 주소, 카테고리 검색"
                  className="flex-1 min-w-0 py-3 sm:py-4 px-2 sm:px-3 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setKakaoResults([]); }}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <i className="ri-close-line text-base"></i>
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="m-1.5 sm:m-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-gray-700 transition-all whitespace-nowrap cursor-pointer"
                >
                  검색
                </button>
              </div>

              {/* 카카오맵 연동 뱃지 */}
              {hasKakaoResults && !isSearching && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#FEE500', color: '#191919' }}
                  >
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="#191919">
                      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.08 4.03 6.53L5.1 21l4.56-2.4c.76.1 1.54.16 2.34.16 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                    </svg>
                    카카오맵
                  </span>
                  <span className="text-xs text-gray-400">실제 매장 {kakaoResults.length}개 포함</span>
                </div>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
                  {/* 로딩 스켈레톤 */}
                  {isSearching && displaySuggestions.length === 0 && (
                    <div className="space-y-1 p-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isSearching && displaySuggestions.length > 0 && (
                    <>
                      {query.trim() && (
                        <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium">
                            검색 결과 {displaySuggestions.length}개
                          </span>
                          {hasKakaoResults && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: '#FEE500', color: '#191919' }}
                            >
                              <svg viewBox="0 0 24 24" width="8" height="8" fill="#191919">
                                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.08 4.03 6.53L5.1 21l4.56-2.4c.76.1 1.54.16 2.34.16 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                              </svg>
                              카카오맵 연동
                            </span>
                          )}
                        </div>
                      )}
                      {!query.trim() && (
                        <div className="px-4 py-2 border-b border-gray-50">
                          <span className="text-xs text-gray-400 font-medium">전체 매장</span>
                        </div>
                      )}
                      {displaySuggestions.map(space => {
                        return (
                          <button
                            key={space.id}
                            onMouseDown={() => handleSelectSpace(space)}
                            className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-primary-50 transition-colors cursor-pointer text-left group"
                          >
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-900 transition-colors flex-shrink-0">
                              <i className={`text-sm transition-colors ${getTypeIcon(space.type)} text-gray-500 group-hover:text-white`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-800">{space.name}</span>
                                {space.isKakao && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
                                    style={{ backgroundColor: '#FEE500', color: '#191919' }}
                                  >
                                    카카오맵
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 truncate">{space.address}</div>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 whitespace-nowrap flex-shrink-0">
                              {space.type}
                            </span>
                          </button>
                        );
                      })}
                    </>
                  )}

                  {!isSearching && displaySuggestions.length === 0 && query.trim() && (
                    <div className="px-5 py-6 text-center">
                      <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2 rounded-full bg-gray-100">
                        <i className="ri-store-2-line text-xl text-gray-400"></i>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        &ldquo;{query}&rdquo; 검색 결과가 없어요
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        아직 등록되지 않은 매장이에요.<br />직접 등록하고 첫 번째 리뷰어가 되어보세요!
                      </p>
                      <button
                        onMouseDown={handleRegisterSpace}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-add-circle-line text-base"></i>
                        직접 매장 등록하기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2">
              <span className="text-sm text-gray-500 self-center">인기 검색:</span>
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagSearch(tag)}
                  className="text-xs sm:text-sm px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-gray-400 transition-all cursor-pointer whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick access tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-1">
              <span className="text-sm text-gray-500 self-center">바로가기:</span>
              {QUICK_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all cursor-pointer whitespace-nowrap shadow-sm font-medium"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                onClick={() => navigate('/review')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-sm sm:text-base"
              >
                리뷰 작성하기
                <i className="ri-arrow-right-line"></i>
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-all whitespace-nowrap cursor-pointer text-sm sm:text-base">
                데모 보기
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="hidden lg:block flex-1 relative w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://readdy.ai/api/search-image?query=restaurant%20seating%20heatmap%20visualization%20with%20warm%20gradient%20colors%20from%20blue%20to%20red%20showing%20popular%20seats%20top%20view%20floor%20plan%20modern%20clean%20interface%20professional%20data%20visualization%20soft%20beige%20background&width=800&height=600&seq=stillog-hero-heatmap&orientation=landscape"
                alt="좌석 히트맵"
                className="w-full h-auto object-top object-cover"
              />
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                <div className="text-sm text-gray-600 mb-1">실시간 리뷰 수</div>
                <div className="text-3xl font-bold text-gray-900">12,847개</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden leading-none">
        <div className="h-8 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}></div>
      </div>
    </section>
  );
}
