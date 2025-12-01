// ========================================
// Types pour l'interaction avec Supabase
// Correspond exactement à la structure SQL de la table videos
// ========================================

export interface VideoRecord {
  // Clé primaire
  id: string;

  // Métadonnées de base
  name: string;
  storage_path: string;
  duration: number;
  size: number;
  format: 'MP4' | 'WebM';

  // Métadonnées système
  created_at: string; // ISO string
  updated_at: string; // ISO string

  // Utilisateur (optionnel, pour authentification future)
  user_id?: string;

  // Statut de la vidéo
  status: 'active' | 'deleted' | 'processing';

  // Métadonnées additionnelles
  description?: string;
  tags?: string[];

  // Champs calculés (non dans la base de données)
  public_url?: string; // URL publique générée
}

// Vue pour les vidéos publiques (plus simple)
export interface PublicVideo {
  id: string;
  name: string;
  storage_path: string;
  duration: number;
  size: number;
  format: 'MP4' | 'WebM';
  created_at: string;
  updated_at: string;
  description?: string;
  tags?: string[];
  public_url: string; // URL complète
}

// Types pour les opérations d'insertion
export interface CreateVideoData {
  name: string;
  storage_path: string;
  duration?: number;
  size?: number;
  format?: 'MP4' | 'WebM';
  description?: string;
  tags?: string[];
  user_id?: string; // Si utilisateur authentifié
}

export interface VideoNameValidation {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

// Types pour les opérations de mise à jour
export interface UpdateVideoData {
  name?: string;
  duration?: number;
  size?: number;
  description?: string;
  tags?: string[];
  status?: 'active' | 'deleted' | 'processing';
}

// Types pour les statistiques
export interface VideoStats {
  total_videos: number;
  total_size: number;
  total_duration: number;
  avg_duration: number;
  format_breakdown: {
    MP4: number;
    WebM: number;
  };
}

// Types pour les filtres et tris
export interface VideoFilters {
  format?: 'MP4' | 'WebM';
  user_id?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  min_duration?: number;
  max_duration?: number;
}

export interface VideoSortOptions {
  field: 'created_at' | 'updated_at' | 'name' | 'duration' | 'size';
  order: 'asc' | 'desc';
}

// Types pour les réponses API
export interface VideosResponse {
  data: PublicVideo[];
  count: number;
  has_more: boolean;
}

export interface VideoUploadResponse {
  success: boolean;
  video?: PublicVideo;
  error?: string;
}

export interface VideoDeleteResponse {
  success: boolean;
  error?: string;
}

// Configuration du bucket Supabase
export const SUPABASE_CONFIG = {
  BUCKET_NAME: 'videos',
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_MIME_TYPES: ['video/mp4', 'video/webm'],
  PUBLIC_URL: 'https://xarnkfrwnpehoyzqdkoc.supabase.co/storage/v1/object/public',
} as const;

// Types pour les erreurs Supabase
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Types pour les logs et debugging
export interface VideoUploadLog {
  timestamp: string;
  action: 'upload_start' | 'upload_progress' | 'upload_success' | 'upload_error';
  video_id?: string;
  file_name: string;
  file_size: number;
  progress?: number;
  error?: string;
}

export default VideoRecord;