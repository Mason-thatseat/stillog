-- ============================================
-- STILLOG 에디터 개편 + 의견 게시판 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 기존 데이터 마이그레이션
UPDATE floor_plan_shapes SET shape_type = 'block_room' WHERE shape_type IN ('block_wall', 'block_floor');
UPDATE floor_plan_shapes SET shape_type = 'block_table_4' WHERE shape_type IN ('block_table_rect', 'table');
DELETE FROM floor_plan_shapes WHERE shape_type IN ('block_chair', 'block_sofa', 'block_plant');

-- 2. CHECK 제약조건 교체
ALTER TABLE floor_plan_shapes DROP CONSTRAINT IF EXISTS floor_plan_shapes_shape_type_check;
ALTER TABLE floor_plan_shapes ADD CONSTRAINT floor_plan_shapes_shape_type_check
  CHECK (shape_type IN (
    'rectangle', 'circle', 'triangle', 'line',
    'block_room', 'block_window', 'block_door', 'block_sliding_door',
    'block_table_2', 'block_table_4', 'block_table_6', 'block_table_round',
    'block_kitchen', 'block_selfbar', 'block_restroom', 'block_dispenser'
  ));

-- 3. 피드백 테이블 생성
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback viewable by everyone"
  ON feedback FOR SELECT USING (true);

CREATE POLICY "Auth users can create feedback"
  ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
  ON feedback FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
