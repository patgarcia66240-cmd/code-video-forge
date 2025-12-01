-- ========================================
-- Script minimal pour corriger uniquement storage.objects
-- Évite la table storage.buckets qui nécessite des droits owner
-- ========================================

-- 1. Configuration de la table videos (notre table perso)
-- ========================================

-- Activer RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Politiques simples pour videos
DROP POLICY IF EXISTS "Videos public access" ON videos;
CREATE POLICY "Videos public access" ON videos
FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Videos insert" ON videos;
CREATE POLICY "Videos insert" ON videos
FOR INSERT WITH CHECK (status = 'active');

DROP POLICY IF EXISTS "Videos update" ON videos;
CREATE POLICY "Videos update" ON videos
FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Videos delete" ON videos;
CREATE POLICY "Videos delete" ON videos
FOR DELETE USING (true);

-- 2. Permissions sur la table videos
-- ========================================

GRANT ALL ON videos TO anon;
GRANT ALL ON videos TO authenticated;

-- Séquence si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'videos_id_seq') THEN
        GRANT ALL ON SEQUENCE videos_id_seq TO anon;
        GRANT ALL ON SEQUENCE videos_id_seq TO authenticated;
    END IF;
END $$;

-- 3. Tentative de configuration storage.objects (sans toucher à buckets)
-- ========================================

-- Activer RLS sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Videos storage access" ON storage.objects;

-- Politique optimisée pour notre bucket videos
CREATE POLICY "Videos storage access"
ON storage.objects FOR ALL
USING (
  -- Uniquement notre bucket
  bucket_id = 'videos'
  -- Uniquement les fichiers vidéo
  AND (storage.extension(name) = 'mp4' OR storage.extension(name) = 'webm')
  -- Pour les utilisateurs authentifiés ou anonymes
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
)
WITH CHECK (
  -- Vérifier le bucket
  bucket_id = 'videos'
  -- Vérifier l'extension
  AND (storage.extension(name) = 'mp4' OR storage.extension(name) = 'webm')
  -- Vérifier le rôle
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- 4. Permissions de base
-- ========================================

GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- GRANT SELECT sur storage.objects (important pour les URLs publiques)
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;

-- 5. Test de configuration
-- ========================================

-- Vérifier que nos politiques sont appliquées
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname = 'Videos storage access';

-- Vérifier les permissions sur storage.objects
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'storage'
  AND table_name = 'objects';

-- Message de statut
SELECT
  'Configuration attempt completed' as status,
  'Check results above' as next_step;

-- ========================================
-- Instructions:
-- ========================================

/*
1. Exécutez ce script dans votre dashboard Supabase
2. Vérifiez les résultats dans la section "Response"
3. Si vous voyez "Videos storage access" dans les politiques: ✅ SUCCÈS
4. Sinon, configurez manuellement dans Storage > Policies

Note: Ce script évite de modifier storage.buckets
qui nécessite des droits d'administrateur/owner.

Si ça fonctionne, votre application pourra:
- ✅ Lire les objets dans storage.objects
- ✅ Uploader via l'API avec les bonnes permissions
- ✅ Générer des URLs publiques pour les vidéos
- ✅ Stocker les métadonnées dans la table videos

Le bucket videos doit être créé manuellement dans:
Dashboard > Storage > Buckets > New bucket
Nom: videos | Public: true | MIME: video/mp4,video/webm
*/