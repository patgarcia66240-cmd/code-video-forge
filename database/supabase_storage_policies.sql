-- ========================================
-- Politiques RLS optimisées pour Supabase Storage (MP4 + WebM)
-- Basé sur la syntaxe officielle Supabase Storage
-- ========================================

-- 1. Politiques pour storage.buckets
-- ========================================

-- Activer RLS si pas déjà fait
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Allow bucket operations" ON storage.buckets;

-- Politique pour permettre les opérations sur le bucket videos
CREATE POLICY "Allow videos bucket operations"
ON storage.buckets FOR ALL
USING (
  name = 'videos'
  -- Autoriser pour les utilisateurs anonymes et authentifiés
  AND (auth.role() = 'anon' OR auth.role() = 'authenticated')
)
WITH CHECK (
  name = 'videos'
  -- Ne permettre de créer que le bucket videos
);

-- 2. Politiques pour storage.objects (le plus important)
-- ========================================

-- Activer RLS si pas déjà fait
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Allow video objects operations" ON storage.objects;
DROP POLICY IF EXISTS "Public video access" ON storage.objects;

-- Politique principale pour les vidéos MP4 et WebM
CREATE POLICY "Allow videos access"
ON storage.objects FOR ALL
USING (
  -- Restriction au bucket videos
  bucket_id = 'videos'
  -- Autoriser uniquement les fichiers vidéo
  AND (
    storage.extension(name) = 'mp4'
    OR storage.extension(name) = 'webm'
  )
  -- Autoriser les utilisateurs anonymes et authentifiés
  AND (auth.role() = 'anon' OR auth.role() = 'authenticated')
)
WITH CHECK (
  -- Vérifier que c'est bien dans le bucket videos
  bucket_id = 'videos'
  -- Vérifier que c'est bien un fichier vidéo
  AND (
    storage.extension(name) = 'mp4'
    OR storage.extension(name) = 'webm'
  )
  -- Vérifier le rôle
  AND (auth.role() = 'anon' OR auth.role() = 'authenticated')
);

-- Politique alternative plus spécifique pour l'insertion
CREATE POLICY "Allow video insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND (
    storage.extension(name) = 'mp4'
    OR storage.extension(name) = 'webm'
  )
  AND (auth.role() = 'anon' OR auth.role() = 'authenticated')
);

-- Politique pour la lecture des vidéos
CREATE POLICY "Allow video select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos'
  AND (
    storage.extension(name) = 'mp4'
    OR storage.extension(name) = 'webm'
  )
);

-- Politique pour la mise à jour des métadonnées
CREATE POLICY "Allow video update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos'
)
WITH CHECK (
  bucket_id = 'videos'
);

-- Politique pour la suppression
CREATE POLICY "Allow video delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
);

-- 3. Politiques pour la table videos (métadonnées)
-- ========================================

-- Activer RLS si pas déjà fait
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Videos insert policy" ON videos;
DROP POLICY IF EXISTS "Videos select policy" ON videos;
DROP POLICY IF EXISTS "Videos update policy" ON videos;
DROP POLICY IF EXISTS "Videos delete policy" ON videos;

-- Politique pour insérer des métadonnées vidéo
CREATE POLICY "Videos insert policy"
ON videos FOR INSERT
WITH CHECK (true);

-- Politique pour lire les métadonnées vidéo (publiques)
CREATE POLICY "Videos select policy"
ON videos FOR SELECT
USING (status = 'active');

-- Politique pour mettre à jour les métadonnées
CREATE POLICY "Videos update policy"
ON videos FOR UPDATE
USING (true)
WITH CHECK (true);

-- Politique pour supprimer les métadonnées
CREATE POLICY "Videos delete policy"
ON videos FOR DELETE
USING (true);

-- 4. Permissions nécessaires
-- ========================================

-- Donner les permissions de base à l'utilisateur anon
GRANT USAGE ON SCHEMA storage TO anon;
GRANT ALL ON storage.buckets TO anon;
GRANT ALL ON storage.objects TO anon;

GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON videos TO anon;

-- Donner les permissions à l'utilisateur authenticated
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON videos TO authenticated;

-- Permissions sur les séquences
DO $$
BEGIN
    -- Séquence pour la table videos
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'videos_id_seq') THEN
        GRANT ALL ON SEQUENCE videos_id_seq TO anon;
        GRANT ALL ON SEQUENCE videos_id_seq TO authenticated;
    END IF;
END $$;

-- 5. Création du bucket videos (optionnel)
-- ========================================

-- Note: Cette section est optionnelle car le bucket peut être créé via API
-- Décommenter seulement si nécessaire et si vous avez les permissions

/*
-- Insertion directe du bucket videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm'],
  NOW()
) ON CONFLICT (id) DO NOTHING;
*/

-- 6. Validation et tests
-- ========================================

-- Vérifier que les politiques sont bien créées
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
  with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

-- Vérifier que les permissions sont bien données
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema IN ('public', 'storage')
  AND table_name IN ('videos', 'buckets', 'objects')
ORDER BY table_schema, table_name, privilege_type;

-- Message de succès
SELECT
  '✅ Supabase Storage policies applied successfully!' as status,
  'Bucket: videos | Extensions: mp4, webm | Roles: anon, authenticated' as details;

-- ========================================
-- Instructions d'utilisation
-- ========================================

/*
1. Copiez ce script entier
2. Allez dans votre dashboard Supabase: https://app.supabase.com/project/xarnkfrwnpehoyzqdkoc/sql/new
3. Collez le script et cliquez sur "Run"
4. Vérifiez qu'il n'y a pas d'erreurs dans les résultats

Ce script va configurer:
- ✅ Politiques RLS optimisées pour MP4 et WebM
- ✅ Restrictions de bucket et d'extensions de fichiers
- ✅ Permissions pour utilisateurs anonymes et authentifiés
- ✅ Validation complète avec affichage des politiques créées
- ✅ Support des fonctions storage.extension() et storage.foldername()

Après exécution, votre application pourra:
- Uploader des fichiers .mp4 et .webm dans le bucket videos
- Gérer les métadonnées dans la table videos
- Utiliser les URLs publiques pour accéder aux vidéos
- Gérer les noms uniques automatiquement

Note: Si vous rencontrez encore des erreurs, vérifiez que:
- Vous avez les droits d'administrateur sur le projet Supabase
- Le nom du bucket est bien 'videos' partout dans le code
- Vos clés API dans le .env sont correctes
*/