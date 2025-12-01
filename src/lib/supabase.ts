import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
// IMPORTANT: Remplacez ces valeurs par vos vraies clés Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Client standard (utilise la clé anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (utilise la clé service_role pour les opérations d'administration)
export const supabaseAdmin = createClient(
  supabaseUrl,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
  user_id?: string; // Pour l'authentification future
}

export interface UploadResult {
  path: string;
  publicUrl: string;
  metadata: VideoMetadata;
}

// Configuration du bucket Supabase
export const VIDEOS_BUCKET = 'videos';

export default supabase;