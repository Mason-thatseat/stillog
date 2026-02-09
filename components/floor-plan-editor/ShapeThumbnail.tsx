'use client';

import type { ShapeType } from '@/lib/types';

interface ShapeThumbnailProps {
  type: ShapeType;
  size?: number;
}

export default function ShapeThumbnail({ type, size = 40 }: ShapeThumbnailProps) {
  const pad = 4;
  const s = size;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {type === 'rectangle' && (
        <rect
          x={pad} y={pad + 4}
          width={s - pad * 2} height={s - pad * 2 - 8}
          rx={3}
          fill="#E8D5C0"
          stroke="#A78B71"
          strokeWidth={1.5}
        />
      )}
      {type === 'circle' && (
        <ellipse
          cx={s / 2} cy={s / 2}
          rx={(s - pad * 2) / 2} ry={(s - pad * 2) / 2}
          fill="#D4C4B5"
          stroke="#A78B71"
          strokeWidth={1.5}
        />
      )}
      {type === 'triangle' && (
        <polygon
          points={`${s / 2},${pad} ${s - pad},${s - pad} ${pad},${s - pad}`}
          fill="#F0E4D7"
          stroke="#A78B71"
          strokeWidth={1.5}
        />
      )}
      {type === 'line' && (
        <line
          x1={pad} y1={s - pad}
          x2={s - pad} y2={pad}
          stroke="#A78B71"
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
      {type === 'table' && (
        <>
          <rect
            x={pad} y={pad + 2}
            width={s - pad * 2} height={s - pad * 2 - 4}
            rx={4}
            fill="url(#tableGradThumb)"
            stroke="#A78B71"
            strokeWidth={1.5}
          />
          <defs>
            <linearGradient id="tableGradThumb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E8D5C0" />
            </linearGradient>
          </defs>
          <text x={s / 2} y={s / 2 + 4} textAnchor="middle" fontSize={14} fill="#A78B71">
            ☕
          </text>
        </>
      )}

      {/* Block types */}
      {type === 'block_wall' && (
        <rect
          x={pad} y={s * 0.35}
          width={s - pad * 2} height={s * 0.3}
          rx={2}
          fill="#5C4033"
          stroke="#3D2B1F"
          strokeWidth={1.5}
        />
      )}
      {type === 'block_floor' && (
        <rect
          x={pad} y={pad}
          width={s - pad * 2} height={s - pad * 2}
          rx={2}
          fill="#FFF8F0"
          stroke="#D4C4B5"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
      )}
      {type === 'block_window' && (
        <>
          <defs>
            <linearGradient id="windowGradThumb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8F4FD" />
              <stop offset="100%" stopColor="#B8D8E8" />
            </linearGradient>
          </defs>
          <rect
            x={pad} y={s * 0.3}
            width={s - pad * 2} height={s * 0.4}
            rx={2}
            fill="url(#windowGradThumb)"
            stroke="#8BB8CC"
            strokeWidth={1.5}
          />
          <line x1={s / 2} y1={s * 0.35} x2={s / 2} y2={s * 0.65} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
        </>
      )}
      {type === 'block_table_rect' && (
        <>
          <defs>
            <linearGradient id="blockTableGradThumb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E8D5C0" />
            </linearGradient>
          </defs>
          <rect
            x={pad} y={pad + 2}
            width={s - pad * 2} height={s - pad * 2 - 4}
            rx={4}
            fill="url(#blockTableGradThumb)"
            stroke="#A78B71"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 4} textAnchor="middle" fontSize={14} fill="#A78B71">
            ☕
          </text>
        </>
      )}
      {type === 'block_table_round' && (
        <>
          <defs>
            <radialGradient id="roundTableGradThumb" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E0CDB8" />
            </radialGradient>
          </defs>
          <ellipse
            cx={s / 2} cy={s / 2}
            rx={(s - pad * 2) / 2} ry={(s - pad * 2) / 2}
            fill="url(#roundTableGradThumb)"
            stroke="#A78B71"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 4} textAnchor="middle" fontSize={12} fill="#A78B71">
            ☕
          </text>
        </>
      )}
      {type === 'block_chair' && (
        <>
          <rect
            x={pad + 4} y={pad + 4}
            width={s - pad * 2 - 8} height={s - pad * 2 - 8}
            rx={3}
            fill="#D4C4B5"
            stroke="#8B7355"
            strokeWidth={1.5}
          />
          {/* Backrest */}
          <rect
            x={pad + 5} y={pad + 4}
            width={s - pad * 2 - 10} height={(s - pad * 2 - 8) * 0.28}
            rx={2}
            fill="#8B7355"
            opacity={0.7}
          />
        </>
      )}
      {type === 'block_sofa' && (
        <>
          <rect
            x={pad} y={pad + 4}
            width={s - pad * 2} height={s - pad * 2 - 8}
            rx={5}
            fill="#C9A882"
            stroke="#8B7355"
            strokeWidth={1.5}
          />
          {/* U cushion */}
          <path
            d={`M ${pad + 5} ${pad + 8}
                L ${pad + 5} ${s - pad - 7}
                Q ${pad + 5} ${s - pad - 5} ${pad + 8} ${s - pad - 5}
                L ${s - pad - 8} ${s - pad - 5}
                Q ${s - pad - 5} ${s - pad - 5} ${s - pad - 5} ${s - pad - 7}
                L ${s - pad - 5} ${pad + 8}`}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1}
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'block_plant' && (
        <>
          <ellipse
            cx={s / 2} cy={s / 2}
            rx={(s - pad * 2) / 2} ry={(s - pad * 2) / 2}
            fill="#A8C686"
            stroke="#6B8E4E"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 3} textAnchor="middle" fontSize={16}>
            🌿
          </text>
        </>
      )}
    </svg>
  );
}
