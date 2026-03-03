
import { useState } from 'react';
import { spaceLayouts } from '../../../mocks/reviewData';

interface Seat {
  id: string;
  type: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

interface NoSeatMapProps {
  space: {
    id: string;
    name: string;
    type: string;
    address: string;
  };
  onSelectSeat: (seat: Seat) => void;
  onSkip: (seat: Seat) => void;
}

const SEAT_TYPES = [
  {
    value: 'window',
    label: '창가석',
    icon: 'ri-sun-line',
    desc: '창문 옆 자연광이 드는 자리',
    color: 'bg-sky-50 border-sky-200 text-sky-700',
  },
  {
    value: 'sofa',
    label: '소파석',
    icon: 'ri-sofa-line',
    desc: '편안한 소파가 있는 자리',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  {
    value: 'bar',
    label: '바 자리',
    icon: 'ri-goblet-line',
    desc: '카운터 앞 바 형태 자리',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  {
    value: 'group',
    label: '단체석',
    icon: 'ri-group-line',
    desc: '여럿이 함께 앉는 큰 테이블',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
  },
  {
    value: 'normal',
    label: '일반석',
    icon: 'ri-armchair-line',
    desc: '기본 테이블 & 의자 자리',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
  },
];

const SEAT_TAGS = [
  { label: '콘센트 있음', icon: 'ri-plug-line' },
  { label: 'Wi-Fi 빠름', icon: 'ri-wifi-line' },
  { label: '조용함', icon: 'ri-volume-mute-line' },
  { label: '뷰가 좋음', icon: 'ri-landscape-line' },
  { label: '혼자 집중하기 좋음', icon: 'ri-user-line' },
  { label: '대화하기 좋음', icon: 'ri-chat-3-line' },
  { label: '조명 밝음', icon: 'ri-sun-line' },
  { label: '조명 어두움', icon: 'ri-moon-line' },
  { label: '반려동물 동반 가능', icon: 'ri-heart-line' },
  { label: '야외 테라스', icon: 'ri-plant-line' },
];

const STORAGE_KEY = 'custom_space_layouts';
const SPACES_STORAGE_KEY = 'custom_spaces';

function generateDefaultLayout(
  spaceId: string,
  seatType: string,
  seatLabel: string,
) {
  const typeMap: Record<string, string> = {
    window: 'window-zone',
    sofa: 'sofa-zone',
    bar: 'bar-zone',
    group: 'group-zone',
    normal: 'normal-zone',
  };
  const zoneId = typeMap[seatType] || 'normal-zone';

  return {
    width: 400,
    height: 300,
    windowSide: 'top' as const,
    entranceSide: 'bottom' as const,
    windows: [
      {
        id: 'w1',
        side: 'top' as const,
        offset: 0,
        length: 400,
        label: '창문',
      },
    ],
    entrances: [
      {
        id: 'e1',
        side: 'bottom' as const,
        offset: 160,
        length: 80,
        label: '주출입구',
        isMain: true,
      },
    ],
    fixtures: [],
    zones: [
      {
        id: zoneId,
        label: seatLabel,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: 'ri-armchair-line',
        x: 20,
        y: 20,
        width: 360,
        height: 220,
        description: `${seatLabel} 구역`,
      },
    ],
    seats: [
      {
        id: 'A1',
        row: 0,
        col: 0,
        type: seatType,
        zone: zoneId,
        tags: [],
        rating: 0,
        reviewCount: 0,
        x: 60,
        y: 80,
        width: 80,
        height: 60,
      },
    ],
  };
}

type FlowStep = 'info' | 'type' | 'tags' | 'label';

export default function NoSeatMap({
  space,
  onSelectSeat,
  onSkip,
}: NoSeatMapProps) {
  const [flowStep, setFlowStep] = useState<FlowStep>('info');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [seatLabel, setSeatLabel] = useState('A1');
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSaveAndContinue = () => {
    setSaving(true);
    const typeInfo = SEAT_TYPES.find((t) => t.value === selectedType);
    const layout = generateDefaultLayout(
      space.id,
      selectedType,
      typeInfo?.label || '일반석',
    );

    // Apply seat label & tags
    layout.seats[0].id = seatLabel || 'A1';
    layout.seats[0].tags = selectedTags;

    try {
      // ---- Persist layout -------------------------------------------------
      const existing = localStorage.getItem(STORAGE_KEY);
      const layouts = existing ? JSON.parse(existing) : {};

      // Guard against unexpected non‑object payloads
      const safeLayouts: Record<string, unknown> =
        typeof layouts === 'object' && layouts !== null ? layouts : {};

      safeLayouts[space.id] = layout;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeLayouts));

      // ---- Persist space list ---------------------------------------------
      const existingSpaces = localStorage.getItem(SPACES_STORAGE_KEY);
      const spaces: { id: string }[] = existingSpaces
        ? JSON.parse(existingSpaces)
        : [];

      if (!spaces.find((v) => v.id === space.id)) {
        spaces.push(space);
        localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(spaces));
      }

      // ---- Update in‑memory mock (so UI reflects instantly) ---------------
      spaceLayouts[space.id] = layout as typeof spaceLayouts[string];
    } catch (err) {
      console.error('Failed to persist custom layout:', err);
      // Fallback: still continue to allow review creation
    }

    // Simulate async saving delay
    setTimeout(() => {
      setSaving(false);
      const seat: Seat = {
        id: seatLabel || 'A1',
        type: selectedType,
        tags: selectedTags,
        rating: 0,
        reviewCount: 0,
      };
      onSelectSeat(seat);
    }, 600);
  };

