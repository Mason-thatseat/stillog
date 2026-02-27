import React from 'react';
import type { ActiveSeatEditorTool } from '@/lib/seat-editor/types';

interface SeatToolbarProps {
  activeTool: ActiveSeatEditorTool;
  onSetTool: (tool: ActiveSeatEditorTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSave: () => void;
  saving?: boolean;
}

export function SeatToolbar({
  activeTool,
  onSetTool,
  onZoomIn,
  onZoomOut,
  onReset,
  onSave,
  saving = false,
}: SeatToolbarProps) {
  const toolButtons: { tool: ActiveSeatEditorTool; label: string; icon: React.ReactNode }[] = [
    {
      tool: 'select',
      label: '선택',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3l12 7-6 1.5L8 18 4 3z" />
        </svg>
      ),
    },
    {
      tool: 'add_table',
      label: '테이블 추가',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="14" height="9" rx="1.5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="10" y1="3" x2="10" y2="7" />
          <line x1="7.5" y1="3" x2="12.5" y2="3" />
        </svg>
      ),
    },
    {
      tool: 'delete',
      label: '삭제',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 7 6 17 14 17 15 7" />
          <line x1="3" y1="7" x2="17" y2="7" />
          <path d="M8 7V5a1 1 0 011-1h2a1 1 0 011 1v2" />
        </svg>
      ),
    },
  ];

  const drawRoomIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="10,3 17,8 14,16 6,16 3,8" />
      <circle cx="10" cy="3"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="8"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6"  cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="3"  cy="8"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="3"  r="3" fill="none" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );

  const zoomInIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="9" cy="9" r="5.5" />
      <line x1="9" y1="6.5" x2="9" y2="11.5" />
      <line x1="6.5" y1="9" x2="11.5" y2="9" />
      <line x1="13.5" y1="13.5" x2="17" y2="17" />
    </svg>
  );

  const zoomOutIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="9" cy="9" r="5.5" />
      <line x1="6.5" y1="9" x2="11.5" y2="9" />
      <line x1="13.5" y1="13.5" x2="17" y2="17" />
    </svg>
  );

  const resetIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9a6 6 0 1 1 1.2 3.6" />
      <polyline points="4 14 4 9 9 9" />
    </svg>
  );

  const saveIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14l4 4 8-8" />
    </svg>
  );

  return (
    <div className="toolbar">
      {toolButtons.map(({ tool, label, icon }) => (
        <button
          key={tool ?? 'none'}
          className={`toolbar-btn${activeTool === tool ? ' toolbar-btn--active' : ''}`}
          title={label}
          aria-label={label}
          onClick={() => onSetTool(tool)}
        >
          {icon}
        </button>
      ))}

      <div className="toolbar-divider" />

      <button
        className={`toolbar-btn${activeTool === 'draw_room' ? ' toolbar-btn--active' : ''}`}
        title="공간 그리기"
        aria-label="공간 그리기"
        onClick={() => onSetTool('draw_room')}
      >
        {drawRoomIcon}
      </button>

      <div className="toolbar-divider" />

      <button className="toolbar-btn" title="줌 인" aria-label="줌 인" onClick={onZoomIn}>
        {zoomInIcon}
      </button>
      <button className="toolbar-btn" title="줌 아웃" aria-label="줌 아웃" onClick={onZoomOut}>
        {zoomOutIcon}
      </button>
      <button className="toolbar-btn" title="초기화" aria-label="초기화" onClick={onReset}>
        {resetIcon}
      </button>

      <div className="toolbar-divider" />

      <button
        className="toolbar-btn toolbar-btn--save"
        title="저장"
        aria-label="저장"
        onClick={onSave}
        disabled={saving}
        style={{ color: saving ? '#AAAAAA' : '#1A1A1A' }}
      >
        {saving ? (
          <div className="spinner" style={{ width: 16, height: 16 }} />
        ) : (
          saveIcon
        )}
      </button>
    </div>
  );
}
