# Code Video Forge

<div align="center">

![Code Video Forge Logo](https://via.placeholder.com/150x50/1e293b/white?text=Code+Video+Forge)

**Créez des vidéos d'animation de code en temps réel**

Transformez votre code en vidéos fluides avec effet de frappe, éditeur VSCode-like, et enregistrement MP4/WebM de qualité professionnelle.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)

</div>

## ✨ Fonctionnalités

### 🎥 Édition et Animation
- **Éditeur VSCode-like** avec coloration syntaxique et thème sombre
- **Animation de frappe réaliste** avec effets sonores optionnels
- **Personnalisation avancée** : vitesse, curseur, effets spéciaux
- **Mode plein écran** pour un rendu professionnel
- **Support multi-langages** : Python, JavaScript, TypeScript, Java, C++, HTML/CSS, etc.

### 📹 Enregistrement Vidéo
- **Enregistrement MP4/WebM** avec options de qualité
- **Capture d'écran éditeur** ou capture d'onglet dédié
- **Audio intégré** : microphone, système son, ou les deux
- **Formats multiples** : MP4 (H.264) et WebM (VP9/Opus)
- **Résolutions personnalisables** : 1080p, 720p, ou original
- **Prévisualisation en temps réel** avant export

### 💾 Sauvegarde et Stockage
- **Sauvegarde locale** persistante avec localStorage
- **Stockage cloud** via Supabase Storage
- **Galerie de codes** avec vignettes automatiques
- **Galerie de vidéos** avec aperçus et téléchargement
- **Import/Export** de fichiers de code
- **Métadonnées complètes** : tags, description, date

### 🎛️ Paramètres Avancés
- **Vitesse d'animation** : 10% - 200%
- **Effets visuels** : machine à écrire, mot par mot, ligne par ligne
- **Types de curseur** : barre, bloc, souligné, outline
- **Effets de défilement** : instantané, doux, centré
- **Ratio d'aspect** : 16:9, 9:16, 1:1, 4:3, 21:9
- **Qualité audio** : haute, moyenne, basse
- **Volume ajustable** pour les enregistrements

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18 ou supérieur
- npm ou yarn
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation

1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/code-video-forge.git
cd code-video-forge
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer le serveur de développement**
```bash
npm run dev
```

4. **Ouvrir votre navigateur**
```
http://localhost:5173
```

## 📖 Guide d'Utilisation

### 1. Créer une Vidéo

1. **Écrire du code** dans l'éditeur
2. **Personnaliser** les paramètres (vitesse, curseur, effets)
3. **Lancer la simulation** pour prévisualiser
4. **Cliquer sur Enregistrer** pour capturer l'animation

### 2. Sauvegarder et Gérer

#### Codes
- **Double-cliquer** sur l'onglet pour renommer le fichier
- **Utiliser "Sauvegarder"** pour enregistrer dans votre collection
- **Importer** des fichiers existants depuis votre ordinateur
- **Accéder à "Mes Codes"** pour retrouver vos créations

#### Vidéos
- **Accéder à "Galerie"** pour voir vos vidéos
- **Télécharger** les vidéos en MP4/WebM
- **Partager** via liens directs (option cloud)
- **Supprimer** les fichiers inutiles

### 3. Personnalisation Avancée

#### Options d'Animation
- **Vitesse** : Contrôle la rapidité de frappe
- **Loop** : Répétition automatique de l'animation
- **Auto-start** : Démarrage automatique au chargement

#### Effets Visuels
- **Typewriter** : Effet machine à écrire classique
- **Word** : Mot par mot avec délai
- **Line** : Ligne par ligne
- **Instant** : Apparition instantanée

#### Options d'Enregistrement
- **Capture Mode** : Éditeur ou onglet spécifique
- **Audio** : Microphone, système, ou les deux
- **Qualité** : Haute (1080p), Moyenne (720p), ou Rapide

## 🎨 Personnalisation

### Thèmes et Apparence

L'interface est entièrement personnalisable :

```css
/* Variables CSS principales */
:root {
  --vscode-bg: #1e1e1e;
  --vscode-editor: #252526;
  --vscode-sidebar: #333333;
  --vscode-button: #0e639c;
  --vscode-primary: #007acc;
}
```

### Paramètres Persistants

Les préférences utilisateur sont sauvegardées :
- Vitesse et paramètres d'animation
- Qualité vidéo et format
- Langage et thèmes préférés
- Raccourcis clavier personnalisés

