import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://vfraioqxeuepplxvbvkf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcmFpb3F4ZXVlcHBseHZidmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NDEyMTIsImV4cCI6MjA4MDExNzIxMn0.vy-kSBJzRNBE7BbSV9odFWzNlED9AqFJ1engDXH_pCU';

// Client standard (utilise la clé anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les vidéos dans Supabase
export interface VideoMetadata {
  id: string;
  name: string;
  storage_path: string;
  duration: number;
  size: number;
  format: 'MP4' | 'WebM';
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
  metadata: VideoMetadata;
}

// Configuration du bucket Supabase
export const VIDEOS_BUCKET = 'videos';

export default supabase;
