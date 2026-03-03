import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Canvas from './components/Canvas';
import ToolPanel from './components/ToolPanel';
import PropertyPanel from './components/PropertyPanel';
import SeatingMap from '../review/components/SeatingMap';
import { type SpaceLayout, type SeatData, type ZoneData, type FixtureData, type WindowData, type EntranceData, mockSpaces } from '../../mocks/reviewData';

const STORAGE_KEY = 'custom_space_layouts';
const SPACES_STORAGE_KEY = 'custom_spaces';

// 로컬 레이아웃 저장소
const spaceLayouts: Record<string, SpaceLayout> = {};

export default function LayoutEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 신규 등록 매장 쿼리 파라미터
  const querySpaceId = searchParams.get('spaceId');
  const querySpaceName = searchParams.get('spaceName');
  const querySpaceType = searchParams.get('spaceType');
  const querySpaceAddress = searchParams.get('spaceAddress');
  const isNewSpace = searchParams.get('isNew') === 'true';

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('v1');
  const [canvasWidth, setCanvasWidth] = useState<number>(620);
  const [canvasHeight, setCanvasHeight] = useState<number>(480);
  const [windowSide, setWindowSide] = useState<'top' | 'left' | 'right' | 'none'>('left');
  const [entranceSide, setEntranceSide] = useState<'bottom' | 'left' | 'right'>('bottom');
  const [selectedElement, setSelectedElement] = useState<{ type: 'seat' | 'zone' | 'fixture' | 'window' | 'entrance'; data: SeatData | ZoneData | FixtureData | WindowData | EntranceData } | null>(null);
  const [savedSpaceId, setSavedSpaceId] = useState<string | null>(null);

  const [seats, setSeats] = useState<SeatData[]>([]);
  const [fixtures, setFixtures] = useState<FixtureData[]>([]);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [entrances, setEntrances] = useState<EntranceData[]>([]);

  const [showPreview, setShowPreview] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceType, setNewSpaceType] = useState('카페');
  const [newSpaceAddress, setNewSpaceAddress] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { Object.assign(spaceLayouts, JSON.parse(saved)); } catch (e) { /* ignore */ }
    }
    const savedSpaces = localStorage.getItem(SPACES_STORAGE_KEY);
    if (savedSpaces) {
      try {
        JSON.parse(savedSpaces).forEach((v: any) => {
          if (!mockSpaces.find(mv => mv.id === v.id)) mockSpaces.push(v);
        });
      } catch (e) { /* ignore */ }
    }

    // 신규 등록 매장으로 진입한 경우
    if (isNewSpace && querySpaceId && querySpaceName) {
      // 이미 저장된 레이아웃이 있으면 불러오기, 없으면 빈 캔버스
      const existingLayout = spaceLayouts[querySpaceId];
      if (existingLayout) {
        setCanvasWidth(existingLayout.width);
        setCanvasHeight(existingLayout.height);
        setWindowSide(existingLayout.windowSide);
        setEntranceSide(existingLayout.entranceSide);
        setFixtures([...existingLayout.fixtures]);
        setZones([...existingLayout.zones]);
        setSeats([...existingLayout.seats]);
        setWindows([...(existingLayout.windows || [])]);
        setEntrances([...(existingLayout.entrances || [])]);
      } else {
        // 빈 캔버스로 시작
        setCanvasWidth(620);
        setCanvasHeight(500);
        setWindowSide('top');
        setEntranceSide('bottom');
        setFixtures([]);
        setZones([]);
        setSeats([]);
        setWindows([]);
        setEntrances([]);
      }
      setSelectedSpaceId(querySpaceId);

      // mockSpaces에 없으면 추가
      if (!mockSpaces.find(v => v.id === querySpaceId)) {
        const newSpace = {
          id: querySpaceId,
          name: querySpaceName,
          type: querySpaceType || '매장',
          address: querySpaceAddress || '',
        };
        mockSpaces.push(newSpace);
        const storedSpaces = localStorage.getItem(SPACES_STORAGE_KEY);
        const spaceList = storedSpaces ? JSON.parse(storedSpaces) : [];
        if (!spaceList.find((v: any) => v.id === querySpaceId)) {
          spaceList.push(newSpace);
          localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(spaceList));
        }
      }
    } else {
      // 일반 진입: v1 기본 로드
      const layout = spaceLayouts['v1'];
      if (layout) {
        setCanvasWidth(layout.width);
        setCanvasHeight(layout.height);
        setWindowSide(layout.windowSide);
        setEntranceSide(layout.entranceSide);
        setFixtures([...layout.fixtures]);
        setZones([...layout.zones]);
        setSeats([...layout.seats]);
        setWindows([...(layout.windows || [])]);
        setEntrances([...(layout.entrances || [])]);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const buildCurrentLayout = (): SpaceLayout => ({
    width: canvasWidth,
    height: canvasHeight,
    windowSide,
    entranceSide,
    windows,
    entrances,
    fixtures,
    zones,
    seats,
  });

  const handleSave = () => {
    if (!selectedSpaceId) return;
    const currentLayout = buildCurrentLayout();
    const isExisting = mockSpaces.find(v => v.id === selectedSpaceId);
    if (isExisting) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const layouts = saved ? JSON.parse(saved) : {};
      layouts[selectedSpaceId] = currentLayout;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
      spaceLayouts[selectedSpaceId] = currentLayout;
      setSavedSpaceId(selectedSpaceId);
      showToast(`✅ "${isExisting.name}" 레이아웃이 저장되었습니다!`);
    } else {
      // 신규 매장 정보가 쿼리로 넘어온 경우 다이얼로그 없이 바로 저장
      if (isNewSpace && querySpaceId && querySpaceName) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const layouts = saved ? JSON.parse(saved) : {};
        layouts[querySpaceId] = currentLayout;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
        spaceLayouts[querySpaceId] = currentLayout;
        setSavedSpaceId(querySpaceId);
        showToast(`✅ "${querySpaceName}" 좌석 지도가 저장되었습니다!`);
      } else {
        setShowSaveDialog(true);
      }
    }
  };

  const handleConfirmNewSpace = (goToReview = false) => {
    if (!newSpaceName.trim()) { showToast('매장명을 입력해주세요.'); return; }
    const newSpaceId = `custom_${Date.now()}`;
    const newSpace = { id: newSpaceId, name: newSpaceName.trim(), type: newSpaceType, address: newSpaceAddress.trim() || '주소 미입력' };
    const savedSpaces = localStorage.getItem(SPACES_STORAGE_KEY);
    const spaces = savedSpaces ? JSON.parse(savedSpaces) : [];
    spaces.push(newSpace);
    localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(spaces));
    mockSpaces.push(newSpace);
    const currentLayout = buildCurrentLayout();
    const saved = localStorage.getItem(STORAGE_KEY);
    const layouts = saved ? JSON.parse(saved) : {};
    layouts[newSpaceId] = currentLayout;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    spaceLayouts[newSpaceId] = currentLayout;
    setSelectedSpaceId(newSpaceId);
    setSavedSpaceId(newSpaceId);
    setShowSaveDialog(false);
    setNewSpaceName(''); setNewSpaceType('카페'); setNewSpaceAddress('');
    if (goToReview) {
      navigate('/review');
    } else {
      showToast(`✅ 새 매장 "${newSpace.name}"이(가) 추가되었습니다!`);
    }
  };

  const handleReset = () => {
    if (!confirm('⚠️ 저장하지 않은 변경사항이 모두 사라집니다. 계속하시겠습니까?')) return;
    if (selectedSpaceId && spaceLayouts[selectedSpaceId]) {
      const original = spaceLayouts[selectedSpaceId];
      setCanvasWidth(original.width); setCanvasHeight(original.height);
      setWindowSide(original.windowSide); setEntranceSide(original.entranceSide);
      setFixtures([...original.fixtures]); setZones([...original.zones]); setSeats([...original.seats]);
      setWindows([...(original.windows || [])]); setEntrances([...(original.entrances || [])]);
      setSelectedElement(null);
    } else {
      setCanvasWidth(620); setCanvasHeight(500);
      setWindowSide('top'); setEntranceSide('bottom');
      setFixtures([]); setZones([]); setSeats([]);
      setWindows([]); setEntrances([]);
      setSelectedElement(null);
    }
  };

  const handlePreviewSelect = () => setShowPreview(false);

  // 저장 후 매장 페이지로 이동
  const handleGoToSpacePage = () => {
    if (isNewSpace && querySpaceId && querySpaceName) {
      const params = new URLSearchParams({
        spaceName: querySpaceName,
        spaceType: querySpaceType || '',
        spaceAddress: querySpaceAddress || '',
        isNew: 'true',
      });
      navigate(`/space/${querySpaceId}?${params.toString()}`);
    } else if (savedSpaceId) {
      navigate(`/space/${savedSpaceId}`);
    }
  };

  // ID 생성 헬퍼
  const generateSeatId = () => {
    const existingIds = seats.map(s => s.id);
    let letter = 'A', number = 1;
    while (existingIds.includes(`${letter}${number}`)) {
      number++;
      if (number > 20) { letter = String.fromCharCode(letter.charCodeAt(0) + 1); number = 1; }
    }
    return `${letter}${number}`;
  };

  const handleAddSeat = (type: string) => {
    const newSeat: SeatData = { id: generateSeatId(), row: 0, col: 0, type, zone: '', tags: [], rating: 0, reviewCount: 0, x: 50, y: 50, width: 70, height: 60 };
    setSeats([...seats, newSeat]);
    setSelectedElement({ type: 'seat', data: newSeat });
  };

  const handleAddFixture = (type: string) => {
    const fixtureConfig: Record<string, { label: string; icon: string; color: string }> = {
      counter: { label: '카운터', icon: 'ri-store-2-line', color: 'bg-stone-300' },
      kitchen: { label: '주방', icon: 'ri-restaurant-line', color: 'bg-orange-200' },
      bar: { label: '바', icon: 'ri-beer-line', color: 'bg-amber-200' },
      reception: { label: '리셉션', icon: 'ri-service-line', color: 'bg-stone-300' },
    };
    const config = fixtureConfig[type] || { label: '시설물', icon: 'ri-building-line', color: 'bg-gray-300' };
    const existingCount = fixtures.filter(f => f.id.startsWith(type)).length;
    const newFixture: FixtureData = { id: `${type}-${existingCount + 1}`, label: config.label, icon: config.icon, x: 100, y: 100, width: 120, height: 80, color: config.color };
    setFixtures([...fixtures, newFixture]);
    setSelectedElement({ type: 'fixture', data: newFixture });
  };

  const handleAddZone = () => {
    const zoneColors = [
      { color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
      { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
      { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
      { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
      { color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
      { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
    ];
    const c = zoneColors[zones.length % zoneColors.length];
    const newZone: ZoneData = { id: `zone-${zones.length + 1}`, label: `새 구역 ${zones.length + 1}`, ...c, icon: 'ri-layout-grid-line', x: 150, y: 150, width: 200, height: 150, description: '구역 설명을 입력하세요' };
    setZones([...zones, newZone]);
    setSelectedElement({ type: 'zone', data: newZone });
  };

  const handleAddWindow = (side: 'top' | 'bottom' | 'left' | 'right') => {
    const isHoriz = side === 'top' || side === 'bottom';
    const wallLength = isHoriz ? canvasWidth : canvasHeight;
    const newWindow: WindowData = {
      id: `win-${Date.now()}`,
      side,
      offset: Math.round(wallLength * 0.2),
      length: Math.round(wallLength * 0.4),
      label: '창문',
    };
    setWindows([...windows, newWindow]);
    setSelectedElement({ type: 'window', data: newWindow });
  };

  const handleAddEntrance = (side: 'top' | 'bottom' | 'left' | 'right', isMain: boolean) => {
    const isHoriz = side === 'top' || side === 'bottom';
    const wallLength = isHoriz ? canvasWidth : canvasHeight;
    const newEntrance: EntranceData = {
      id: `ent-${Date.now()}`,
      side,
      offset: Math.round(wallLength * 0.4),
      length: 80,
      label: isMain ? '주출입구' : '보조출입구',
      isMain,
    };
    setEntrances([...entrances, newEntrance]);
    setSelectedElement({ type: 'entrance', data: newEntrance });
  };

  const handleDeleteWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    setSelectedElement(null);
  };

  const handleDeleteEntrance = (id: string) => {
    setEntrances(entrances.filter(en => en.id !== id));
    setSelectedElement(null);
  };

  const handleUpdateSelectedElement = (updated: any) => {
    if (!selectedElement) return;
    if (selectedElement.type === 'seat') {
      const idx = seats.findIndex(s => s.id === updated.id);
      if (idx !== -1) { const arr = [...seats]; arr[idx] = updated; setSeats(arr); setSelectedElement({ type: 'seat', data: updated }); }
    } else if (selectedElement.type === 'zone') {
      const idx = zones.findIndex(z => z.id === updated.id);
      if (idx !== -1) { const arr = [...zones]; arr[idx] = updated; setZones(arr); setSelectedElement({ type: 'zone', data: updated }); }
    } else if (selectedElement.type === 'fixture') {
      const idx = fixtures.findIndex(f => f.id === updated.id);
      if (idx !== -1) { const arr = [...fixtures]; arr[idx] = updated; setFixtures(arr); setSelectedElement({ type: 'fixture', data: updated }); }
    } else if (selectedElement.type === 'window') {
      const idx = windows.findIndex(w => w.id === updated.id);
      if (idx !== -1) { const arr = [...windows]; arr[idx] = updated; setWindows(arr); setSelectedElement({ type: 'window', data: updated }); }
    } else if (selectedElement.type === 'entrance') {
      const idx = entrances.findIndex(en => en.id === updated.id);
      if (idx !== -1) { const arr = [...entrances]; arr[idx] = updated; setEntrances(arr); setSelectedElement({ type: 'entrance', data: updated }); }
    }
  };

  // 현재 매장 이름 표시용
  const currentSpaceName = isNewSpace && querySpaceName
    ? querySpaceName
    : mockSpaces.find(v => v.id === selectedSpaceId)?.name || '';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-lg text-gray-600"></i>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">좌석 지도 에디터</h1>
              {isNewSpace && querySpaceName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                  <i className="ri-sparkling-line text-xs"></i>
                  신규 매장
                </span>
              )}
            </div>
            {currentSpaceName && (
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <i className="ri-store-2-line text-xs"></i>
                {currentSpaceName}
                {querySpaceAddress && (
                  <span className="text-gray-400 text-xs ml-1">· {querySpaceAddress}</span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-refresh-line mr-1.5"></i>초기화
          </button>
          <button onClick={() => setShowPreview(true)} className="px-4 py-2 rounded-lg border-2 border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-eye-line mr-1.5"></i>미리보기
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm">
            <i className="ri-save-line mr-1.5"></i>저장
          </button>
          {savedSpaceId && (
            <button
              onClick={handleGoToSpacePage}
              className="px-5 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <i className="ri-store-2-line"></i>매장 페이지 보기
            </button>
          )}
        </div>
      </header>

      {/* 저장 토스트 */}
      {saveMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl text-sm font-medium">
          {saveMessage}
        </div>
      )}

      {/* 신규 매장 안내 배너 */}
      {isNewSpace && querySpaceName && (
        <div className="bg-teal-50 border-b border-teal-200 px-6 py-3 flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center bg-teal-500 rounded-full flex-shrink-0">
            <i className="ri-information-line text-white text-xs"></i>
          </div>
          <p className="text-sm text-teal-700">
            <strong>{querySpaceName}</strong> 매장의 좌석 지도를 그려보세요.
            좌측 패널에서 좌석, 구역, 창문, 출입구를 추가하고 드래그로 배치할 수 있어요.
            완성 후 <strong>저장</strong>을 누르면 매장 페이지에 바로 반영돼요!
          </p>
        </div>
      )}

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        <ToolPanel
          onAddSeat={handleAddSeat}
          onAddFixture={handleAddFixture}
          onAddZone={handleAddZone}
          onAddWindow={handleAddWindow}
          onAddEntrance={handleAddEntrance}
        />

        <div className="flex-1 overflow-auto p-6">
          {/* 신규 매장이 아닐 때만 매장 선택 드롭다운 표시 */}
          {!isNewSpace && (
            <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">매장 선택</label>
              <select
                value={selectedSpaceId || ''}
                onChange={(e) => {
                  const spaceId = e.target.value;
                  setSavedSpaceId(null);
                  if (spaceId === 'new') {
                    setSelectedSpaceId('new');
                    setCanvasWidth(620); setCanvasHeight(500);
                    setWindowSide('top'); setEntranceSide('bottom');
                    setFixtures([]); setZones([]); setSeats([]);
                    setWindows([]); setEntrances([]);
                    setSelectedElement(null);
                  } else {
                    setSelectedSpaceId(spaceId);
                    const layout = spaceLayouts[spaceId];
                    if (layout) {
                      setCanvasWidth(layout.width); setCanvasHeight(layout.height);
                      setWindowSide(layout.windowSide); setEntranceSide(layout.entranceSide);
                      setFixtures([...layout.fixtures]); setZones([...layout.zones]); setSeats([...layout.seats]);
                      setWindows([...(layout.windows || [])]); setEntrances([...(layout.entrances || [])]);
                      setSelectedElement(null);
                    }
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-medium text-gray-900 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <option value="">매장을 선택하세요</option>
                {mockSpaces.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                ))}
                <option value="new">+ 새 매장 추가</option>
              </select>
            </div>
          )}

          {/* 범례 */}
          <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-sky-300 inline-block"></span>창문</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block"></span>주출입구</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block"></span>보조출입구</span>
            <span className="text-gray-400">— 클릭하여 선택, 드래그하여 이동, 양 끝 핸들로 크기 조절</span>
          </div>

          <Canvas
            width={canvasWidth}
            height={canvasHeight}
            windowSide={windowSide}
            entranceSide={entranceSide}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            seats={seats}
            fixtures={fixtures}
            zones={zones}
            windows={windows}
            entrances={entrances}
            onUpdateSeats={setSeats}
            onUpdateFixtures={setFixtures}
            onUpdateZones={setZones}
            onUpdateWindows={setWindows}
            onUpdateEntrances={setEntrances}
          />
        </div>

        <PropertyPanel
          selectedElement={selectedElement}
          zones={zones}
          onUpdateElement={handleUpdateSelectedElement}
          canvasSettings={{ width: canvasWidth, height: canvasHeight, windowSide, entranceSide }}
          onUpdateCanvas={(settings) => {
            setCanvasWidth(settings.width); setCanvasHeight(settings.height);
            setWindowSide(settings.windowSide); setEntranceSide(settings.entranceSide);
          }}
          onDeleteWindow={handleDeleteWindow}
          onDeleteEntrance={handleDeleteEntrance}
        />
      </div>

      {/* 미리보기 모달 */}
      {showPreview && selectedSpaceId && spaceLayouts[selectedSpaceId] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">미리보기</h2>
                <p className="text-sm text-gray-500">실제 리뷰 페이지와 동일하게 표시됩니다</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowPreview(false); navigate('/review'); }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <i className="ri-edit-line"></i>이 매장으로 리뷰 작성
                </button>
                <button onClick={() => setShowPreview(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <SeatingMap
                spaceId={selectedSpaceId}
                spaceName={currentSpaceName || '미리보기'}
                onSelect={handlePreviewSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* 새 매장 저장 다이얼로그 */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">새 매장 정보 입력</h2>
              <p className="text-sm text-gray-500 mt-1">레이아웃과 함께 저장됩니다</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">매장명 <span className="text-red-500">*</span></label>
                <input type="text" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} placeholder="예: 블루보틀 성수점" className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:border-gray-900 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">매장 유형</label>
                <select value={newSpaceType} onChange={(e) => setNewSpaceType(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm cursor-pointer focus:border-gray-900 focus:outline-none transition-colors">
                  <option value="카페">카페</option>
                  <option value="레스토랑">레스토랑</option>
                  <option value="라운지">라운지</option>
                  <option value="바">바</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">주소</label>
                <input type="text" value={newSpaceAddress} onChange={(e) => setNewSpaceAddress(e.target.value)} placeholder="예: 서울 성동구 성수이로 78" className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:border-gray-900 focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => { setShowSaveDialog(false); setNewSpaceName(''); setNewSpaceType('카페'); setNewSpaceAddress(''); }}
                className="px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
              <button
                onClick={() => handleConfirmNewSpace(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-save-line mr-1"></i>저장만
              </button>
              <button
                onClick={() => handleConfirmNewSpace(true)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-edit-line mr-1"></i>저장 후 리뷰 작성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
