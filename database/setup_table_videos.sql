-- ========================================
-- Table pour stocker les métadonnées des vidéos
-- ========================================

-- Activer l'extension UUID si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des vidéos
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Métadonnées de base
  name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL UNIQUE,
  duration FLOAT DEFAULT 0,
  size BIGINT DEFAULT 0,
  format VARCHAR(10) CHECK (format IN ('MP4', 'WebM')) DEFAULT 'MP4',

  -- Métadonnées système
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Utilisateur (optionnel, pour authentification future)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Statut de la vidéo
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'processing')),

  -- Métadonnées additionnelles
  description TEXT,
  tags TEXT[], -- Array de tags pour la recherche

  -- Contraintes
  CONSTRAINT videos_name_format_check CHECK (length(name) >= 1),
  CONSTRAINT videos_path_format_check CHECK (storage_path ~ '^videos/.*\.(mp4|webm)$')
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_format ON videos(format);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- Trigger pour automatiquement mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Politiques de sécurité (Row Level Security)
-- ========================================

-- Activer RLS sur la table videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs anonymes (lecture seule)
CREATE POLICY "Les vidéos publiques sont visibles par tout le monde"
    ON videos FOR SELECT
    USING (status = 'active');

-- Politique pour les utilisateurs authentifiés (CRUD complet sur leurs vidéos)
CREATE POLICY "Les utilisateurs peuvent gérer leurs vidéos"
    ON videos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique pour les insertions anonymes (création de vidéos sans compte)
CREATE POLICY "Création de vidéos anonymes autorisée"
    ON videos FOR INSERT
    WITH CHECK (user_id IS NULL);

-- ========================================
-- Vue pour les vidéos publiques
-- ========================================

CREATE OR REPLACE VIEW public_videos AS
SELECT
  id,
  name,
  storage_path,
  duration,
  size,
  format,
  created_at,
  updated_at,
  description,
  tags,
  -- URL publique générée
  'https://xarnkfrwnpehoyzqdkoc.supabase.co/storage/v1/object/public/videos/' ||
  REPLACE(storage_path, 'videos/', '') as public_url
FROM videos
WHERE status = 'active';

-- ========================================
-- Données de test (optionnel)
-- ========================================

-- Fonction pour insérer une vidéo de test
CREATE OR REPLACE FUNCTION insert_test_video()
RETURNS UUID AS $$
DECLARE
  video_id UUID;
BEGIN
  INSERT INTO videos (
    name,
    storage_path,
    duration,
    size,
    format,
    description,
    tags
  ) VALUES (
    'Vidéo de test',
    'videos/test_video.mp4',
    30.5,
    1024000,
    'MP4',
    'Vidéo de test pour vérifier le fonctionnement',
    ARRAY['test', 'demo']
  )
  RETURNING id INTO video_id;

  RETURN video_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Fonctions utilitaires
-- ========================================

-- Fonction pour obtenir les statistiques des vidéos
CREATE OR REPLACE FUNCTION get_video_stats()
RETURNS TABLE(
  total_videos BIGINT,
  total_size BIGINT,
  total_duration FLOAT,
  avg_duration FLOAT,
  format_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_videos,
    COALESCE(SUM(size), 0) as total_size,
    COALESCE(SUM(duration), 0) as total_duration,
    COALESCE(AVG(duration), 0) as avg_duration,
    jsonb_build_object(
      'MP4', COUNT(*) FILTER (WHERE format = 'MP4'),
      'WebM', COUNT(*) FILTER (WHERE format = 'WebM')
    ) as format_breakdown
  FROM videos
  WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Nettoyage (optionnel)
-- ========================================

-- Fonction pour supprimer les anciennes vidéos (plus de X jours)
CREATE OR REPLACE FUNCTION cleanup_old_videos(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM videos
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old
  AND status = 'active';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Instructions d'installation
-- ========================================

/*
Pour appliquer ce script dans votre projet Supabase:

1. Allez dans le dashboard Supabase: https://app.supabase.com
2. Sélectionnez votre projet "xarnkfrwnpehoyzqdkoc"
3. Allez dans "SQL Editor"
4. Copiez-collez l'intégralité de ce script
5. Cliquez sur "Run" pour exécuter

Le script va:
- Créer la table "videos" avec toutes les colonnes nécessaires
- Configurer les index pour de bonnes performances
- Mettre en place la sécurité (Row Level Security)
- Créer une vue "public_videos" pour faciliter les requêtes
- Ajouter des fonctions utilitaires pour les statistiques

Après exécution, votre application pourra:
- Sauvegarder des métadonnées de vidéos dans Supabase
- Récupérer les listes de vidéos avec leurs URLs publiques
- Calculer des statistiques sur vos vidéos
- Préparer une future authentification utilisateur
*/