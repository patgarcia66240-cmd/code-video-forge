# 📋 Plan d'Amélioration Architecturale - Code Video Forge

## Vue d'ensemble
Document décrivant les phases d'amélioration pour transformer l'application en architecture professionnelle et modulaire, passant d'un prototype avancé à un niveau production-ready.

## 🔄 État Actuel (~30% implémenté)
- ✅ Hooks spécialisés partiellement créés (`useTypingEngine`, `useVideoConverter`, `useScreenRecorder`)
- ❌ Store global manquant
- ❌ FFmpeg dans thread principal
- ❌ Architecture Core/UI non séparée
- ❌ TypingSimulator reste un "God Component"

---

# Phase 1 : Store Global Zustand ⭐️ *Priorité Haute*
**Objectif** : Simplifier Index.tsx et centraliser l'état métier

## Tâches Détaillées
1. **Installation dépendance**
   ```bash
   npm install zustand
   ```

2. **Créer `src/store/useForgeStore.ts`**
   ```typescript
   interface ForgeState {
     // État principal
     code: string;
     recordedBlob: Blob | null;
     videoPreviewUrl: string | null;
     isSimulating: boolean;
     showVideoPreview: boolean;

     // Paramètres
     speed: number;
     exportFormat: "webm" | "mp4";
     // ... autres paramètres

     // Actions
     setCode: (code: string) => void;
     setRecordedBlob: (blob: Blob | null) => void;
     startSimulation: () => void;
     showPreview: () => void;
   }
   ```

3. **Refactoriser `Index.tsx`**
   - Supprimer tous les `useState` locaux
   - Utiliser `useForgeStore()` pour l'état
   - Réduire de ~80 lignes à ~30 lignes

4. **Tests de validation**
   - Navigation CodeEditor → TypingSimulator ✅
   - Navigation TypingSimulator → VideoPreview ✅
   - État persistant entre les vues ✅

## Critères de Succès
- ✅ Index.tsx < 100 lignes
- ✅ État partagé entre composants
- ✅ Navigation fluide sans bugs

---

# Phase 2 : Web Worker FFmpeg ⭐️ *Priorité Haute*
**Objectif** : Déplacer la conversion vidéo hors du thread principal

## Tâches Détaillées
1. **Créer `src/workers/ffmpeg.worker.ts`**
   ```typescript
   // Importer FFmpeg WASM
   importScripts('/ffmpeg/ffmpeg.min.js');

   // Interface Worker
   interface WorkerMessage {
     type: 'convert';
     webmBlob: Blob;
     options: ConversionOptions;
   }

   // Logique conversion dans worker
   self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
     if (e.data.type === 'convert') {
       const { webmBlob, options } = e.data;
       try {
         const mp4Blob = await convertInWorker(webmBlob, options);
         self.postMessage({ type: 'success', blob: mp4Blob });
       } catch (error) {
         self.postMessage({ type: 'error', error });
       }
     }
   };
   ```

2. **Modifier `src/lib/ffmpeg.ts`**
   - Créer instance Web Worker
   - Wrapper fonctions pour communication postMessage
   - Gestion erreurs et progrès

3. **Refactoriser `useVideoConverter`**
   - Utiliser worker au lieu d'appel direct
   - Écouter messages du worker
   - Gestion progrès temps réel

4. **Tests de performance**
   - Conversion MP4 sans blocage UI ✅
   - Mémoire stable pendant conversion ✅
   - Gestion erreurs graceful ✅

## Critères de Succès
- ✅ Thread principal non bloqué
- ✅ Conversion MP4 fonctionnelle
- ✅ Gestion erreurs améliorée

---

# Phase 3 : Architecture Modulaire Core/UI ⭐️ *Priorité Moyenne*
**Objectif** : Séparer logique métier de l'interface React

## Tâches Détaillées
1. **Créer `src/core/typing/engine.ts`**
   ```typescript
   // Fonction pure indépendante de React
   export function simulateTyping(
     text: string,
     speed: number,
     effect: "smooth" | "burst" = "smooth"
   ): TypingEvent[] {
     // Retourne séquence événements temporels
     // Testable unitairement
   }
   ```

2. **Créer `src/core/typing/types.ts`**
   ```typescript
   export interface TypingEvent {
     type: 'add_char' | 'pause' | 'complete';
     char?: string;
     delay: number;
   }

   export interface TypingConfig {
     speed: number;
     effect: "smooth" | "burst";
     loop: boolean;
   }
   ```

3. **Créer `src/core/recording/screenRecorder.ts`**
   ```typescript
   export class ScreenRecorder {
     private recorder: RecordRTC | null = null;

     async startRecording(): Promise<MediaStream> {
       // Logique pure enregistrement
     }

     async stopRecording(): Promise<Blob> {
       // Logique pure arrêt
     }
   }
   ```

