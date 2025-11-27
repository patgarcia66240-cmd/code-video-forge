# Code Video Forge

🎥 **Simulateur de code animé pour créer des vidéos professionnelles d'édition de code**

---

## 📖 Présentation

Code Video Forge est une application web révolutionnaire qui transforme votre code en vidéos d'animation professionnelles. Parfait pour les développeurs, enseignants, créateurs de contenu et passionnés qui veulent présenter leur code de manière visuelle et engageante.

### ✨ Fonctionnalités Principales

#### 📝 **Simulateur de Frappe Avancé**
- **Effets de frappe multiples** : machine à écrire, mot, ligne, bloc, instantané
- **Personnalisation complète** : vitesse de frappe (CPM), boucles, curseurs animés
- **Effets de défilement** : instantané, doux, centré, aucun
- **Plusieurs curseurs** : barre, bloc, souligné, contour, aucun

#### 🎬 **Système d'Enregistrement Vidéo**
- **Modes de capture** : écran complet ou éditeur uniquement
- **Formats multiples** : WebM et MP4 avec qualité configurable
- **Résolutions prédéfinies** : 16:9, 9:16 (vertical), 1:1, 4:3, 21:9
- **Qualité MP4** : Ultra-rapide, rapide, moyenne avec résolutions jusqu'à 1080p

#### 📊 **Contrôles Vidéo Professionnels**
- **Lecteur personnalisé** : play/pause, navigation temporelle, volume
- **Vitesse de lecture** : 0.5x, 1x, 1.5x, 2x
- **Contrôles avancés** : saut avant/arrière, plein écran
- **Barre de progression** interactive avec temps réel

#### 📈 **Système de Status Centralisé**
- **Gestion d'état complète** avec enums TypeScript
- **Indicateurs visuels** en temps réel
- **Phases d'application** : Éditeur, Simulation, Aperçu, Paramètres
- **Monitoring détaillé** : progression, erreurs, succès

#### 🎨 **Interface Moderne et Intuitive**
- **Design VS Code** familière pour les développeurs
- **Thème sombre/clair** avec haute contraste
- **Responsive design** pour tous les écrans
- **Animations fluides** avec Framer Motion

---

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** 18.0 ou supérieur
- **npm** ou **yarn**
- **Navigateur moderne** compatible avec les MediaRecorder API

### Installation

```bash
# Cloner le dépôt
git clone <URL_DU_DEPOT>
cd code-video-forge

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Scripts Disponibles

```bash
npm run dev      # Serveur de développement avec hot-reload
npm run build     # Build de production
npm run preview   # Aperçu de la build de production
npm run lint      # Linting du code
```

---

## 💻 Utilisation

### 1. **Phase Éditeur** 📝

Dans cette phase, vous pouvez :

- **Saisir votre code** dans l'éditeur Monaco (comme VS Code)
- **Configurer les paramètres** de frappe dans le panneau de droite
- **Ajuster la vitesse** en caractères par minute (CPM)
- **Choisir l'effet d'affichage** préféré
- **Personnaliser le curseur** et les effets de défilement

### 2. **Phase Simulation** ⚡

Cliquez sur "Démarrer la simulation" pour voir votre code s'animer :

- **Animation en temps réel** selon les paramètres configurés
- **Contrôles de lecture** : play/pause, réinitialisation
- **Barre de progression** pour naviguer dans l'animation
- **Mode boucle** pour répéter l'animation

### 3. **Phase Enregistrement** 🎥

Une fois la simulation terminée, enregistrez votre vidéo :

- **Choisir le mode** de capture (écran ou éditeur)
- **Sélectionner le format** (WebM ou MP4)
- **Configurer la qualité** et résolution
- **Démarrer l'enregistrement** automatique

### 4. **Phase Aperçu** 👁️

Visualisez et gérez votre vidéo finale :

- **Lecteur vidéo** avec contrôles complets
- **Informations détaillées** : format, durée, taille, résolution
- **Actions disponibles** : téléchargement, partage, suppression
- **Export vers réseaux sociaux** : YouTube, Twitter, LinkedIn

---

## 🛠️ Architecture Technique

### Structure du Projet

```
src/
├── components/          # Composants React réutilisables
│   ├── StatusIndicator.tsx     # Indicateurs de status
│   ├── VideoInfoPanel.tsx      # Panneau d'informations vidéo
│   ├── VideoPreview.tsx         # Lecteur vidéo avancé
│   └── ui/                     # Composants UI shadcn
├── core/                # Logique métier
│   ├── typing/         # Moteur de frappe
│   ├── recording/      # Enregistrement vidéo
│   └── converter/      # Conversion vidéo
├── hooks/              # Hooks personnalisés
│   ├── useAppStatus.ts          # Gestion du status
│   ├── useTypingEngine.ts       # Simulation de frappe
│   ├── useScreenRecorder.ts     # Enregistrement
│   └── useVideoConverter.ts    # Conversion vidéo
├── store/              # État global Zustand
│   ├── useAppStatusStore.ts     # Status centralisé
│   └── useForgeStore.ts        # État principal
├── types/              # Types TypeScript
│   └── appStatus.ts            # Enums et interfaces
└── workers/            # Web Workers
    └── ffmpeg.worker.ts        # Traitement vidéo
