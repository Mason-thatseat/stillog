'use client';

import { useState } from 'react';
import type { ShapeType, BlockType } from '@/lib/types';
import { BLOCK_CATEGORIES, BLOCK_REGISTRY } from '@/lib/block-definitions';
import ShapeThumbnail from './ShapeThumbnail';

interface BlockPaletteProps {
  activeTool: ShapeType | null;
  onSelectTool: (type: ShapeType | null) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  gridSnap: boolean;
  onToggleGrid: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  scale: number;
  onExportJSON: () => void;
}

export default function BlockPalette({
  activeTool,
  onSelectTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  gridSnap,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  scale,
  onExportJSON,
}: BlockPaletteProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="block-palette flex flex-row md:flex-col gap-1 p-2 md:p-3 bg-white rounded-xl border border-border shadow-sm w-full md:w-[180px] overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[80vh]">
      {/* Block categories */}
      <div className="flex flex-row md:flex-col gap-1 flex-shrink-0">
        {BLOCK_CATEGORIES.map(({ id, label, types }) => (
          <div key={id} className="flex-shrink-0">
            {/* Category header: hidden on mobile, shown on desktop */}
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

            {/* Mobile: always show blocks in a row; Desktop: collapsible grid */}
            <div className={`flex flex-row md:grid md:grid-cols-2 gap-1 md:mb-2 ${collapsed[id] ? 'md:hidden' : ''}`}>
              {types.map((type) => {
                const def = BLOCK_REGISTRY[type];
                return (
                  <button
                    key={type}
                    title={def.label}
                    onClick={() => onSelectTool(activeTool === type ? null : type)}
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

      {/* Zoom controls */}
      <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1 flex-shrink-0">
        <span className="hidden md:block text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1">
          줌
        </span>
        <div className="flex gap-1 md:mt-1">
          <button
            title="줌 인"
            onClick={onZoomIn}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle transition-all min-w-[44px] min-h-[44px]"
          >
            <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
            </svg>
          </button>
          <button
            title="줌 아웃"
            onClick={onZoomOut}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle transition-all min-w-[44px] min-h-[44px]"
          >
            <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12H6" />
            </svg>
          </button>
          <button
            title="줌 리셋"
            onClick={onZoomReset}
            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-background-subtle transition-all min-w-[44px] min-h-[44px]"
          >
            <span className="text-[10px] text-foreground-muted font-medium">{Math.round(scale * 100)}%</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="hidden md:block border-border my-1" />
      <div className="w-px h-auto bg-border md:hidden flex-shrink-0" />

      {/* Edit tools */}
      <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1 flex-shrink-0">
        <span className="hidden md:block text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1">
          편집
        </span>

        <div className="flex gap-1 md:mt-1.5">
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
          onClick={onToggleGrid}
          className={`md:w-full md:mt-1.5 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap min-w-[44px] min-h-[44px] ${
            gridSnap
              ? 'bg-accent/15 text-accent'
              : 'text-foreground-muted hover:bg-background-subtle'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 10h16M4 15h16M10 4v16M15 4v16" />
          </svg>
          <span className="hidden md:inline">그리드 스냅</span>
        </button>

        {/* JSON Export */}
        <button
          title="JSON 내보내기"
          onClick={onExportJSON}
          className="md:w-full md:mt-1.5 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap text-foreground-muted hover:bg-background-subtle min-w-[44px] min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden md:inline">JSON 내보내기</span>
        </button>
      </div>
    </div>
  );
}
