/**
 * Énumérations et types pour gérer les status de l'application
 */

// Énumération principale pour les phases de l'application
export enum AppPhase {
  EDITOR = 'editor',
  SIMULATION = 'simulation',
  PREVIEW = 'preview',
  SETTINGS = 'settings'
}

// Énumération pour les status de simulation
export enum SimulationStatus {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  RECORDING = 'recording',
  ERROR = 'error'
}

// Énumération pour les status d'enregistrement vidéo
export enum RecordingStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Énumération pour les status de conversion vidéo
export enum ConversionStatus {
  IDLE = 'idle',
  CONVERTING = 'converting',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Énumération pour les status généraux de l'application
export enum AppStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  BUSY = 'busy',
  ERROR = 'error'
}

// Interface pour l'état global de l'application
export interface AppState {
  phase: AppPhase;
  appStatus: AppStatus;
  simulationStatus: SimulationStatus;
  recordingStatus: RecordingStatus;
  conversionStatus: ConversionStatus;

  // Métadonnées
  lastError?: string;
  progress?: number; // 0-100 pour les opérations longues

  // Utilitaires
  isEditorMode: () => boolean;
  isSimulationMode: () => boolean;
  isPreviewMode: () => boolean;
  isSettingsMode: () => boolean;
  isSimulating: () => boolean;
  isRecording: () => boolean;
  isProcessing: () => boolean;
  hasError: () => boolean;
  isBusy: () => boolean;
}

// Actions pour modifier le status
export interface AppStatusActions {
  // Phase navigation
  setPhase: (phase: AppPhase) => void;
  goToEditor: () => void;
  goToSimulation: () => void;
  goToPreview: () => void;
  goToSettings: () => void;

  // App status
  setAppStatus: (status: AppStatus) => void;
  setReady: () => void;
  setBusy: () => void;
  setError: (error: string) => void;
  clearError: () => void;

  // Simulation status
  setSimulationStatus: (status: SimulationStatus) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  stopSimulation: () => void;
  completeSimulation: () => void;

  // Recording status
  setRecordingStatus: (status: RecordingStatus) => void;
  startRecording: () => void;
  stopRecording: () => void;
  completeRecording: () => void;
  failRecording: () => void;

  // Conversion status
  setConversionStatus: (status: ConversionStatus) => void;
  startConversion: () => void;
  completeConversion: () => void;
  failConversion: () => void;

  // Progress
  setProgress: (progress: number) => void;
  clearProgress: () => void;

  // Reset
  resetAllStatus: () => void;
}

// Type complet pour le slice de status dans le store
export type AppStatusSlice = AppState & AppStatusActions;

// Messages d'erreur prédéfinis
export const ERROR_MESSAGES = {
  SIMULATION_FAILED: 'La simulation a échoué',
  RECORDING_FAILED: 'L\'enregistrement a échoué',
  CONVERSION_FAILED: 'La conversion vidéo a échoué',
  MEDIA_PERMISSION_DENIED: 'Autorisation d\'accès au média refusée',
  BROWSER_NOT_SUPPORTED: 'Navigateur non supporté',
  NETWORK_ERROR: 'Erreur réseau',
  UNKNOWN_ERROR: 'Une erreur inconnue est survenue'
} as const;