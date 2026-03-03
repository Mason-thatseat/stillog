export const mockSpaces = [
  { id: 'v1', name: '블루보틀 성수점', type: '카페', address: '서울 성동구 성수이로 78' },
  { id: 'v2', name: '온더테이블 강남점', type: '레스토랑', address: '서울 강남구 테헤란로 152' },
  { id: 'v3', name: '카페 드 파리', type: '카페', address: '서울 마포구 연남로 45' },
  { id: 'v4', name: '스시 오마카세 긴자', type: '레스토랑', address: '서울 강남구 도산대로 211' },
  { id: 'v5', name: '더 라운지 호텔신라', type: '라운지', address: '서울 중구 동호로 249' },
];

// 좌석 선호 태그 전체 목록 (카테고리별)
export const seatTagCategories = [
  {
    category: '편의시설',
    icon: 'ri-plug-line',
    tags: ['콘센트 있음', 'USB 충전 가능', 'Wi-Fi 빠름', '조명 밝음', '조명 어두움'],
  },
  {
    category: '위치 특성',
    icon: 'ri-map-pin-line',
    tags: ['창가석', '구석 자리', '입구 근처', '카운터 뷰', '야외 테라스'],
  },
  {
    category: '분위기',
    icon: 'ri-music-line',
    tags: ['조용함', '음악 잘 들림', '대화하기 좋음', '혼자 집중하기 좋음', '뷰가 좋음'],
  },
  {
    category: '좌석 유형',
    icon: 'ri-armchair-line',
    tags: ['소파석', '바 자리', '단체석', '1인석', '높은 의자'],
  },
  {
    category: '기타',
    icon: 'ri-star-line',
    tags: ['직원 서비스 좋음', '음식 빨리 나옴', '냄새 없음', '환기 잘 됨', '반려동물 동반 가능'],
  },
];

// ─── 매장별 평면도 레이아웃 ───────────────────────────────────────────────

