-- Creer un utilisateur de test dans auth.users
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Test User"}',
    false
);