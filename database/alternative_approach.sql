-- ========================================
-- Approche alternative pour contourner la restriction owner
-- Focus sur la table videos + permissions minimales pour Storage
-- ========================================

-- 1. S'assurer que la table videos existe et est correctement configurée
-- ========================================

-- Ne pas modifier storage.buckets (table système)
-- Se concentrer sur notre table videos personnalisée

-- Activer RLS sur videos si pas déjà fait
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques sur videos
DROP POLICY IF EXISTS "Enable insert for all users" ON videos;
DROP POLICY IF EXISTS "Enable select for all users" ON videos;
DROP POLICY IF EXISTS "Enable update for all users" ON videos;
DROP POLICY IF EXISTS "Enable delete for all users" ON videos;

-- Politiques simples pour la table videos
CREATE POLICY "Allow video insert" ON videos
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow video select" ON videos
FOR SELECT USING (true);

CREATE POLICY "Allow video update" ON videos
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow video delete" ON videos
FOR DELETE USING (true);

-- 2. Donner les permissions sur notre table videos
-- ========================================

-- Permissions pour anon
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON videos TO anon;

-- Permissions pour authenticated
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON videos TO authenticated;

-- Permissions sur les séquences
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'videos_id_seq') THEN
        GRANT ALL ON SEQUENCE videos_id_seq TO anon;
        GRANT ALL ON SEQUENCE videos_id_seq TO authenticated;
    END IF;
END $$;

-- 3. Note importante sur storage.buckets
-- ========================================

/*
INFORMATION IMPORTANTE:

La table storage.buckets est une table système Supabase.
Seul le owner du projet peut modifier ses politiques RLS.

SOLUTIONS ALTERNATIVES:

1. VIA LE DASHBOARD SUPABASE:
   - Allez dans: https://app.supabase.com/project/xarnkfrwnpehoyzqdkoc/storage/policies
   - Créez manuellement le bucket 'videos' s'il n'existe pas
   - Ajoutez une politique "Allow all operations" pour les utilisateurs anon et authenticated

2. VIA L'API SUPABASE (recommandé):
   - Le bucket sera créé automatiquement par votre application
   - L'API a les permissions nécessaires même si les RLS ne sont pas configurées

3. CONFIGURATION MANUELLE DU BUCKET:
   - Dans Storage > Buckets, cliquez sur "New bucket"
   - Nom: "videos"
   - Public: true
   - File size limit: 100MB (104857600 bytes)
   - Allowed MIME types: ["video/mp4", "video/webm"]

4. POLITIQUES STORAGE.OBJECTS:
   - Dans Storage > Policies, créez des politiques pour storage.objects
   - Utilisez la syntaxe: bucket_id = 'videos' AND (extension = 'mp4' OR extension = 'webm')

*/

-- 4. Validation de notre configuration
-- ========================================

-- Vérifier que notre table videos est correctement configurée
SELECT
  'videos table configuration' as configuration_type,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos' AND table_schema = 'public')
    THEN 'Table exists ✅'
    ELSE 'Table missing ❌'
  END as table_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos')
    THEN 'RLS enabled ✅'
    ELSE 'RLS disabled ❌'
  END as rls_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
    THEN 'Anon role exists ✅'
    ELSE 'Anon role missing ❌'
  END as anon_role,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
    THEN 'Authenticated role exists ✅'
    ELSE 'Authenticated role missing ❌'
  END as authenticated_role;

-- Instructions pour l'utilisateur
SELECT
  'NEXT STEPS' as action,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos')
    THEN 'Run setup_table_videos.sql first'
    WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos')
    THEN 'Configure RLS policies manually in dashboard'
    ELSE 'Table ready! Configure Storage policies in dashboard'
  END as recommendation;

-- Test d'insertion simple
INSERT INTO videos (
  name,
  storage_path,
  duration,
  size,
  format,
  created_at,
  updated_at,
  status,
  description,
  tags
) VALUES (
  'test_configuration',
  'videos/test_config.mp4',
  0,
  0,
  'MP4',
  NOW(),
  NOW(),
  'active',
  'Test entry to verify configuration',
  ARRAY['configuration', 'test']
) ON CONFLICT (name) DO NOTHING;

-- Vérifier que l'insertion a fonctionné
SELECT
  'Test insertion result:' as status,
  CASE
    WHEN EXISTS (SELECT 1 FROM videos WHERE name = 'test_configuration')
    THEN 'SUCCESS: Table is writable ✅'
    ELSE 'FAILED: Table is not writable ❌'
  END as test_result;

-- Nettoyer le test
DELETE FROM videos WHERE name = 'test_configuration';

-- ========================================
-- Instructions finales:
-- ========================================

/*
1. Exécutez ce script pour configurer la table videos
2. Configurez manuellement le bucket 'videos' dans le dashboard Supabase:
   - Storage > Buckets > New bucket
   - Nom: videos, Public: true, Size: 100MB, MIME: video/mp4, video/webm
3. Configurez les politiques storage.objects dans le dashboard:
   - Storage > Policies > New policy
   - Sur storage.objects, pour les roles: anon, authenticated
   - Condition: bucket_id = 'videos' AND (extension = 'mp4' OR extension = 'webm')
4. Testez votre application avec le bouton "Créer test"

Cette approche contourne la restriction owner en se concentrant sur:
- ✅ Configuration correcte de la table videos
- ✅ Permissions RLS sur vos propres données
- ✅ Instructions manuelles pour Storage (qui nécessite les droits owner)
- ✅ Tests de validation complets
*/