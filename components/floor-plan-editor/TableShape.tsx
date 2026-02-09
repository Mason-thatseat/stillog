'use client';

import type { EditorShape } from '@/lib/types';

interface TableShapeProps {
  shape: EditorShape;
  avgRating?: number;
  postsCount?: number;
  isViewer?: boolean;
}

export default function TableShape({ shape, avgRating, postsCount, isViewer }: TableShapeProps) {
  const { x_percent: x, y_percent: y, width_percent: w, height_percent: h } = shape;
  const gradId = `tableGrad-${shape.id}`;
  const shadowId = `tableShadow-${shape.id}`;
  const fontSize = Math.min(w, h) * 0.18;
  const labelSize = fontSize * 0.85;
  const statSize = fontSize * 0.7;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5E6D3" />
          <stop offset="100%" stopColor="#E8D5C0" />
        </linearGradient>
        <filter id={shadowId} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="0.3" stdDeviation="0.4" floodColor="#A78B71" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Table body */}
      <rect
        x={x} y={y}
        width={w} height={h}
        rx={Math.min(w, h) * 0.1}
        fill={`url(#${gradId})`}
        stroke={shape.stroke_color}
        strokeWidth={shape.stroke_width * 0.15}
        filter={`url(#${shadowId})`}
        opacity={shape.opacity}
      />

      {/* Inner highlight line */}
      <rect
        x={x + w * 0.08}
        y={y + h * 0.08}
        width={w * 0.84}
        height={h * 0.84}
        rx={Math.min(w, h) * 0.06}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={0.15}
      />

      {/* Coffee cup icon */}
      <text
        x={x + w / 2}
        y={y + h * 0.38}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        ☕
      </text>

      {/* Label */}
      {shape.label && (
        <text
          x={x + w / 2}
          y={y + h * 0.62}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={labelSize}
          fill="#6B5B4D"
          fontWeight="600"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {shape.label.length > 6 ? shape.label.slice(0, 5) + '…' : shape.label}
        </text>
      )}

      {/* Stats (viewer mode) */}
      {isViewer && (avgRating !== undefined || (postsCount !== undefined && postsCount > 0)) && (
        <g>
          {avgRating !== undefined && avgRating > 0 && (
            <text
              x={x + w / 2}
              y={y + h * 0.82}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={statSize}
              fill="#A78B71"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {'★'.repeat(Math.round(avgRating))} {avgRating.toFixed(1)}
            </text>
          )}
          {postsCount !== undefined && postsCount > 0 && (
            <>
              <circle
                cx={x + w - w * 0.08}
                cy={y + h * 0.12}
                r={Math.min(w, h) * 0.12}
                fill="#A78B71"
              />
              <text
                x={x + w - w * 0.08}
                y={y + h * 0.12}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={statSize * 0.8}
                fill="white"
                fontWeight="700"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {postsCount > 99 ? '99+' : postsCount}
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
}
