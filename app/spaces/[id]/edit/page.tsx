'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import FloorWizard from '@/components/floor-wizard/FloorWizard';
import type { Space } from '@/lib/types';
import type { WizardState, WizardZone, WizardSeatUnit, WizardFixture, WizardWalls } from '@/lib/floor-wizard/types';

export default function EditSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [space, setSpace] = useState<Space | null>(null);
  const [initialWizardState, setInitialWizardState] = useState<Partial<WizardState> | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchData = async () => {
      const [
        { data: spaceData },
        { data: shapesData },
        { data: zonesData },
        { data: fixturesData },
      ] = await Promise.all([
        supabase.from('spaces').select('*').eq('id', id).single(),
        supabase.from('floor_plan_shapes').select('*').eq('space_id', id).order('z_index', { ascending: true }),
        supabase.from('wizard_zones').select('*').eq('space_id', id),
        supabase.from('wizard_fixtures').select('*').eq('space_id', id),
      ]);

      if (cancelled) return;

      if (spaceData) {
        setSpace(spaceData);

        const canvasRatio = spaceData.canvas_height / 100;

        // Rebuild walls from room_polygon
        const storedPolygon = (spaceData as Record<string, unknown>).room_polygon as {
          shape?: string; points?: { x: number; y: number }[]
        } | null | undefined;
        const walls: WizardWalls = storedPolygon
          ? { shape: (storedPolygon.shape as WizardWalls['shape']) ?? 'custom', points: storedPolygon.points ?? [] }
          : { shape: 'rectangle', points: [
              { x: 10, y: 10 * canvasRatio },
              { x: 90, y: 10 * canvasRatio },
              { x: 90, y: 90 * canvasRatio },
              { x: 10, y: 90 * canvasRatio },
            ]};

        // Rebuild zones
        const zones: WizardZone[] = (zonesData ?? []).map((z: Record<string, unknown>) => ({
          id: z.id as string,
          type: z.type as WizardZone['type'],
          label: z.label as string,
          color: z.color as string,
          x: z.x_percent as number,
          y: z.y_percent as number,
          width: z.width_percent as number,
          height: z.height_percent as number,
        }));

        // Rebuild fixtures
        const fixtures: WizardFixture[] = (fixturesData ?? []).map((f: Record<string, unknown>) => ({
          id: f.id as string,
          type: f.type as WizardFixture['type'],
          x: f.x_percent as number,
          y: f.y_percent as number,
          width: f.width_percent as number,
          height: f.height_percent as number,
        }));

        // Capacity lookup per SeatUnitType
        const SEAT_UNIT_CAPACITY: Record<string, number> = {
          TABLE_1: 1,
          TABLE_2: 2,
          TABLE_4: 4,
          TABLE_6: 6,
          BAR: 4,
        };

        // Derive SeatUnitType from shape_type string.
        // Stored as: block_table_{type.toLowerCase()} e.g. block_table_table_4, block_table_bar
        const shapeTypeToSeatUnitType = (shapeType: string): WizardSeatUnit['type'] => {
          // strip leading "block_table_" prefix then uppercase
          const suffix = shapeType.replace(/^block_table_/, '').toUpperCase();
          const validTypes: WizardSeatUnit['type'][] = ['TABLE_1', 'TABLE_2', 'TABLE_4', 'TABLE_6', 'BAR'];
          return validTypes.includes(suffix as WizardSeatUnit['type'])
            ? (suffix as WizardSeatUnit['type'])
            : 'TABLE_4';
        };

        // Rebuild seat units from floor_plan_shapes
        const seatUnits: WizardSeatUnit[] = (shapesData ?? [])
          .filter((s: Record<string, unknown>) => String(s.shape_type).startsWith('block_table'))
          .map((s: Record<string, unknown>, i: number) => {
            const unitType = shapeTypeToSeatUnitType(String(s.shape_type));
            return {
              id: s.id as string,
              zoneId: (s.zone_id as string | null) ?? null,
              type: unitType,
              label: (s.label as string) ?? String(i + 1),
              capacity: SEAT_UNIT_CAPACITY[unitType] ?? 4,
              x: s.x_percent as number,
              y: s.y_percent as number,
              width: s.width_percent as number,
              height: s.height_percent as number,
            };
          });

        setInitialWizardState({ walls, zones, fixtures, seatUnits, canvasRatio, step: 3 });
      }
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const handleWizardComplete = async (wizardState: WizardState) => {
    if (!user || !space) return;

    setSaving(true);
    setError('');

    // 롤백용 스냅샷 변수 (try 밖에 선언하여 catch에서 접근 가능)
    let snapshotShapes: Record<string, unknown>[] | null = null;
    let snapshotZones: Record<string, unknown>[] | null = null;
    let snapshotFixtures: Record<string, unknown>[] | null = null;

    try {
      // 0. 롤백용 기존 데이터 스냅샷
      const [
        { data: snapShapes },
        { data: snapZones },
        { data: snapFixtures },
      ] = await Promise.all([
        supabase.from('floor_plan_shapes').select('*').eq('space_id', id),
        supabase.from('wizard_zones').select('*').eq('space_id', id),
        supabase.from('wizard_fixtures').select('*').eq('space_id', id),
      ]);
      snapshotShapes = (snapShapes ?? []) as Record<string, unknown>[];
      snapshotZones = (snapZones ?? []) as Record<string, unknown>[];
      snapshotFixtures = (snapFixtures ?? []) as Record<string, unknown>[];

      // 1. 포스트 있는 seats 확인 후 언링크
      const { data: existingSeats } = await supabase
        .from('seats')
        .select('id, shape_id, posts:posts(count)')
        .eq('space_id', id);

      const seatsWithPosts = (existingSeats ?? []).filter(
        (s) => (s.posts?.[0]?.count ?? 0) > 0
      );
      if (seatsWithPosts.length > 0) {
        await supabase
          .from('seats')
          .update({ shape_id: null })
          .in('id', seatsWithPosts.map((s) => s.id));
      }

      const seatsWithoutPosts = (existingSeats ?? []).filter(
        (s) => (s.posts?.[0]?.count ?? 0) === 0
      );
      if (seatsWithoutPosts.length > 0) {
        await supabase
          .from('seats')
          .delete()
          .in('id', seatsWithoutPosts.map((s) => s.id));
      }

      // 2. 기존 shapes 삭제
      const { error: deleteShapesError } = await supabase
        .from('floor_plan_shapes')
        .delete()
        .eq('space_id', id);
      if (deleteShapesError) throw deleteShapesError;

      // 3. 기존 wizard_zones, wizard_fixtures 삭제
      await supabase.from('wizard_zones').delete().eq('space_id', id);
      await supabase.from('wizard_fixtures').delete().eq('space_id', id);

      // 4. spaces 업데이트
      const { error: updateError } = await supabase
        .from('spaces')
        .update({
          canvas_height: Math.round(100 * wizardState.canvasRatio),
          room_polygon: wizardState.walls.points.length > 0 ? wizardState.walls : null,
        } as Record<string, unknown>)
        .eq('id', id);
      if (updateError) throw updateError;

      // 5. wizard zones 삽입
      const zoneIdMap = new Map<string, string>();
      if (wizardState.zones.length > 0) {
        const zoneInserts = wizardState.zones.map((z) => ({
          space_id: id,
          type: z.type,
          label: z.label,
          color: z.color,
          x_percent: z.x,
          y_percent: z.y,
          width_percent: z.width,
          height_percent: z.height,
        }));
        const { data: savedZones, error: zonesError } = await supabase
          .from('wizard_zones').insert(zoneInserts).select();
        if (zonesError) throw zonesError;

        wizardState.zones.forEach((z, i) => {
          if (savedZones?.[i]) zoneIdMap.set(z.id, savedZones[i].id);
        });
      }

      // 6. wizard fixtures 삽입
      if (wizardState.fixtures.length > 0) {
        const fixtureInserts = wizardState.fixtures.map((f) => ({
          space_id: id,
          type: f.type,
          x_percent: f.x,
          y_percent: f.y,
          width_percent: f.width,
          height_percent: f.height,
        }));
        const { error: fixturesError } = await supabase.from('wizard_fixtures').insert(fixtureInserts);
        if (fixturesError) throw fixturesError;
      }

      // 7. seat_units → floor_plan_shapes + seats
      if (wizardState.seatUnits.length > 0) {
        const shapeInserts = wizardState.seatUnits.map((u, i) => ({
          space_id: id,
          shape_type: `block_table_${u.type.toLowerCase()}`,
          x_percent: u.x,
          y_percent: u.y,
          width_percent: u.width,
          height_percent: u.height,
          label: u.label,
          z_index: i,
          rotation: 0,
          fill_color: '#FFFFFF',
          stroke_color: '#1A1A1A',
          stroke_width: 1,
          opacity: 1,
          zone_id: u.zoneId ? (zoneIdMap.get(u.zoneId) ?? null) : null,
        }));

        const { data: savedShapes, error: shapesError } = await supabase
          .from('floor_plan_shapes')
          .insert(shapeInserts)
          .select();
        if (shapesError) throw shapesError;

        if (savedShapes && savedShapes.length > 0) {
          const seatInserts = wizardState.seatUnits.map((unit, ui) => ({
            space_id: id,
            shape_id: savedShapes[ui].id,
            label: unit.label,
            x_percent: unit.x + unit.width / 2,
            y_percent: unit.y + unit.height / 2,
          }));

          if (seatInserts.length > 0) {
            const { error: seatsError } = await supabase.from('seats').insert(seatInserts);
            if (seatsError) throw seatsError;
          }
        }
      }

      router.push(`/spaces/${id}`);
    } catch (err) {
      // 롤백 시도: 삭제된 데이터 복구
      try {
        if (snapshotShapes && snapshotShapes.length > 0) {
          await supabase.from('floor_plan_shapes').insert(snapshotShapes);
        }
        if (snapshotZones && snapshotZones.length > 0) {
          await supabase.from('wizard_zones').insert(snapshotZones);
        }
        if (snapshotFixtures && snapshotFixtures.length > 0) {
          await supabase.from('wizard_fixtures').insert(snapshotFixtures);
        }
        setError(
          (err instanceof Error ? err.message : '저장 중 오류가 발생했습니다') +
          ' — 이전 데이터가 복구되었습니다. 다시 시도해주세요.'
        );
      } catch {
        setError(
          (err instanceof Error ? err.message : '저장 중 오류가 발생했습니다') +
          ' — 데이터 복구에 실패했습니다. 페이지를 새로고침하여 확인하세요.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">공간을 찾을 수 없습니다</h1>
      </div>
    );
  }

  const isOwner = user && space.created_by === user.id;
  if (!isOwner) {
    router.replace(`/spaces/${id}`);
    return null;
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background flex-shrink-0">
        <button
          onClick={() => router.push(`/spaces/${id}`)}
          className="text-sm text-foreground-muted hover:text-foreground flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로
        </button>
        <h1 className="text-base font-bold text-foreground truncate">{space.name} — 배치도 수정</h1>
      </div>

      {error && (
        <p className="text-sm text-red-500 px-4 py-2">{error}</p>
      )}

      <FloorWizard
        spaceId={id}
        canvasRatio={space.canvas_height / 100}
        initialState={initialWizardState}
        onComplete={handleWizardComplete}
        saving={saving}
      />
    </div>
  );
}
