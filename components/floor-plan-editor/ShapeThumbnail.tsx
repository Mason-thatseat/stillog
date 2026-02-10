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

      {/* Block: Room */}
      {type === 'block_room' && (
        <rect
          x={pad} y={pad}
          width={s - pad * 2} height={s - pad * 2}
          rx={2}
          fill="#FFF8F0"
          stroke="#5C4033"
          strokeWidth={1.5}
        />
      )}

      {/* Block: Window */}
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

      {/* Block: Door */}
      {type === 'block_door' && (
        <>
          <rect
            x={pad} y={s * 0.3}
            width={s - pad * 2} height={s * 0.4}
            rx={2}
            fill="#D4A574"
            stroke="#8B6914"
            strokeWidth={1.5}
          />
          <circle cx={s * 0.72} cy={s * 0.5} r={2} fill="#8B6914" opacity={0.6} />
        </>
      )}

      {/* Block: Sliding door */}
      {type === 'block_sliding_door' && (
        <>
          <rect
            x={pad} y={s * 0.3}
            width={s - pad * 2} height={s * 0.4}
            rx={2}
            fill="#E8DDD3"
            stroke="#8B7355"
            strokeWidth={1.5}
          />
          <line x1={s / 2} y1={s * 0.35} x2={s / 2} y2={s * 0.65} stroke="#8B7355" strokeWidth={0.8} strokeDasharray="2 1.5" opacity={0.5} />
        </>
      )}

      {/* Block: Wall */}
      {type === 'block_wall' && (
        <>
          <rect
            x={pad} y={s * 0.32}
            width={s - pad * 2} height={s * 0.36}
            fill="#C8B8A8"
            stroke="#5C4033"
            strokeWidth={1.5}
          />
          <line x1={s * 0.33} y1={s * 0.32} x2={s * 0.33} y2={s * 0.68} stroke="#5C4033" strokeWidth={0.6} opacity={0.3} />
          <line x1={s * 0.66} y1={s * 0.32} x2={s * 0.66} y2={s * 0.68} stroke="#5C4033" strokeWidth={0.6} opacity={0.3} />
        </>
      )}

      {/* Block: Partition (zigzag) */}
      {type === 'block_partition' && (
        <polyline
          points={`${pad},${s * 0.3} ${s * 0.25},${s * 0.7} ${s * 0.5},${s * 0.3} ${s * 0.75},${s * 0.7} ${s - pad},${s * 0.3}`}
          fill="none"
          stroke="#9E8E7E"
          strokeWidth={2}
          strokeLinejoin="bevel"
        />
      )}

      {/* Block: Table 2 */}
      {type === 'block_table_2' && (
        <>
          <defs>
            <linearGradient id="table2GradThumb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E8D5C0" />
            </linearGradient>
          </defs>
          <rect
            x={pad + 4} y={pad + 2}
            width={s - pad * 2 - 8} height={s - pad * 2 - 4}
            rx={4}
            fill="url(#table2GradThumb)"
            stroke="#A78B71"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 1} textAnchor="middle" fontSize={9} fill="#8B7355" fontWeight="500">
            2
          </text>
        </>
      )}

      {/* Block: Table 4 */}
      {type === 'block_table_4' && (
        <>
          <defs>
            <linearGradient id="table4GradThumb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E8D5C0" />
            </linearGradient>
          </defs>
          <rect
            x={pad} y={pad + 2}
            width={s - pad * 2} height={s - pad * 2 - 4}
            rx={4}
            fill="url(#table4GradThumb)"
            stroke="#A78B71"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 1} textAnchor="middle" fontSize={9} fill="#8B7355" fontWeight="500">
            4
          </text>
        </>
      )}

      {/* Block: Table 6 */}
      {type === 'block_table_6' && (
        <>
          <defs>
            <linearGradient id="table6GradThumb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E8D5C0" />
            </linearGradient>
          </defs>
          <rect
            x={pad - 1} y={pad + 4}
            width={s - pad * 2 + 2} height={s - pad * 2 - 8}
            rx={3}
            fill="url(#table6GradThumb)"
            stroke="#A78B71"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 1} textAnchor="middle" fontSize={9} fill="#8B7355" fontWeight="500">
            6
          </text>
        </>
      )}

      {/* Block: Round table */}
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

      {/* Block: Kitchen */}
      {type === 'block_kitchen' && (
        <>
          <rect
            x={pad} y={pad + 2}
            width={s - pad * 2} height={s - pad * 2 - 4}
            rx={3}
            fill="#E8E8E8"
            stroke="#999999"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 2} textAnchor="middle" fontSize={8} fill="#666">
            주방
          </text>
        </>
      )}

      {/* Block: Self bar */}
      {type === 'block_selfbar' && (
        <>
          <rect
            x={pad} y={pad + 4}
            width={s - pad * 2} height={s - pad * 2 - 8}
            rx={3}
            fill="#D4C4B5"
            stroke="#8B7355"
            strokeWidth={1.5}
          />
          <line x1={pad + 3} y1={s * 0.38} x2={s - pad - 3} y2={s * 0.38} stroke="#8B7355" strokeWidth={0.8} opacity={0.4} />
          <text x={s / 2} y={s / 2 + 4} textAnchor="middle" fontSize={7} fill="#6B5B4D">
            셀프바
          </text>
        </>
      )}

      {/* Block: Restroom */}
      {type === 'block_restroom' && (
        <>
          <rect
            x={pad} y={pad}
            width={s - pad * 2} height={s - pad * 2}
            rx={3}
            fill="#E0EBF0"
            stroke="#8BAAB8"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 2} textAnchor="middle" fontSize={14}>
            🚻
          </text>
        </>
      )}

      {/* Block: Fridge */}
      {type === 'block_fridge' && (
        <>
          <defs>
            <linearGradient id="fridgeGradThumb" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F5F5F5" />
              <stop offset="40%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E8E8E8" />
            </linearGradient>
          </defs>
          {/* Body */}
          <rect x={pad + 2} y={pad} width={s - pad * 2 - 4} height={s - pad * 2} rx={2}
            fill="url(#fridgeGradThumb)" stroke="#C0C0C0" strokeWidth={1.2} />
          {/* Upper door (freezer) */}
          <rect x={pad + 4} y={pad + 2} width={s - pad * 2 - 8} height={(s - pad * 2) * 0.3} rx={1}
            fill="none" stroke="#D5D5D5" strokeWidth={0.8} />
          {/* Lower door */}
          <rect x={pad + 4} y={pad + (s - pad * 2) * 0.36} width={s - pad * 2 - 8} height={(s - pad * 2) * 0.58} rx={1}
            fill="none" stroke="#D5D5D5" strokeWidth={0.8} />
          {/* Upper handle */}
          <line x1={s * 0.65} y1={pad + 5} x2={s * 0.65} y2={pad + (s - pad * 2) * 0.27}
            stroke="#B0B0B0" strokeWidth={1.5} strokeLinecap="round" />
          {/* Lower handle */}
          <line x1={s * 0.65} y1={pad + (s - pad * 2) * 0.42} x2={s * 0.65} y2={pad + (s - pad * 2) * 0.6}
            stroke="#B0B0B0" strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}

      {/* Block: Dispenser */}
      {type === 'block_dispenser' && (
        <>
          <ellipse
            cx={s / 2} cy={s / 2}
            rx={(s - pad * 2) / 2} ry={(s - pad * 2) / 2}
            fill="#D5E8F0"
            stroke="#7BAFC0"
            strokeWidth={1.5}
          />
          <text x={s / 2} y={s / 2 + 2} textAnchor="middle" fontSize={14}>
            💧
          </text>
        </>
      )}
    </svg>
  );
}
