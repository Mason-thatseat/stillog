import { useState, useEffect } from 'react';
import { seatTagCategories } from '../../../mocks/reviewData';
import type { WindowData, EntranceData } from '../../../mocks/reviewData';

type SeatData = {
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

type ZoneData = {
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

type FixtureData = {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

type CanvasSettings = {
  width: number;
  height: number;
  windowSide: 'top' | 'left' | 'right' | 'none';
  entranceSide: 'bottom' | 'left' | 'right';
};

type PropertyPanelProps = {
  selectedElement: { type: 'seat' | 'zone' | 'fixture' | 'window' | 'entrance'; data: any } | null;
  canvasSettings: CanvasSettings;
  zones: any[];
  onUpdateElement: (data: any) => void;
  onUpdateCanvas: (settings: CanvasSettings) => void;
  onDeleteWindow: (id: string) => void;
  onDeleteEntrance: (id: string) => void;
};

const seatTypeOptions = [
  { value: 'window', label: '창가석', icon: 'ri-sun-line' },
  { value: 'bar', label: '바 자리', icon: 'ri-goblet-line' },
  { value: 'sofa', label: '소파석', icon: 'ri-sofa-line' },
  { value: 'group', label: '단체석', icon: 'ri-team-line' },
  { value: 'normal', label: '일반석', icon: 'ri-armchair-line' },
];

const zoneColorOptions = [
  { color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', label: '하늘색' },
  { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: '호박색' },
  { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', label: '로즈' },
  { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: '에메랄드' },
  { color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', label: '보라색' },
  { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', label: '회색' },
  { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300', label: '초록색' },
];

const iconOptions = [
  { value: 'ri-sun-line', label: '태양' },
  { value: 'ri-goblet-line', label: '잔' },
  { value: 'ri-sofa-line', label: '소파' },
  { value: 'ri-team-line', label: '그룹' },
  { value: 'ri-armchair-line', label: '의자' },
  { value: 'ri-landscape-line', label: '풍경' },
  { value: 'ri-table-line', label: '테이블' },
  { value: 'ri-door-closed-line', label: '문' },
  { value: 'ri-plant-line', label: '식물' },
  { value: 'ri-cup-line', label: '컵' },
  { value: 'ri-restaurant-line', label: '레스토랑' },
  { value: 'ri-hotel-line', label: '호텔' },
];

const fixtureColorOptions = [
  { value: 'bg-stone-300', label: '스톤' },
  { value: 'bg-orange-200', label: '오렌지' },
  { value: 'bg-amber-200', label: '호박색' },
  { value: 'bg-slate-300', label: '슬레이트' },
  { value: 'bg-gray-300', label: '회색' },
];

export default function PropertyPanel({
  selectedElement,
  canvasSettings,
  zones,
  onUpdateElement,
  onUpdateCanvas,
  onDeleteWindow,
  onDeleteEntrance,
}: PropertyPanelProps) {
  const [localData, setLocalData] = useState<any>(null);
  const [localCanvas, setLocalCanvas] = useState<CanvasSettings>(canvasSettings);

  useEffect(() => {
    if (selectedElement) {
      setLocalData(selectedElement.data);
    } else {
      setLocalData(null);
    }
  }, [selectedElement]);

  useEffect(() => {
    setLocalCanvas(canvasSettings);
  }, [canvasSettings]);

  const handleChange = (field: string, value: string | number | string[]) => {
    if (!localData) return;
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onUpdateElement(updated);
  };

  const handleCanvasChange = (field: string, value: string | number) => {
    const updated = { ...localCanvas, [field]: value };
    setLocalCanvas(updated);
    onUpdateCanvas(updated);
  };

  const toggleTag = (tag: string) => {
    if (!localData || !('tags' in localData)) return;
    const currentTags = localData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    handleChange('tags', newTags);
  };

  const sideLabel = (side: string) => {
    const map: Record<string, string> = { top: '상단', bottom: '하단', left: '좌측', right: '우측' };
    return map[side] || side;
  };

  // ── 창문 속성 편집 ──
  if (selectedElement?.type === 'window' && localData) {
    const winData = localData as WindowData;
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block"></span>
            창문 속성
          </h2>
          <button
            onClick={() => onDeleteWindow(winData.id)}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-delete-bin-line mr-1"></i>삭제
          </button>
        </div>

        {/* 라벨 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">라벨</label>
          <input
            type="text"
            value={winData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* 벽면 위치 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">벽면 위치</label>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'bottom', 'left', 'right'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleChange('side', s)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                  winData.side === s
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                }`}
              >
                {sideLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* 위치 및 크기 */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">위치 및 크기</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                시작 위치 ({winData.side === 'top' || winData.side === 'bottom' ? '좌→우' : '위→아래'})
              </label>
              <input
                type="number"
                value={winData.offset}
                onChange={(e) => handleChange('offset', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">길이 (px)</label>
              <input
                type="number"
                value={winData.length}
                onChange={(e) => handleChange('length', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          <i className="ri-information-line mr-1"></i>
          캔버스에서 직접 드래그하거나 양 끝 핸들로 크기를 조절할 수 있어요.
        </p>
      </div>
    );
  }

  // ── 출입구 속성 편집 ──
  if (selectedElement?.type === 'entrance' && localData) {
    const enData = localData as EntranceData;
    const accentColor = enData.isMain ? 'emerald' : 'orange';
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm inline-block ${enData.isMain ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
            {enData.isMain ? '주출입구' : '보조출입구'} 속성
          </h2>
          <button
            onClick={() => onDeleteEntrance(enData.id)}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-delete-bin-line mr-1"></i>삭제
          </button>
        </div>

        {/* 라벨 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">라벨</label>
          <input
            type="text"
            value={enData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-400`}
          />
        </div>

        {/* 출입구 유형 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">출입구 유형</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChange('isMain', true)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                enData.isMain
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
              }`}
            >
              <i className="ri-door-open-line mr-1"></i>주출입구
            </button>
            <button
              type="button"
              onClick={() => handleChange('isMain', false)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                !enData.isMain
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
              }`}
            >
              <i className="ri-door-line mr-1"></i>보조출입구
            </button>
          </div>
        </div>

        {/* 벽면 위치 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">벽면 위치</label>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'bottom', 'left', 'right'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleChange('side', s)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                  enData.side === s
                    ? `bg-${accentColor}-500 text-white border-${accentColor}-500`
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {sideLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* 위치 및 크기 */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">위치 및 크기</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                시작 위치 ({enData.side === 'top' || enData.side === 'bottom' ? '좌→우' : '위→아래'})
              </label>
              <input
                type="number"
                value={enData.offset}
                onChange={(e) => handleChange('offset', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">길이 (px)</label>
              <input
                type="number"
                value={enData.length}
                onChange={(e) => handleChange('length', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          <i className="ri-information-line mr-1"></i>
          캔버스에서 직접 드래그하거나 양 끝 핸들로 크기를 조절할 수 있어요.
        </p>
      </div>
    );
  }

  // 좌석 속성 편집
  if (selectedElement?.type === 'seat' && localData && 'type' in localData) {
    const seatData = localData;
    const seatTypeOptions = [
      { value: 'window', label: '창가석', icon: 'ri-sun-line' },
      { value: 'bar', label: '바 자리', icon: 'ri-goblet-line' },
      { value: 'sofa', label: '소파석', icon: 'ri-sofa-line' },
      { value: 'group', label: '단체석', icon: 'ri-team-line' },
      { value: 'normal', label: '일반석', icon: 'ri-armchair-line' },
    ];
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">좌석 속성</h2>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">좌석 ID</label>
          <input
            type="text"
            value={seatData.id}
            onChange={(e) => handleChange('id', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">좌석 유형</label>
          <div className="grid grid-cols-2 gap-2">
            {seatTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('type', option.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                  seatData.type === option.value
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                }`}
              >
                <i className={`${option.icon} mr-1`}></i>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">소속 구역</label>
          <select
            value={seatData.zone}
            onChange={(e) => handleChange('zone', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="">구역 없음</option>
            {zones.map((zone: any) => (
              <option key={zone.id} value={zone.id}>{zone.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">기본 태그</label>
          <div className="space-y-4">
            {seatTagCategories.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-2 mb-2">
                  <i className={`${category.icon} text-gray-600 text-sm`}></i>
                  <span className="text-xs font-medium text-gray-600">{category.category}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {category.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                        seatData.tags?.includes(tag)
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">위치 및 크기</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['x', 'y', 'width', 'height'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-600 mb-1">
                  {field === 'x' ? 'X 좌표' : field === 'y' ? 'Y 좌표' : field === 'width' ? '너비' : '높이'}
                </label>
                <input
                  type="number"
                  value={seatData[field]}
                  onChange={(e) => handleChange(field, Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 구역 속성 편집
  if (selectedElement?.type === 'zone' && localData && 'label' in localData && !('isMain' in localData)) {
    const zoneData = localData;
    const zoneColorOptions = [
      { color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', label: '하늘색' },
      { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: '호박색' },
      { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', label: '로즈' },
      { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: '에메랄드' },
      { color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', label: '보라색' },
      { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', label: '회색' },
      { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300', label: '초록색' },
    ];
    const iconOptions = [
      { value: 'ri-sun-line', label: '태양' },
      { value: 'ri-goblet-line', label: '잔' },
      { value: 'ri-sofa-line', label: '소파' },
      { value: 'ri-team-line', label: '그룹' },
      { value: 'ri-armchair-line', label: '의자' },
      { value: 'ri-landscape-line', label: '풍경' },
      { value: 'ri-table-line', label: '테이블' },
      { value: 'ri-door-closed-line', label: '문' },
      { value: 'ri-plant-line', label: '식물' },
      { value: 'ri-cup-line', label: '컵' },
      { value: 'ri-restaurant-line', label: '레스토랑' },
      { value: 'ri-hotel-line', label: '호텔' },
    ];
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">구역 속성</h2>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">구역명</label>
          <input
            type="text"
            value={zoneData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
          <div className="grid grid-cols-2 gap-2">
            {zoneColorOptions.map((option) => (
              <button
                key={option.color}
                type="button"
                onClick={() => {
                  handleChange('color', option.color);
                  handleChange('bgColor', option.bgColor);
                  handleChange('borderColor', option.borderColor);
                }}
                className={`px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap cursor-pointer ${option.bgColor} ${option.borderColor} ${
                  zoneData.color === option.color ? 'ring-2 ring-teal-500' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">아이콘</label>
          <div className="grid grid-cols-4 gap-2">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('icon', option.value)}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  zoneData.icon === option.value
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                }`}
                title={option.label}
              >
                <i className={`${option.value} text-lg`}></i>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea
            value={zoneData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">위치 및 크기</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['x', 'y', 'width', 'height'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-600 mb-1">
                  {field === 'x' ? 'X 좌표' : field === 'y' ? 'Y 좌표' : field === 'width' ? '너비' : '높이'}
                </label>
                <input
                  type="number"
                  value={zoneData[field]}
                  onChange={(e) => handleChange(field, Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 시설물 속성 편집
  if (selectedElement?.type === 'fixture' && localData && 'label' in localData) {
    const fixtureData = localData;
    const fixtureColorOptions = [
      { value: 'bg-stone-300', label: '스톤' },
      { value: 'bg-orange-200', label: '오렌지' },
      { value: 'bg-amber-200', label: '호박색' },
      { value: 'bg-slate-300', label: '슬레이트' },
      { value: 'bg-gray-300', label: '회색' },
    ];
    const iconOptions = [
      { value: 'ri-sun-line', label: '태양' },
      { value: 'ri-goblet-line', label: '잔' },
      { value: 'ri-sofa-line', label: '소파' },
      { value: 'ri-team-line', label: '그룹' },
      { value: 'ri-armchair-line', label: '의자' },
      { value: 'ri-landscape-line', label: '풍경' },
      { value: 'ri-table-line', label: '테이블' },
      { value: 'ri-door-closed-line', label: '문' },
      { value: 'ri-plant-line', label: '식물' },
      { value: 'ri-cup-line', label: '컵' },
      { value: 'ri-restaurant-line', label: '레스토랑' },
      { value: 'ri-hotel-line', label: '호텔' },
    ];
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">시설물 속성</h2>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">라벨</label>
          <input
            type="text"
            value={fixtureData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">아이콘</label>
          <div className="grid grid-cols-4 gap-2">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('icon', option.value)}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  fixtureData.icon === option.value
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                }`}
                title={option.label}
              >
                <i className={`${option.value} text-lg`}></i>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">배경색</label>
          <div className="grid grid-cols-2 gap-2">
            {fixtureColorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('color', option.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap cursor-pointer ${option.value} ${
                  fixtureData.color === option.value ? 'ring-2 ring-teal-500' : 'border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">위치 및 크기</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['x', 'y', 'width', 'height'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-600 mb-1">
                  {field === 'x' ? 'X 좌표' : field === 'y' ? 'Y 좌표' : field === 'width' ? '너비' : '높이'}
                </label>
                <input
                  type="number"
                  value={fixtureData[field]}
                  onChange={(e) => handleChange(field, Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 캔버스 전체 설정
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">캔버스 설정</h2>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">캔버스 크기</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">너비</label>
            <input
              type="number"
              value={localCanvas.width}
              onChange={(e) => handleCanvasChange('width', Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">높이</label>
            <input
              type="number"
              value={localCanvas.height}
              onChange={(e) => handleCanvasChange('height', Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <i className="ri-information-line text-teal-500"></i>
          창문 &amp; 출입구 추가 방법
        </p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-sky-400 inline-block flex-shrink-0"></span>좌측 패널 → 창문 추가</li>
          <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block flex-shrink-0"></span>좌측 패널 → 주출입구 추가</li>
          <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-orange-400 inline-block flex-shrink-0"></span>좌측 패널 → 보조출입구 추가</li>
        </ul>
        <p className="text-xs text-gray-400 pt-1">추가 후 클릭하면 속성을 편집할 수 있어요.</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          좌석, 구역, 시설물을 선택하면 세부 속성을 편집할 수 있습니다.
        </p>
      </div>
    </div>
  );
}