export interface Profile {
  id: string;
  nickname: string;
  email: string | null;
  profile_image: string | null;
  created_at: string;
}

export type ShapeType =
  | 'rectangle' | 'circle' | 'triangle' | 'line'
  | 'block_room' | 'block_window' | 'block_door' | 'block_door_in' | 'block_door_double' | 'block_sliding_door' | 'block_wall' | 'block_partition'
  | 'block_table_2' | 'block_table_4' | 'block_table_6' | 'block_table_round'
  | 'block_kitchen' | 'block_selfbar' | 'block_restroom' | 'block_dispenser' | 'block_fridge'
  | 'block_seat_point';

export type BlockType = Extract<ShapeType,
  | 'block_room' | 'block_window' | 'block_door' | 'block_door_in' | 'block_door_double' | 'block_sliding_door' | 'block_wall' | 'block_partition'
  | 'block_table_2' | 'block_table_4' | 'block_table_6' | 'block_table_round'
  | 'block_kitchen' | 'block_selfbar' | 'block_restroom' | 'block_dispenser' | 'block_fridge'
  | 'block_seat_point'
>;

export interface FloorPlanShape {
  id: string;
  space_id: string;
  shape_type: ShapeType;
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
  rotation: number;
  fill_color: string;
  stroke_color: string;
  stroke_width: number;
  opacity: number;
  z_index: number;
  label: string | null;
  created_at: string;
}

export interface EditorShape extends FloorPlanShape {
  isNew?: boolean;
  view_direction?: number; // 0~360, seat viewing direction in degrees
}

export type EditorMode = 'sketch' | 'structure';

export interface TableShapeWithStats extends FloorPlanShape {
  seat_id?: string;
  avg_rating?: number;
  posts_count?: number;
}

export interface Space {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  floor_plan_url: string | null;
  floor_plan_width: number | null;
  floor_plan_height: number | null;
  canvas_width: number;
  canvas_height: number;
  created_by: string | null;
  created_at: string;
  // Joined data
  profile?: Profile;
  seats_count?: number;
  posts_count?: number;
}

export interface Seat {
  id: string;
  space_id: string;
  shape_id: string | null;
  label: string | null;
  x_percent: number;
  y_percent: number;
  created_at: string;
  // Joined data
  posts_count?: number;
  latest_post?: Post;
}

export interface Post {
  id: string;
  seat_id: string;
  user_id: string;
  image_url: string;
  content: string | null;
  rating: number | null;
  created_at: string;
  // Joined data
  profile?: Profile;
  seat?: Seat & { space?: Space };
}

export interface Feedback {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      spaces: {
        Row: Space;
        Insert: Omit<Space, 'id' | 'created_at' | 'profile' | 'seats_count' | 'posts_count'>;
        Update: Partial<Omit<Space, 'id' | 'created_at' | 'profile' | 'seats_count' | 'posts_count'>>;
      };
      floor_plan_shapes: {
        Row: FloorPlanShape;
        Insert: Omit<FloorPlanShape, 'id' | 'created_at'>;
        Update: Partial<Omit<FloorPlanShape, 'id' | 'created_at'>>;
      };
      seats: {
        Row: Seat;
        Insert: Omit<Seat, 'id' | 'created_at' | 'posts_count' | 'latest_post'>;
        Update: Partial<Omit<Seat, 'id' | 'created_at' | 'posts_count' | 'latest_post'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'profile' | 'seat'>;
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'profile' | 'seat'>>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'created_at' | 'profile'>;
        Update: Partial<Omit<Feedback, 'id' | 'created_at' | 'profile'>>;
      };
    };
  };
}
