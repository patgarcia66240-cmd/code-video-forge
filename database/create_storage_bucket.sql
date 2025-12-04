-- =====================================================
-- Création du bucket pour les vignettes de codes
-- =====================================================

-- 1. Créer le bucket pour les thumbnails
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
    'code-thumbnails',
    'code-thumbnails',
    true, -- public pour avoir accès aux images
    false,
    5242880, -- 5MB max par vignette
    ARRAY['image/png', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Créer les politiques d'accès (RLS)
-- Politique pour que les utilisateurs puissent uploader leurs propres vignettes
CREATE POLICY "Users can upload own thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'code-thumbnails' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres vignettes
CREATE POLICY "Users can update own thumbnails" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'code-thumbnails' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour que les utilisateurs puissent supprimer leurs propres vignettes
CREATE POLICY "Users can delete own thumbnails" ON storage.objects
FOR DELETE USING (
    bucket_id = 'code-thumbnails' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour que tout le monde puisse lire les vignettes (publiques)
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT USING (
    bucket_id = 'code-thumbnails'
);

-- =====================================================
-- Structure des noms de fichiers attendue :
-- thumbnails/{user_id}/{code_id}/{timestamp}.png
--
-- Exemple : thumbnails/550e8400-e29b-41d4-a716-446655440000/12345/1703123456.png
-- =====================================================