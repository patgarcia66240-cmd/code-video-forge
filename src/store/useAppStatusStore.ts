import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AppPhase,
  SimulationStatus,
  RecordingStatus,
  ConversionStatus,
  AppStatus,
  AppStatusSlice,
  ERROR_MESSAGES
} from '@/types/appStatus';

const createAppStatusSlice = (set: (fn: (state: AppStatusSlice) => AppStatusSlice) => void): AppStatusSlice => {
  // État initial
  const initialState: AppStatusSlice = {
    // État principal
    phase: AppPhase.EDITOR,
    appStatus: AppStatus.INITIALIZING,
    simulationStatus: SimulationStatus.IDLE,
    recordingStatus: RecordingStatus.IDLE,
    conversionStatus: ConversionStatus.IDLE,
    progress: undefined,
    lastError: undefined,

    // Utilitaires
    isEditorMode: () => {
      const state = useAppStatusStore.getState();
      return state.phase === AppPhase.EDITOR;
    },
    isSimulationMode: () => {
      const state = useAppStatusStore.getState();
      return state.phase === AppPhase.SIMULATION;
    },
    isPreviewMode: () => {
      const state = useAppStatusStore.getState();
      return state.phase === AppPhase.PREVIEW;
    },
    isSettingsMode: () => {
      const state = useAppStatusStore.getState();
      return state.phase === AppPhase.SETTINGS;
    },
    isSimulating: () => {
      const state = useAppStatusStore.getState();
      return state.simulationStatus === SimulationStatus.PLAYING;
    },
    isRecording: () => {
      const state = useAppStatusStore.getState();
      return state.recordingStatus === RecordingStatus.RECORDING;
    },
    isProcessing: () => {
      const state = useAppStatusStore.getState();
      return state.recordingStatus === RecordingStatus.PROCESSING ||
             state.conversionStatus === ConversionStatus.CONVERTING;
    },
    hasError: () => {
      const state = useAppStatusStore.getState();
      return state.appStatus === AppStatus.ERROR ||
             state.simulationStatus === SimulationStatus.ERROR ||
             state.recordingStatus === RecordingStatus.FAILED ||
             state.conversionStatus === ConversionStatus.FAILED;
    },
    isBusy: () => {
      const state = useAppStatusStore.getState();
      return state.appStatus === AppStatus.BUSY ||
             state.simulationStatus === SimulationStatus.PLAYING ||
             state.recordingStatus === RecordingStatus.RECORDING ||
             state.recordingStatus === RecordingStatus.PROCESSING ||
             state.conversionStatus === ConversionStatus.CONVERTING;
    },

    // Actions de phase
    setPhase: (phase: AppPhase) => set((state) => ({ ...state, phase })),
    goToEditor: () => set((state) => ({
      ...state,
      phase: AppPhase.EDITOR,
      appStatus: AppStatus.READY,
      lastError: undefined
    })),
    goToSimulation: () => set((state) => ({
      ...state,
      phase: AppPhase.SIMULATION,
      appStatus: AppStatus.READY,
      lastError: undefined
    })),
    goToPreview: () => set((state) => ({
      ...state,
      phase: AppPhase.PREVIEW,
      appStatus: AppStatus.READY,
      lastError: undefined
    })),
    goToSettings: () => set((state) => ({
      ...state,
      phase: AppPhase.SETTINGS,
      appStatus: AppStatus.READY,
      lastError: undefined
    })),

    // Actions de status d'application
    setAppStatus: (appStatus: AppStatus) => set((state) => ({ ...state, appStatus })),
    setReady: () => set((state) => ({
      ...state,
      appStatus: AppStatus.READY,
      lastError: undefined
    })),
    setBusy: () => set((state) => ({ ...state, appStatus: AppStatus.BUSY })),
    setError: (error: string) => set((state) => ({
      ...state,
      appStatus: AppStatus.ERROR,
      lastError: error
    })),
    clearError: () => set((state) => ({
      ...state,
      appStatus: AppStatus.READY,
      lastError: undefined
    })),

    // Actions de status de simulation
    setSimulationStatus: (simulationStatus: SimulationStatus) => set((state) => ({
      ...state,
      simulationStatus
    })),
    startSimulation: () => set((state) => ({
      ...state,
      simulationStatus: SimulationStatus.PLAYING,
      appStatus: AppStatus.BUSY,
      lastError: undefined
    })),
    pauseSimulation: () => set((state) => ({
      ...state,
      simulationStatus: SimulationStatus.PAUSED,
      appStatus: AppStatus.READY
    })),
    resumeSimulation: () => set((state) => ({
      ...state,
      simulationStatus: SimulationStatus.PLAYING,
      appStatus: AppStatus.BUSY
    })),
    stopSimulation: () => set((state) => ({
      ...state,
      simulationStatus: SimulationStatus.IDLE,
      appStatus: AppStatus.READY
    })),
    completeSimulation: () => set((state) => ({
      ...state,
      simulationStatus: SimulationStatus.COMPLETED,
      appStatus: AppStatus.READY
    })),

    // Actions de status d'enregistrement
    setRecordingStatus: (recordingStatus: RecordingStatus) => set((state) => ({
      ...state,
      recordingStatus
    })),
    startRecording: () => set((state) => ({
      ...state,
      recordingStatus: RecordingStatus.RECORDING,
      appStatus: AppStatus.BUSY,
      progress: 0,
      lastError: undefined
    })),
    stopRecording: () => set((state) => ({
      ...state,
      recordingStatus: RecordingStatus.PROCESSING,
      appStatus: AppStatus.BUSY
    })),
    completeRecording: () => set((state) => ({
      ...state,
      recordingStatus: RecordingStatus.COMPLETED,
      appStatus: AppStatus.READY,
      progress: undefined
    })),
    failRecording: () => set((state) => ({
      ...state,
      recordingStatus: RecordingStatus.FAILED,
      appStatus: AppStatus.ERROR,
      lastError: ERROR_MESSAGES.RECORDING_FAILED
    })),

    // Actions de status de conversion
    setConversionStatus: (conversionStatus: ConversionStatus) => set((state) => ({
      ...state,
      conversionStatus
    })),
    startConversion: () => set((state) => ({
      ...state,
      conversionStatus: ConversionStatus.CONVERTING,
      appStatus: AppStatus.BUSY,
      progress: 0,
      lastError: undefined
    })),
    completeConversion: () => set((state) => ({
      ...state,
      conversionStatus: ConversionStatus.COMPLETED,
      appStatus: AppStatus.READY,
      progress: undefined
    })),
    failConversion: () => set((state) => ({
      ...state,
      conversionStatus: ConversionStatus.FAILED,
      appStatus: AppStatus.ERROR,
      lastError: ERROR_MESSAGES.CONVERSION_FAILED
    })),

    // Actions de progression
    setProgress: (progress: number) => set((state) => ({
      ...state,
      progress: Math.min(100, Math.max(0, progress))
    })),
    clearProgress: () => set((state) => ({
      ...state,
      progress: undefined
    })),

    // Actions de reset
    resetAllStatus: () => set((state) => ({
      ...state,
      phase: AppPhase.EDITOR,
      appStatus: AppStatus.READY,
      simulationStatus: SimulationStatus.IDLE,
      recordingStatus: RecordingStatus.IDLE,
      conversionStatus: ConversionStatus.IDLE,
      progress: undefined,
      lastError: undefined
    }))
  };

  return initialState;
};

