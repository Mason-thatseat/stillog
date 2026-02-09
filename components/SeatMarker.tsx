'use client';

interface SeatMarkerProps {
  label?: string | null;
  postsCount?: number;
  isSelected?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export default function SeatMarker({
  label,
  postsCount = 0,
  isSelected = false,
  isEditing = false,
  onClick,
  onDelete,
}: SeatMarkerProps) {
  return (
    <div
      className={`
        seat-marker flex flex-col items-center
        ${isEditing ? 'cursor-move' : 'cursor-pointer'}
      `}
      onClick={onClick}
    >
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center
          text-xs font-medium transition-all
          ${isSelected
            ? 'bg-accent text-white ring-2 ring-accent ring-offset-2'
            : postsCount > 0
              ? 'bg-accent text-white'
              : 'bg-white border-2 border-accent text-accent'
          }
        `}
      >
        {postsCount > 0 ? postsCount : label?.[0] || '•'}
      </div>
      {label && (
        <span className="mt-1 text-xs text-foreground-muted whitespace-nowrap">
          {label}
        </span>
      )}
      {isEditing && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
}
