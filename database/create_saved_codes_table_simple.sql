-- =====================================================
-- Table: saved_codes (Version simplifiée)
-- Description: Stockage des codes sauvegardés par les utilisateurs
-- =====================================================

-- 1. Création de la table principale
CREATE TABLE IF NOT EXISTS saved_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'python',
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    thumbnail TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_saved_codes_user_id ON saved_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_codes_created_at ON saved_codes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_codes_language ON saved_codes(language);

-- 3. Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_saved_codes_updated_at ON saved_codes;
CREATE TRIGGER update_saved_codes_updated_at
    BEFORE UPDATE ON saved_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Activer Row Level Security (RLS)
ALTER TABLE saved_codes ENABLE ROW LEVEL SECURITY;

-- 5. Politiques de sécurité (RLS Policies)
DROP POLICY IF EXISTS "Users can view own saved codes" ON saved_codes;
DROP POLICY IF EXISTS "Users can insert own saved codes" ON saved_codes;
DROP POLICY IF EXISTS "Users can update own saved codes" ON saved_codes;
DROP POLICY IF EXISTS "Users can delete own saved codes" ON saved_codes;

-- Les utilisateurs peuvent voir uniquement leurs propres codes
CREATE POLICY "Users can view own saved codes" ON saved_codes
    FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer uniquement leurs propres codes
CREATE POLICY "Users can insert own saved codes" ON saved_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour uniquement leurs propres codes
CREATE POLICY "Users can update own saved codes" ON saved_codes
    FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer uniquement leurs propres codes
CREATE POLICY "Users can delete own saved codes" ON saved_codes
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Fonctions utilitaires simplifiées

-- Fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_code_stats()
RETURNS TABLE(
    total_codes BIGINT,
    total_languages BIGINT,
    total_size BIGINT,
    codes_this_month BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    -- Vérifier si l'utilisateur est authentifié
    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    -- Calculer les statistiques
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM saved_codes WHERE user_id = v_user_id),
        (SELECT COUNT(DISTINCT language) FROM saved_codes WHERE user_id = v_user_id),
        COALESCE((SELECT SUM(LENGTH(code)) FROM saved_codes WHERE user_id = v_user_id), 0),
        (SELECT COUNT(*) FROM saved_codes
         WHERE user_id = v_user_id
         AND created_at >= date_trunc('month', NOW()));
END;
$$;

-- 7. Commentaires sur la table
COMMENT ON TABLE saved_codes IS 'Table pour stocker les codes sauvegardés par les utilisateurs';
COMMENT ON COLUMN saved_codes.id IS 'Identifiant unique UUID généré automatiquement';
COMMENT ON COLUMN saved_codes.title IS 'Titre du code';
COMMENT ON COLUMN saved_codes.code IS 'Contenu du code source';
COMMENT ON COLUMN saved_codes.language IS 'Langage de programmation';
COMMENT ON COLUMN saved_codes.description IS 'Description optionnelle du code';
COMMENT ON COLUMN saved_codes.tags IS 'Tableau de tags pour organiser les codes';
COMMENT ON COLUMN saved_codes.thumbnail IS 'URL optionnelle vers une miniature';
COMMENT ON COLUMN saved_codes.user_id IS 'Référence à l utilisateur authentifié';

-- =====================================================
-- Instructions d'installation dans Supabase :
--
-- 1. Aller dans le dashboard Supabase
-- 2. Aller dans "SQL Editor"
-- 3. Copier-coller ce script entier
-- 4. Exécuter le script
-- 5. Vérifier que la table "saved_codes" a été créée
-- =====================================================