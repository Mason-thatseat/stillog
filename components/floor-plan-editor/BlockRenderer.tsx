'use client';

import type { EditorShape } from '@/lib/types';

interface BlockRendererProps {
  shape: EditorShape;
  isViewer?: boolean;
  avgRating?: number;
  postsCount?: number;
}

export default function BlockRenderer({ shape, isViewer, avgRating, postsCount }: BlockRendererProps) {
  const { x_percent: x, y_percent: y, width_percent: w, height_percent: h, shape_type } = shape;
  const gradId = `blockGrad-${shape.id}`;
  const shadowId = `blockShadow-${shape.id}`;
  const fontSize = Math.min(w, h) * 0.18;
  const labelSize = fontSize * 0.85;
  const statSize = fontSize * 0.7;

  const renderStats = () => {
    if (!isViewer) return null;
    if (!avgRating && (!postsCount || postsCount === 0)) return null;

    return (
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
    );
  };

  switch (shape_type) {
    case 'block_wall':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.03}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Brick texture lines */}
          {h > 4 && (
            <>
              <line x1={x + w * 0.3} y1={y + h * 0.33} x2={x + w * 0.7} y2={y + h * 0.33}
                stroke="rgba(255,255,255,0.15)" strokeWidth={0.15} />
              <line x1={x + w * 0.2} y1={y + h * 0.66} x2={x + w * 0.8} y2={y + h * 0.66}
                stroke="rgba(255,255,255,0.15)" strokeWidth={0.15} />
            </>
          )}
        </g>
      );

    case 'block_floor':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.02}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            strokeDasharray="1 0.5"
            opacity={shape.opacity}
          />
        </g>
      );

    case 'block_window':
      return (
        <g>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8F4FD" />
              <stop offset="100%" stopColor="#B8D8E8" />
            </linearGradient>
          </defs>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.05}
            fill={`url(#${gradId})`}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Glass pane lines */}
          <line x1={x + w * 0.5} y1={y + h * 0.15} x2={x + w * 0.5} y2={y + h * 0.85}
            stroke="rgba(255,255,255,0.6)" strokeWidth={0.15} />
          <line x1={x + w * 0.15} y1={y + h * 0.5} x2={x + w * 0.85} y2={y + h * 0.5}
            stroke="rgba(255,255,255,0.6)" strokeWidth={0.15} />
        </g>
      );

    case 'block_table_rect': {
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
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.1}
            fill={`url(#${gradId})`}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            filter={`url(#${shadowId})`}
            opacity={shape.opacity}
          />
          <rect
            x={x + w * 0.08} y={y + h * 0.08}
            width={w * 0.84} height={h * 0.84}
            rx={Math.min(w, h) * 0.06}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.15}
          />
          <text
            x={x + w / 2} y={y + h * 0.38}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >☕</text>
          {shape.label && (
            <text
              x={x + w / 2} y={y + h * 0.62}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={labelSize} fill="#6B5B4D" fontWeight="600"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {shape.label.length > 6 ? shape.label.slice(0, 5) + '…' : shape.label}
            </text>
          )}
          {renderStats()}
        </g>
      );
    }

    case 'block_table_round': {
      return (
        <g>
          <defs>
            <radialGradient id={gradId} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E0CDB8" />
            </radialGradient>
            <filter id={shadowId} x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="0.3" stdDeviation="0.4" floodColor="#A78B71" floodOpacity="0.25" />
            </filter>
          </defs>
          <ellipse
            cx={x + w / 2} cy={y + h / 2}
            rx={w / 2} ry={h / 2}
            fill={`url(#${gradId})`}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            filter={`url(#${shadowId})`}
            opacity={shape.opacity}
          />
          <ellipse
            cx={x + w / 2} cy={y + h / 2}
            rx={w * 0.38} ry={h * 0.38}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.15}
          />
          <text
            x={x + w / 2} y={y + h * 0.38}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >☕</text>
          {shape.label && (
            <text
              x={x + w / 2} y={y + h * 0.62}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={labelSize} fill="#6B5B4D" fontWeight="600"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {shape.label.length > 6 ? shape.label.slice(0, 5) + '…' : shape.label}
            </text>
          )}
          {renderStats()}
        </g>
      );
    }

    case 'block_chair':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.1}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Backrest - thicker top bar */}
          <rect
            x={x + w * 0.05} y={y}
            width={w * 0.9} height={h * 0.25}
            rx={Math.min(w, h) * 0.08}
            fill={shape.stroke_color}
            opacity={shape.opacity * 0.7}
          />
          {shape.label && (
            <text
              x={x + w / 2} y={y + h * 0.65}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(w, h) * 0.25} fill="#6B5B4D" fontWeight="500"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {shape.label.length > 4 ? shape.label.slice(0, 3) + '…' : shape.label}
            </text>
          )}
          {renderStats()}
        </g>
      );

    case 'block_sofa':
      return (
        <g>
          {/* Sofa body */}
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.15}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Inner U-cushion */}
          <path
            d={`M ${x + w * 0.12} ${y + h * 0.2}
                L ${x + w * 0.12} ${y + h * 0.75}
                Q ${x + w * 0.12} ${y + h * 0.85} ${x + w * 0.22} ${y + h * 0.85}
                L ${x + w * 0.78} ${y + h * 0.85}
                Q ${x + w * 0.88} ${y + h * 0.85} ${x + w * 0.88} ${y + h * 0.75}
                L ${x + w * 0.88} ${y + h * 0.2}`}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={0.2}
            strokeLinecap="round"
          />
          {shape.label && (
            <text
              x={x + w / 2} y={y + h * 0.5}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={labelSize} fill="#5C4033" fontWeight="600"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {shape.label.length > 6 ? shape.label.slice(0, 5) + '…' : shape.label}
            </text>
          )}
          {renderStats()}
        </g>
      );

    case 'block_plant':
      return (
        <g>
          {/* Pot */}
          <ellipse
            cx={x + w / 2} cy={y + h / 2}
            rx={w / 2} ry={h / 2}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Leaf icon */}
          <g transform={`translate(${x + w * 0.25}, ${y + h * 0.2}) scale(${Math.min(w, h) * 0.012})`}>
            <path
              d="M12 3C7 3 2 8 2 13c0 2 1 3 2 3 1.5 0 3-1 4-3 1 2 2.5 3 4 3 1 0 2-1 2-3C14 8 17 3 12 3z"
              fill="#5A8F3C"
              opacity={0.8}
            />
            <path
              d="M12 3C12 8 10 12 8 13"
              fill="none"
              stroke="#4A7A2E"
              strokeWidth={0.8}
              strokeLinecap="round"
            />
          </g>
          {/* Simple leaf emoji fallback for small sizes */}
          <text
            x={x + w / 2} y={y + h / 2 + h * 0.05}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.35}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >🌿</text>
        </g>
      );

    default:
      return null;
  }
}
