'use client';

import type { DuplicateCandidate } from '@/lib/space-duplicate-check';

interface DuplicateSpaceModalProps {
  candidates: DuplicateCandidate[];
  onSelectExisting: (spaceId: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

function matchLabel(candidate: DuplicateCandidate): string {
  if (candidate.matchType === 'name_similarity' && candidate.similarity != null) {
    return `이름 유사도 ${Math.round(candidate.similarity * 100)}%`;
  }
  if (candidate.distance != null) {
    return `${Math.round(candidate.distance)}m 이내`;
  }
  return '위치 일치';
}

export default function DuplicateSpaceModal({
  candidates,
  onSelectExisting,
  onCreateNew,
  onClose,
}: DuplicateSpaceModalProps) {
  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Card */}
      <div className="relative w-full max-w-md mx-4 bg-background rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">
            이미 등록된 공간일 수 있습니다
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground transition-colors"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="px-5 pb-3 text-sm text-foreground-muted">
          비슷한 공간이 이미 존재합니다. 기존 공간을 확인하거나 새로 등록하세요.
        </p>

        {/* Candidate list */}
        <ul className="px-5 pb-3 space-y-2 max-h-64 overflow-y-auto">
          {candidates.map((c) => (
            <li
              key={c.space.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background-subtle"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.space.name}</p>
                {c.space.address && (
                  <p className="text-xs text-foreground-muted truncate mt-0.5">{c.space.address}</p>
                )}
                <p className="text-xs text-accent mt-0.5">{matchLabel(c)}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectExisting(c.space.id)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                이 공간으로
              </button>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="px-5 pb-5 pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-background-subtle transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            새로 등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
