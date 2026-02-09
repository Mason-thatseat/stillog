import { useState, useCallback, useRef } from 'react';
import type { EditorShape, ShapeType } from '@/lib/types';
import { createShape } from '@/lib/editor-utils';

const MAX_UNDO = 50;

interface EditorStateReturn {
  shapes: EditorShape[];
  selectedId: string | null;
  selectedShape: EditorShape | undefined;
  setShapes: (shapes: EditorShape[]) => void;
  addShape: (type: ShapeType, x: number, y: number, spaceId: string, width?: number, height?: number) => EditorShape;
  updateShape: (id: string, updates: Partial<EditorShape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string | null) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pushSnapshot: () => void;
}

export function useEditorState(): EditorStateReturn {
  const [shapes, setShapesInternal] = useState<EditorShape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const undoStack = useRef<EditorShape[][]>([]);
  const redoStack = useRef<EditorShape[][]>([]);
  const shapesRef = useRef<EditorShape[]>(shapes);

  const setShapes = useCallback((newShapes: EditorShape[]) => {
    shapesRef.current = newShapes;
    setShapesInternal(newShapes);
  }, []);

  const pushSnapshot = useCallback(() => {
    undoStack.current.push([...shapesRef.current]);
    if (undoStack.current.length > MAX_UNDO) {
      undoStack.current.shift();
    }
    redoStack.current = [];
  }, []);

  const addShape = useCallback((type: ShapeType, x: number, y: number, spaceId: string, width?: number, height?: number) => {
    pushSnapshot();
    const shape = createShape(type, x, y, spaceId, width, height);
    const maxZ = shapesRef.current.reduce((max, s) => Math.max(max, s.z_index), 0);
    shape.z_index = maxZ + 1;
    const newShapes = [...shapesRef.current, shape];
    setShapes(newShapes);
    setSelectedId(shape.id);
    return shape;
  }, [pushSnapshot, setShapes]);

  const updateShape = useCallback((id: string, updates: Partial<EditorShape>) => {
    const newShapes = shapesRef.current.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    setShapes(newShapes);
  }, [setShapes]);

  const deleteShape = useCallback((id: string) => {
    pushSnapshot();
    const newShapes = shapesRef.current.filter(s => s.id !== id);
    setShapes(newShapes);
    if (selectedId === id) setSelectedId(null);
  }, [pushSnapshot, setShapes, selectedId]);

  const selectShape = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const bringForward = useCallback((id: string) => {
    pushSnapshot();
    const maxZ = shapesRef.current.reduce((max, s) => Math.max(max, s.z_index), 0);
    const newShapes = shapesRef.current.map(s =>
      s.id === id ? { ...s, z_index: maxZ + 1 } : s
    );
    setShapes(newShapes);
  }, [pushSnapshot, setShapes]);

  const sendBackward = useCallback((id: string) => {
    pushSnapshot();
    const minZ = shapesRef.current.reduce((min, s) => Math.min(min, s.z_index), 0);
    const newShapes = shapesRef.current.map(s =>
      s.id === id ? { ...s, z_index: minZ - 1 } : s
    );
    setShapes(newShapes);
  }, [pushSnapshot, setShapes]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push([...shapesRef.current]);
    const prev = undoStack.current.pop()!;
    setShapes(prev);
  }, [setShapes]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push([...shapesRef.current]);
    const next = redoStack.current.pop()!;
    setShapes(next);
  }, [setShapes]);

  const selectedShape = shapes.find(s => s.id === selectedId);

  return {
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
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    pushSnapshot,
  };
}
