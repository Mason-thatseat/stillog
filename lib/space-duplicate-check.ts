import { createClient } from '@/lib/supabase/client';
import type { Space } from '@/lib/types';

export interface DuplicateCandidate {
  space: Space;
  matchType: 'place_id' | 'location' | 'name_similarity';
  similarity?: number;
  distance?: number;
}

export interface DuplicateCheckResult {
  exactMatch: Space | null;
  candidates: DuplicateCandidate[];
}

/** Haversine distance in metres between two lat/lng pairs */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Normalise a store name for similarity comparison */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    // remove common suffixes that differ between branches
    .replace(/[()（）[\]【】]/g, '')
    .trim();
}

/** Levenshtein edit distance (iterative, O(m*n)) */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Use a single-row rolling array for memory efficiency
  const row: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = i;
    for (let j = 1; j <= n; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : 1 + Math.min(row[j - 1], row[j], prev);
      row[j - 1] = prev;
      prev = val;
    }
    row[n] = prev;
  }

  return row[n];
}

/**
 * Returns a similarity ratio in [0, 1] between two strings.
 * 1.0 = identical, 0.0 = completely different.
 */
export function calculateNameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;
  const maxLen = Math.max(na.length, nb.length);
  return (maxLen - levenshtein(na, nb)) / maxLen;
}

const RADIUS_METRES = 50;
const SIMILARITY_THRESHOLD = 0.8;

/**
 * 3-stage duplicate check:
 *  1. Exact place_id match → exactMatch
 *  2. Haversine distance ≤ 50 m → location candidates
 *  3. Name similarity ≥ 80 % on location candidates → name_similarity candidates
 */
export async function checkDuplicateSpace(params: {
  placeId?: string;
  latitude?: number;
  longitude?: number;
  name: string;
}): Promise<DuplicateCheckResult> {
  const { placeId, latitude, longitude, name } = params;
  const supabase = createClient();

  // ── Stage 1: exact place_id match ────────────────────────────────────────
  if (placeId) {
    const { data: exact } = await supabase
      .from('spaces')
      .select('*')
      .eq('place_id', placeId)
      .maybeSingle();

    if (exact) {
      return { exactMatch: exact as Space, candidates: [] };
    }
  }

  // ── Stages 2 & 3 need coordinates ────────────────────────────────────────
  if (latitude == null || longitude == null) {
    return { exactMatch: null, candidates: [] };
  }

  // Fetch all spaces that have coordinates
  const { data: allSpaces } = await supabase
    .from('spaces')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (!allSpaces || allSpaces.length === 0) {
    return { exactMatch: null, candidates: [] };
  }

  // ── Stage 2: filter by distance ──────────────────────────────────────────
  const nearbySpaces: Array<Space & { _distance: number }> = [];
  for (const space of allSpaces as Space[]) {
    if (space.latitude == null || space.longitude == null) continue;
    const dist = calculateDistance(latitude, longitude, space.latitude, space.longitude);
    if (dist <= RADIUS_METRES) {
      nearbySpaces.push({ ...space, _distance: dist });
    }
  }

  if (nearbySpaces.length === 0) {
    return { exactMatch: null, candidates: [] };
  }

  // ── Stage 3: name similarity on nearby candidates ────────────────────────
  const candidates: DuplicateCandidate[] = [];
  for (const space of nearbySpaces) {
    const similarity = calculateNameSimilarity(name, space.name);
    if (similarity >= SIMILARITY_THRESHOLD) {
      candidates.push({
        space,
        matchType: 'name_similarity',
        similarity,
        distance: space._distance,
      });
    } else {
      // Still include pure location matches (even without name similarity)
      candidates.push({
        space,
        matchType: 'location',
        distance: space._distance,
      });
    }
  }

  // Sort: name_similarity first, then by distance
  candidates.sort((a, b) => {
    if (a.matchType === 'name_similarity' && b.matchType !== 'name_similarity') return -1;
    if (b.matchType === 'name_similarity' && a.matchType !== 'name_similarity') return 1;
    return (a.distance ?? 0) - (b.distance ?? 0);
  });

  return { exactMatch: null, candidates };
}
