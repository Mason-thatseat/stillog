'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ShapeType, EditorShape, FloorPlanShape, EditorMode } from '@/lib/types';
import { isSeatBlock } from '@/lib/block-definitions';
import { useEditorState } from '@/hooks/useEditorState';
import { useCanvasTransform } from '@/hooks/useCanvasTransform';
import { useSketchState } from '@/hooks/useSketchState';
import { analyzeSketch } from '@/lib/sketch/analyze-sketch';
import { sketchToShapes } from '@/lib/sketch/sketch-to-shapes';
import EditorCanvas from './EditorCanvas';
import BlockPalette from './BlockPalette';
import PropertyPanel from './PropertyPanel';
import SketchCanvas from './SketchCanvas';
import SketchToolbar from './SketchToolbar';

interface FloorPlanEditorProps {
  spaceId: string;
  initialShapes?: FloorPlanShape[];
  onSave: (shapes: EditorShape[]) => Promise<void>;
  saving?: boolean;
}

const LS_KEY_PREFIX = 'stillog_editor_draft_';

export default function FloorPlanEditor({
  spaceId,
  initialShapes,
  onSave,
  saving,
}: FloorPlanEditorProps) {
  // Default to sketch mode if no initial shapes
  const [editorMode, setEditorMode] = useState<EditorMode>(
    initialShapes && initialShapes.length > 0 ? 'structure' : 'sketch'
  );
  const [activeTool, setActiveTool] = useState<ShapeType | null>(null);
  const [sketchBlockTool, setSketchBlockTool] = useState<ShapeType | null>(null);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(5);
  const [canvasRatio, setCanvasRatio] = useState(1);
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [classificationBanner, setClassificationBanner] = useState<string | null>(null);
  const draftChecked = useRef(false);

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

  const {
    transform: canvasTransform,
    zoomIn,
    zoomOut,
    resetTransform,
    handleWheel,
    startPan,
    updatePan,
    endPan,
    isPanning,
    startPinch,
    updatePinch,
    endPinch,
  } = useCanvasTransform();

  // Sketch state — separate transform for sketch mode
  const sketchTransform = useCanvasTransform();
  const sketch = useSketchState();

  // Load initial shapes
  useEffect(() => {
    if (initialShapes && initialShapes.length > 0) {
      setShapes(initialShapes.map(s => ({ ...s, isNew: false })));
    }
  }, [initialShapes, setShapes]);

  // Check for localStorage draft on mount
  useEffect(() => {
    if (draftChecked.current) return;
    draftChecked.current = true;
    try {
      const saved = localStorage.getItem(LS_KEY_PREFIX + spaceId);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setShowDraftRestore(true);
        }
      }
    } catch { /* ignore */ }
  }, [spaceId]);

  const restoreDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_PREFIX + spaceId);
      if (saved) {
        const parsed = JSON.parse(saved) as EditorShape[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setShapes(parsed);
          setEditorMode('structure');
        }
      }
    } catch { /* ignore */ }
    setShowDraftRestore(false);
  }, [spaceId, setShapes]);

  const dismissDraft = useCallback(() => {
    setShowDraftRestore(false);
    localStorage.removeItem(LS_KEY_PREFIX + spaceId);
  }, [spaceId]);

  // Auto-save to localStorage (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        if (shapes.length > 0) {
          localStorage.setItem(LS_KEY_PREFIX + spaceId, JSON.stringify(shapes));
        } else {
          localStorage.removeItem(LS_KEY_PREFIX + spaceId);
        }
      } catch { /* quota exceeded etc */ }
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [shapes, spaceId]);

  const handleAddShape = useCallback((type: ShapeType, x: number, y: number, width?: number, height?: number) => {
    addShape(type, x, y, spaceId, width, height);
    setActiveTool(null);
  }, [addShape, spaceId]);

  // Block placement in sketch mode (doesn't clear tool so user can place multiple)
  const handleSketchAddShape = useCallback((type: ShapeType, x: number, y: number) => {
    addShape(type, x, y, spaceId);
  }, [addShape, spaceId]);

  // When sketch block tool changes, deactivate sketch drawing
  const handleSetSketchBlockTool = useCallback((type: ShapeType | null) => {
    setSketchBlockTool(type);
    if (type) {
      sketch.setTool('pen'); // reset but won't be active since block tool takes priority
    }
  }, [sketch]);

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

  // JSON export
  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(shapes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `floor-plan-${spaceId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [shapes, spaceId]);

  // Sketch → Structure conversion
  const handleAnalyzeSketch = useCallback(() => {
    if (sketch.strokes.length === 0 && shapes.length === 0) return;

    const result = analyzeSketch(sketch.strokes);
    const sketchDerivedShapes = sketchToShapes(result, spaceId);

    // Preserve blocks already placed in sketch mode, add sketch-derived room shapes behind them
    const existingBlocks = shapes.filter(s => s.shape_type !== 'block_room');
    const maxZ = sketchDerivedShapes.reduce((max, s) => Math.max(max, s.z_index), 0);
    const reindexedBlocks = existingBlocks.map((s, i) => ({ ...s, z_index: maxZ + 1 + i }));
    const merged = [...sketchDerivedShapes, ...reindexedBlocks];

    setShapes(merged.length > 0 ? merged : sketchDerivedShapes);

    setEditorMode('structure');

    if (result.classification.suggestion) {
      setClassificationBanner(result.classification.suggestion);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setClassificationBanner(null), 5000);
    }
  }, [sketch.strokes, shapes, spaceId, setShapes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (editorMode === 'sketch') {
        if (e.ctrlKey && e.key === 'z') {
          e.preventDefault();
          sketch.undo();
        } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
          e.preventDefault();
          sketch.redo();
        }
        return;
      }

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
  }, [editorMode, handleDelete, selectShape, undo, redo, sketch]);

  return (
    <div className="editor-layout flex flex-col gap-3 w-full">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setEditorMode('sketch')}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${
              editorMode === 'sketch'
                ? 'bg-accent text-white'
                : 'bg-white text-foreground-muted hover:bg-background-subtle'
            }`}
          >
            스케치
          </button>
          <button
            onClick={() => setEditorMode('structure')}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${
              editorMode === 'structure'
                ? 'bg-accent text-white'
                : 'bg-white text-foreground-muted hover:bg-background-subtle'
            }`}
          >
            배치도
          </button>
        </div>
        {editorMode === 'sketch' && (
          <span className="text-[10px] text-foreground-muted">
            벽을 그리고 &quot;도면 정리하기&quot;를 눌러 배치도로 변환하세요
          </span>
        )}
      </div>

      {/* Classification banner */}
      {classificationBanner && (
        <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-between gap-2">
          <span className="text-xs text-accent">{classificationBanner}</span>
          <button
            onClick={() => setClassificationBanner(null)}
            className="text-xs text-accent/60 hover:text-accent transition-colors"
          >
            닫기
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 w-full">
        {editorMode === 'sketch' ? (
          <>
            {/* Sketch toolbar */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <SketchToolbar
                sketchTool={sketchBlockTool ? null : sketch.tool}
                activeTool={sketchBlockTool}
                onSetSketchTool={sketch.setTool}
                onSetBlockTool={handleSetSketchBlockTool}
                onUndo={sketch.undo}
                onRedo={sketch.redo}
                canUndo={sketch.canUndo}
                canRedo={sketch.canRedo}
                onClearAll={sketch.clearAll}
                onZoomIn={sketchTransform.zoomIn}
                onZoomOut={sketchTransform.zoomOut}
                onZoomReset={sketchTransform.resetTransform}
                scale={sketchTransform.transform.scale}
                onAnalyze={handleAnalyzeSketch}
                hasStrokes={sketch.strokes.length > 0}
              />
            </div>

            {/* Sketch canvas */}
            <div className="flex-1 min-w-0">
              {/* Draft restore banner */}
              {showDraftRestore && (
                <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
                  <span className="text-xs text-amber-700">이전에 저장하지 않은 임시 데이터가 있습니다.</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={restoreDraft}
                      className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
                    >
                      복원
                    </button>
                    <button
                      onClick={dismissDraft}
                      className="text-xs px-3 py-1 text-amber-600 hover:bg-amber-100 rounded-md transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}

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

              <SketchCanvas
                strokes={sketch.strokes}
                currentPoints={sketch.currentPoints}
                tool={sketchBlockTool ? null : sketch.tool}
                shapes={shapes}
                activeTool={sketchBlockTool}
                onAddShape={handleSketchAddShape}
                onBeginStroke={sketch.beginStroke}
                onAddPoint={sketch.addPoint}
                onEndStroke={sketch.endStroke}
                onEraseStroke={sketch.eraseStroke}
                canvasRatio={canvasRatio}
                canvasTransform={sketchTransform.transform}
                onStartPan={sketchTransform.startPan}
                onUpdatePan={sketchTransform.updatePan}
                onEndPan={sketchTransform.endPan}
                isPanning={sketchTransform.isPanning}
                onWheel={sketchTransform.handleWheel}
                onStartPinch={sketchTransform.startPinch}
                onUpdatePinch={sketchTransform.updatePinch}
                onEndPinch={sketchTransform.endPinch}
              />
            </div>
          </>
        ) : (
          <>
            {/* Block palette */}
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
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onZoomReset={resetTransform}
                scale={canvasTransform.scale}
                onExportJSON={handleExportJSON}
              />
            </div>

            {/* Canvas */}
            <div className="flex-1 min-w-0">
              {/* Draft restore banner */}
              {showDraftRestore && (
                <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
                  <span className="text-xs text-amber-700">이전에 저장하지 않은 임시 데이터가 있습니다.</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={restoreDraft}
                      className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
                    >
                      복원
                    </button>
                    <button
                      onClick={dismissDraft}
                      className="text-xs px-3 py-1 text-amber-600 hover:bg-amber-100 rounded-md transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}

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
                canvasTransform={canvasTransform}
                onStartPan={startPan}
                onUpdatePan={updatePan}
                onEndPan={endPan}
                isPanning={isPanning}
                onWheel={handleWheel}
                onStartPinch={startPinch}
                onUpdatePinch={updatePinch}
                onEndPinch={endPinch}
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

            {/* Property panel */}
            <div className="flex-shrink-0 w-full md:w-[200px]">
              <PropertyPanel
                shape={selectedShape}
                onUpdate={handleUpdateSelected}
                onDelete={handleDelete}
                onBringForward={() => selectedId && bringForward(selectedId)}
                onSendBackward={() => selectedId && sendBackward(selectedId)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