## 🛠️ Développement

### Structure du Projet

```
src/
├── components/           # Composants React
│   ├── ui/              # Composants UI de base
│   ├── CodeEditor.tsx   # Éditeur de code
│   ├── TypingSimulator/ # Simulation de frappe
│   ├── VideoPlayer.tsx  # Lecteur vidéo
│   └── VSCodeLayout.tsx # Layout VSCode-like
├── pages/               # Pages principales
│   ├── Index.tsx        # Page d'accueil
│   ├── Gallery.tsx      # Galerie de vidéos
│   └── CodesGallery.tsx # Galerie de codes
├── hooks/               # Hooks personnalisés
│   ├── useCodeStorage.ts
│   ├── useVideoStorage.ts
│   └── useScreenRecorder.ts
├── lib/                 # Bibliothèques et utilitaires
├── store/               # État global (Zustand)
└── utils/               # Fonctions utilitaires
```

### Scripts Disponibles

```bash
# Développement
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Qualité et maintenance
npm run lint         # Linting ESLint
npm run type-check   # Vérification TypeScript
npm run format       # Formatage Prettier

# Nettoyage
npm run clean        # Nettoyer les dépendances
```

### Technologies Utilisées

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Éditeur** : Monaco Editor (VS Code engine)
- **Animations** : Framer Motion
- **État** : Zustand (state management)
- **Stockage** : Supabase (cloud) + localStorage (local)
- **Enregistrement** : MediaRecorder API + RecordRTC
- **Conversion** : FFmpeg.js (MP4 conversion)

### Variables d'Environnement

Créer un fichier `.env.local` :

```env
# Supabase (optionnel)
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase

# Configuration
VITE_APP_NAME=Code Video Forge
VITE_APP_VERSION=1.0.0
```

## 🔧 Configuration Supabase (Optionnel)

Pour activer le stockage cloud :

1. **Créer un projet** sur [supabase.com](https://supabase.com)
2. **Exécuter les migrations** SQL dans votre dashboard :

```sql
-- Créer la table des codes
CREATE TABLE saved_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des vidéos
CREATE TABLE saved_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  format TEXT NOT NULL,
  size BIGINT,
  duration FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer le bucket de stockage
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
```

3. **Configurer les permissions RLS** (Row Level Security)

## 🎯 Cas d'Usage

### 🎓 Éducation
- **Tutoriels de programmation** avec animations fluides
- **Présentations de code** pour les cours
- **Démonstrations interactives** en ligne

### 💼 Professionnel
- **Documentation technique** animée
- **Présentations d'algorithmes**
- **Démos de fonctionnalités** pour les équipes

### 📱 Création de Contenu
- **Vidéos pour réseaux sociaux** (LinkedIn, Twitter)
- **Contenu éducatif** pour YouTube
- **Portfolios de développeurs**

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment vous pouvez aider :

### Signalement de Bugs
- Utiliser les [issues GitHub](https://github.com/votre-username/code-video-forge/issues)
- Fournir un exemple reproductible minimal
- Inclure captures d'écran si applicable

### Pull Requests
1. **Forker** le projet
2. **Créer une branche** (`git checkout -b feature/amazing-feature`)
3. **Commettre** les changements (`git commit -m 'Add amazing feature'`)
4. **Pusher** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir une Pull Request**

### Normes de Code
- Utiliser **TypeScript** pour tout nouveau code
- Suivre les conventions **ESLint/Prettier**
- Ajouter des **tests** pour les nouvelles fonctionnalités
- Documenter les **props** des composants

## 📄 License

Ce projet est sous license MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Monaco Editor** - Éditeur de code VS Code
- **Framer Motion** - Animations fluides
- **Supabase** - Backend et stockage
- **Tailwind CSS** - Framework CSS utilitaire
- **RecordRTC** - Enregistrement média

## 📞 Support

- 📧 Email : support@codevideoforge.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/code-video-forge/issues)
- 📖 Documentation : [Wiki du projet](https://github.com/votre-username/code-video-forge/wiki)
- 💬 Discussions : [GitHub Discussions](https://github.com/votre-username/code-video-forge/discussions)

---

<div align="center">

**[⭐ Donner une étoile](https://github.com/votre-username/code-video-forge) • [🐖 Signaler un bug](https://github.com/votre-username/code-video-forge/issues) • [💡 Suggérer une amélioration](https://github.com/votre-username/code-video-forge/discussions)**

Made with ❤️ by Code Video Forge Team

</div>