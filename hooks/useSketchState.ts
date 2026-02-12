import { useState, useCallback, useRef } from 'react';
import type { SketchStroke, Point, SketchTool } from '@/lib/sketch/types';

const MAX_UNDO = 50;
const MIN_POINT_DISTANCE = 0.5;

interface SketchStateReturn {
  strokes: SketchStroke[];
  currentPoints: Point[] | null;
  tool: SketchTool;
  setTool: (tool: SketchTool) => void;
  beginStroke: (point: Point) => void;
  addPoint: (point: Point) => void;
  endStroke: () => void;
  eraseStroke: (id: string) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useSketchState(): SketchStateReturn {
  const [strokes, setStrokesInternal] = useState<SketchStroke[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[] | null>(null);
  const [tool, setTool] = useState<SketchTool>('pen');

  const strokesRef = useRef<SketchStroke[]>(strokes);
  const currentPointsRef = useRef<Point[] | null>(null);
  const undoStack = useRef<SketchStroke[][]>([]);
  const redoStack = useRef<SketchStroke[][]>([]);

  const setStrokes = useCallback((newStrokes: SketchStroke[]) => {
    strokesRef.current = newStrokes;
    setStrokesInternal(newStrokes);
  }, []);

  const pushSnapshot = useCallback(() => {
    undoStack.current.push([...strokesRef.current]);
    if (undoStack.current.length > MAX_UNDO) {
      undoStack.current.shift();
    }
    redoStack.current = [];
  }, []);

  const beginStroke = useCallback((point: Point) => {
    currentPointsRef.current = [point];
    setCurrentPoints([point]);
  }, []);

  const addPoint = useCallback((point: Point) => {
    const pts = currentPointsRef.current;
    if (!pts) return;

    const last = pts[pts.length - 1];
    const dist = Math.hypot(point.x - last.x, point.y - last.y);
    if (dist < MIN_POINT_DISTANCE) return;

    const newPts = [...pts, point];
    currentPointsRef.current = newPts;
    setCurrentPoints(newPts);
  }, []);

  const endStroke = useCallback(() => {
    const pts = currentPointsRef.current;
    if (!pts || pts.length < 2) {
      currentPointsRef.current = null;
      setCurrentPoints(null);
      return;
    }

    pushSnapshot();

    const newStroke: SketchStroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      points: pts,
      timestamp: Date.now(),
    };

    const newStrokes = [...strokesRef.current, newStroke];
    setStrokes(newStrokes);
    currentPointsRef.current = null;
    setCurrentPoints(null);
  }, [pushSnapshot, setStrokes]);

  const eraseStroke = useCallback((id: string) => {
    pushSnapshot();
    const newStrokes = strokesRef.current.filter(s => s.id !== id);
    setStrokes(newStrokes);
  }, [pushSnapshot, setStrokes]);

  const clearAll = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    pushSnapshot();
    setStrokes([]);
  }, [pushSnapshot, setStrokes]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push([...strokesRef.current]);
    const prev = undoStack.current.pop()!;
    setStrokes(prev);
  }, [setStrokes]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push([...strokesRef.current]);
    const next = redoStack.current.pop()!;
    setStrokes(next);
  }, [setStrokes]);

  return {
    strokes,
    currentPoints,
    tool,
    setTool,
    beginStroke,
    addPoint,
    endStroke,
    eraseStroke,
    clearAll,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  };
}
