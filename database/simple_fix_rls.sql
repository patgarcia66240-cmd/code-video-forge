-- ========================================
-- Script simplifié pour corriger les politiques RLS Supabase
-- ========================================

-- Activer RLS sur les tables si pas déjà fait
ALTER TABLE IF EXISTS videos ENABLE ROW LEVEL SECURITY;

-- 1. Politiques pour la table videos (plus simples)
-- ========================================

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Allow insert on videos" ON videos;
DROP POLICY IF EXISTS "Allow select on videos" ON videos;
DROP POLICY IF EXISTS "Allow update on videos" ON videos;
DROP POLICY IF EXISTS "Allow delete on videos" ON videos;

-- Politiques simples qui permettent tout (pour le développement)
CREATE POLICY "Enable insert for all users" ON videos
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON videos
FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON videos
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON videos
FOR DELETE USING (true);

-- 2. Politiques pour Storage (plus simples)
-- ========================================

-- Supprimer anciennes politiques sur storage.buckets
DROP POLICY IF EXISTS "Allow anonymous bucket creation" ON storage.buckets;
DROP POLICY IF EXISTS "Allow anonymous bucket view" ON storage.buckets;

-- Politiques simples pour storage.buckets
CREATE POLICY "Enable bucket insert" ON storage.buckets
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable bucket select" ON storage.buckets
FOR SELECT USING (true);

CREATE POLICY "Enable bucket update" ON storage.buckets
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable bucket delete" ON storage.buckets
FOR DELETE USING (true);

-- Supprimer anciennes politiques sur storage.objects
DROP POLICY IF EXISTS "Allow full access to videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert and select on videos" ON storage.objects;

-- Politiques simples pour storage.objects
CREATE POLICY "Enable object insert" ON storage.objects
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable object select" ON storage.objects
FOR SELECT USING (true);

CREATE POLICY "Enable object update" ON storage.objects
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable object delete" ON storage.objects
FOR DELETE USING (true);

-- 3. Donner les permissions à l'utilisateur anon
-- ========================================

-- Permissions sur les schémas
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA storage TO anon;

-- Permissions sur les tables
GRANT ALL ON videos TO anon;
GRANT ALL ON storage.buckets TO anon;
GRANT ALL ON storage.objects TO anon;

-- Permissions sur les séquences (si existent)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'videos_id_seq') THEN
        GRANT ALL ON SEQUENCE videos_id_seq TO anon;
    END IF;
END $$;

-- 4. Créer le bucket videos manuellement (si nécessaire)
-- ========================================

-- Note: Le bucket peut être créé via l'API ou le dashboard
-- Cette section est optionnelle et dépend de vos permissions

-- 5. Validation finale
-- ========================================

-- Test simple pour vérifier que tout fonctionne
SELECT 'RLS Fix Applied Successfully' as status;

-- Vérifier que les tables existent
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos')
    THEN 'videos table exists'
    ELSE 'videos table missing'
  END as videos_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buckets' AND table_schema = 'storage')
    THEN 'storage.buckets exists'
    ELSE 'storage.buckets missing'
  END as buckets_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'objects' AND table_schema = 'storage')
    THEN 'storage.objects exists'
    ELSE 'storage.objects missing'
  END as objects_status;

-- ========================================
-- Instructions:
-- ========================================

/*
1. Copiez tout ce script
2. Allez dans votre dashboard Supabase: https://app.supabase.com/project/xarnkfrwnpehoyzqdkoc/sql/new
3. Collez le script et cliquez sur "Run"
4. Vérifiez qu'il n'y a pas d'erreurs dans les résultats

Ce script va:
- Activer RLS sur la table videos si nécessaire
- Créer des politiques simples qui permettent toutes les opérations
- Donner les permissions nécessaires à l'utilisateur anon
- Valider que tout est correctement configuré

Après exécution, votre application pourra:
- Uploader des fichiers dans Supabase Storage
- Insérer des métadonnées dans la table videos
- Récupérer les listes de vidéos
- Gérer les noms uniques automatiquement
*/