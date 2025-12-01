-- ========================================
-- SCRIPT POUR CORRIGER LES PERMISSIONS DE SUPPRESSION
-- ========================================

-- Étape 1: Activer RLS sur la table videos (si pas déjà fait)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Étape 2: Supprimer les anciennes politiques de suppression si elles existent
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
DROP POLICY IF EXISTS "Allow delete operations" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

-- Étape 3: Créer la politique de suppression CORRECTE
-- Cette politique permet aux utilisateurs de supprimer leurs propres vidéos
CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE
  USING (
    -- Option 1: Si user_id existe et correspond à l'utilisateur authentifié
    (user_id IS NOT NULL AND auth.uid()::text = user_id)
    OR
    -- Option 2: Si pas de user_id (vidéos créées avant l'authentification)
    (user_id IS NULL AND true)
  );

-- Étape 4: Alternative pour tests (PLUS PERMISSIF)
-- Décommentez cette ligne si vous voulez permettre TOUTES les suppressions
-- CREATE POLICY "Allow all delete operations" ON videos FOR DELETE USING (true);

-- Étape 5: Vérifier que les politiques sont bien créées
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'videos';

-- ========================================
-- INSTRUCTIONS
-- ========================================
/*
1. Ouvrez votre dashboard Supabase
2. Allez dans "SQL Editor"
3. Copiez-collez ce script
4. Cliquez sur "Run"

Si vous avez toujours des erreurs après avoir exécuté ce script,
utilisez l'alternative permissive (option 4) en décommentant la ligne.

Pour vérifier que ça fonctionne:
SELECT * FROM pg_policies WHERE tablename = 'videos';
*/

-- ========================================
-- DÉBOGAGE SUPPLÉMENTAIRE
-- ========================================

-- Pour vérifier les permissions actuelles:
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'videos'
ORDER BY cmd, policyname;

-- Pour tester la suppression manuellement:
-- DELETE FROM videos WHERE id = 'votre_video_id';

-- Pour voir les vidéos existantes:
-- SELECT id, name, created_at, user_id FROM videos LIMIT 10;