'use client';

import type { EditorShape } from '@/lib/types';
import { isBlockType, isSeatBlock, BLOCK_REGISTRY } from '@/lib/block-definitions';
import { COLOR_PALETTE, STROKE_PALETTE } from '@/lib/editor-utils';

interface PropertyPanelProps {
  shape: EditorShape | undefined;
  onUpdate: (updates: Partial<EditorShape>) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export default function PropertyPanel({
  shape,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
}: PropertyPanelProps) {
  if (!shape) {
    return (
      <div className="editor-property-panel p-4 bg-white rounded-xl border border-border shadow-sm hidden md:block">
        <p className="text-sm text-foreground-muted text-center py-8">
          블록을 선택하거나<br />좌측에서 블록을 클릭하여<br />캔버스에 배치하세요
        </p>
      </div>
    );
  }

  const isBlock = isBlockType(shape.shape_type);
  const isSeat = isSeatBlock(shape.shape_type) || shape.shape_type === 'table';
  const blockDef = isBlock ? BLOCK_REGISTRY[shape.shape_type as keyof typeof BLOCK_REGISTRY] : null;

  // Block types: structure blocks have no label, furniture blocks have label
  const showLabel = isSeat || shape.shape_type === 'rectangle';
  // Block types: structure blocks don't show fill/stroke pickers (colors are fixed)
  const showColorPickers = !isBlock || blockDef?.category === 'furniture';
  const isLine = shape.shape_type === 'line';

  return (
    <div className="editor-property-panel p-4 bg-white rounded-xl border border-border shadow-sm space-y-4 overflow-y-auto max-h-[40vh] md:max-h-[70vh]">
      <h3 className="font-semibold text-sm text-foreground">
        {blockDef ? blockDef.label : '속성'}
      </h3>

      {/* Type badge for blocks */}
      {isBlock && (
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            isSeat ? 'bg-accent/15 text-accent' : 'bg-background-subtle text-foreground-muted'
          }`}>
            {isSeat ? '좌석 블록' : blockDef?.category === 'structure' ? '구조' : '장식'}
          </span>
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <div>
          <label className="block text-xs text-foreground-muted mb-1">라벨</label>
          <input
            type="text"
            value={shape.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value || null })}
            placeholder={isSeat ? '좌석 이름' : '라벨'}
            className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
      )}

      {/* Position */}
      <div>
        <label className="block text-xs text-foreground-muted mb-1">위치</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-foreground-muted">X</span>
            <input
              type="number"
              value={Math.round(shape.x_percent * 10) / 10}
              onChange={(e) => onUpdate({ x_percent: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent/50"
              step={0.5}
              min={0}
              max={100}
            />
          </div>
          <div>
            <span className="text-[10px] text-foreground-muted">Y</span>
            <input
              type="number"
              value={Math.round(shape.y_percent * 10) / 10}
              onChange={(e) => onUpdate({ y_percent: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent/50"
              step={0.5}
              min={0}
              max={100}
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs text-foreground-muted mb-1">크기</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-foreground-muted">너비</span>
            <input
              type="number"
              value={Math.round(shape.width_percent * 10) / 10}
              onChange={(e) => onUpdate({ width_percent: parseFloat(e.target.value) || 3 })}
              className="w-full text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent/50"
              step={0.5}
              min={blockDef?.minWidth ?? 3}
              max={100}
            />
          </div>
          <div>
            <span className="text-[10px] text-foreground-muted">높이</span>
            <input
              type="number"
              value={Math.round(shape.height_percent * 10) / 10}
              onChange={(e) => onUpdate({ height_percent: parseFloat(e.target.value) || 3 })}
              className="w-full text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent/50"
              step={0.5}
              min={blockDef?.minHeight ?? 3}
              max={100}
            />
          </div>
        </div>
      </div>

      {/* Fill color */}
      {showColorPickers && !isLine && (
        <div>
          <label className="block text-xs text-foreground-muted mb-1.5">채우기</label>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PALETTE.map(({ name, value }) => (
              <button
                key={name}
                title={name}
                onClick={() => onUpdate({ fill_color: value })}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  shape.fill_color === value
                    ? 'border-accent scale-110'
                    : 'border-border hover:border-accent/50'
                }`}
                style={{
                  backgroundColor: value === 'transparent' ? undefined : value,
                  backgroundImage: value === 'transparent'
                    ? 'linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%)'
                    : undefined,
                  backgroundSize: value === 'transparent' ? '8px 8px' : undefined,
                  backgroundPosition: value === 'transparent' ? '0 0, 4px 4px' : undefined,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stroke color */}
      {showColorPickers && (
        <div>
          <label className="block text-xs text-foreground-muted mb-1.5">테두리</label>
          <div className="flex flex-wrap gap-1.5">
            {STROKE_PALETTE.map(({ name, value }) => (
              <button
                key={name}
                title={name}
                onClick={() => onUpdate({ stroke_color: value })}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  shape.stroke_color === value
                    ? 'border-accent scale-110'
                    : 'border-border hover:border-accent/50'
                }`}
                style={{
                  backgroundColor: value === 'transparent' ? undefined : value,
                  backgroundImage: value === 'transparent'
                    ? 'linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%)'
                    : undefined,
                  backgroundSize: value === 'transparent' ? '8px 8px' : undefined,
                  backgroundPosition: value === 'transparent' ? '0 0, 4px 4px' : undefined,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Opacity */}
      <div>
        <label className="block text-xs text-foreground-muted mb-1">투명도</label>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={shape.opacity}
          onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
          className="w-full accent-accent"
        />
        <span className="text-[10px] text-foreground-muted">{Math.round(shape.opacity * 100)}%</span>
      </div>

      {/* Z-order */}
      <div className="flex gap-2">
        <button
          onClick={onBringForward}
          className="flex-1 text-xs py-1.5 px-2 border border-border rounded-lg hover:bg-background-subtle transition-colors"
        >
          앞으로
        </button>
        <button
          onClick={onSendBackward}
          className="flex-1 text-xs py-1.5 px-2 border border-border rounded-lg hover:bg-background-subtle transition-colors"
        >
          뒤로
        </button>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-full text-xs py-2 px-3 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        삭제
      </button>
    </div>
  );
}
