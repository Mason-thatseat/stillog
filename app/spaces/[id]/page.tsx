'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import FloorPlanCanvas from '@/components/FloorPlanCanvas';
import BlockFloorPlanViewer from '@/components/BlockFloorPlanViewer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Space, Seat, FloorPlanShape } from '@/lib/types';

export default function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [space, setSpace] = useState<Space | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [shapes, setShapes] = useState<FloorPlanShape[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSeatLabel, setNewSeatLabel] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  const isOwner = user && space?.created_by === user.id;

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      const [
        { data: spaceData },
        { data: seatsData },
        { data: shapesData },
      ] = await Promise.all([
        supabase.from('spaces').select('*').eq('id', id).single(),
        supabase.from('seats').select('*, posts:posts(count)').eq('space_id', id),
        supabase.from('floor_plan_shapes').select('*').eq('space_id', id).order('z_index', { ascending: true }),
      ]);

      if (cancelled) return;

      if (spaceData) {
        setSpace(spaceData);
        setSeats(
          seatsData?.map((seat) => ({
            ...seat,
            posts_count: seat.posts?.[0]?.count || 0,
          })) || []
        );
        setShapes(shapesData || []);
      }

      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const handleSeatClick = (seat: Seat) => {
    if (isEditing) {
      setSelectedSeat(seat);
      setNewSeatLabel(seat.label || '');
    } else {
      // Navigate to seat posts page
      router.push(`/spaces/${id}/seats/${seat.id}`);
    }
  };

  const handleAddSeat = async (xPercent: number, yPercent: number) => {
    if (!user || !isOwner) return;

    const nextNum = seats.reduce((max, s) => {
      const n = parseInt(s.label?.replace(/\D/g, '') || '0', 10);
      return Math.max(max, n);
    }, 0) + 1;

    const { data: newSeat, error } = await supabase
      .from('seats')
      .insert({
        space_id: id,
        x_percent: xPercent,
        y_percent: yPercent,
        label: `좌석 ${nextNum}`,
      })
      .select()
      .single();

    if (!error && newSeat) {
      setSeats([...seats, { ...newSeat, posts_count: 0 }]);
    }
  };

  const handleDeleteSeat = async (seatId: string) => {
    if (!user || !isOwner) return;

    const { error } = await supabase
      .from('seats')
      .delete()
      .eq('id', seatId);

    if (!error) {
      setSeats(seats.filter((s) => s.id !== seatId));
      if (selectedSeat?.id === seatId) {
        setSelectedSeat(null);
      }
    }
  };

  const handleUpdateSeatLabel = async () => {
    if (!selectedSeat || !user || !isOwner) return;

    const { error } = await supabase
      .from('seats')
      .update({ label: newSeatLabel })
      .eq('id', selectedSeat.id);

    if (!error) {
      setSeats(seats.map((s) =>
        s.id === selectedSeat.id ? { ...s, label: newSeatLabel } : s
      ));
      setSelectedSeat(null);
      setNewSeatLabel('');
    }
  };

  if (loading) {
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
        <Button onClick={() => router.push('/spaces')}>공간 목록으로</Button>
      </div>
    );
  }

  const hasFloorPlanImage = !!space.floor_plan_url;
  const hasBlockShapes = shapes.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{space.name}</h1>
          {space.address && (
            <p className="text-foreground-muted mt-1">{space.address}</p>
          )}
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <Button
              variant="outline"
              onClick={() => router.push(`/spaces/${id}/edit`)}
            >
              배치도 수정
            </Button>
          )}
          {isOwner && (hasFloorPlanImage || hasBlockShapes) && (
            <Button
              variant={isEditing ? 'primary' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? '편집 완료' : '좌석 편집'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor Plan */}
        <div className="lg:col-span-2">
          {hasBlockShapes ? (
            <BlockFloorPlanViewer
              shapes={shapes}
              seats={seats}
              onSeatClick={handleSeatClick}
              canvasWidth={space.canvas_width ?? 100}
              canvasHeight={space.canvas_height ?? 100}
            />
          ) : hasFloorPlanImage ? (
            <FloorPlanCanvas
              floorPlanUrl={space.floor_plan_url!}
              floorPlanWidth={space.floor_plan_width!}
              floorPlanHeight={space.floor_plan_height!}
              seats={seats}
              selectedSeatId={selectedSeat?.id}
              isEditing={isEditing}
              onSeatClick={handleSeatClick}
              onAddSeat={handleAddSeat}
              onDeleteSeat={handleDeleteSeat}
            />
          ) : (
            <div className="w-full aspect-square bg-background-subtle rounded-xl border border-border flex items-center justify-center">
              <p className="text-foreground-muted text-sm">배치도가 없습니다</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Seat Editor (when editing) */}
          {isEditing && selectedSeat && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4">좌석 편집</h3>
              <Input
                id="seatLabel"
                label="좌석 이름"
                value={newSeatLabel}
                onChange={(e) => setNewSeatLabel(e.target.value)}
                placeholder="예: 창가 1번"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleUpdateSeatLabel} className="flex-1">
                  저장
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteSeat(selectedSeat.id)}
                  className="text-red-500 hover:bg-red-50"
                >
                  삭제
                </Button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-background-subtle rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-4">공간 정보</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground-muted">총 좌석</dt>
                <dd className="font-medium">{seats.length}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-muted">총 포스트</dt>
                <dd className="font-medium">
                  {seats.reduce((acc, s) => acc + (s.posts_count || 0), 0)}개
                </dd>
              </div>
            </dl>
          </div>

          {/* Seat List */}
          <div className="bg-background-subtle rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-4">좌석 목록</h3>
            {seats.length > 0 ? (
              <ul className="space-y-2">
                {seats.map((seat) => (
                  <li key={seat.id}>
                    <Link
                      href={`/spaces/${id}/seats/${seat.id}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white transition-colors duration-150"
                    >
                      <span className="text-sm font-medium">
                        {seat.label || '이름 없음'}
                      </span>
                      <span className="text-xs text-foreground-muted">
                        포스트 {seat.posts_count || 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground-muted text-center py-4">
                {isOwner
                  ? '배치도에서 가구 블록을 배치하면 좌석이 자동 생성됩니다'
                  : '아직 등록된 좌석이 없습니다'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
