-- ========================================
-- SCRIPT POUR UTILISATEURS AUTHENTIFIÉS
-- Politiques RLS correctes pour la table videos
-- ========================================

-- 1. Activer RLS sur la table videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Enable read access for all users" ON videos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON videos;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
DROP POLICY IF EXISTS "Allow all delete operations" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

-- 3. Politiques CORRECTES pour utilisateurs authentifiés

-- Politique de LECTURE : Les utilisateurs peuvent voir toutes les vidéos
CREATE POLICY "Enable read for authenticated users" ON videos
  FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- Politique D'INSERTION : Les utilisateurs peuvent insérer des vidéos
CREATE POLICY "Enable insert for authenticated users" ON videos
  FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- Politique DE MISE À JOUR : Les utilisateurs peuvent modifier leurs vidéos
CREATE POLICY "Enable update for user's own videos" ON videos
  FOR UPDATE
  USING (
    -- Option 1: Si user_id correspond à l'utilisateur authentifié
    (user_id IS NOT NULL AND auth.uid()::text = user_id)
    OR
    -- Option 2: Anciennes vidéos sans user_id (compatibilité)
    (user_id IS NULL AND created_by = auth.email())
  );

-- Politique DE SUPPRESSION : Les utilisateurs peuvent supprimer leurs vidéos
CREATE POLICY "Enable delete for user's own videos" ON videos
  FOR DELETE
  USING (
    -- Option 1: Si user_id correspond à l'utilisateur authentifié
    (user_id IS NOT NULL AND auth.uid()::text = user_id)
    OR
    -- Option 2: Anciennes vidéos sans user_id (compatibilité)
    (user_id IS NULL AND created_by = auth.email())
  );

-- 4. Ajouter une colonne created_by si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE videos ADD COLUMN created_by text;
  END IF;
END
$$;

-- 5. Mettre à jour les anciennes vidéos avec created_by (une seule fois)
UPDATE videos
SET created_by =
  CASE
    WHEN user_id IS NOT NULL THEN
      (SELECT email FROM auth.users WHERE id::text = videos.user_id)
    ELSE 'anonymous'
  END
WHERE created_by IS NULL;

-- 6. Vérifier les politiques
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'videos'
ORDER BY cmd, policyname;

-- ========================================
-- UTILISATION APRÈS AUTHENTIFICATION
-- ========================================
/*
1. Connectez-vous depuis l'application avec le bouton "Se connecter"
2. Créez un compte ou connectez-vous
3. Essayez de supprimer une vidéo

La politique de suppression autorisera si :
- user_id = auth.uid() (pour les vidéos créées avec user_id)
- OU created_by = auth.email() (pour les anciennes vidéos)

Pour tester manuellement :
-- Vérifier l'utilisateur connecté
SELECT auth.uid(), auth.email(), auth.role();

-- Tester la suppression
DELETE FROM videos WHERE id = 'votre_video_id' RETURNING *;
*/