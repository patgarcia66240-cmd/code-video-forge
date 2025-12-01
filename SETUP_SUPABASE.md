# 🚀 GUIDE DE CONFIGURATION SUPABASE

## ❌ Problème actuel
L'erreur `xarnkfrwnpehoyzqdkoc.supabase.co/auth/v1/signup: 400` indique que :
- Le projet Supabase dans `.env.local` n'est pas le bon
- Les clés API ne correspondent pas

## ✅ Solution immédiate

### 1. Trouvez vos vraies clés Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez **votre projet** (pas celui de démo)
3. Allez dans **Settings** > **API**
4. Copiez les valeurs :
   - **Project URL**
   - **anon public** (sous "Project API keys")

### 2. Créez votre fichier `.env.local`

Créez un fichier `/.env.local` à la racine du projet avec :

```bash
# Remplacez avec VOS vraies valeurs
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_VRAIE_CLÉ_ANON_PUBLIQUE
VITE_USE_SUPABASE=true
```

### 3. Redémarrez le serveur

```bash
npm run dev
```

### 4. Testez l'authentification

1. Allez sur http://localhost:8081/auth
2. Créez un compte avec email et mot de passe
3. Vérifiez que la connexion fonctionne

## 🔧 Configuration avancée

### Activer l'authentification email

Dans votre dashboard Supabase :
1. **Authentication** > **Settings**
2. **Enable email confirmations** = ✅
3. **Site URL** = `http://localhost:8081`
4. **Redirect URLs** = `http://localhost:8081`

### Créer la table `videos`

Exécutez ce SQL dans **SQL Editor** :

```sql
CREATE TABLE IF NOT EXISTS videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  storage_path text NOT NULL,
  duration numeric DEFAULT 0,
  size bigint DEFAULT 0,
  format text CHECK (format IN ('MP4', 'WebM')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id text,
  status text DEFAULT 'active',
  description text,
  tags text[]
);

-- Activer RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Politiques de base pour les utilisateurs authentifiés
CREATE POLICY "Enable read for authenticated users" ON videos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON videos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for user's own videos" ON videos
  FOR UPDATE USING (
    (user_id IS NOT NULL AND auth.uid()::text = user_id)
    OR (user_id IS NULL AND auth.email() = 'anonymous')
  );

CREATE POLICY "Enable delete for user's own videos" ON videos
  FOR DELETE USING (
    (user_id IS NOT NULL AND auth.uid()::text = user_id)
    OR (user_id IS NULL AND auth.email() = 'anonymous')
  );
```

## 🎯 Résultat attendu

Après configuration :

✅ **Page Auth** : http://localhost:8081/auth
✅ **Connexion/Inscription** : Sans erreur 400
✅ **Redirection** : Automatique vers gallery
✅ **Suppression** : Fonctionne avec user authentifié

## 🚨 Erreurs communes

| Erreur | Cause | Solution |
|--------|--------|----------|
| `400 /auth/v1/signup` | Mauvaise URL ou clé | Vérifiez votre .env.local |
| `Invalid login credentials` | Email/mot de passe incorrect | Testez avec un utilisateur créé manuellement |
| `Email not confirmed` | Confirmation email requise | Vérifiez vos emails ou activez "Email confirmations" |

---

**Une fois configuré, la suppression des vidéos dans Supabase fonctionnera parfaitement !** 🎬