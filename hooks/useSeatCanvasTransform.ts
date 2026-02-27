import { useState, useCallback, useRef } from 'react';
import { clientToSvg } from '@/lib/seat-editor/utils';

const BASE_W = 100;
const MIN_SCALE = 0.5;
const MAX_SCALE = 4.0;

export interface CanvasTransform {
  scale: number;
  panX: number;
  panY: number;
  vbW: number;
  vbH: number;
  viewBox: string;
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
  handleWheel: (e: WheelEvent, svgEl: SVGSVGElement) => void;
  startPan: (e: PointerEvent, svgEl: SVGSVGElement) => void;
  updatePan: (e: PointerEvent, svgEl: SVGSVGElement) => void;
  endPan: () => void;
  handlePinchStart: (touches: TouchList, svgEl: SVGSVGElement) => void;
  handlePinchMove: (touches: TouchList, svgEl: SVGSVGElement) => void;
  isPanning: boolean;
}

export function useSeatCanvasTransform(canvasRatio: number): CanvasTransform {
  const BASE_H = BASE_W * canvasRatio;

  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const isPanningRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const startPanSvgRef = useRef<{ x: number; y: number } | null>(null);
  const startPanViewRef = useRef<{ x: number; y: number } | null>(null);

  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);

  const scaleRef = useRef(scale);
  const panXRef = useRef(panX);
  const panYRef = useRef(panY);
  scaleRef.current = scale;
  panXRef.current = panX;
  panYRef.current = panY;

  const vbW = BASE_W / scale;
  const vbH = BASE_H / scale;
  const viewBox = `${panX} ${panY} ${vbW} ${vbH}`;

  const clampPan = useCallback(
    (px: number, py: number): { x: number; y: number } => {
      return {
        x: Math.max(-BASE_W, Math.min(BASE_W, px)),
        y: Math.max(-BASE_H, Math.min(BASE_H, py)),
      };
    },
    [BASE_H]
  );

  const applyZoom = useCallback(
    (newScale: number, centerSvgX: number, centerSvgY: number, curPanX: number, curPanY: number, curScale: number) => {
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      const newVbW = BASE_W / clamped;
      const newVbH = BASE_H / clamped;
      const curVbW = BASE_W / curScale;
      const curVbH = BASE_H / curScale;

      const fracX = (centerSvgX - curPanX) / curVbW;
      const fracY = (centerSvgY - curPanY) / curVbH;

      const newPanX = centerSvgX - fracX * newVbW;
      const newPanY = centerSvgY - fracY * newVbH;

      void newVbH;

      const c = clampPan(newPanX, newPanY);
      setScale(clamped);
      setPanX(c.x);
      setPanY(c.y);
    },
    [BASE_H, clampPan]
  );

  const handleWheel = useCallback(
    (e: WheelEvent, svgEl: SVGSVGElement) => {
      e.preventDefault();
      const curScale = scaleRef.current;
      const curPanX = panXRef.current;
      const curPanY = panYRef.current;
      const vbWc = BASE_W / curScale;
      const vbHc = BASE_H / curScale;
      const svgPos = clientToSvg(e.clientX, e.clientY, svgEl, curPanX, curPanY, vbWc, vbHc);
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      applyZoom(curScale * factor, svgPos.x, svgPos.y, curPanX, curPanY, curScale);
    },
    [BASE_H, applyZoom]
  );

  const startPan = useCallback((e: PointerEvent, svgEl: SVGSVGElement) => {
    isPanningRef.current = true;
    setIsPanning(true);
    const curPanX = panXRef.current;
    const curPanY = panYRef.current;
    const curScale = scaleRef.current;
    const vbWc = BASE_W / curScale;
    const vbHc = BASE_H / curScale;
    const svgPos = clientToSvg(e.clientX, e.clientY, svgEl, curPanX, curPanY, vbWc, vbHc);
    startPanSvgRef.current = svgPos;
    startPanViewRef.current = { x: curPanX, y: curPanY };
  }, [BASE_H]);

  const updatePan = useCallback((e: PointerEvent, svgEl: SVGSVGElement) => {
    if (!isPanningRef.current || !startPanSvgRef.current || !startPanViewRef.current) return;
    const curScale = scaleRef.current;
    const curPanX = panXRef.current;
    const curPanY = panYRef.current;
    const vbWc = BASE_W / curScale;
    const vbHc = BASE_H / curScale;
    const curSvgPos = clientToSvg(e.clientX, e.clientY, svgEl, curPanX, curPanY, vbWc, vbHc);
    const dx = startPanSvgRef.current.x - curSvgPos.x;
    const dy = startPanSvgRef.current.y - curSvgPos.y;
    const newPanX = startPanViewRef.current.x + dx;
    const newPanY = startPanViewRef.current.y + dy;
    const c = clampPan(newPanX, newPanY);
    setPanX(c.x);
    setPanY(c.y);
  }, [clampPan, BASE_H]);

  const endPan = useCallback(() => {
    isPanningRef.current = false;
    setIsPanning(false);
    startPanSvgRef.current = null;
    startPanViewRef.current = null;
  }, []);

  const getTouchDist = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePinchStart = useCallback((touches: TouchList, _svgEl: SVGSVGElement) => {
    if (touches.length < 2) return;
    const dist = getTouchDist(touches[0], touches[1]);
    const cx = (touches[0].clientX + touches[1].clientX) / 2;
    const cy = (touches[0].clientY + touches[1].clientY) / 2;
    pinchRef.current = { dist, cx, cy };
  }, []);

  const handlePinchMove = useCallback((touches: TouchList, svgEl: SVGSVGElement) => {
    if (touches.length < 2 || !pinchRef.current) return;
    const curScale = scaleRef.current;
    const curPanX = panXRef.current;
    const curPanY = panYRef.current;
    const vbWc = BASE_W / curScale;
    const vbHc = BASE_H / curScale;
    const { cx, cy } = pinchRef.current;
    const svgPos = clientToSvg(cx, cy, svgEl, curPanX, curPanY, vbWc, vbHc);
    const newDist = getTouchDist(touches[0], touches[1]);
    const factor = newDist / pinchRef.current.dist;
    applyZoom(curScale * factor, svgPos.x, svgPos.y, curPanX, curPanY, curScale);
    const cx2 = (touches[0].clientX + touches[1].clientX) / 2;
    const cy2 = (touches[0].clientY + touches[1].clientY) / 2;
    pinchRef.current = { dist: newDist, cx: cx2, cy: cy2 };
  }, [BASE_H, applyZoom]);

  const zoomIn = useCallback(() => {
    const curScale = scaleRef.current;
    const newScale = Math.min(MAX_SCALE, curScale * 1.25);
    const curPanX = panXRef.current;
    const curPanY = panYRef.current;
    const vbWc = BASE_W / curScale;
    const vbHc = BASE_H / curScale;
    const centerX = curPanX + vbWc / 2;
    const centerY = curPanY + vbHc / 2;
    applyZoom(newScale, centerX, centerY, curPanX, curPanY, curScale);
  }, [BASE_H, applyZoom]);

  const zoomOut = useCallback(() => {
    const curScale = scaleRef.current;
    const newScale = Math.max(MIN_SCALE, curScale / 1.25);
    const curPanX = panXRef.current;
    const curPanY = panYRef.current;
    const vbWc = BASE_W / curScale;
    const vbHc = BASE_H / curScale;
    const centerX = curPanX + vbWc / 2;
    const centerY = curPanY + vbHc / 2;
    applyZoom(newScale, centerX, centerY, curPanX, curPanY, curScale);
  }, [BASE_H, applyZoom]);

  const resetTransform = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, []);

  return {
    scale,
    panX,
    panY,
    vbW,
    vbH,
    viewBox,
    zoomIn,
    zoomOut,
    resetTransform,
    handleWheel,
    startPan,
    updatePan,
    endPan,
    handlePinchStart,
    handlePinchMove,
    isPanning,
  };
}
