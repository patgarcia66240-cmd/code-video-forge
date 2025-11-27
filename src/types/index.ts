/**
 * Point d'entrée central pour les types TypeScript
 * Exporte tous les types et interfaces de manière organisée
 */

// Types principaux
export * from './appStatus';

// Réexporter les types les plus utilisés
export type {
  AppPhase,
  SimulationStatus,
  RecordingStatus,
  ConversionStatus,
  AppStatus,
  AppState,
  AppStatusActions,
  AppStatusSlice
} from './appStatus';