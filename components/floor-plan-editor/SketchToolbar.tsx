'use client';

import { useState } from 'react';
import type { SketchTool } from '@/lib/sketch/types';
import type { ShapeType, BlockType } from '@/lib/types';
import { BLOCK_CATEGORIES, BLOCK_REGISTRY } from '@/lib/block-definitions';
import ShapeThumbnail from './ShapeThumbnail';

interface SketchToolbarProps {
  sketchTool: SketchTool | null;
  activeTool: ShapeType | null;
  onSetSketchTool: (tool: SketchTool) => void;
  onSetBlockTool: (type: ShapeType | null) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearAll: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  scale: number;
  onAnalyze: () => void;
  hasStrokes: boolean;
}

// Block categories for sketch mode (furniture + facility + doors only, no room/wall)
const SKETCH_BLOCK_CATEGORIES = BLOCK_CATEGORIES.map(cat => {
  if (cat.id === 'structure') {
    // Only show doors from structure, not room/wall/partition/window
    return {
      ...cat,
      label: '문',
      types: cat.types.filter(t =>
        t === 'block_door' || t === 'block_door_in' || t === 'block_door_double' || t === 'block_sliding_door'
      ),
    };
  }
  return cat;
}).filter(cat => cat.types.length > 0);

export default function SketchToolbar({
  sketchTool,
  activeTool,
  onSetSketchTool,
  onSetBlockTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearAll,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  scale,
  onAnalyze,
  hasStrokes,
}: SketchToolbarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectSketchTool = (tool: SketchTool) => {
    onSetSketchTool(tool);
    onSetBlockTool(null); // deactivate block tool
  };

  const handleSelectBlockTool = (type: ShapeType) => {
    if (activeTool === type) {
      onSetBlockTool(null);
    } else {
      onSetBlockTool(type);
    }
  };

  return (
    <div className="block-palette flex flex-row md:flex-col gap-1 p-2 md:p-3 bg-white rounded-xl border border-border shadow-sm w-full md:w-[180px] overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[80vh]">
      {/* Drawing tools */}
      <div className="flex flex-row md:flex-col gap-1 flex-shrink-0">
        <span className="hidden md:block text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1 py-1.5">
          스케치
        </span>

        <button
          title="펜"
          onClick={() => handleSelectSketchTool('pen')}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all min-w-[44px] min-h-[44px] ${
            sketchTool === 'pen' && !activeTool
              ? 'bg-accent/15 text-accent ring-1 ring-accent/40'
              : 'text-foreground-muted hover:bg-background-subtle'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="hidden md:inline">펜</span>
        </button>

        <button
          title="지우개"
          onClick={() => handleSelectSketchTool('eraser')}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all min-w-[44px] min-h-[44px] ${
            sketchTool === 'eraser' && !activeTool
              ? 'bg-accent/15 text-accent ring-1 ring-accent/40'
              : 'text-foreground-muted hover:bg-background-subtle'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden md:inline">지우개</span>
        </button>
      </div>

      {/* Divider */}
      <hr className="hidden md:block border-border my-1" />
      <div className="w-px h-auto bg-border md:hidden flex-shrink-0" />

      {/* Block palette for sketch mode */}
      <div className="flex flex-row md:flex-col gap-1 flex-shrink-0">
        {SKETCH_BLOCK_CATEGORIES.map(({ id, label, types }) => (
          <div key={id} className="flex-shrink-0">
            <button
              onClick={() => toggleCategory(id)}
              className="hidden md:flex w-full items-center justify-between py-1.5 px-1"
            >
              <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                {label}
              </span>
              <svg
                className={`w-3 h-3 text-foreground-muted transition-transform ${collapsed[id] ? '-rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`flex flex-row md:grid md:grid-cols-2 gap-1 md:mb-2 ${collapsed[id] ? 'md:hidden' : ''}`}>
              {types.map((type) => {
                const def = BLOCK_REGISTRY[type];
                return (
                  <button
                    key={type}
                    title={def.label}
                    onClick={() => handleSelectBlockTool(type)}
                    className={`
                      flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all flex-shrink-0
                      min-w-[44px] min-h-[44px]
                      ${activeTool === type
                        ? 'bg-accent/15 ring-1 ring-accent/40'
                        : 'hover:bg-background-subtle'
                      }
                    `}
                  >
                    <ShapeThumbnail type={type} size={36} />
                    <span className="text-[9px] text-foreground-muted leading-tight text-center whitespace-nowrap">
                      {def.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <hr className="hidden md:block border-border my-1" />
      <div className="w-px h-auto bg-border md:hidden flex-shrink-0" />

      {/* Edit tools */}
      <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1 flex-shrink-0">
        <span className="hidden md:block text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1">
          편집
        </span>
        <div className="flex gap-1 md:mt-1">
          <button
            title="실행취소 (Ctrl+Z)"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle disabled:opacity-30 transition-all min-w-[44px] min-h-[44px]"
          >
            <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button
            title="다시실행 (Ctrl+Y)"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle disabled:opacity-30 transition-all min-w-[44px] min-h-[44px]"
          >
            <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>

        <button
          title="전체 지우기"
          onClick={() => {
            if (window.confirm('모든 스케치를 지우시겠습니까?')) {
              onClearAll();
            }
          }}
          disabled={!hasStrokes}
          className="md:w-full md:mt-1.5 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap text-foreground-muted hover:bg-background-subtle disabled:opacity-30 min-w-[44px] min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden md:inline">전체 지우기</span>
        </button>
      </div>

      {/* Divider */}
      <hr className="hidden md:block border-border my-1" />
      <div className="w-px h-auto bg-border md:hidden flex-shrink-0" />

      {/* Zoom controls */}
      <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1 flex-shrink-0">
        <span className="hidden md:block text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1">
          줌
        </span>
        <div className="flex gap-1 md:mt-1">
          <button title="줌 인" onClick={onZoomIn}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle transition-all min-w-[44px] min-h-[44px]">
            <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
            </svg>
          </button>
          <button title="줌 아웃" onClick={onZoomOut}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle transition-all min-w-[44px] min-h-[44px]">
            <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12H6" />
            </svg>
          </button>
          <button title="줌 리셋" onClick={onZoomReset}
            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-background-subtle transition-all min-w-[44px] min-h-[44px]">
            <span className="text-[10px] text-foreground-muted font-medium">{Math.round(scale * 100)}%</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="hidden md:block border-border my-1" />
      <div className="w-px h-auto bg-border md:hidden flex-shrink-0" />

      {/* Analyze button */}
      <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1 flex-shrink-0 md:mt-auto">
        <button
          onClick={onAnalyze}
          disabled={!hasStrokes}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-[44px] min-h-[44px] bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>도면 정리하기</span>
        </button>
      </div>
    </div>
  );
}
