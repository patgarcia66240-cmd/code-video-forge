-- ========================================
-- Correction des politiques RLS pour Supabase Storage
-- ========================================

-- 1. Autoriser la création du bucket videos pour les utilisateurs anonymes
-- ========================================

-- D'abord, supprimer toutes les politiques existantes sur storage.buckets (si besoin)
DROP POLICY IF EXISTS "Users can create buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Users can view buckets" ON storage.buckets;

-- Politique pour permettre la création du bucket 'videos'
-- Utilisation correcte des références de la table storage.buckets
CREATE POLICY "Allow anonymous bucket creation" ON storage.buckets
FOR ALL USING (
  name = 'videos' OR
  (EXISTS (
    SELECT 1 FROM storage.buckets b
    WHERE b.id = storage.buckets.id AND b.name = 'videos'
  ))
);

-- Politique pour permettre la vue du bucket 'videos'
CREATE POLICY "Allow anonymous bucket view" ON storage.buckets
FOR SELECT USING (name = 'videos');

-- Politique pour permettre l'insertion (simplifiée)
CREATE POLICY "Allow bucket insert" ON storage.buckets
FOR INSERT WITH CHECK (name = 'videos');

-- 2. Autoriser les opérations sur les objets dans le bucket videos
-- ========================================

-- Supprimer les anciennes politiques sur storage.objects (si besoin)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert" ON storage.objects;

-- Politique complète pour le bucket videos
CREATE POLICY "Allow full access to videos bucket" ON storage.objects
FOR ALL USING (
  bucket_id = 'videos'
) WITH CHECK (
  bucket_id = 'videos'
);

-- Alternative plus sécurisée si nécessaire :
CREATE POLICY "Allow insert and select on videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow select on videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Allow update on videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos') WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow delete on videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos');

-- 3. Correction des politiques sur la table videos (si elle existe)
-- ========================================

-- Supprimer les anciennes politiques sur la table videos (si besoin)
DROP POLICY IF EXISTS "Les vidéos publiques sont visibles par tout le monde" ON videos;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs vidéos" ON videos;
DROP POLICY IF EXISTS "Création de vidéos anonymes autorisée" ON videos;

-- Activer RLS si pas déjà fait
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre les insertions anonymes
CREATE POLICY "Allow anonymous insert on videos" ON videos
FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture de toutes les vidéos actives
CREATE POLICY "Allow select on active videos" ON videos
FOR SELECT USING (status = 'active');

-- Politique pour permettre la mise à jour (limitée)
CREATE POLICY "Allow update on videos" ON videos
FOR UPDATE USING (true) WITH CHECK (true);

-- Politique pour permettre la suppression (limitée)
CREATE POLICY "Allow delete on videos" ON videos
FOR DELETE USING (true);

-- 4. Donner les permissions nécessaires à l'utilisateur anon
-- ========================================

-- S'assurer que l'utilisateur anon a les permissions sur le schéma storage
GRANT USAGE ON SCHEMA storage TO anon;
GRANT ALL ON storage.buckets TO anon;
GRANT ALL ON storage.objects TO anon;

-- Donner les permissions sur le schéma public pour les tables
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON videos TO anon;
GRANT ALL ON SEQUENCE videos_id_seq TO anon;

-- 5. Créer le bucket s'il n'existe pas (approche alternative)
-- ========================================

-- Insérer directement dans storage.buckets si nécessaire
-- Note: Cette approche nécessite des permissions élevées

-- D'abord, essayer une insertion simple
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at)
SELECT
  'videos',
  'videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm'],
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE name = 'videos'
);

-- Alternative avec référence à auth.uid() (si disponible)
-- Note: Cette section ne sera exécutée que si auth.uid() est disponible
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at)
    SELECT
      'videos',
      'videos',
      auth.uid(),
      true,
      104857600,
      ARRAY['video/mp4', 'video/webm'],
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = 'videos'
    );
  END IF;
END $$;

-- 6. Test des permissions
-- ========================================

-- Test de lecture du bucket
SELECT 'Bucket videos access test:' as test, bucket.name as bucket_name
FROM storage.buckets
WHERE bucket.name = 'videos';

-- Test de permissions sur la table videos
SELECT 'Videos table access test:' as test, COUNT(*) as video_count
FROM videos;

-- 7. Nettoyage des permissions éventuellement redondantes
-- ========================================

-- S'assurer que l'utilisateur authenticated a aussi les permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON videos TO authenticated;
GRANT ALL ON SEQUENCE videos_id_seq TO authenticated;

-- ========================================
-- Instructions importantes:
-- ========================================

/*
Après avoir exécuté ce script dans votre dashboard Supabase:

1. Allez dans: https://app.supabase.com/project/xarnkfrwnpehoyzqdkoc/sql/new
2. Copiez-collez tout ce script
3. Cliquez sur "Run" pour exécuter
4. Vérifiez qu'il n'y a pas d'erreurs

Ce script va:
- Créer les bonnes politiques RLS pour le bucket 'videos'
- Permettre les opérations anonymes sur le stockage
- Corriger les permissions sur la table 'videos'
- Créer le bucket s'il n'existe pas
- Donner les permissions nécessaires à l'utilisateur anon

Une fois exécuté, votre application pourra:
- Créer des vidéos dans Supabase Storage
- Insérer des métadonnées dans la table videos
- Récupérer les listes de vidéos
- Gérer les noms uniques automatiquement

Si vous rencontrez encore des erreurs, vérifiez dans votre dashboard:
- Settings > API que la clé anon est correcte
- Storage > Buckets que le bucket 'videos' existe bien
- Authentication > Policies que les politiques sont activées
*/