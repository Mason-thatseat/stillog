
import { useState, useRef, useEffect } from 'react';
import type { SeatData, ZoneData, FixtureData, WindowData, EntranceData } from '../../../mocks/reviewData';

type CanvasProps = {
  width: number;
  height: number;
  windowSide: 'top' | 'left' | 'right' | 'none';
  entranceSide: 'bottom' | 'left' | 'right';
  selectedElement: { type: 'seat' | 'zone' | 'fixture' | 'window' | 'entrance'; data: SeatData | ZoneData | FixtureData | WindowData | EntranceData } | null;
  onSelectElement: (element: { type: 'seat' | 'zone' | 'fixture' | 'window' | 'entrance'; data: SeatData | ZoneData | FixtureData | WindowData | EntranceData } | null) => void;
  seats: SeatData[];
  fixtures: FixtureData[];
  zones: ZoneData[];
  windows: WindowData[];
  entrances: EntranceData[];
  onUpdateSeats: (seats: SeatData[]) => void;
  onUpdateFixtures: (fixtures: FixtureData[]) => void;
  onUpdateZones: (zones: ZoneData[]) => void;
  onUpdateWindows: (windows: WindowData[]) => void;
  onUpdateEntrances: (entrances: EntranceData[]) => void;
};

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;
type WallResizeHandle = 'start' | 'end' | null;

