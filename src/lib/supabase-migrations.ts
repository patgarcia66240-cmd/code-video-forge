// Fonction pour créer la table saved_codes dans Supabase
export const createSavedCodesTableSQL = `
  CREATE TABLE IF NOT EXISTS saved_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'python',
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Créer un index pour accélérer les requêtes
  CREATE INDEX IF NOT EXISTS idx_saved_codes_user_id ON saved_codes(user_id);
  CREATE INDEX IF NOT EXISTS idx_saved_codes_created_at ON saved_codes(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_saved_codes_language ON saved_codes(language);

  -- Activer Row Level Security
  ALTER TABLE saved_codes ENABLE ROW LEVEL SECURITY;

  -- Créer une politique pour que les utilisateurs ne voient que leurs propres codes
  CREATE POLICY "Users can view own saved codes" ON saved_codes
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own saved codes" ON saved_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own saved codes" ON saved_codes
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own saved codes" ON saved_codes
    FOR DELETE USING (auth.uid() = user_id);
`;

// Fonction pour créer la table via RPC
export const createTableRPC = `
  CREATE OR REPLACE FUNCTION create_saved_codes_table()
  RETURNS TABLE(success BOOLEAN, message TEXT)
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    -- Créer la table
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS saved_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        code TEXT NOT NULL,
        language VARCHAR(50) NOT NULL DEFAULT ''python'',
        description TEXT,
        tags TEXT[] DEFAULT ''{}'',
        user_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    ');

    -- Créer les index
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_saved_codes_user_id ON saved_codes(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_saved_codes_created_at ON saved_codes(created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_saved_codes_language ON saved_codes(language)';

    -- Activer RLS
    EXECUTE 'ALTER TABLE saved_codes ENABLE ROW LEVEL SECURITY';

    -- Créer les politiques
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Users can view own saved codes" ON saved_codes
        FOR SELECT USING (auth.uid() = user_id)
    ');

    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Users can insert own saved codes" ON saved_codes
        FOR INSERT WITH CHECK (auth.uid() = user_id)
    ');

    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Users can update own saved codes" ON saved_codes
        FOR UPDATE USING (auth.uid() = user_id)
    ');

    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Users can delete own saved codes" ON saved_codes
        FOR DELETE USING (auth.uid() = user_id)
    ');

    RETURN QUERY SELECT true, 'Table saved_codes created successfully';
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM;
  END;
  $$;
`;