  const handleSkipToReview = () => {
    const seat: Seat = {
      id: '직접입력',
      type: 'normal',
      tags: [],
      rating: 0,
      reviewCount: 0,
    };
    onSkip(seat);
  };

  // ── 안내 화면 ──────────────────────────────────────────────────────────────
  if (flowStep === 'info') {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            좌석 배치도 없음
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">{space.name}</p>
        </div>

        {/* 안내 카드 */}
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <i className="ri-map-2-line text-3xl text-gray-400"></i>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-base mb-1">
              아직 좌석 배치도가 없어요
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              카카오맵에서 불러온 매장은 아직 좌석 정보가 등록되지 않았어요.
              <br />
              간단하게 앉은 자리 정보를 입력하면 바로 리뷰를 작성할 수 있어요.
            </p>
          </div>

          {/* 매장 정보 */}
          <div className="w-full bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 text-left">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
              <i className="ri-store-2-line text-gray-500 text-base"></i>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {space.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{space.address}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap flex-shrink-0">
              {space.type}
            </span>
          </div>
        </div>

        {/* 선택지 */}
        <div className="space-y-3">
          <button
            onClick={() => setFlowStep('type')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 flex-shrink-0">
              <i className="ri-add-circle-line text-xl"></i>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">자리 정보 입력하고 리뷰 작성</p>
              <p className="text-xs text-white/60 mt-0.5">
                좌석 유형과 특징을 선택해요 (30초)
              </p>
            </div>
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-arrow-right-s-line text-lg"></i>
            </div>
          </button>

          <button
            onClick={handleSkipToReview}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0 group-hover:bg-gray-200 transition-colors">
              <i className="ri-edit-line text-xl text-gray-500"></i>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-gray-800">
                자리 정보 없이 바로 리뷰 작성
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                좌석 선택 없이 매장 전체 리뷰만 남겨요
              </p>
            </div>
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-300 group-hover:text-gray-600 transition-colors">
              <i className="ri-arrow-right-s-line text-lg"></i>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          입력한 자리 정보는 다음 방문자에게도 도움이 돼요 🙌
        </p>
      </div>
    );
  }

  // ── 좌석 유형 선택 ─────────────────────────────────────────────────────────
  if (flowStep === 'type') {
    return (
      <div className="space-y-5">
        <div>
          <button
            onClick={() => setFlowStep('info')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer mb-3"
          >
            <i className="ri-arrow-left-s-line"></i> 뒤로
          </button>
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
            어떤 자리였나요?
          </h2>
          <p className="text-xs text-gray-500">
            앉았던 자리 유형을 선택해 주세요
          </p>
        </div>

        <div className="space-y-2">
          {SEAT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setSelectedType(type.value);
                setFlowStep('tags');
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left hover:shadow-sm ${
                selectedType === type.value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : `${type.color} hover:border-gray-400`
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                  selectedType === type.value ? 'bg-white/10' : 'bg-white'
                }`}
              >
                <i className={`${type.icon} text-xl`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{type.label}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    selectedType === type.value
                      ? 'text-white/60'
                      : 'text-gray-400'
                  }`}
                >
                  {type.desc}
                </p>
              </div>
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-arrow-right-s-line text-lg"></i>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── 태그 선택 ──────────────────────────────────────────────────────────────
  if (flowStep === 'tags') {
    const typeInfo = SEAT_TYPES.find((t) => t.value === selectedType);
    return (
      <div className="space-y-5">
        <div>
          <button
            onClick={() => setFlowStep('type')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer mb-3"
          >
            <i className="ri-arrow-left-s-line"></i> 뒤로
          </button>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 text-white flex-shrink-0">
              <i className={`${typeInfo?.icon} text-sm`}></i>
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              {typeInfo?.label}
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            이 자리의 특징을 선택해 주세요 (복수 선택 가능)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SEAT_TAGS.map((tag) => {
            const isOn = selectedTags.includes(tag.label);
            return (
              <button
                key={tag.label}
                onClick={() => toggleTag(tag.label)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border-2 transition-all cursor-pointer whitespace-nowrap ${
                  isOn
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className={`${tag.icon} text-xs`}></i>
                </div>
                {isOn && <i className="ri-check-line text-[10px]"></i>}
                {tag.label}
              </button>
            );
          })}
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-gray-900 text-white rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => setFlowStep('label')}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          다음 — 자리 이름 입력
        </button>
        <button
          onClick={() => setFlowStep('label')}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          태그 없이 건너뛰기
        </button>
      </div>
    );
  }

  // ── 자리 이름 입력 ─────────────────────────────────────────────────────────
  if (flowStep === 'label') {
    const typeInfo = SEAT_TYPES.find((t) => t.value === selectedType);
    return (
      <div className="space-y-5">
        <div>
          <button
            onClick={() => setFlowStep('tags')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer mb-3"
          >
            <i className="ri-arrow-left-s-line"></i> 뒤로
          </button>
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
            자리 이름을 정해주세요
          </h2>
          <p className="text-xs text-gray-500">
            나중에 같은 자리를 찾을 때 도움이 돼요
          </p>
        </div>

        {/* 선택 요약 */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-900 text-white flex-shrink-0">
              <i className={`${typeInfo?.icon} text-xs`}></i>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {typeInfo?.label}
            </span>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 ml-8">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 자리 이름 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">
            자리 이름 (예: A1, 창가 1번, 소파 왼쪽)
          </label>
          <input
            type="text"
            value={seatLabel}
            onChange={(e) => setSeatLabel(e.target.value.slice(0, 20))}
            placeholder="자리 이름을 입력하세요"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
          />
          <div className="flex flex-wrap gap-1.5">
            {['A1', 'B2', '창가 1번', '소파석', '바 자리 1'].map((preset) => (
              <button
                key={preset}
                onClick={() => setSeatLabel(preset)}
                className="px-2.5 py-1 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSaveAndContinue}
          disabled={saving}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
            saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg'
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <i className="ri-loader-4-line animate-spin"></i>
              저장 중...
            </span>
          ) : (
            '저장하고 리뷰 작성하기 →'
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          입력한 정보는 이 매장의 좌석 배치도로 등록돼요 ✨
        </p>
      </div>
    );
  }

  return null;
}
