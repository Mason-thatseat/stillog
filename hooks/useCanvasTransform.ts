import { useState, useCallback, useRef } from 'react';

export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.1;

export function useCanvasTransform() {
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // For pinch zoom tracking
  const pinchRef = useRef<{ initialDistance: number; initialScale: number } | null>(null);
  // For pan tracking
  const panRef = useRef<{ startX: number; startY: number; startTX: number; startTY: number } | null>(null);

  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale + ZOOM_STEP, MAX_SCALE),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale - ZOOM_STEP, MIN_SCALE),
    }));
  }, []);

  const resetTransform = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale + delta, MIN_SCALE), MAX_SCALE),
    }));
  }, []);

  // Start panning (call on pointer down when no tool is active and clicking empty area)
  const startPan = useCallback((clientX: number, clientY: number) => {
    panRef.current = {
      startX: clientX,
      startY: clientY,
      startTX: transform.translateX,
      startTY: transform.translateY,
    };
  }, [transform.translateX, transform.translateY]);

  const updatePan = useCallback((clientX: number, clientY: number) => {
    if (!panRef.current) return false;
    const dx = clientX - panRef.current.startX;
    const dy = clientY - panRef.current.startY;
    setTransform(prev => ({
      ...prev,
      translateX: panRef.current!.startTX + dx,
      translateY: panRef.current!.startTY + dy,
    }));
    return true;
  }, []);

  const endPan = useCallback(() => {
    panRef.current = null;
  }, []);

  const isPanning = useCallback(() => {
    return panRef.current !== null;
  }, []);

  // Pinch zoom helpers
  const startPinch = useCallback((distance: number) => {
    pinchRef.current = {
      initialDistance: distance,
      initialScale: transform.scale,
    };
  }, [transform.scale]);

  const updatePinch = useCallback((distance: number) => {
    if (!pinchRef.current) return;
    const ratio = distance / pinchRef.current.initialDistance;
    const newScale = Math.min(Math.max(pinchRef.current.initialScale * ratio, MIN_SCALE), MAX_SCALE);
    setTransform(prev => ({ ...prev, scale: newScale }));
  }, []);

  const endPinch = useCallback(() => {
    pinchRef.current = null;
  }, []);

  return {
    transform,
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
  };
}