4. **Adapter hooks existants**
   - `useTypingEngine` → utilise `core/typing/engine.ts`
   - `useScreenRecorder` → utilise `core/recording/screenRecorder.ts`
   - `useVideoConverter` → utilise `core/converter/videoConverter.ts`

## Critères de Succès
- ✅ Fonctions `simulateTyping()` testables
- ✅ Logique métier indépendante de React
- ✅ Tests unitaires possibles

---

# Phase 4 : Refactorisation TypingSimulator ⭐️ *Priorité Moyenne*
**Objectif** : Éliminer le "God Component" actuel

## Tâches Détaillées
1. **Créer composants spécialisés**
   ```
   src/components/TypingSimulator/
   ├── TypingControls.tsx      # Boutons lecture/pause/reset
   ├── RecordingControls.tsx   # Contrôles enregistrement
   ├── VideoPreviewPanel.tsx   # Aperçu vidéo intégré
   ├── TimelinePanel.tsx       # Timeline et contrôles
   └── index.tsx               # Orchestrateur simplifié
   ```

2. **Simplifier `TypingSimulator/index.tsx`**
   - Importer composants spécialisés
   - Utiliser store Zustand pour communication
   - ~50 lignes au lieu de ~400

3. **Éliminer duplication**
   - Supprimer logique dupliquée avec hooks
   - Utiliser store pour état partagé
   - Nettoyer raccourcis clavier

4. **Tests d'intégration**
   - Contrôles fonctionnels ✅
   - État synchronisé ✅
   - Performance améliorée ✅

## Critères de Succès
- ✅ TypingSimulator.tsx < 200 lignes
- ✅ Composants indépendants testables
- ✅ Logique UI séparée de logique métier

---

# Phase 5 : Structure Finale du Projet ⭐️ *Priorité Basse*
**Objectif** : Organisation selon bonnes pratiques

## Tâches Détaillées
1. **Réorganiser structure**
   ```
   src/
   ├── core/           # Logique métier pure
   │   ├── typing/
   │   ├── recording/
   │   ├── converter/
   │   └── timeline/
   ├── components/     # Composants React
   │   ├── CodeEditor/
   │   ├── TypingSimulator/
   │   ├── VideoPreview/
   │   └── ui/         # Composants réutilisables
   ├── store/          # État global
   ├── workers/        # Web Workers
   ├── hooks/          # Hooks React (legacy)
   ├── pages/          # Pages/routes
   └── lib/            # Utilitaires
   ```

2. **Nettoyer dépendances**
   - Supprimer imports circulaires
   - Optimiser tree-shaking
   - Documenter API publique

3. **Ajouter tests unitaires**
   ```typescript
   // tests/core/typing/engine.test.ts
   describe('simulateTyping', () => {
     it('should return correct events', () => {
       const events = simulateTyping('hello', 50);
       expect(events).toHaveLength(5);
     });
   });
   ```

4. **Documentation**
   - README mis à jour
   - Guide contribution
   - API documentation

## Critères de Succès
- ✅ Structure cohérente
- ✅ Tests unitaires > 80% couverture
- ✅ Documentation complète

---

# 📊 Métriques de Suivi

## KPIs par Phase
- **Phase 1** : Index.tsx < 100 lignes
- **Phase 2** : Conversion sans blocage UI
- **Phase 3** : 5+ fonctions testables unitairement
- **Phase 4** : TypingSimulator < 200 lignes
- **Phase 5** : Tests couverture > 80%

## Timeline Estimée
- **Phase 1** : 1 jour
- **Phase 2** : 1-2 jours
- **Phase 3** : 1-2 jours
- **Phase 4** : 1 jour
- **Phase 5** : 2-3 jours

**Total estimé** : 6-9 jours développement

---

# 🚀 Ordre Recommandé d'Exécution

1. **Phase 1** (Store) → Simplification immédiate
2. **Phase 2** (Worker) → Performance critique
3. **Phase 3** (Core) → Maintenabilité
4. **Phase 4** (UI) → Complexité réduite
5. **Phase 5** (Structure) → Nettoyage final

---

# ✅ Checklist Validation Finale

- [ ] Index.tsx utilise uniquement le store
- [ ] FFmpeg s'exécute dans Web Worker
- [ ] Fonctions core testables unitairement
- [ ] TypingSimulator décomposé en composants
- [ ] Structure projet modulaire respectée
- [ ] Tests automatisés en place
- [ ] Performance améliorée (pas de blocage UI)
- [ ] Maintenabilité accrue (séparation responsabilités)
