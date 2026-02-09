'use client';

import type { ShapeType } from '@/lib/types';
import ShapeThumbnail from './ShapeThumbnail';

interface EditorToolbarProps {
  activeTool: ShapeType | null;
  onSelectTool: (type: ShapeType | null) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TOOLS: { type: ShapeType; label: string }[] = [
  { type: 'rectangle', label: '사각형' },
  { type: 'circle', label: '원' },
  { type: 'triangle', label: '삼각형' },
  { type: 'line', label: '선' },
];

export default function EditorToolbar({
  activeTool,
  onSelectTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: EditorToolbarProps) {
  return (
    <div className="editor-toolbar flex flex-col gap-1 p-2 bg-white rounded-xl border border-border shadow-sm">
      <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1 mb-1">
        도형
      </p>
      {TOOLS.map(({ type, label }) => (
        <button
          key={type}
          title={label}
          onClick={() => onSelectTool(activeTool === type ? null : type)}
          className={`
            flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all
            ${activeTool === type
              ? 'bg-accent/15 ring-1 ring-accent/40'
              : 'hover:bg-background-subtle'
            }
          `}
        >
          <ShapeThumbnail type={type} size={36} />
          <span className="text-[10px] text-foreground-muted">{label}</span>
        </button>
      ))}

      <hr className="border-border my-1" />

      <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1 mb-1">
        편집
      </p>
      <button
        title="실행취소 (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle disabled:opacity-30 transition-all"
      >
        <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      </button>
      <button
        title="다시실행 (Ctrl+Y)"
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center justify-center p-2 rounded-lg hover:bg-background-subtle disabled:opacity-30 transition-all"
      >
        <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
        </svg>
      </button>
    </div>
  );
}