export default function Canvas({
  width,
  height,
  selectedElement,
  onSelectElement,
  seats,
  fixtures,
  zones,
  windows,
  entrances,
  onUpdateSeats,
  onUpdateFixtures,
  onUpdateZones,
  onUpdateWindows,
  onUpdateEntrances,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [wallResizeHandle, setWallResizeHandle] = useState<WallResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [wallElementStart, setWallElementStart] = useState({ offset: 0, length: 0 });

  // Delete 키로 선택된 요소 삭제
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        if (selectedElement.type === 'seat') {
          onUpdateSeats(seats.filter(s => s.id !== selectedElement.data.id));
        } else if (selectedElement.type === 'zone') {
          onUpdateZones(zones.filter(z => z.id !== selectedElement.data.id));
        } else if (selectedElement.type === 'fixture') {
          onUpdateFixtures(fixtures.filter(f => f.id !== selectedElement.data.id));
        } else if (selectedElement.type === 'window') {
          onUpdateWindows(windows.filter(w => w.id !== selectedElement.data.id));
        } else if (selectedElement.type === 'entrance') {
          onUpdateEntrances(entrances.filter(en => en.id !== selectedElement.data.id));
        }
        onSelectElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, seats, fixtures, zones, windows, entrances, onUpdateSeats, onUpdateFixtures, onUpdateZones, onUpdateWindows, onUpdateEntrances, onSelectElement]);

  // 일반 요소 드래그 시작
  const handleMouseDown = (
    e: React.MouseEvent,
    type: 'seat' | 'zone' | 'fixture',
    data: SeatData | ZoneData | FixtureData,
    handle?: ResizeHandle
  ) => {
    e.stopPropagation();
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setElementStart({ x: data.x, y: data.y, width: data.width, height: data.height });
    } else {
      setIsDragging(true);
      setElementStart({ x: data.x, y: data.y, width: data.width, height: data.height });
    }
    setDragStart({ x: e.clientX, y: e.clientY });
    onSelectElement({ type, data });
  };

  // 벽면 요소(창문/입구) 드래그 시작
  const handleWallMouseDown = (
    e: React.MouseEvent,
    type: 'window' | 'entrance',
    data: WindowData | EntranceData,
    handle?: WallResizeHandle
  ) => {
    e.stopPropagation();
    setWallElementStart({ offset: data.offset, length: data.length });
    setDragStart({ x: e.clientX, y: e.clientY });
    if (handle) {
      setWallResizeHandle(handle);
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    onSelectElement({ type, data });
  };

  // 마우스 이동 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedElement || (!isDragging && !isResizing)) return;
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // 벽면 요소 처리 (창문/입구)
      if (selectedElement.type === 'window' || selectedElement.type === 'entrance') {
        const wallData = selectedElement.data as WindowData | EntranceData;
        const isHorizontal = wallData.side === 'top' || wallData.side === 'bottom';
        const wallLength = isHorizontal ? width : height;
        const delta = isHorizontal ? deltaX : deltaY;

        if (isDragging) {
          const newOffset = Math.max(0, Math.min(wallLength - wallElementStart.length, wallElementStart.offset + delta));
          const updated = { ...wallData, offset: Math.round(newOffset) };
          if (selectedElement.type === 'window') {
            const idx = windows.findIndex(w => w.id === wallData.id);
            if (idx !== -1) {
              const arr = [...windows];
              arr[idx] = updated as WindowData;
              onUpdateWindows(arr);
            }
          } else {
            const idx = entrances.findIndex(en => en.id === wallData.id);
            if (idx !== -1) {
              const arr = [...entrances];
              arr[idx] = updated as EntranceData;
              onUpdateEntrances(arr);
            }
          }
        } else if (isResizing && wallResizeHandle) {
          let newOffset = wallElementStart.offset;
          let newLength = wallElementStart.length;
          if (wallResizeHandle === 'start') {
            const change = -delta;
            newLength = Math.max(20, wallElementStart.length + change);
            newOffset = Math.max(0, wallElementStart.offset - change);
          } else {
            newLength = Math.max(20, wallElementStart.length + delta);
          }
          newLength = Math.min(newLength, wallLength - newOffset);
          const updated = { ...wallData, offset: Math.round(newOffset), length: Math.round(newLength) };
          if (selectedElement.type === 'window') {
            const idx = windows.findIndex(w => w.id === wallData.id);
            if (idx !== -1) {
              const arr = [...windows];
              arr[idx] = updated as WindowData;
              onUpdateWindows(arr);
            }
          } else {
            const idx = entrances.findIndex(en => en.id === wallData.id);
            if (idx !== -1) {
              const arr = [...entrances];
              arr[idx] = updated as EntranceData;
              onUpdateEntrances(arr);
            }
          }
        }
        return;
      }

      // 일반 요소 처리
      if (isDragging) {
        const newX = Math.max(0, Math.min(width - elementStart.width, elementStart.x + deltaX));
        const newY = Math.max(0, Math.min(height - elementStart.height, elementStart.y + deltaY));
        if (selectedElement.type === 'seat') {
          const idx = seats.findIndex(s => s.id === selectedElement.data.id);
          if (idx !== -1) { const arr = [...seats]; arr[idx] = { ...arr[idx], x: newX, y: newY }; onUpdateSeats(arr); }
        } else if (selectedElement.type === 'zone') {
          const idx = zones.findIndex(z => z.id === selectedElement.data.id);
          if (idx !== -1) { const arr = [...zones]; arr[idx] = { ...arr[idx], x: newX, y: newY }; onUpdateZones(arr); }
        } else if (selectedElement.type === 'fixture') {
          const idx = fixtures.findIndex(f => f.id === selectedElement.data.id);
          if (idx !== -1) { const arr = [...fixtures]; arr[idx] = { ...arr[idx], x: newX, y: newY }; onUpdateFixtures(arr); }
        }
      } else if (isResizing && resizeHandle) {
        let newX = elementStart.x, newY = elementStart.y, newW = elementStart.width, newH = elementStart.height;
        if (resizeHandle.includes('e')) newW = Math.max(30, elementStart.width + deltaX);
        if (resizeHandle.includes('w')) { const d = -deltaX; newW = Math.max(30, elementStart.width + d); newX = elementStart.x - d; }
        if (resizeHandle.includes('s')) newH = Math.max(30, elementStart.height + deltaY);
        if (resizeHandle.includes('n')) { const d = -deltaY; newH = Math.max(30, elementStart.height + d); newY = elementStart.y - d; }
        newX = Math.max(0, Math.min(width - newW, newX));
        newY = Math.max(0, Math.min(height - newH, newY));
        if (selectedElement.type === 'seat') {
          const idx = seats.findIndex(s => s.id === selectedElement.data.id);
          if (idx !== -1) { const arr = [...seats]; arr[idx] = { ...arr[idx], x: newX, y: newY, width: newW, height: newH }; onUpdateSeats(arr); }
        } else if (selectedElement.type === 'zone') {
          const idx = zones.findIndex(z => z.id === selectedElement.data.id);
          if (idx !== -1) { const arr = [...zones]; arr[idx] = { ...arr[idx], x: newX, y: newY, width: newW, height: newH }; onUpdateZones(arr); }
        } else if (selectedElement.type === 'fixture') {
          const idx = fixtures.findIndex(f => f.id === selectedElement.data.id);
          if (idx !== -1) { const arr = [...fixtures]; arr[idx] = { ...arr[idx], x: newX, y: newY, width: newW, height: newH }; onUpdateFixtures(arr); }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      setWallResizeHandle(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, resizeHandle, wallResizeHandle, dragStart, elementStart, wallElementStart, selectedElement, seats, fixtures, zones, windows, entrances, width, height, onUpdateSeats, onUpdateFixtures, onUpdateZones, onUpdateWindows, onUpdateEntrances]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) onSelectElement(null);
  };

  // 창문 렌더링
  const renderWindow = (win: WindowData) => {
    const isSelected = selectedElement?.type === 'window' && selectedElement.data.id === win.id;
    const isHoriz = win.side === 'top' || win.side === 'bottom';
    const THICKNESS = 8;

    const style: React.CSSProperties = isHoriz
      ? {
          left: win.offset,
          [win.side]: 0,
          width: win.length,
          height: THICKNESS,
          cursor: 'ew-resize',
        }
      : {
          top: win.offset,
          [win.side]: 0,
          width: THICKNESS,
          height: win.length,
          cursor: 'ns-resize',
        };

    return (
      <div
        key={`win-${win.id}`}
        className={`absolute z-20 ${isSelected ? 'bg-sky-400' : 'bg-sky-300'} hover:bg-sky-400 transition-colors`}
        style={style}
        onMouseDown={(e) => handleWallMouseDown(e, 'window', win)}
        title={win.label}
      >
        {/* 크기 조절 핸들 - start */}
        <div
          className={`absolute z-30 bg-white border-2 border-sky-500 rounded-full ${isHoriz ? 'w-3 h-5 -left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize' : 'w-5 h-3 left-1/2 -translate-x-1/2 -top-1.5 cursor-ns-resize'}`}
          onMouseDown={(e) => handleWallMouseDown(e, 'window', win, 'start')}
        />
        {/* 크기 조절 핸들 - end */}
        <div
          className={`absolute z-30 bg-white border-2 border-sky-500 rounded-full ${isHoriz ? 'w-3 h-5 -right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize' : 'w-5 h-3 left-1/2 -translate-x-1/2 -bottom-1.5 cursor-ns-resize'}`}
          onMouseDown={(e) => handleWallMouseDown(e, 'window', win, 'end')}
        />
        {/* 라벨 */}
        {win.length > 40 && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
            <span className="text-sky-800 text-xs font-semibold whitespace-nowrap" style={{ fontSize: 9 }}>
              <i className="ri-sun-line mr-0.5"></i>{win.label}
            </span>
          </div>
        )}
        {isSelected && (
          <div className={`absolute inset-0 ring-2 ring-sky-500 ring-offset-1 pointer-events-none rounded-sm`} />
        )}
      </div>
    );
  };

  // 입구 렌더링
  const renderEntrance = (en: EntranceData) => {
    const isSelected = selectedElement?.type === 'entrance' && selectedElement.data.id === en.id;
    const isHoriz = en.side === 'top' || en.side === 'bottom';
    const THICKNESS = 10;
    const color = en.isMain ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-orange-400 hover:bg-orange-500';
    const selectedColor = en.isMain ? 'bg-emerald-500' : 'bg-orange-500';
    const handleColor = en.isMain ? 'border-emerald-600' : 'border-orange-600';
    const ringColor = en.isMain ? 'ring-emerald-500' : 'ring-orange-500';

    const style: React.CSSProperties = isHoriz
      ? {
          left: en.offset,
          [en.side]: 0,
          width: en.length,
          height: THICKNESS,
          cursor: 'ew-resize',
        }
      : {
          top: en.offset,
          [en.side]: 0,
          width: THICKNESS,
          height: en.length,
          cursor: 'ns-resize',
        };

    return (
      <div
        key={`ent-${en.id}`}
        className={`absolute z-20 ${isSelected ? selectedColor : color} transition-colors`}
        style={style}
        onMouseDown={(e) => handleWallMouseDown(e, 'entrance', en)}
        title={en.label}
      >
        {/* 크기 조절 핸들 - start */}
        <div
          className={`absolute z-30 bg-white border-2 ${handleColor} rounded-full ${isHoriz ? 'w-3 h-5 -left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize' : 'w-5 h-3 left-1/2 -translate-x-1/2 -top-1.5 cursor-ns-resize'}`}
          onMouseDown={(e) => handleWallMouseDown(e, 'entrance', en, 'start')}
        />
        {/* 크기 조절 핸들 - end */}
        <div
          className={`absolute z-30 bg-white border-2 ${handleColor} rounded-full ${isHoriz ? 'w-3 h-5 -right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize' : 'w-5 h-3 left-1/2 -translate-x-1/2 -bottom-1.5 cursor-ns-resize'}`}
          onMouseDown={(e) => handleWallMouseDown(e, 'entrance', en, 'end')}
        />
        {/* 라벨 */}
        {en.length > 40 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-xs font-bold whitespace-nowrap" style={{ fontSize: 9 }}>
              <i className={`${en.isMain ? 'ri-door-open-line' : 'ri-door-line'} mr-0.5`}></i>{en.label}
            </span>
          </div>
        )}
        {isSelected && (
          <div className={`absolute inset-0 ring-2 ${ringColor} ring-offset-1 pointer-events-none rounded-sm`} />
        )}
      </div>
    );
  };

  // 구역 렌더링
  const renderZone = (zone: ZoneData) => {
    const isSelected = selectedElement?.type === 'zone' && selectedElement?.data.id === zone.id;
    return (
      <div
        key={`zone-${zone.id}`}
        className={`absolute cursor-move border-2 ${zone.bgColor || 'bg-purple-50'} ${isSelected ? 'border-teal-500 ring-2 ring-teal-300' : zone.borderColor || 'border-purple-200'} rounded-lg flex items-center justify-center transition-shadow hover:shadow-lg`}
        style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height }}
        onMouseDown={(e) => handleMouseDown(e, 'zone', zone)}
      >
        <div className={`flex flex-col items-center justify-center gap-1 ${zone.color || 'text-purple-700'} pointer-events-none`}>
          <i className={`${zone.icon || 'ri-layout-line'} text-lg`}></i>
          <span className="text-xs font-medium whitespace-nowrap">{zone.label}</span>
        </div>
        {isSelected && (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-nw-resize" onMouseDown={(e) => handleMouseDown(e, 'zone', zone, 'nw')} />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-ne-resize" onMouseDown={(e) => handleMouseDown(e, 'zone', zone, 'ne')} />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-sw-resize" onMouseDown={(e) => handleMouseDown(e, 'zone', zone, 'sw')} />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-se-resize" onMouseDown={(e) => handleMouseDown(e, 'zone', zone, 'se')} />
          </>
        )}
      </div>
    );
  };

  // 시설물 렌더링
  const renderFixture = (fixture: FixtureData) => {
    const isSelected = selectedElement?.type === 'fixture' && selectedElement?.data.id === fixture.id;
    return (
      <div
        key={`fixture-${fixture.id}`}
        className={`absolute cursor-move border-2 ${fixture.color || 'bg-stone-300'} ${isSelected ? 'border-teal-500 ring-2 ring-teal-300' : 'border-stone-400'} rounded-lg flex items-center justify-center transition-shadow hover:shadow-lg`}
        style={{ left: fixture.x, top: fixture.y, width: fixture.width, height: fixture.height }}
        onMouseDown={(e) => handleMouseDown(e, 'fixture', fixture)}
      >
        <div className="flex flex-col items-center justify-center gap-1 text-stone-700 pointer-events-none">
          <i className={`${fixture.icon || 'ri-building-line'} text-lg`}></i>
          <span className="text-xs font-medium whitespace-nowrap">{fixture.label}</span>
        </div>
        {isSelected && (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-nw-resize" onMouseDown={(e) => handleMouseDown(e, 'fixture', fixture, 'nw')} />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-ne-resize" onMouseDown={(e) => handleMouseDown(e, 'fixture', fixture, 'ne')} />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-sw-resize" onMouseDown={(e) => handleMouseDown(e, 'fixture', fixture, 'sw')} />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-se-resize" onMouseDown={(e) => handleMouseDown(e, 'fixture', fixture, 'se')} />
          </>
        )}
      </div>
    );
  };

  // 좌석 렌더링
  const renderSeat = (seat: SeatData) => {
    const isSelected = selectedElement?.type === 'seat' && selectedElement?.data.id === seat.id;
    const seatColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      window: { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-700', icon: 'ri-sun-line' },
      bar: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700', icon: 'ri-goblet-line' },
      sofa: { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-700', icon: 'ri-sofa-line' },
      group: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', icon: 'ri-group-line' },
      normal: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', icon: 'ri-armchair-line' },
    };
    const c = seatColors[seat.type] || seatColors.normal;
    return (
      <div
        key={`seat-${seat.id}`}
        className={`absolute cursor-move border-2 ${c.bg} ${isSelected ? 'border-teal-500 ring-2 ring-teal-300' : c.border} rounded-lg flex items-center justify-center transition-shadow hover:shadow-lg`}
        style={{ left: seat.x, top: seat.y, width: seat.width, height: seat.height }}
        onMouseDown={(e) => handleMouseDown(e, 'seat', seat)}
      >
        <div className={`flex flex-col items-center justify-center gap-0.5 ${c.text} pointer-events-none`}>
          <i className={`${c.icon} text-base`}></i>
          <span className="text-xs font-medium whitespace-nowrap">{seat.id}</span>
        </div>
        {isSelected && (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-nw-resize" onMouseDown={(e) => handleMouseDown(e, 'seat', seat, 'nw')} />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-ne-resize" onMouseDown={(e) => handleMouseDown(e, 'seat', seat, 'ne')} />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-sw-resize" onMouseDown={(e) => handleMouseDown(e, 'seat', seat, 'sw')} />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-teal-500 border border-white rounded-full cursor-se-resize" onMouseDown={(e) => handleMouseDown(e, 'seat', seat, 'se')} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto">
      <div className="flex items-center justify-center min-h-full">
        <div
          ref={canvasRef}
          className="bg-white border-2 border-gray-400 rounded-lg shadow-xl relative overflow-hidden"
          style={{ width, height }}
          onClick={handleCanvasClick}
        >
          {/* 구역 (가장 뒤) */}
          {zones.map(zone => renderZone(zone))}
          {/* 시설물 */}
          {fixtures.map(fixture => renderFixture(fixture))}
          {/* 좌석 */}
          {seats.map(seat => renderSeat(seat))}
          {/* 창문 (벽면 위) */}
          {windows.map(win => renderWindow(win))}
          {/* 입구 (벽면 위) */}
          {entrances.map(en => renderEntrance(en))}
        </div>
      </div>
    </div>
  );
}
