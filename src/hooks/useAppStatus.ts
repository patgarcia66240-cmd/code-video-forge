/**
 * Hook personnalisé pour gérer les status de l'application
 * Fournit une interface simple pour interagir avec les status
 */

import { useCallback } from 'react';
import {
  AppPhase,
  SimulationStatus,
  RecordingStatus,
  ConversionStatus,
  AppStatus,
  ERROR_MESSAGES
} from '@/types/appStatus';
import { useAppStatusStore } from '@/store/useAppStatusStore';

// Types pour le hook
interface AppStatusHook {
  // État actuel
  phase: AppPhase;
  appStatus: AppStatus;
  simulationStatus: SimulationStatus;
  recordingStatus: RecordingStatus;
  conversionStatus: ConversionStatus;
  lastError?: string;
  progress?: number;

  // Utilitaires
  isEditorMode: boolean;
  isSimulationMode: boolean;
  isPreviewMode: boolean;
  isSettingsMode: boolean;
  isSimulating: boolean;
  isPaused: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  hasError: boolean;
  isBusy: boolean;

  // Actions navigation
  goToEditor: () => void;
  goToSimulation: () => void;
  goToPreview: () => void;
  goToSettings: () => void;

  // Actions simulation
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  stopSimulation: () => void;
  completeSimulation: () => void;

  // Actions enregistrement
  startRecording: () => void;
  stopRecording: () => void;
  completeRecording: () => void;

  // Actions conversion
  startConversion: () => void;
  completeConversion: () => void;

  // Actions utilitaires
  setError: (error?: string) => void;
  clearError: () => void;
  setProgress: (progress: number) => void;
  clearProgress: () => void;

  // États calculés
  canStartSimulation: boolean;
  canStartRecording: boolean;
  canConvertVideo: boolean;
}

// Hook qui interagit avec le store Zustand
export const useAppStatus = (): AppStatusHook => {
  // Import des méthodes du store
  const {
    phase,
    appStatus,
    simulationStatus,
    recordingStatus,
    conversionStatus,
    lastError,
    progress,

    // Actions
    setPhase,
    setAppStatus,
    setSimulationStatus,
    setRecordingStatus,
    setConversionStatus,
    setError,
    clearError,
    setProgress,
    clearProgress,

    // Utilitaires
    isEditorMode,
    isSimulationMode,
    isPreviewMode,
    isSettingsMode,
    isSimulating,
    isRecording,
    isProcessing,
    hasError,
    isBusy
  } = useAppStatusStore();

  // Actions de navigation
  const goToEditor = useCallback(() => {
    setPhase(AppPhase.EDITOR);
    setAppStatus(AppStatus.READY);
  }, [setPhase, setAppStatus]);

  const goToSimulation = useCallback(() => {
    setPhase(AppPhase.SIMULATION);
    setSimulationStatus(SimulationStatus.IDLE);
    setAppStatus(AppStatus.READY);
  }, [setPhase, setSimulationStatus, setAppStatus]);

  const goToPreview = useCallback(() => {
    setPhase(AppPhase.PREVIEW);
    setAppStatus(AppStatus.READY);
  }, [setPhase, setAppStatus]);

  const goToSettings = useCallback(() => {
    setPhase(AppPhase.SETTINGS);
    setAppStatus(AppStatus.READY);
  }, [setPhase, setAppStatus]);

  // Actions simulation
  const startSimulation = useCallback(() => {
    setSimulationStatus(SimulationStatus.PLAYING);
    setAppStatus(AppStatus.BUSY);
  }, [setSimulationStatus, setAppStatus]);

  const pauseSimulation = useCallback(() => {
    setSimulationStatus(SimulationStatus.PAUSED);
    setAppStatus(AppStatus.READY);
  }, [setSimulationStatus, setAppStatus]);

  const resumeSimulation = useCallback(() => {
    setSimulationStatus(SimulationStatus.PLAYING);
    setAppStatus(AppStatus.BUSY);
  }, [setSimulationStatus, setAppStatus]);

  const stopSimulation = useCallback(() => {
    setSimulationStatus(SimulationStatus.IDLE);
    setAppStatus(AppStatus.READY);
  }, [setSimulationStatus, setAppStatus]);

  const completeSimulation = useCallback(() => {
    setSimulationStatus(SimulationStatus.COMPLETED);
    setAppStatus(AppStatus.READY);
  }, [setSimulationStatus, setAppStatus]);

  // Actions enregistrement
  const startRecording = useCallback(() => {
    setRecordingStatus(RecordingStatus.RECORDING);
    setAppStatus(AppStatus.BUSY);
    setProgress(0);
  }, [setRecordingStatus, setAppStatus, setProgress]);

  const stopRecording = useCallback(() => {
    setRecordingStatus(RecordingStatus.PROCESSING);
    setAppStatus(AppStatus.BUSY);
  }, [setRecordingStatus, setAppStatus]);

  const completeRecording = useCallback(() => {
    setRecordingStatus(RecordingStatus.COMPLETED);
    setAppStatus(AppStatus.READY);
    clearProgress();
  }, [setRecordingStatus, setAppStatus, clearProgress]);

  // Actions conversion
  const startConversion = useCallback(() => {
    setConversionStatus(ConversionStatus.CONVERTING);
    setAppStatus(AppStatus.BUSY);
    setProgress(0);
  }, [setConversionStatus, setAppStatus, setProgress]);

  const completeConversion = useCallback(() => {
    setConversionStatus(ConversionStatus.COMPLETED);
    setAppStatus(AppStatus.READY);
    clearProgress();
  }, [setConversionStatus, setAppStatus, clearProgress]);

  // État dérivé
  const isPaused = simulationStatus === SimulationStatus.PAUSED;

  // États calculés pour l'UI
  const canStartSimulation = appStatus === AppStatus.READY &&
    phase === AppPhase.EDITOR &&
    !hasError;

  const canStartRecording = appStatus === AppStatus.READY &&
    simulationStatus === SimulationStatus.COMPLETED &&
    !hasError;

  const canConvertVideo = appStatus === AppStatus.READY &&
    recordingStatus === RecordingStatus.COMPLETED &&
    !hasError;

  return {
    // État actuel
    phase,
    appStatus,
    simulationStatus,
    recordingStatus,
    conversionStatus,
    lastError,
    progress,

    // Utilitaires
    isEditorMode,
    isSimulationMode,
    isPreviewMode,
    isSettingsMode,
    isSimulating,
    isPaused,
    isRecording,
    isProcessing,
    hasError,
    isBusy,

    // Actions
    goToEditor,
    goToSimulation,
    goToPreview,
    goToSettings,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    completeSimulation,
    startRecording,
    stopRecording,
    completeRecording,
    startConversion,
    completeConversion,
    setError,
    clearError,
    setProgress,
    clearProgress,

    // États calculés
    canStartSimulation,
    canStartRecording,
    canConvertVideo
  };
};

