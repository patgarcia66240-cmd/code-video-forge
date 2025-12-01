-- ========================================
-- SOLUTION IMMÉDIATE POUR RÉPARER LA SUPPRESSION
-- ========================================
-- Copiez-collez CE SCRIPT dans le SQL Editor de Supabase et cliquez sur "Run"

-- 1. Activer RLS sur la table videos (si pas déjà fait)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes politiques DELETE
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
DROP POLICY IF EXISTS "Allow delete operations" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

-- 3. Créer une politique DELETE qui fonctionne POUR TOUTES LES VIDÉOS
-- (Permet la suppression sans restriction pour les tests)
CREATE POLICY "Allow all delete operations" ON videos
  FOR DELETE
  USING (true);

-- 4. Vérifier que la politique est bien créée
SELECT
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'videos' AND cmd = 'DELETE';

-- ========================================
-- RÉSULTAT ATTENDU APRÈS EXÉCUTION
-- ========================================
/*
Vous devriez voir:
- "Allow all delete operations" dans les politiques
- cmd = 'DELETE'
- roles = 'public' ou 'authenticated'

Si vous voyez cette politique, alors essayez de supprimer une vidéo depuis l'application.
Ça devrait fonctionner !

Pour info: Cette politique autorise TOUTES les suppressions.
Pour plus de sécurité plus tard, vous pouvez la remplacer par:
CREATE POLICY "Users can delete own videos" ON videos
  FOR DELETE
  USING (auth.uid()::text = COALESCE(user_id, ''));
*/