'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import FloorPlanEditor from '@/components/floor-plan-editor/FloorPlanEditor';
import { isSeatBlock } from '@/lib/block-definitions';
import type { EditorShape, FloorPlanShape, Space } from '@/lib/types';

export default function EditSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [space, setSpace] = useState<Space | null>(null);
  const [shapes, setShapes] = useState<FloorPlanShape[]>([]);
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
      const [{ data: spaceData }, { data: shapesData }] = await Promise.all([
        supabase.from('spaces').select('*').eq('id', id).single(),
        supabase.from('floor_plan_shapes').select('*').eq('space_id', id).order('z_index', { ascending: true }),
      ]);

      if (cancelled) return;

      if (spaceData) {
        setSpace(spaceData);
        setShapes(shapesData || []);
      }
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async (editorShapes: EditorShape[], canvasRatio: number) => {
    if (!user || !space) return;

    setSaving(true);
    setError('');

    try {
      // 1. Fetch existing seats with post counts
      const { data: existingSeats } = await supabase
        .from('seats')
        .select('id, shape_id, posts:posts(count)')
        .eq('space_id', id);

      // 2. For seats WITH posts: unlink shape_id (set null) so shape delete doesn't cascade
      const seatsWithPosts = (existingSeats ?? []).filter(
        (s) => (s.posts?.[0]?.count ?? 0) > 0
      );
      if (seatsWithPosts.length > 0) {
        await supabase
          .from('seats')
          .update({ shape_id: null })
          .in('id', seatsWithPosts.map((s) => s.id));
      }

      // 3. Delete seats with NO posts (will be re-created from new blocks)
      const seatsWithoutPosts = (existingSeats ?? []).filter(
        (s) => (s.posts?.[0]?.count ?? 0) === 0
      );
      if (seatsWithoutPosts.length > 0) {
        await supabase
          .from('seats')
          .delete()
          .in('id', seatsWithoutPosts.map((s) => s.id));
      }

      // 4. Delete all old shapes
      const { error: deleteShapesError } = await supabase
        .from('floor_plan_shapes')
        .delete()
        .eq('space_id', id);
      if (deleteShapesError) throw deleteShapesError;

      // 5. Update canvas dimensions
      const { error: updateError } = await supabase
        .from('spaces')
        .update({ canvas_height: Math.round(100 * canvasRatio) })
        .eq('id', id);
      if (updateError) throw updateError;

      // 6. Insert new shapes
      if (editorShapes.length > 0) {
        const shapeInserts = editorShapes.map((s) => ({
          space_id: id,
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

        // 7. Create seats for new seat blocks
        if (savedShapes) {
          const seatInserts = savedShapes
            .filter((s) => isSeatBlock(s.shape_type))
            .map((s, idx) => ({
              space_id: id,
              shape_id: s.id,
              label: s.label != null ? s.label : `좌석 ${idx + 1}`,
              x_percent: s.x_percent + s.width_percent / 2,
              y_percent: s.y_percent + s.height_percent / 2,
            }));

          if (seatInserts.length > 0) {
            const { error: seatsError } = await supabase.from('seats').insert(seatInserts);
            if (seatsError) throw seatsError;
          }
        }
      }

      router.push(`/spaces/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다');
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
    <div className="max-w-6xl mx-auto px-2 md:px-4 py-4 md:py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={() => router.push(`/spaces/${id}`)}
            className="text-sm text-foreground-muted hover:text-foreground mb-1 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로
          </button>
          <h1 className="text-xl font-bold text-foreground">{space.name} — 배치도 수정</h1>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      <FloorPlanEditor
        spaceId={id}
        initialShapes={shapes}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
