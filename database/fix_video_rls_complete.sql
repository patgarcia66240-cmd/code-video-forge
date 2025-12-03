-- ========================================
-- Correction complète des politiques RLS pour les vidéos
-- Exécutez ce script dans le SQL Editor de Supabase
-- ========================================

-- 1. Supprimer les anciennes politiques sur la table videos
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs vidéos" ON videos;
DROP POLICY IF EXISTS "Création de vidéos anonymes autorisée" ON videos;
DROP POLICY IF EXISTS "Les vidéos publiques sont visibles par tout le monde" ON videos;
DROP POLICY IF EXISTS "Allow video insert" ON videos;
DROP POLICY IF EXISTS "Allow video update" ON videos;
DROP POLICY IF EXISTS "Allow video delete" ON videos;
DROP POLICY IF EXISTS "Allow anonymous insert on videos" ON videos;
DROP POLICY IF EXISTS "Allow select on active videos" ON videos;
DROP POLICY IF EXISTS "Allow update on videos" ON videos;
DROP POLICY IF EXISTS "Allow delete on videos" ON videos;
DROP POLICY IF EXISTS "Allow all delete operations" ON videos;

-- 2. Activer RLS sur la table videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 3. Créer les nouvelles politiques permissives pour la table videos

-- SELECT: Toutes les vidéos actives sont visibles
CREATE POLICY "Allow select all videos" ON videos
  FOR SELECT USING (status = 'active' OR status IS NULL);

-- INSERT: Tout le monde peut créer des vidéos
CREATE POLICY "Allow insert videos" ON videos
  FOR INSERT WITH CHECK (true);

-- UPDATE: Propriétaire ou vidéos anonymes
CREATE POLICY "Allow update videos" ON videos
  FOR UPDATE USING (user_id IS NULL OR user_id::text = auth.uid()::text)
  WITH CHECK (user_id IS NULL OR user_id::text = auth.uid()::text);

-- DELETE: Propriétaire ou vidéos anonymes
CREATE POLICY "Allow delete videos" ON videos
  FOR DELETE USING (user_id IS NULL OR user_id::text = auth.uid()::text);

-- 4. Créer le bucket 'videos' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm'];

-- 5. Supprimer les anciennes politiques sur storage.objects
DROP POLICY IF EXISTS "Allow video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow video reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow video deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow full access to videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert and select on videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow select on videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow update on videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete on videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 6. Créer les nouvelles politiques pour storage.objects

-- SELECT: Lecture publique des vidéos
CREATE POLICY "Public read videos bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

-- INSERT: Upload de vidéos
CREATE POLICY "Allow upload to videos bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');

-- UPDATE: Mise à jour de vidéos
CREATE POLICY "Allow update in videos bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'videos')
  WITH CHECK (bucket_id = 'videos');

-- DELETE: Suppression de vidéos
CREATE POLICY "Allow delete from videos bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'videos');

-- 7. Accorder les permissions aux rôles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON videos TO anon, authenticated;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- ========================================
-- Vérification
-- ========================================
SELECT 'Politiques videos:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'videos';

SELECT 'Politiques storage.objects:' as info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

SELECT 'Bucket videos:' as info;
SELECT id, name, public FROM storage.buckets WHERE id = 'videos';