```

### Technologies Utilisées

- **React 18** - Framework UI avec hooks modernes
- **TypeScript** - Typage statique pour la robustesse
- **Vite** - Build tool ultra-rapide
- **Zustand** - Gestion d'état légère et efficace
- **Monaco Editor** - Éditeur de code de VS Code
- **Tailwind CSS** - Styling utilitaire moderne
- **shadcn/ui** - Composants UI de haute qualité
- **Framer Motion** - Animations fluides
- **FFmpeg.wasm** - Traitement vidéo côté client

### Patterns Architecturaux

#### 🎯 **Modularité**
- Séparation claire des responsabilités
- Composants réutilisables et testables
- Services métier découplés

#### 🔄 **Réactivité**
- Hooks personnalisés pour la logique complexe
- État centralisé avec Zustand
- Mise à jour optimisée du DOM

#### 🛡️ **Type Safety**
- Enums pour tous les états possibles
- Interfaces TypeScript complètes
- Validation des données

#### ⚡ **Performance**
- Web Workers pour les opérations lourdes
- Lazy loading des composants
- Optimisation du re-rendering

---

## 📋 Guides et Documentation

### Guide Complet : Créer votre première vidéo

1. **Préparation**
   ```bash
   npm install
   npm run dev
   ```

2. **Saisie du Code**
   - Écrivez votre code dans l'éditeur
   - Ajoutez des commentaires si nécessaire

3. **Configuration de l'Animation**
   - Vitesse : 50 CPM (recommandé)
   - Effet : Machine à écrire
   - Curseur : Barre
   - Défilement : Doux

4. **Test de l'Animation**
   - Cliquez sur "Démarrer la simulation"
   - Ajustez les paramètres si nécessaire

5. **Enregistrement**
   - Choisissez le mode éditeur
   - Format : MP4, Qualité : Moyenne
   - Résolution : 1920x1080

6. **Finalisation**
   - Attendez la fin de l'enregistrement
   - Téléchargez votre vidéo
   - Partagez sur vos réseaux préférés

### Configuration Avancée

#### Personnalisation des Effets

```typescript
// Configurer un effet personnalisé
const config = {
  speed: 75,          // Caractères par minute
  effect: "typewriter", // Effet de frappe
  cursor: "block",      // Type de curseur
  scroll: "smooth",     // Effet de défilement
  loop: false          // Mode boucle
};
```

#### Export Video

```typescript
// Configuration d'export
const exportConfig = {
  format: "mp4",           // WebM ou MP4
  quality: "medium",        // high, medium, fast
  resolution: "1080p",     // original, 1080p, 720p
  aspectRatio: "16:9",      // Format d'écran
  captureMode: "editor"      // screen ou editor
};
```

---

## 🐛 Dépannage

### Problèmes Communs

#### ❌ **Enregistrement ne démarre pas**
- Vérifiez les permissions du navigateur
- Assurez-vous d'être en HTTPS
- Essayez un autre navigateur

#### ⏱️ **Animation trop rapide/lente**
- Ajustez la vitesse en CPM
- Modifiez l'effet d'affichage
- Vérifiez la longueur du code

#### 📱 **Problèmes mobiles**
- Utilisez la vue paysage
- Réduisez la résolution d'enregistrement
- Vérifiez la connectivité

#### 🎬 **Qualité vidéo faible**
- Augmentez la qualité d'export
- Utilisez le MP4 au lieu du WebM
- Enregistrez en résolution supérieure

### Support Technique

- **Documentation complète** : Consultez les guides dans `/docs`
- **Issues GitHub** : Signalez les problèmes sur le dépôt
- **Discussions** : Partagez vos idées et suggestions

---

## 🤝 Contribuer

Nous apprécions les contributions ! Voici comment participer :

### Étapes

1. **Forker** le dépôt
2. **Créer une branche** pour votre fonctionnalité
3. **Committer** vos changements
4. **Pousser** vers votre fork
5. **Ouvrir une Pull Request**

### Standards de Code

- **TypeScript** pour tout nouveau code
- **ESLint** pour le style de code
- **Tests** pour les nouvelles fonctionnalités
- **Documentation** mise à jour

### Convention de Commits

```bash
# Feature nouvelle fonctionnalité
git commit -m "feat: ajouter le support de l'export GIF"

# Correction de bug
git commit -m "fix: corriger le problème de boucle infinie"

# Documentation
git commit -m "docs: mettre à jour le README"

# Style
git commit -m "style: améliorer l'animation du curseur"
```

---

## 📜 Licence

Ce projet est sous licence **MIT**. Consultez le fichier `LICENSE` pour plus d'informations.

---

## 🙏 Remerciements

- **VS Code** pour l'inspiration de l'éditeur
- **Monaco Editor** pour l'éditeur de code exceptionnel
- **FFmpeg** pour le traitement vidéo
- **shadcn/ui** pour les composants UI de qualité
- **Vercel** pour l'hébergement et le déploiement

---

## 📞 Contact

- **GitHub** : [Dépôt du projet](https://github.com/votre-username/code-video-forge)
- **Email** : [contact@votre-domaine.com](mailto:contact@votre-domaine.com)
- **Twitter** : [@votre_compte](https://twitter.com/votre_compte)

---

**✨ Transformez votre code en narration visuelle avec Code Video Forge !**