-- ========================================
-- SCRIPT DE DÉBOGAGE DES PERMISSIONS RLS
-- ========================================

-- 1. Vérifier si RLS est activé sur la table videos
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'videos';

-- 2. Voir toutes les politiques RLS actuelles sur la table videos
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

-- 3. Vérifier la structure de la table videos
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;

-- 4. Créer une politique de suppression plus permissive pour le debug
-- D'abord supprimer les anciennes politiques DELETE
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
DROP POLICY IF EXISTS "Allow delete operations" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

-- Créer une politique DELETE très permissive (pour tests uniquement)
CREATE POLICY "Allow all delete operations" ON videos
  FOR DELETE
  USING (true);

-- 5. Tester la suppression manuellement (remplacez VOTRE_VIDEO_ID)
-- DELETE FROM videos WHERE id = 'VOTRE_VIDEO_ID' RETURNING *;

-- 6. Vérifier les vidéos existantes
SELECT
  id,
  name,
  created_at,
  user_id,
  storage_path
FROM videos
ORDER BY created_at DESC;

-- ========================================
-- INSTRUCTIONS DE DÉBOGAGE
-- ========================================
/*
1. Exécutez ce script dans le SQL Editor de Supabase
2. Vérifiez que "rowsecurity = true" pour la table videos
3. Vérifiez que la nouvelle politique "Allow all delete operations" apparaît
4. Essayez de supprimer une vidéo depuis l'application
5. Regardez les logs dans la console du navigateur

Si après avoir exécuté ce script la suppression fonctionne toujours pas,
vérifiez dans la console du navigateur les messages de débogage détaillés.
*/

-- ========================================
-- QUOI CHERCHER DANS LA CONSOLE NAVIGATEUR
-- ========================================
/*
🔍 Recherche de la vidéo à supprimer: [ID]
🔍 Vérification vidéo existante: [Résultats]
📊 Résultat suppression DB: [Détails complets]

Les messages clés à regarder:
- "❌ Erreur suppression métadonnées DB:" = Problème de permissions
- "⚠️ AUCUNE LIGNE SUPPRIMÉE - RLS bloque la suppression silencieusement" = RLS trop restrictif
- "✅ Suppression DB réussie: 1 ligne(s) supprimée(s)" = Ça fonctionne !
*/