export type SeatData = {
  id: string;
  row: number;
  col: number;
  type: string;
  zone: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ZoneData = {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
};

export type FixtureData = {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type WindowData = {
  id: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  offset: number;   // 해당 벽면 기준 시작 위치 (px)
  length: number;   // 창문 길이 (px)
  label: string;
};

export type EntranceData = {
  id: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  offset: number;
  length: number;
  label: string;
  isMain: boolean;  // true = 주출입구, false = 보조출입구
};

export type SpaceLayout = {
  width: number;
  height: number;
  windowSide: 'top' | 'left' | 'right' | 'none';
  entranceSide: 'bottom' | 'left' | 'right';
  windows: WindowData[];
  entrances: EntranceData[];
  fixtures: FixtureData[];
  zones: ZoneData[];
  seats: SeatData[];
};

export const spaceLayouts: Record<string, SpaceLayout> = {
  // ── v1: 블루보틀 성수점 (직사각형, 창가 상단, 바 좌측) ──
  v1: {
    width: 620,
    height: 500,
    windowSide: 'top',
    entranceSide: 'bottom',
    windows: [
      { id: 'w1', side: 'top', offset: 0, length: 620, label: '창문' },
    ],
    entrances: [
      { id: 'e1', side: 'bottom', offset: 260, length: 100, label: '주출입구', isMain: true },
    ],
    fixtures: [
      { id: 'counter', label: '카운터', icon: 'ri-cup-line', x: 240, y: 110, width: 140, height: 70, color: 'bg-stone-300' },
    ],
    zones: [
      { id: 'window-zone', label: '창가존', color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', icon: 'ri-sun-line', x: 0, y: 0, width: 620, height: 100, description: '자연광이 들어오는 창가 자리' },
      { id: 'bar-zone', label: '바 존', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: 'ri-goblet-line', x: 0, y: 110, width: 220, height: 180, description: '혼자 집중하기 좋은 바 자리' },
      { id: 'sofa-zone', label: '소파존', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', icon: 'ri-sofa-line', x: 0, y: 310, width: 300, height: 180, description: '편안한 소파 자리' },
      { id: 'normal-zone', label: '일반석', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: 'ri-armchair-line', x: 400, y: 110, width: 220, height: 380, description: '기본 테이블 자리' },
    ],
    seats: [
      { id: 'A1', row: 0, col: 0, type: 'window', zone: 'window-zone', tags: ['창가석', '뷰가 좋음'], rating: 4.8, reviewCount: 23, x: 20, y: 20, width: 65, height: 55 },
      { id: 'A2', row: 0, col: 1, type: 'window', zone: 'window-zone', tags: ['창가석', '조용함'], rating: 4.5, reviewCount: 18, x: 100, y: 20, width: 65, height: 55 },
      { id: 'A3', row: 0, col: 2, type: 'window', zone: 'window-zone', tags: ['창가석', '콘센트 있음'], rating: 4.9, reviewCount: 31, x: 180, y: 20, width: 65, height: 55 },
      { id: 'A4', row: 0, col: 3, type: 'window', zone: 'window-zone', tags: ['창가석', '조명 밝음'], rating: 4.3, reviewCount: 15, x: 310, y: 20, width: 65, height: 55 },
      { id: 'A5', row: 0, col: 4, type: 'window', zone: 'window-zone', tags: ['창가석', '혼자 집중하기 좋음'], rating: 4.7, reviewCount: 27, x: 390, y: 20, width: 65, height: 55 },
      { id: 'A6', row: 0, col: 5, type: 'window', zone: 'window-zone', tags: ['창가석'], rating: 4.2, reviewCount: 12, x: 530, y: 20, width: 65, height: 55 },
      { id: 'B1', row: 1, col: 0, type: 'bar', zone: 'bar-zone', tags: ['바 자리', '콘센트 있음', '혼자 집중하기 좋음'], rating: 4.6, reviewCount: 20, x: 20, y: 130, width: 55, height: 45 },
      { id: 'B2', row: 1, col: 1, type: 'bar', zone: 'bar-zone', tags: ['바 자리', 'USB 충전 가능'], rating: 4.4, reviewCount: 17, x: 20, y: 190, width: 55, height: 45 },
      { id: 'B3', row: 1, col: 2, type: 'bar', zone: 'bar-zone', tags: ['바 자리', '콘센트 있음'], rating: 4.7, reviewCount: 22, x: 90, y: 130, width: 55, height: 45 },
      { id: 'B4', row: 1, col: 3, type: 'bar', zone: 'bar-zone', tags: ['바 자리', '조용함'], rating: 4.3, reviewCount: 14, x: 90, y: 190, width: 55, height: 45 },
      { id: 'B5', row: 1, col: 4, type: 'bar', zone: 'bar-zone', tags: ['바 자리', '1인석'], rating: 4.5, reviewCount: 19, x: 160, y: 130, width: 55, height: 45 },
      { id: 'B6', row: 1, col: 5, type: 'bar', zone: 'bar-zone', tags: ['바 자리'], rating: 4.1, reviewCount: 11, x: 160, y: 190, width: 55, height: 45 },
      { id: 'D1', row: 3, col: 0, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', '조용함', '콘센트 있음'], rating: 4.9, reviewCount: 35, x: 20, y: 330, width: 110, height: 65 },
      { id: 'D2', row: 3, col: 1, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', '대화하기 좋음'], rating: 4.7, reviewCount: 28, x: 150, y: 330, width: 110, height: 65 },
      { id: 'D3', row: 3, col: 2, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', '뷰가 좋음'], rating: 4.8, reviewCount: 32, x: 20, y: 415, width: 110, height: 65 },
      { id: 'D4', row: 3, col: 3, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', 'USB 충전 가능'], rating: 4.6, reviewCount: 25, x: 150, y: 415, width: 110, height: 65 },
      { id: 'E1', row: 4, col: 0, type: 'normal', zone: 'normal-zone', tags: ['조용함', '콘센트 있음'], rating: 4.1, reviewCount: 9, x: 420, y: 130, width: 65, height: 55 },
      { id: 'E2', row: 4, col: 1, type: 'normal', zone: 'normal-zone', tags: ['Wi-Fi 빠름'], rating: 3.8, reviewCount: 7, x: 500, y: 130, width: 65, height: 55 },
      { id: 'E3', row: 4, col: 2, type: 'normal', zone: 'normal-zone', tags: ['콘센트 있음', '조명 밝음'], rating: 4.2, reviewCount: 14, x: 420, y: 210, width: 65, height: 55 },
      { id: 'E4', row: 4, col: 3, type: 'normal', zone: 'normal-zone', tags: [], rating: 3.5, reviewCount: 5, x: 500, y: 210, width: 65, height: 55 },
      { id: 'E5', row: 4, col: 4, type: 'normal', zone: 'normal-zone', tags: ['조용함'], rating: 4.0, reviewCount: 11, x: 420, y: 310, width: 65, height: 55 },
      { id: 'E6', row: 4, col: 5, type: 'normal', zone: 'normal-zone', tags: ['콘센트 있음'], rating: 3.9, reviewCount: 8, x: 500, y: 310, width: 65, height: 55 },
      { id: 'E7', row: 4, col: 6, type: 'normal', zone: 'normal-zone', tags: ['대화하기 좋음'], rating: 4.1, reviewCount: 10, x: 420, y: 390, width: 65, height: 55 },
      { id: 'E8', row: 4, col: 7, type: 'normal', zone: 'normal-zone', tags: [], rating: 3.7, reviewCount: 6, x: 500, y: 390, width: 65, height: 55 },
    ],
  },

  // ── v2: 온더테이블 강남점 ──
  v2: {
    width: 620,
    height: 500,
    windowSide: 'right',
    entranceSide: 'left',
    windows: [
      { id: 'w1', side: 'right', offset: 0, length: 500, label: '통창' },
    ],
    entrances: [
      { id: 'e1', side: 'left', offset: 180, length: 80, label: '주출입구', isMain: true },
    ],
    fixtures: [
      { id: 'kitchen', label: '주방', icon: 'ri-restaurant-line', x: 0, y: 180, width: 100, height: 140, color: 'bg-orange-200' },
      { id: 'bar', label: '바', icon: 'ri-goblet-line', x: 0, y: 0, width: 100, height: 160, color: 'bg-amber-200' },
    ],
    zones: [
      { id: 'window-zone', label: '창가석', color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', icon: 'ri-sun-line', x: 480, y: 0, width: 140, height: 500, description: '통창 뷰 창가 자리' },
      { id: 'center-zone', label: '중앙석', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: 'ri-table-line', x: 120, y: 0, width: 340, height: 300, description: '넓은 중앙 테이블' },
      { id: 'private-zone', label: '프라이빗룸', color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', icon: 'ri-door-closed-line', x: 120, y: 320, width: 340, height: 180, description: '독립된 프라이빗 공간' },
    ],
    seats: [
      { id: 'W1', row: 0, col: 0, type: 'window', zone: 'window-zone', tags: ['창가석', '뷰가 좋음', '조명 밝음'], rating: 4.9, reviewCount: 42, x: 495, y: 20, width: 110, height: 65 },
      { id: 'W2', row: 0, col: 1, type: 'window', zone: 'window-zone', tags: ['창가석', '뷰가 좋음'], rating: 4.8, reviewCount: 38, x: 495, y: 105, width: 110, height: 65 },
      { id: 'W3', row: 0, col: 2, type: 'window', zone: 'window-zone', tags: ['창가석', '대화하기 좋음'], rating: 4.7, reviewCount: 31, x: 495, y: 190, width: 110, height: 65 },
      { id: 'W4', row: 0, col: 3, type: 'window', zone: 'window-zone', tags: ['창가석', '콘센트 있음'], rating: 4.6, reviewCount: 27, x: 495, y: 275, width: 110, height: 65 },
      { id: 'W5', row: 0, col: 4, type: 'window', zone: 'window-zone', tags: ['창가석'], rating: 4.5, reviewCount: 22, x: 495, y: 360, width: 110, height: 65 },
      { id: 'W6', row: 0, col: 5, type: 'window', zone: 'window-zone', tags: ['창가석', '뷰가 좋음'], rating: 4.7, reviewCount: 29, x: 495, y: 420, width: 110, height: 65 },
      { id: 'C1', row: 1, col: 0, type: 'normal', zone: 'center-zone', tags: ['음식 빨리 나옴'], rating: 4.2, reviewCount: 15, x: 140, y: 20, width: 75, height: 60 },
      { id: 'C2', row: 1, col: 1, type: 'normal', zone: 'center-zone', tags: ['대화하기 좋음'], rating: 4.0, reviewCount: 12, x: 235, y: 20, width: 75, height: 60 },
      { id: 'C3', row: 1, col: 2, type: 'normal', zone: 'center-zone', tags: ['Wi-Fi 빠름'], rating: 3.9, reviewCount: 10, x: 330, y: 20, width: 75, height: 60 },
      { id: 'C4', row: 1, col: 3, type: 'normal', zone: 'center-zone', tags: ['조용함'], rating: 4.1, reviewCount: 13, x: 140, y: 110, width: 75, height: 60 },
      { id: 'C5', row: 1, col: 4, type: 'normal', zone: 'center-zone', tags: ['콘센트 있음'], rating: 4.3, reviewCount: 17, x: 235, y: 110, width: 75, height: 60 },
      { id: 'C6', row: 1, col: 5, type: 'normal', zone: 'center-zone', tags: [], rating: 3.8, reviewCount: 9, x: 330, y: 110, width: 75, height: 60 },
      { id: 'C7', row: 1, col: 6, type: 'normal', zone: 'center-zone', tags: ['음식 빨리 나옴', '직원 서비스 좋음'], rating: 4.4, reviewCount: 19, x: 140, y: 200, width: 75, height: 60 },
      { id: 'C8', row: 1, col: 7, type: 'normal', zone: 'center-zone', tags: ['대화하기 좋음'], rating: 4.0, reviewCount: 11, x: 235, y: 200, width: 75, height: 60 },
      { id: 'C9', row: 1, col: 8, type: 'normal', zone: 'center-zone', tags: [], rating: 3.7, reviewCount: 8, x: 330, y: 200, width: 75, height: 60 },
      { id: 'P1', row: 2, col: 0, type: 'group', zone: 'private-zone', tags: ['단체석', '조용함', '냄새 없음'], rating: 4.8, reviewCount: 24, x: 140, y: 340, width: 130, height: 70 },
      { id: 'P2', row: 2, col: 1, type: 'group', zone: 'private-zone', tags: ['단체석', '대화하기 좋음'], rating: 4.6, reviewCount: 20, x: 290, y: 340, width: 130, height: 70 },
      { id: 'P3', row: 2, col: 2, type: 'group', zone: 'private-zone', tags: ['단체석', '콘센트 있음', '직원 서비스 좋음'], rating: 4.7, reviewCount: 22, x: 140, y: 425, width: 130, height: 60 },
      { id: 'P4', row: 2, col: 3, type: 'group', zone: 'private-zone', tags: ['단체석'], rating: 4.5, reviewCount: 18, x: 290, y: 425, width: 130, height: 60 },
    ],
  },

  // ── v3: 카페 드 파리 ──
  v3: {
    width: 620,
    height: 500,
    windowSide: 'top',
    entranceSide: 'right',
    windows: [
      { id: 'w1', side: 'top', offset: 180, length: 240, label: '창문' },
    ],
    entrances: [
      { id: 'e1', side: 'right', offset: 200, length: 80, label: '주출입구', isMain: true },
    ],
    fixtures: [
      { id: 'counter', label: '카운터', icon: 'ri-cup-line', x: 0, y: 0, width: 180, height: 120, color: 'bg-stone-300' },
    ],
    zones: [
      { id: 'terrace-zone', label: '야외 테라스', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300', icon: 'ri-plant-line', x: 420, y: 0, width: 200, height: 500, description: '야외 테라스 자리' },
      { id: 'window-zone', label: '창가존', color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', icon: 'ri-sun-line', x: 200, y: 0, width: 200, height: 200, description: '자연광 창가 자리' },
      { id: 'sofa-zone', label: '소파존', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', icon: 'ri-sofa-line', x: 0, y: 140, width: 400, height: 180, description: '편안한 소파 자리' },
      { id: 'normal-zone', label: '일반석', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: 'ri-armchair-line', x: 0, y: 340, width: 400, height: 160, description: '기본 테이블 자리' },
    ],
    seats: [
      { id: 'T1', row: 0, col: 0, type: 'window', zone: 'terrace-zone', tags: ['야외 테라스', '뷰가 좋음', '환기 잘 됨'], rating: 4.9, reviewCount: 45, x: 435, y: 20, width: 80, height: 65 },
      { id: 'T2', row: 0, col: 1, type: 'window', zone: 'terrace-zone', tags: ['야외 테라스', '반려동물 동반 가능'], rating: 4.8, reviewCount: 38, x: 435, y: 105, width: 80, height: 65 },
      { id: 'T3', row: 0, col: 2, type: 'window', zone: 'terrace-zone', tags: ['야외 테라스', '뷰가 좋음'], rating: 4.7, reviewCount: 32, x: 435, y: 190, width: 80, height: 65 },
      { id: 'T4', row: 0, col: 3, type: 'window', zone: 'terrace-zone', tags: ['야외 테라스', '환기 잘 됨'], rating: 4.6, reviewCount: 28, x: 435, y: 275, width: 80, height: 65 },
      { id: 'T5', row: 0, col: 4, type: 'window', zone: 'terrace-zone', tags: ['야외 테라스'], rating: 4.5, reviewCount: 24, x: 435, y: 360, width: 80, height: 65 },
      { id: 'T6', row: 0, col: 5, type: 'window', zone: 'terrace-zone', tags: ['야외 테라스', '반려동물 동반 가능'], rating: 4.7, reviewCount: 30, x: 435, y: 420, width: 80, height: 65 },
      { id: 'W1', row: 1, col: 0, type: 'window', zone: 'window-zone', tags: ['창가석', '조명 밝음', '혼자 집중하기 좋음'], rating: 4.7, reviewCount: 26, x: 215, y: 20, width: 80, height: 65 },
      { id: 'W2', row: 1, col: 1, type: 'window', zone: 'window-zone', tags: ['창가석', '콘센트 있음'], rating: 4.5, reviewCount: 21, x: 310, y: 20, width: 80, height: 65 },
      { id: 'W3', row: 1, col: 2, type: 'window', zone: 'window-zone', tags: ['창가석', '1인석'], rating: 4.6, reviewCount: 23, x: 215, y: 110, width: 80, height: 65 },
      { id: 'W4', row: 1, col: 3, type: 'window', zone: 'window-zone', tags: ['창가석', 'USB 충전 가능'], rating: 4.4, reviewCount: 18, x: 310, y: 110, width: 80, height: 65 },
      { id: 'S1', row: 2, col: 0, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', '조용함', '콘센트 있음'], rating: 4.8, reviewCount: 33, x: 15, y: 160, width: 110, height: 70 },
      { id: 'S2', row: 2, col: 1, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', '대화하기 좋음'], rating: 4.6, reviewCount: 27, x: 145, y: 160, width: 110, height: 70 },
      { id: 'S3', row: 2, col: 2, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', 'USB 충전 가능'], rating: 4.7, reviewCount: 29, x: 275, y: 160, width: 110, height: 70 },
      { id: 'S4', row: 2, col: 3, type: 'sofa', zone: 'sofa-zone', tags: ['소파석'], rating: 4.5, reviewCount: 22, x: 15, y: 250, width: 110, height: 60 },
      { id: 'S5', row: 2, col: 4, type: 'sofa', zone: 'sofa-zone', tags: ['소파석', '조용함'], rating: 4.4, reviewCount: 19, x: 145, y: 250, width: 110, height: 60 },
      { id: 'N1', row: 3, col: 0, type: 'normal', zone: 'normal-zone', tags: ['조용함'], rating: 4.0, reviewCount: 11, x: 15, y: 360, width: 80, height: 60 },
      { id: 'N2', row: 3, col: 1, type: 'normal', zone: 'normal-zone', tags: ['Wi-Fi 빠름', '콘센트 있음'], rating: 4.2, reviewCount: 14, x: 115, y: 360, width: 80, height: 60 },
      { id: 'N3', row: 3, col: 2, type: 'normal', zone: 'normal-zone', tags: ['1인석'], rating: 3.9, reviewCount: 9, x: 215, y: 360, width: 80, height: 60 },
      { id: 'N4', row: 3, col: 3, type: 'normal', zone: 'normal-zone', tags: [], rating: 3.7, reviewCount: 7, x: 315, y: 360, width: 80, height: 60 },
      { id: 'N5', row: 3, col: 4, type: 'normal', zone: 'normal-zone', tags: ['조용함', '혼자 집중하기 좋음'], rating: 4.1, reviewCount: 12, x: 15, y: 430, width: 80, height: 55 },
      { id: 'N6', row: 3, col: 5, type: 'normal', zone: 'normal-zone', tags: ['콘센트 있음'], rating: 3.8, reviewCount: 8, x: 115, y: 430, width: 80, height: 55 },
    ],
  },

  // ── v4: 스시 오마카세 긴자 ──
  v4: {
    width: 620,
    height: 500,
    windowSide: 'none',
    entranceSide: 'bottom',
    windows: [],
    entrances: [
      { id: 'e1', side: 'bottom', offset: 260, length: 100, label: '주출입구', isMain: true },
    ],
    fixtures: [
      { id: 'sushi-bar', label: '스시 바', icon: 'ri-restaurant-line', x: 160, y: 130, width: 300, height: 180, color: 'bg-stone-400' },
    ],
    zones: [
      { id: 'counter-zone', label: '카운터석', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: 'ri-goblet-line', x: 100, y: 80, width: 420, height: 300, description: '셰프와 마주보는 카운터석' },
      { id: 'table-zone', label: '테이블석', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: 'ri-table-line', x: 0, y: 0, width: 620, height: 70, description: '일반 테이블 자리' },
      { id: 'private-zone', label: '프라이빗', color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', icon: 'ri-door-closed-line', x: 0, y: 390, width: 620, height: 110, description: '독립 프라이빗 룸' },
    ],
    seats: [
      { id: 'T1', row: 0, col: 0, type: 'normal', zone: 'table-zone', tags: ['조용함', '냄새 없음'], rating: 4.2, reviewCount: 14, x: 20, y: 10, width: 80, height: 50 },
      { id: 'T2', row: 0, col: 1, type: 'normal', zone: 'table-zone', tags: ['직원 서비스 좋음'], rating: 4.3, reviewCount: 16, x: 120, y: 10, width: 80, height: 50 },
      { id: 'T3', row: 0, col: 2, type: 'normal', zone: 'table-zone', tags: ['대화하기 좋음'], rating: 4.1, reviewCount: 12, x: 270, y: 10, width: 80, height: 50 },
      { id: 'T4', row: 0, col: 3, type: 'normal', zone: 'table-zone', tags: [], rating: 4.0, reviewCount: 10, x: 370, y: 10, width: 80, height: 50 },
      { id: 'T5', row: 0, col: 4, type: 'normal', zone: 'table-zone', tags: ['조용함'], rating: 4.2, reviewCount: 13, x: 520, y: 10, width: 80, height: 50 },
      { id: 'K1', row: 1, col: 0, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰', '직원 서비스 좋음', '음식 빨리 나옴'], rating: 4.9, reviewCount: 52, x: 115, y: 95, width: 55, height: 50 },
      { id: 'K2', row: 1, col: 1, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰', '직원 서비스 좋음'], rating: 4.8, reviewCount: 47, x: 180, y: 95, width: 55, height: 50 },
      { id: 'K3', row: 1, col: 2, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰', '음식 빨리 나옴'], rating: 4.9, reviewCount: 50, x: 245, y: 95, width: 55, height: 50 },
      { id: 'K4', row: 1, col: 3, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰'], rating: 4.7, reviewCount: 41, x: 320, y: 95, width: 55, height: 50 },
      { id: 'K5', row: 1, col: 4, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰', '직원 서비스 좋음'], rating: 4.8, reviewCount: 44, x: 385, y: 95, width: 55, height: 50 },
      { id: 'K6', row: 1, col: 5, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰'], rating: 4.7, reviewCount: 39, x: 450, y: 95, width: 55, height: 50 },
      { id: 'K7', row: 2, col: 0, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰', '음식 빨리 나옴'], rating: 4.8, reviewCount: 46, x: 115, y: 330, width: 55, height: 50 },
      { id: 'K8', row: 2, col: 1, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰'], rating: 4.7, reviewCount: 40, x: 180, y: 330, width: 55, height: 50 },
      { id: 'K9', row: 2, col: 2, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰', '직원 서비스 좋음'], rating: 4.9, reviewCount: 48, x: 245, y: 330, width: 55, height: 50 },
      { id: 'K10', row: 2, col: 3, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰'], rating: 4.6, reviewCount: 36, x: 320, y: 330, width: 55, height: 50 },
      { id: 'K11', row: 2, col: 4, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰', '음식 빨리 나옴'], rating: 4.8, reviewCount: 43, x: 385, y: 330, width: 55, height: 50 },
      { id: 'K12', row: 2, col: 5, type: 'bar', zone: 'counter-zone', tags: ['카운터 뷰'], rating: 4.7, reviewCount: 38, x: 450, y: 330, width: 55, height: 50 },
      { id: 'PR1', row: 3, col: 0, type: 'group', zone: 'private-zone', tags: ['단체석', '조용함', '냄새 없음', '직원 서비스 좋음'], rating: 5.0, reviewCount: 28, x: 20, y: 405, width: 150, height: 75 },
      { id: 'PR2', row: 3, col: 1, type: 'group', zone: 'private-zone', tags: ['단체석', '대화하기 좋음'], rating: 4.9, reviewCount: 24, x: 235, y: 405, width: 150, height: 75 },
      { id: 'PR3', row: 3, col: 2, type: 'group', zone: 'private-zone', tags: ['단체석', '콘센트 있음'], rating: 4.8, reviewCount: 21, x: 450, y: 405, width: 150, height: 75 },
    ],
  },

  // ── v5: 더 라운지 호텔신라 ──
  v5: {
    width: 620,
    height: 500,
    windowSide: 'right',
    entranceSide: 'left',
    windows: [
      { id: 'w1', side: 'right', offset: 0, length: 500, label: '전망창' },
    ],
    entrances: [
      { id: 'e1', side: 'left', offset: 180, length: 80, label: '주출입구', isMain: true },
    ],
    fixtures: [
      { id: 'reception', label: '리셉션', icon: 'ri-hotel-line', x: 0, y: 180, width: 100, height: 140, color: 'bg-stone-300' },
      { id: 'bar', label: '바', icon: 'ri-goblet-line', x: 200, y: 200, width: 220, height: 100, color: 'bg-amber-200' },
    ],
    zones: [
      { id: 'view-zone', label: '뷰 좌석', color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', icon: 'ri-landscape-line', x: 460, y: 0, width: 160, height: 500, description: '도심 전망 뷰 자리' },
      { id: 'lounge-zone', label: '라운지석', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', icon: 'ri-sofa-line', x: 110, y: 0, width: 330, height: 180, description: '편안한 라운지 소파' },
      { id: 'dining-zone', label: '다이닝석', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: 'ri-table-line', x: 110, y: 330, width: 330, height: 170, description: '정식 다이닝 테이블' },
    ],
    seats: [
      { id: 'V1', row: 0, col: 0, type: 'window', zone: 'view-zone', tags: ['뷰가 좋음', '창가석', '조명 어두움'], rating: 5.0, reviewCount: 58, x: 475, y: 20, width: 120, height: 70 },
      { id: 'V2', row: 0, col: 1, type: 'window', zone: 'view-zone', tags: ['뷰가 좋음', '창가석', '대화하기 좋음'], rating: 4.9, reviewCount: 52, x: 475, y: 105, width: 120, height: 70 },
      { id: 'V3', row: 0, col: 2, type: 'window', zone: 'view-zone', tags: ['뷰가 좋음', '창가석'], rating: 4.9, reviewCount: 49, x: 475, y: 190, width: 120, height: 70 },
      { id: 'V4', row: 0, col: 3, type: 'window', zone: 'view-zone', tags: ['뷰가 좋음', '콘센트 있음'], rating: 4.8, reviewCount: 44, x: 475, y: 275, width: 120, height: 70 },
      { id: 'V5', row: 0, col: 4, type: 'window', zone: 'view-zone', tags: ['뷰가 좋음', '창가석'], rating: 4.8, reviewCount: 41, x: 475, y: 360, width: 120, height: 70 },
      { id: 'V6', row: 0, col: 5, type: 'window', zone: 'view-zone', tags: ['뷰가 좋음'], rating: 4.7, reviewCount: 37, x: 475, y: 420, width: 120, height: 65 },
      { id: 'L1', row: 1, col: 0, type: 'sofa', zone: 'lounge-zone', tags: ['소파석', '조용함', '직원 서비스 좋음'], rating: 4.8, reviewCount: 36, x: 125, y: 20, width: 120, height: 75 },
      { id: 'L2', row: 1, col: 1, type: 'sofa', zone: 'lounge-zone', tags: ['소파석', '대화하기 좋음', 'USB 충전 가능'], rating: 4.7, reviewCount: 31, x: 265, y: 20, width: 120, height: 75 },
      { id: 'L3', row: 1, col: 2, type: 'sofa', zone: 'lounge-zone', tags: ['소파석', '콘센트 있음'], rating: 4.6, reviewCount: 27, x: 125, y: 110, width: 120, height: 60 },
      { id: 'L4', row: 1, col: 3, type: 'sofa', zone: 'lounge-zone', tags: ['소파석', '조용함'], rating: 4.7, reviewCount: 29, x: 265, y: 110, width: 120, height: 60 },
      { id: 'D1', row: 2, col: 0, type: 'normal', zone: 'dining-zone', tags: ['직원 서비스 좋음', '음식 빨리 나옴', '냄새 없음'], rating: 4.6, reviewCount: 22, x: 125, y: 350, width: 90, height: 65 },
      { id: 'D2', row: 2, col: 1, type: 'normal', zone: 'dining-zone', tags: ['대화하기 좋음', '조용함'], rating: 4.5, reviewCount: 19, x: 235, y: 350, width: 90, height: 65 },
      { id: 'D3', row: 2, col: 2, type: 'normal', zone: 'dining-zone', tags: ['콘센트 있음'], rating: 4.4, reviewCount: 17, x: 345, y: 350, width: 90, height: 65 },
      { id: 'D4', row: 2, col: 3, type: 'normal', zone: 'dining-zone', tags: ['직원 서비스 좋음'], rating: 4.6, reviewCount: 21, x: 125, y: 430, width: 90, height: 55 },
      { id: 'D5', row: 2, col: 4, type: 'normal', zone: 'dining-zone', tags: ['음식 빨리 나옴'], rating: 4.3, reviewCount: 15, x: 235, y: 430, width: 90, height: 55 },
      { id: 'D6', row: 2, col: 5, type: 'normal', zone: 'dining-zone', tags: [], rating: 4.2, reviewCount: 13, x: 345, y: 430, width: 90, height: 55 },
    ],
  },
};

