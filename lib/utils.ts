// ─── Date formatting ───────────────────────────────────────────────────────

/** 표준 날짜: "2025년 12월 25일" */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** 날짜+시각: "2025년 12월 25일 14:30" */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${formatDate(dateStr)} ${time}`;
}

/** 상대 시간: "방금 전 / N분 전 / N시간 전 / N일 전 / 날짜" */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return formatDate(dateStr);
}

// ─── Space data helpers ─────────────────────────────────────────────────────

type RawSpaceWithJoins = {
  seats?: { count: number }[] | null;
  posts?: { posts: { count: number }[] }[] | null;
};

/** Supabase join 결과를 seats_count / posts_count 필드로 변환 (3곳 중복 제거) */
export function transformSpacesWithCounts<T extends RawSpaceWithJoins>(
  spaces: T[] | null | undefined
): Array<T & { seats_count: number; posts_count: number }> {
  return (spaces ?? []).map((space) => ({
    ...space,
    seats_count: space.seats?.[0]?.count ?? 0,
    posts_count: (space.posts ?? []).reduce(
      (acc, seat) => acc + (seat.posts?.[0]?.count ?? 0),
      0
    ),
  }));
}
