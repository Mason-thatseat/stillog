'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import KakaoMapPicker from '@/components/KakaoMapPicker';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DuplicateSpaceModal from '@/components/DuplicateSpaceModal';
import FloorWizard from '@/components/floor-wizard/FloorWizard';
import { checkDuplicateSpace } from '@/lib/space-duplicate-check';
import type { DuplicateCandidate } from '@/lib/space-duplicate-check';
import type { WizardState } from '@/lib/floor-wizard/types';

export default function NewSpacePage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [placeId, setPlaceId] = useState<string | undefined>();
  const [step, setStep] = useState<'info' | 'wizard'>('info');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidate[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [noMatchConfirm, setNoMatchConfirm] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, user, router]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setChecking(true);
    setError('');

    try {
      const result = await checkDuplicateSpace({
        placeId,
        latitude,
        longitude,
        name,
      });

      if (result.exactMatch) {
        // Redirect directly to the existing space
        router.push(`/spaces/${result.exactMatch.id}`);
        return;
      }

      if (result.candidates.length > 0) {
        setDuplicateCandidates(result.candidates);
        setShowDuplicateModal(true);
        return;
      }

      setNoMatchConfirm(true);
    } catch {
      setError('중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setChecking(false);
    }
  };

  const handleWizardComplete = async (wizardState: WizardState) => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setSaving(true);
    setError('');

    let createdSpaceId: string | null = null;

    try {
      // 1. 공간 생성
      const { data: space, error: insertError } = await supabase
        .from('spaces')
        .insert({
          name,
          address: address || null,
          latitude: latitude == null ? null : latitude,
          longitude: longitude == null ? null : longitude,
          place_id: placeId ?? null,
          floor_plan_url: null,
          floor_plan_width: null,
          floor_plan_height: null,
          canvas_width: 100,
          canvas_height: Math.round(100 * wizardState.canvasRatio),
          room_polygon: wizardState.walls.points.length > 0 ? wizardState.walls : null,
          created_by: user.id,
        } as Record<string, unknown>)
        .select()
        .single();

      if (insertError) throw insertError;
      createdSpaceId = space.id;

      // 2. wizard zones → wizard_zones table
      const zoneIdMap = new Map<string, string>();
      if (wizardState.zones.length > 0) {
        const zoneInserts = wizardState.zones.map((z) => ({
          space_id: space.id,
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

      // 3. wizard fixtures → wizard_fixtures table
      if (wizardState.fixtures.length > 0) {
        const fixtureInserts = wizardState.fixtures.map((f) => ({
          space_id: space.id,
          type: f.type,
          x_percent: f.x,
          y_percent: f.y,
          width_percent: f.width,
          height_percent: f.height,
        }));
        const { error: fixturesError } = await supabase.from('wizard_fixtures').insert(fixtureInserts);
        if (fixturesError) throw fixturesError;
      }

      // 4. seat_units → floor_plan_shapes + seats
      if (wizardState.seatUnits.length > 0) {
        const shapeInserts = wizardState.seatUnits.map((u, i) => ({
          space_id: space.id,
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

        // 5. auto-create one seat (table) per unit
        if (savedShapes && savedShapes.length > 0) {
          const seatInserts = wizardState.seatUnits.map((unit, ui) => ({
            space_id: space.id,
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

      createdSpaceId = null;
      router.push(`/spaces/${space.id}`);
    } catch (err) {
      if (createdSpaceId) {
        await supabase.from('spaces').delete().eq('id', createdSpaceId);
      }
      const msg = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? JSON.stringify(err);
      setError(msg || '오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">공간 등록</h1>
        <p className="text-foreground-muted mb-8">
          새로운 공간 정보를 입력하고 배치도를 조립하세요
        </p>

        <form onSubmit={handleInfoSubmit} className="space-y-6">
          <Input
            id="name"
            label="공간 이름"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNoMatchConfirm(false); }}
            required
            placeholder="예: 스타벅스 강남점"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">위치 선택</label>
            <KakaoMapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng, addr, pid) => {
                setLatitude(lat);
                setLongitude(lng);
                if (addr) setAddress(addr);
                setPlaceId(pid);
                setNoMatchConfirm(false);
              }}
            />
            {address && (
              <p className="mt-2 text-sm text-foreground-muted">
                선택된 주소: {address}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={checking}>
            {checking ? '중복 확인 중...' : '다음: 배치도 생성'}
          </Button>

        </form>

        {noMatchConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setNoMatchConfirm(false)}
          >
            <div
              className="w-full max-w-sm mx-4 bg-background rounded-2xl shadow-xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-semibold text-foreground">등록된 매장이 없습니다</h2>
              <p className="text-sm text-foreground-muted">
                일치하는 매장이 없습니다. 새로운 매장으로 등록하시겠습니까?
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNoMatchConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-background-subtle transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => { setNoMatchConfirm(false); setStep('wizard'); }}
                  className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  신규 생성
                </button>
              </div>
            </div>
          </div>
        )}

        {showDuplicateModal && (
          <DuplicateSpaceModal
            candidates={duplicateCandidates}
            onSelectExisting={(id) => router.push(`/spaces/${id}`)}
            onCreateNew={() => {
              setShowDuplicateModal(false);
              setStep('wizard');
            }}
            onClose={() => setShowDuplicateModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background flex-shrink-0">
        <button
          onClick={() => setStep('info')}
          className="text-sm text-foreground-muted hover:text-foreground flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-foreground truncate">{name} - 배치도 생성</h1>
          {address && <p className="text-xs text-foreground-muted truncate">{address}</p>}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 px-4 py-2">{error}</p>
      )}

      <FloorWizard
        onComplete={handleWizardComplete}
        saving={saving}
      />
    </div>
  );
}
