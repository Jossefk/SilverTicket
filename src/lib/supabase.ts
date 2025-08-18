import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please click "Connect to Supabase" to set up your project.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      event_settings: {
        Row: {
          id: string;
          name: string;
          date: string;
          time: string;
          location: string;
          description: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          date?: string;
          time?: string;
          location?: string;
          description?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          date?: string;
          time?: string;
          location?: string;
          description?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          event_name: string;
          event_date: string;
          event_location: string;
          created_at: string;
          checked_in: boolean;
          checked_in_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone: string;
          event_name: string;
          event_date: string;
          event_location: string;
          created_at?: string;
          checked_in?: boolean;
          checked_in_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          event_name?: string;
          event_date?: string;
          event_location?: string;
          created_at?: string;
          checked_in?: boolean;
          checked_in_at?: string | null;
        };
      };
    };
  };
};