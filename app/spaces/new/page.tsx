'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { isSeatBlock } from '@/lib/block-definitions';
import FloorPlanEditor from '@/components/floor-plan-editor/FloorPlanEditor';
import KakaoMapPicker from '@/components/KakaoMapPicker';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { EditorShape } from '@/lib/types';

export default function NewSpacePage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [step, setStep] = useState<'info' | 'editor'>('info');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('editor');
  };

  const handleSave = async (shapes: EditorShape[]) => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 1. Create space (no floor_plan_url)
      const { data: space, error: insertError } = await supabase
        .from('spaces')
        .insert({
          name,
          address: address || null,
          latitude: latitude || null,
          longitude: longitude || null,
          floor_plan_url: null,
          floor_plan_width: null,
          floor_plan_height: null,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Save shapes
      if (shapes.length > 0) {
        const shapeInserts = shapes.map((s) => ({
          space_id: space.id,
          shape_type: s.shape_type,
          x_percent: s.x_percent,
          y_percent: s.y_percent,
          width_percent: s.width_percent,
          height_percent: s.height_percent,
          rotation: s.rotation,
          fill_color: s.fill_color,
          stroke_color: s.stroke_color,
          stroke_width: s.stroke_width,
          opacity: s.opacity,
          z_index: s.z_index,
          label: s.label,
        }));

        const { data: savedShapes, error: shapesError } = await supabase
          .from('floor_plan_shapes')
          .insert(shapeInserts)
          .select();

        if (shapesError) throw shapesError;

        // 3. Auto-create seats for seat blocks
        if (savedShapes) {
          const seatInserts = savedShapes
            .filter((s) => isSeatBlock(s.shape_type))
            .map((s, idx) => ({
              space_id: space.id,
              shape_id: s.id,
              label: s.label || `좌석 ${idx + 1}`,
              x_percent: s.x_percent + s.width_percent / 2,
              y_percent: s.y_percent + s.height_percent / 2,
            }));

          if (seatInserts.length > 0) {
            const { error: seatsError } = await supabase
              .from('seats')
              .insert(seatInserts);
            if (seatsError) throw seatsError;
          }
        }
      }

      router.push(`/spaces/${space.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">로그인이 필요합니다</h1>
        <p className="text-foreground-muted mb-6">공간을 등록하려면 먼저 로그인해주세요.</p>
        <Button onClick={() => router.push('/auth')}>로그인하기</Button>
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
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="예: 스타벅스 강남점"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">위치 선택</label>
            <KakaoMapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng, addr) => {
                setLatitude(lat);
                setLongitude(lng);
                if (addr) setAddress(addr);
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

          <Button type="submit" className="w-full">
            다음: 배치도 조립
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 py-4 md:py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={() => setStep('info')}
            className="text-sm text-foreground-muted hover:text-foreground mb-1 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로
          </button>
          <h1 className="text-xl font-bold text-foreground">{name} - 배치도 조립</h1>
          {address && <p className="text-sm text-foreground-muted">{address}</p>}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      <FloorPlanEditor
        spaceId="new"
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
