'use client';

import type { EditorShape } from '@/lib/types';
import { isBlockType, isSeatBlock } from '@/lib/block-definitions';
import BlockRenderer from './BlockRenderer';

interface ShapeRendererProps {
  shape: EditorShape;
  allShapes?: EditorShape[];
  isSelected?: boolean;
  isViewer?: boolean;
  avgRating?: number;
  postsCount?: number;
  onPointerDown?: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

export default function ShapeRenderer({
  shape,
  allShapes,
  isSelected,
  isViewer,
  avgRating,
  postsCount,
  onPointerDown,
  onClick,
}: ShapeRendererProps) {
  const { x_percent: x, y_percent: y, width_percent: w, height_percent: h, shape_type, fill_color, stroke_color, stroke_width, opacity } = shape;
  const sw = stroke_width * 0.15;

  const isSeat = isBlockType(shape_type) && isSeatBlock(shape_type);
  const commonProps = {
    opacity,
    style: { cursor: isViewer ? (isSeat ? 'pointer' : 'default') : 'move' } as React.CSSProperties,
    onPointerDown,
    onClick,
  };

  // Rotation transform
  const rotation = shape.rotation || 0;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rotationTransform = rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined;

  const renderShape = () => {
    switch (shape_type) {
      case 'rectangle':
        return (
          <rect
            x={x} y={y}
            width={w} height={h}
            rx={Math.min(w, h) * 0.05}
            fill={fill_color}
            stroke={stroke_color}
            strokeWidth={sw}
            {...commonProps}
          />
        );

      case 'circle':
        return (
          <ellipse
            cx={x + w / 2}
            cy={y + h / 2}
            rx={w / 2}
            ry={h / 2}
            fill={fill_color}
            stroke={stroke_color}
            strokeWidth={sw}
            {...commonProps}
          />
        );

      case 'triangle':
        return (
          <polygon
            points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`}
            fill={fill_color}
            stroke={stroke_color}
            strokeWidth={sw}
            {...commonProps}
          />
        );

      case 'line':
        return (
          <line
            x1={x} y1={y + h / 2}
            x2={x + w} y2={y + h / 2}
            stroke={stroke_color}
            strokeWidth={Math.max(sw, 0.3)}
            strokeLinecap="round"
            {...commonProps}
          />
        );

      default:
        if (isBlockType(shape_type)) {
          return (
            <g {...commonProps}>
              <BlockRenderer
                shape={shape}
                allShapes={allShapes}
                avgRating={avgRating}
                postsCount={postsCount}
                isViewer={isViewer}
              />
            </g>
          );
        }
        return null;
    }
  };

  if (rotationTransform) {
    return (
      <g transform={rotationTransform}>
        {renderShape()}
      </g>
    );
  }

  return renderShape();
}
