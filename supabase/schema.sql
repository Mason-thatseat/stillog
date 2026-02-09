-- STILLOG Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT NOT NULL,
  email TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, email, profile_image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Spaces table (cafes/locations)
CREATE TABLE spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  floor_plan_url TEXT,
  floor_plan_width INT,
  floor_plan_height INT,
  canvas_width INT DEFAULT 100,
  canvas_height INT DEFAULT 100,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- Spaces policies
CREATE POLICY "Spaces are viewable by everyone" ON spaces
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create spaces" ON spaces
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own spaces" ON spaces
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own spaces" ON spaces
  FOR DELETE USING (auth.uid() = created_by);

-- Floor plan shapes table
CREATE TABLE floor_plan_shapes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  shape_type TEXT NOT NULL CHECK (shape_type IN (
    'rectangle', 'circle', 'triangle', 'line', 'table',
    'block_wall', 'block_floor', 'block_window',
    'block_table_rect', 'block_table_round', 'block_chair', 'block_sofa',
    'block_plant'
  )),
  x_percent DECIMAL NOT NULL DEFAULT 10,
  y_percent DECIMAL NOT NULL DEFAULT 10,
  width_percent DECIMAL NOT NULL DEFAULT 10,
  height_percent DECIMAL NOT NULL DEFAULT 10,
  rotation DECIMAL DEFAULT 0,
  fill_color TEXT DEFAULT '#F5E6D3',
  stroke_color TEXT DEFAULT '#A78B71',
  stroke_width DECIMAL DEFAULT 1,
  opacity DECIMAL DEFAULT 1,
  z_index INT DEFAULT 0,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE floor_plan_shapes ENABLE ROW LEVEL SECURITY;

-- Floor plan shapes policies
CREATE POLICY "Shapes are viewable by everyone" ON floor_plan_shapes
  FOR SELECT USING (true);

CREATE POLICY "Space owners can create shapes" ON floor_plan_shapes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM spaces WHERE spaces.id = floor_plan_shapes.space_id AND spaces.created_by = auth.uid()
    )
  );

CREATE POLICY "Space owners can update shapes" ON floor_plan_shapes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM spaces WHERE spaces.id = floor_plan_shapes.space_id AND spaces.created_by = auth.uid()
    )
  );

CREATE POLICY "Space owners can delete shapes" ON floor_plan_shapes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM spaces WHERE spaces.id = floor_plan_shapes.space_id AND spaces.created_by = auth.uid()
    )
  );

-- Seats table
CREATE TABLE seats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  shape_id UUID REFERENCES floor_plan_shapes(id) ON DELETE SET NULL,
  label TEXT,
  x_percent DECIMAL NOT NULL,
  y_percent DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Seats policies
CREATE POLICY "Seats are viewable by everyone" ON seats
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create seats" ON seats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Space owners can update seats" ON seats
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM spaces WHERE spaces.id = seats.space_id AND spaces.created_by = auth.uid()
    )
  );

CREATE POLICY "Space owners can delete seats" ON seats
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM spaces WHERE spaces.id = seats.space_id AND spaces.created_by = auth.uid()
    )
  );

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_id UUID REFERENCES seats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  image_url TEXT NOT NULL,
  content TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_floor_plan_shapes_space_id ON floor_plan_shapes(space_id);
CREATE INDEX idx_seats_space_id ON seats(space_id);
CREATE INDEX idx_seats_shape_id ON seats(shape_id);
CREATE INDEX idx_posts_seat_id ON posts(seat_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_spaces_created_at ON spaces(created_at DESC);

-- Storage buckets (create these in Supabase Dashboard > Storage)
-- 1. floor-plans (public)
-- 2. post-images (public)
-- 3. avatars (public)
