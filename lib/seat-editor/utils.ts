export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clientToSvg(
  clientX: number,
  clientY: number,
  svgEl: SVGSVGElement,
  vbX: number,
  vbY: number,
  vbW: number,
  vbH: number
): { x: number; y: number } {
  const rect = svgEl.getBoundingClientRect();
  const px = (clientX - rect.left) / rect.width;
  const py = (clientY - rect.top) / rect.height;
  return {
    x: vbX + px * vbW,
    y: vbY + py * vbH,
  };
}
