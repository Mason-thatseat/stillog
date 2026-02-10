'use client';

import type { EditorShape } from '@/lib/types';
import { getRoomEdgeVisibility } from '@/lib/editor-utils';

interface BlockRendererProps {
  shape: EditorShape;
  allShapes?: EditorShape[];
  isViewer?: boolean;
  avgRating?: number;
  postsCount?: number;
}

export default function BlockRenderer({ shape, allShapes = [], isViewer, avgRating, postsCount }: BlockRendererProps) {
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

  const renderLabel = (yPos?: number) => {
    if (!shape.label) return null;
    return (
      <text
        x={x + w / 2} y={yPos ?? (y + h * 0.62)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={labelSize} fill="#6B5B4D" fontWeight="600"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {shape.label.length > 6 ? shape.label.slice(0, 5) + '…' : shape.label}
      </text>
    );
  };

  switch (shape_type) {
    case 'block_room': {
      const edges = getRoomEdgeVisibility(shape, allShapes);
      const sw = 0.3;
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            fill={shape.fill_color}
            stroke="none"
            opacity={shape.opacity}
          />
          {/* Draw edges individually, skip shared walls */}
          {edges.top && (
            <line x1={x} y1={y} x2={x + w} y2={y}
              stroke={shape.stroke_color} strokeWidth={sw} />
          )}
          {edges.right && (
            <line x1={x + w} y1={y} x2={x + w} y2={y + h}
              stroke={shape.stroke_color} strokeWidth={sw} />
          )}
          {edges.bottom && (
            <line x1={x} y1={y + h} x2={x + w} y2={y + h}
              stroke={shape.stroke_color} strokeWidth={sw} />
          )}
          {edges.left && (
            <line x1={x} y1={y} x2={x} y2={y + h}
              stroke={shape.stroke_color} strokeWidth={sw} />
          )}
          {shape.label && (
            <text
              x={x + w / 2} y={y + h / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(w, h) * 0.12} fill="#8B7355" fontWeight="500"
              opacity={0.6}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {shape.label}
            </text>
          )}
        </g>
      );
    }

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
          <line x1={x + w * 0.5} y1={y + h * 0.15} x2={x + w * 0.5} y2={y + h * 0.85}
            stroke="rgba(255,255,255,0.6)" strokeWidth={0.15} />
          <line x1={x + w * 0.15} y1={y + h * 0.5} x2={x + w * 0.85} y2={y + h * 0.5}
            stroke="rgba(255,255,255,0.6)" strokeWidth={0.15} />
        </g>
      );

    case 'block_door':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.08}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Door arc indicator */}
          <path
            d={`M ${x + w * 0.15} ${y + h * 0.85} A ${w * 0.7} ${w * 0.7} 0 0 1 ${x + w * 0.85} ${y + h * 0.85}`}
            fill="none"
            stroke={shape.stroke_color}
            strokeWidth={0.15}
            strokeDasharray="0.5 0.3"
            opacity={0.5}
          />
          {/* Door knob */}
          <circle
            cx={x + w * 0.75} cy={y + h * 0.5}
            r={Math.min(w, h) * 0.06}
            fill={shape.stroke_color}
            opacity={0.6}
          />
        </g>
      );

    case 'block_sliding_door':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.05}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Sliding door arrows */}
          <line x1={x + w * 0.3} y1={y + h * 0.5} x2={x + w * 0.15} y2={y + h * 0.5}
            stroke={shape.stroke_color} strokeWidth={0.2} opacity={0.5} />
          <line x1={x + w * 0.7} y1={y + h * 0.5} x2={x + w * 0.85} y2={y + h * 0.5}
            stroke={shape.stroke_color} strokeWidth={0.2} opacity={0.5} />
          {/* Center divider */}
          <line x1={x + w * 0.5} y1={y + h * 0.15} x2={x + w * 0.5} y2={y + h * 0.85}
            stroke={shape.stroke_color} strokeWidth={0.15} strokeDasharray="0.4 0.3" opacity={0.4} />
        </g>
      );

    case 'block_wall':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.2}
            opacity={shape.opacity}
          />
          {/* Brick-like pattern lines */}
          {h < w ? (
            <>
              <line x1={x + w * 0.33} y1={y} x2={x + w * 0.33} y2={y + h}
                stroke={shape.stroke_color} strokeWidth={0.1} opacity={0.3} />
              <line x1={x + w * 0.66} y1={y} x2={x + w * 0.66} y2={y + h}
                stroke={shape.stroke_color} strokeWidth={0.1} opacity={0.3} />
            </>
          ) : (
            <>
              <line x1={x} y1={y + h * 0.33} x2={x + w} y2={y + h * 0.33}
                stroke={shape.stroke_color} strokeWidth={0.1} opacity={0.3} />
              <line x1={x} y1={y + h * 0.66} x2={x + w} y2={y + h * 0.66}
                stroke={shape.stroke_color} strokeWidth={0.1} opacity={0.3} />
            </>
          )}
        </g>
      );

    case 'block_partition': {
      const isHorizontal = w >= h;
      const zigzagCount = isHorizontal ? Math.max(4, Math.round(w / 2)) : Math.max(4, Math.round(h / 2));
      const zigzagPoints: string[] = [];

      if (isHorizontal) {
        for (let i = 0; i <= zigzagCount; i++) {
          const px = x + (w * i) / zigzagCount;
          const py = i % 2 === 0 ? y : y + h;
          zigzagPoints.push(`${px},${py}`);
        }
      } else {
        for (let i = 0; i <= zigzagCount; i++) {
          const py = y + (h * i) / zigzagCount;
          const px = i % 2 === 0 ? x : x + w;
          zigzagPoints.push(`${px},${py}`);
        }
      }

      return (
        <g>
          <polyline
            points={zigzagPoints.join(' ')}
            fill="none"
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.2}
            strokeLinejoin="bevel"
            opacity={shape.opacity}
          />
        </g>
      );
    }

    case 'block_table_2': {
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
          {/* 2-person indicator */}
          <text
            x={x + w / 2} y={y + h * 0.35}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize * 0.9}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >☕</text>
          <text
            x={x + w / 2} y={y + h * 0.65}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={labelSize * 0.8} fill="#8B7355" fontWeight="500"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >2인</text>
          {renderLabel(y + h * 0.85)}
          {renderStats()}
        </g>
      );
    }

    case 'block_table_4': {
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
            x={x + w / 2} y={y + h * 0.35}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >☕</text>
          <text
            x={x + w / 2} y={y + h * 0.6}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={labelSize * 0.8} fill="#8B7355" fontWeight="500"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >4인</text>
          {renderLabel(y + h * 0.8)}
          {renderStats()}
        </g>
      );
    }

    case 'block_table_6': {
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
            rx={Math.min(w, h) * 0.08}
            fill={`url(#${gradId})`}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            filter={`url(#${shadowId})`}
            opacity={shape.opacity}
          />
          <rect
            x={x + w * 0.06} y={y + h * 0.08}
            width={w * 0.88} height={h * 0.84}
            rx={Math.min(w, h) * 0.05}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.15}
          />
          <text
            x={x + w / 2} y={y + h * 0.35}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >☕</text>
          <text
            x={x + w / 2} y={y + h * 0.6}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={labelSize * 0.8} fill="#8B7355" fontWeight="500"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >6인</text>
          {renderLabel(y + h * 0.8)}
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
          {renderLabel()}
          {renderStats()}
        </g>
      );
    }

    case 'block_kitchen':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.05}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Counter lines */}
          <line x1={x + w * 0.1} y1={y + h * 0.35} x2={x + w * 0.9} y2={y + h * 0.35}
            stroke={shape.stroke_color} strokeWidth={0.15} opacity={0.3} />
          <text
            x={x + w / 2} y={y + h * 0.55}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.16} fill="#666"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >주방</text>
        </g>
      );

    case 'block_selfbar':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.08}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          {/* Bar counter top line */}
          <line x1={x + w * 0.1} y1={y + h * 0.3} x2={x + w * 0.9} y2={y + h * 0.3}
            stroke={shape.stroke_color} strokeWidth={0.2} opacity={0.4} />
          <text
            x={x + w / 2} y={y + h * 0.65}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.18} fill="#6B5B4D"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >셀프바</text>
        </g>
      );

    case 'block_restroom':
      return (
        <g>
          <rect
            x={x} y={y} width={w} height={h}
            rx={Math.min(w, h) * 0.05}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          <text
            x={x + w / 2} y={y + h * 0.45}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.25}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >🚻</text>
          <text
            x={x + w / 2} y={y + h * 0.75}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.13} fill="#6B8EA0"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >화장실</text>
        </g>
      );

    case 'block_dispenser':
      return (
        <g>
          <ellipse
            cx={x + w / 2} cy={y + h / 2}
            rx={w / 2} ry={h / 2}
            fill={shape.fill_color}
            stroke={shape.stroke_color}
            strokeWidth={shape.stroke_width * 0.15}
            opacity={shape.opacity}
          />
          <text
            x={x + w / 2} y={y + h * 0.42}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.28}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >💧</text>
          <text
            x={x + w / 2} y={y + h * 0.72}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.14} fill="#5A9AB0"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >정수기</text>
        </g>
      );

    case 'block_fridge': {
      const fridgeGradId = `fridgeGrad-${shape.id}`;
      const fridgeShineId = `fridgeShine-${shape.id}`;
      const r = Math.min(w, h) * 0.06;
      return (
        <g opacity={shape.opacity}>
          <defs>
            <linearGradient id={fridgeGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F5F5F5" />
              <stop offset="40%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E8E8E8" />
            </linearGradient>
            <linearGradient id={fridgeShineId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {/* Body */}
          <rect x={x} y={y} width={w} height={h} rx={r}
            fill={`url(#${fridgeGradId})`} stroke="#C0C0C0" strokeWidth={0.2} />
          {/* Upper door (freezer) */}
          <rect x={x + w * 0.06} y={y + h * 0.04} width={w * 0.88} height={h * 0.3} rx={r * 0.6}
            fill="none" stroke="#D0D0D0" strokeWidth={0.12} />
          {/* Lower door (fridge) */}
          <rect x={x + w * 0.06} y={y + h * 0.38} width={w * 0.88} height={h * 0.58} rx={r * 0.6}
            fill="none" stroke="#D0D0D0" strokeWidth={0.12} />
          {/* Shine highlight */}
          <rect x={x + w * 0.08} y={y + h * 0.05} width={w * 0.3} height={h * 0.25} rx={r * 0.4}
            fill={`url(#${fridgeShineId})`} />
          {/* Upper handle */}
          <line x1={x + w * 0.78} y1={y + h * 0.1} x2={x + w * 0.78} y2={y + h * 0.28}
            stroke="#B0B0B0" strokeWidth={0.3} strokeLinecap="round" />
          {/* Lower handle */}
          <line x1={x + w * 0.78} y1={y + h * 0.44} x2={x + w * 0.78} y2={y + h * 0.62}
            stroke="#B0B0B0" strokeWidth={0.3} strokeLinecap="round" />
          {/* Label */}
          <text
            x={x + w / 2} y={y + h * 0.82}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.min(w, h) * 0.13} fill="#999"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >냉장고</text>
        </g>
      );
    }

    default:
      return null;
  }
}