// Store principal avec devtools
export const useAppStatusStore = create<AppStatusSlice>()(
  devtools(
    (set) => createAppStatusSlice(set),
    {
      name: 'app-status-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Selecteurs optimisés pour éviter les re-renders inutiles
export const useAppPhase = () => useAppStatusStore((state) => state.phase);
export const useAppGlobalStatus = () => useAppStatusStore((state) => state.appStatus);
export const useSimulationStatus = () => useAppStatusStore((state) => state.simulationStatus);
export const useRecordingStatus = () => useAppStatusStore((state) => state.recordingStatus);
export const useConversionStatus = () => useAppStatusStore((state) => state.conversionStatus);
export const useAppProgress = () => useAppStatusStore((state) => state.progress);
export const useAppError = () => useAppStatusStore((state) => state.lastError);

// Selecteurs pour les états dérivés
export const useAppMode = () => useAppStatusStore((state) => ({
  isEditorMode: state.isEditorMode(),
  isSimulationMode: state.isSimulationMode(),
  isPreviewMode: state.isPreviewMode(),
  isSettingsMode: state.isSettingsMode()
}));

export const useAppState = () => useAppStatusStore((state) => ({
  isSimulating: state.isSimulating(),
  isRecording: state.isRecording(),
  isProcessing: state.isProcessing(),
  hasError: state.hasError(),
  isBusy: state.isBusy()
}));

// Actions regroupées pour une utilisation plus facile
export const useAppPhaseActions = () => useAppStatusStore((state) => ({
  setPhase: state.setPhase,
  goToEditor: state.goToEditor,
  goToSimulation: state.goToSimulation,
  goToPreview: state.goToPreview,
  goToSettings: state.goToSettings
}));

export const useSimulationActions = () => useAppStatusStore((state) => ({
  setSimulationStatus: state.setSimulationStatus,
  startSimulation: state.startSimulation,
  pauseSimulation: state.pauseSimulation,
  resumeSimulation: state.resumeSimulation,
  stopSimulation: state.stopSimulation,
  completeSimulation: state.completeSimulation
}));

export const useRecordingActions = () => useAppStatusStore((state) => ({
  setRecordingStatus: state.setRecordingStatus,
  startRecording: state.startRecording,
  stopRecording: state.stopRecording,
  completeRecording: state.completeRecording,
  failRecording: state.failRecording
}));

export const useConversionActions = () => useAppStatusStore((state) => ({
  setConversionStatus: state.setConversionStatus,
  startConversion: state.startConversion,
  completeConversion: state.completeConversion,
  failConversion: state.failConversion
}));

export const useAppStatusActions = () => useAppStatusStore((state) => ({
  setAppStatus: state.setAppStatus,
  setReady: state.setReady,
  setBusy: state.setBusy,
  setError: state.setError,
  clearError: state.clearError,
  setProgress: state.setProgress,
  clearProgress: state.clearProgress,
  resetAllStatus: state.resetAllStatus
}));