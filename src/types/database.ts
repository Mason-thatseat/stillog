export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          email: string | null;
          profile_image: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          nickname: string;
          email?: string | null;
          profile_image?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nickname?: string;
          email?: string | null;
          profile_image?: string | null;
          created_at?: string | null;
        };
      };
      spaces: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          category: string | null;
          owner_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          category?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          category?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
      };
      seats: {
        Row: {
          id: string;
          space_id: string | null;
          seat_number: string | null;
          x: number | null;
          y: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          space_id?: string | null;
          seat_number?: string | null;
          x?: number | null;
          y?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          space_id?: string | null;
          seat_number?: string | null;
          x?: number | null;
          y?: number | null;
          created_at?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          space_id: string | null;
          seat_id: string | null;
          author_id: string | null;
          content: string | null;
          rating: number | null;
          images: string[] | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          space_id?: string | null;
          seat_id?: string | null;
          author_id?: string | null;
          content?: string | null;
          rating?: number | null;
          images?: string[] | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          space_id?: string | null;
          seat_id?: string | null;
          author_id?: string | null;
          content?: string | null;
          rating?: number | null;
          images?: string[] | null;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export interface Favorite {
  id: string;
  user_id: string;
  space_id: string;
  created_at: string;
}