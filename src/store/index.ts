/**
 * Point d'entrée central pour les stores Zustand
 * Exporte tous les stores de manière organisée
 */

// Stores principaux
export { useForgeStore } from './useForgeStore';
export { useAppStatusStore } from './useAppStatusStore';

// Selecteurs optimisés
export {
  useForgeCode,
  useForgeSimulationState,
  useForgeVideoState,
  useForgeTypingSettings,
  useForgeRecordingSettings,
  useForgeMp4Settings
} from './useForgeStore';

export {
  useAppPhase,
  useAppGlobalStatus,
  useSimulationStatus,
  useRecordingStatus,
  useConversionStatus,
  useAppProgress,
  useAppError,
  useAppMode,
  useAppState,
  useAppPhaseActions,
  useSimulationActions,
  useRecordingActions,
  useConversionActions,
  useAppStatusActions
} from './useAppStatusStore';