// Hook pour les messages de status
export const useStatusMessages = () => {
  const {
    simulationStatus,
    recordingStatus,
    conversionStatus,
    appStatus,
    hasError,
    lastError,
    progress
  } = useAppStatus();

  const getSimulationMessage = () => {
    switch (simulationStatus) {
      case SimulationStatus.PLAYING:
        return 'Simulation en cours...';
      case SimulationStatus.PAUSED:
        return 'Simulation en pause';
      case SimulationStatus.COMPLETED:
        return 'Simulation terminée';
      case SimulationStatus.ERROR:
        return 'Erreur de simulation';
      default:
        return '';
    }
  };

  const getRecordingMessage = () => {
    switch (recordingStatus) {
      case RecordingStatus.PREPARING:
        return 'Préparation de l\'enregistrement...';
      case RecordingStatus.RECORDING:
        return progress ? `Enregistrement en cours... ${progress}%` : 'Enregistrement en cours...';
      case RecordingStatus.PROCESSING:
        return 'Traitement de la vidéo...';
      case RecordingStatus.COMPLETED:
        return 'Enregistrement terminé';
      case RecordingStatus.FAILED:
        return 'Échec de l\'enregistrement';
      default:
        return '';
    }
  };

  const getConversionMessage = () => {
    switch (conversionStatus) {
      case ConversionStatus.CONVERTING:
        return progress ? `Conversion en cours... ${progress}%` : 'Conversion en cours...';
      case ConversionStatus.COMPLETED:
        return 'Conversion terminée';
      case ConversionStatus.FAILED:
        return 'Échec de la conversion';
      default:
        return '';
    }
  };

  const getGlobalMessage = () => {
    if (hasError && lastError) {
      return lastError;
    }
    if (appStatus === AppStatus.INITIALIZING) {
      return 'Initialisation...';
    }
    if (appStatus === AppStatus.BUSY) {
      return getRecordingMessage() || getConversionMessage() || getSimulationMessage() || 'Opération en cours...';
    }
    return '';
  };

  return {
    simulationMessage: getSimulationMessage(),
    recordingMessage: getRecordingMessage(),
    conversionMessage: getConversionMessage(),
    globalMessage: getGlobalMessage(),
    hasError,
    lastError
  };
};