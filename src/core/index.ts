/**
 * Point d'entrée central pour la logique métier (core)
 * Exporte tous les modules core de manière organisée
 */

// Types communs
export type { TypingEvent, TypingConfig, TypingState, TypingSequence } from './typing/types';

// Fonctions principales
export { simulateTyping, createTypingSequence, calculateTypingProgress, getTypingTextAtTime } from './typing/engine';

// Classes et utilitaires
export { ScreenRecorder } from './recording/screenRecorder';
export { VideoConverter } from './converter/videoConverter';
