'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ShapeType, EditorShape, FloorPlanShape } from '@/lib/types';
import { isSeatBlock } from '@/lib/block-definitions';
import { useEditorState } from '@/hooks/useEditorState';
import EditorCanvas from './EditorCanvas';
import BlockPalette from './BlockPalette';
import PropertyPanel from './PropertyPanel';

interface FloorPlanEditorProps {
  spaceId: string;
  initialShapes?: FloorPlanShape[];
  onSave: (shapes: EditorShape[]) => Promise<void>;
  saving?: boolean;
}

export default function FloorPlanEditor({
  spaceId,
  initialShapes,
  onSave,
  saving,
}: FloorPlanEditorProps) {
  const [activeTool, setActiveTool] = useState<ShapeType | null>(null);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(5);
  const [canvasRatio, setCanvasRatio] = useState(1); // height/width ratio

  const {
    shapes,
    selectedId,
    selectedShape,
    setShapes,
    addShape,
    updateShape,
    deleteShape,
    selectShape,
    bringForward,
    sendBackward,
    undo,
    redo,
    canUndo,
    canRedo,
    pushSnapshot,
  } = useEditorState();

  // Load initial shapes
  useEffect(() => {
    if (initialShapes && initialShapes.length > 0) {
      setShapes(initialShapes.map(s => ({ ...s, isNew: false })));
    }
  }, [initialShapes, setShapes]);

  const handleAddShape = useCallback((type: ShapeType, x: number, y: number, width?: number, height?: number) => {
    addShape(type, x, y, spaceId, width, height);
    setActiveTool(null);
  }, [addShape, spaceId]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    const shape = shapes.find(s => s.id === selectedId);
    if (shape && isSeatBlock(shape.shape_type)) {
      if (!window.confirm('좌석 블록을 삭제하면 연결된 포스트도 사라질 수 있습니다. 삭제하시겠습니까?')) {
        return;
      }
    }
    deleteShape(selectedId);
  }, [selectedId, shapes, deleteShape]);

  const handleUpdateSelected = useCallback((updates: Partial<EditorShape>) => {
    if (selectedId) {
      pushSnapshot();
      updateShape(selectedId, updates);
    }
  }, [selectedId, pushSnapshot, updateShape]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        selectShape(null);
        setActiveTool(null);
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDelete, selectShape, undo, redo]);

  return (
    <div className="editor-layout flex flex-col md:flex-row gap-3 w-full">
      {/* Block palette: horizontal strip on mobile, vertical sidebar on desktop */}
      <div className="flex-shrink-0 w-full md:w-auto">
        <BlockPalette
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          gridSnap={gridSnap}
          onToggleGrid={() => setGridSnap(!gridSnap)}
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 min-w-0">
        {/* Canvas size selector */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-foreground-muted font-semibold">캔버스 비율</span>
          {[
            { label: '정사각형', ratio: 1 },
            { label: '가로형', ratio: 0.75 },
            { label: '세로형', ratio: 1.33 },
            { label: '넓은 가로', ratio: 0.56 },
          ].map(({ label, ratio }) => (
            <button
              key={label}
              onClick={() => setCanvasRatio(ratio)}
              className={`text-[10px] px-2 py-1 rounded-md transition-all ${
                canvasRatio === ratio
                  ? 'bg-accent/15 text-accent ring-1 ring-accent/40'
                  : 'text-foreground-muted hover:bg-background-subtle'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <EditorCanvas
          shapes={shapes}
          selectedId={selectedId}
          activeTool={activeTool}
          onSelectShape={selectShape}
          onAddShape={handleAddShape}
          updateShape={updateShape}
          pushSnapshot={pushSnapshot}
          gridSnap={gridSnap}
          gridSize={gridSize}
          canvasRatio={canvasRatio}
        />

        {/* Save button */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onSave(shapes)}
            disabled={saving}
            className="px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors text-sm font-medium shadow-sm"
          >
            {saving ? '저장 중...' : '배치도 저장'}
          </button>
        </div>
      </div>

      {/* Property panel: bottom sheet on mobile, right sidebar on desktop */}
      <div className="flex-shrink-0 w-full md:w-[200px]">
        <PropertyPanel
          shape={selectedShape}
          onUpdate={handleUpdateSelected}
          onDelete={handleDelete}
          onBringForward={() => selectedId && bringForward(selectedId)}
          onSendBackward={() => selectedId && sendBackward(selectedId)}
        />
      </div>
    </div>
  );
}
