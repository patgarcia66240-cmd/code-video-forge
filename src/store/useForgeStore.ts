import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour le store
interface ForgeState {
    // État principal de navigation
    code: string;
    isSimulating: boolean;
    showVideoPreview: boolean;
    recordedBlob: Blob | null;
    videoPreviewUrl: string | null;
    currentFileName: string;

    // Paramètres de simulation
    speed: number;
    autoStart: boolean;
    isLoopEnabled: boolean;
    displayEffect: "typewriter" | "word" | "line" | "block" | "instant";
    cursorType: "none" | "bar" | "block" | "underline" | "outline";
    scrollEffect: "none" | "instant" | "smooth" | "center";

    // Paramètres d'enregistrement
    exportFormat: "webm" | "mp4";
    captureMode: "screen" | "editor";
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9";

    // Paramètres MP4
    mp4Quality: "high" | "medium" | "fast";
    mp4Preset: "ultrafast" | "fast" | "medium";
    mp4Resolution: "original" | "1080p" | "720p";
    saveWebmBackup: boolean;

    // Actions
    setCode: (code: string) => void;
    setIsSimulating: (simulating: boolean) => void;
    setShowVideoPreview: (show: boolean) => void;
    setRecordedBlob: (blob: Blob | null) => void;
    setVideoPreviewUrl: (url: string | null) => void;
    setCurrentFileName: (fileName: string) => void;

    // Actions de navigation
    startSimulation: () => void;
    stopSimulation: () => void;
    showPreview: () => void;
    hidePreview: () => void;
    resetToEditor: () => void;

    // Actions paramètres
    updateSpeed: (speed: number) => void;
    updateAutoStart: (autoStart: boolean) => void;
    updateLoopEnabled: (enabled: boolean) => void;
    updateDisplayEffect: (effect: "typewriter" | "word" | "line" | "block" | "instant") => void;
    updateCursorType: (type: "none" | "bar" | "block" | "underline" | "outline") => void;
    updateScrollEffect: (effect: "none" | "instant" | "smooth" | "center") => void;

    // Actions enregistrement
    updateExportFormat: (format: "webm" | "mp4") => void;
    updateCaptureMode: (mode: "screen" | "editor") => void;
    updateAspectRatio: (ratio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9") => void;

    // Actions MP4
    updateMp4Quality: (quality: "high" | "medium" | "fast") => void;
    updateMp4Preset: (preset: "ultrafast" | "fast" | "medium") => void;
    updateMp4Resolution: (resolution: "original" | "1080p" | "720p") => void;
    updateSaveWebmBackup: (save: boolean) => void;
}

// Valeurs par défaut
const defaultCode = `# Bienvenue dans le simulateur de code
# Ce simulateur reproduit l'écriture de code en temps réel

def fibonacci(n):
    """Calcule la suite de Fibonacci"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Exemple d'utilisation
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

class DataProcessor:
    def __init__(self, data):
        self.data = data

    def process(self):
        """Traite les données"""
        return [x * 2 for x in self.data]

# Instance et utilisation
processor = DataProcessor([1, 2, 3, 4, 5])
result = processor.process()
print(f"Résultat: {result}")`;

// Store avec persistance pour certains paramètres
export const useForgeStore = create<ForgeState>()(
    persist(
        (set, get) => ({
            // État initial
            code: defaultCode,
            isSimulating: false,
            showVideoPreview: false,
            recordedBlob: null,
            videoPreviewUrl: null,
            currentFileName: "typing-demo.py",

            // Paramètres avec valeurs par défaut
            speed: 50,
            autoStart: false,
            isLoopEnabled: false,
            displayEffect: "typewriter" as const,
            cursorType: "bar" as const,
            scrollEffect: "smooth" as const,

            exportFormat: "webm" as const,
            captureMode: "editor" as const,
            aspectRatio: "16:9" as const,

            mp4Quality: "medium" as const,
            mp4Preset: "ultrafast" as const,
            mp4Resolution: "original" as const,
            saveWebmBackup: true,

            // Actions de base
            setCode: (code: string) => set({ code }),
            setIsSimulating: (isSimulating: boolean) => set({ isSimulating }),
            setShowVideoPreview: (showVideoPreview: boolean) => set({ showVideoPreview }),
            setRecordedBlob: (recordedBlob: Blob | null) => set({ recordedBlob }),
            setVideoPreviewUrl: (videoPreviewUrl: string | null) => set({ videoPreviewUrl }),
            setCurrentFileName: (currentFileName: string) => set({ currentFileName }),

            // Actions de navigation
            startSimulation: () => set({
                isSimulating: true,
                showVideoPreview: false
            }),
            stopSimulation: () => set({ isSimulating: false }),
            showPreview: () => set({
                showVideoPreview: true,
                isSimulating: false
            }),
            hidePreview: () => set({ showVideoPreview: false }),
            resetToEditor: () => set({
                isSimulating: false,
                showVideoPreview: false,
                recordedBlob: null,
                videoPreviewUrl: null
            }),

            // Actions paramètres
            updateSpeed: (speed: number) => set({ speed }),
            updateAutoStart: (autoStart: boolean) => set({ autoStart }),
            updateLoopEnabled: (isLoopEnabled: boolean) => set({ isLoopEnabled }),
            updateDisplayEffect: (displayEffect: "typewriter" | "word" | "line" | "block" | "instant") => set({ displayEffect }),
            updateCursorType: (cursorType: "none" | "bar" | "block" | "underline" | "outline") => set({ cursorType }),
            updateScrollEffect: (scrollEffect: "none" | "instant" | "smooth" | "center") => set({ scrollEffect }),

            // Actions enregistrement
            updateExportFormat: (exportFormat: "webm" | "mp4") => set({ exportFormat }),
            updateCaptureMode: (captureMode: "screen" | "editor") => set({ captureMode }),
            updateAspectRatio: (aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9") => set({ aspectRatio }),

            // Actions MP4
            updateMp4Quality: (mp4Quality: "high" | "medium" | "fast") => set({ mp4Quality }),
            updateMp4Preset: (mp4Preset: "ultrafast" | "fast" | "medium") => set({ mp4Preset }),
            updateMp4Resolution: (mp4Resolution: "original" | "1080p" | "720p") => set({ mp4Resolution }),
            updateSaveWebmBackup: (saveWebmBackup: boolean) => set({ saveWebmBackup }),
        }),
        {
            name: 'code-video-forge-store',
            partialize: (state) => {
                // Ne sauvegarder le code que s'il est différent du code par défaut
                const shouldSaveCode = state.code !== defaultCode || state.currentFileName !== "typing-demo.py";

                return {
                    // Persister seulement les paramètres importants
                    speed: state.speed,
                    autoStart: state.autoStart,
                    isLoopEnabled: state.isLoopEnabled,
                    displayEffect: state.displayEffect,
                    cursorType: state.cursorType,
                    scrollEffect: state.scrollEffect,
                    exportFormat: state.exportFormat,
                    captureMode: state.captureMode,
                    aspectRatio: state.aspectRatio,
                    mp4Quality: state.mp4Quality,
                    mp4Preset: state.mp4Preset,
                    mp4Resolution: state.mp4Resolution,
                    saveWebmBackup: state.saveWebmBackup,
                    // Toujours sauvegarder le nom de fichier
                    currentFileName: state.currentFileName,
                    // Sauvegarder le code seulement si c'est du code utilisateur
                    ...(shouldSaveCode && { code: state.code }),
                };
            },
            onRehydrateStorage: () => (state) => {
                // Restaurer l'état depuis localStorage
                if (state) {
                    console.log('🔄 Restauration depuis localStorage:', {
                        hasUserCode: !!state.code,
                        fileName: state.currentFileName
                    });

                    // Si aucun code n'est trouvé dans localStorage, utiliser le code par défaut
                    if (!state.code) {
                        state.code = defaultCode;
                    }

                    // Si aucun nom de fichier n'est trouvé, utiliser le nom par défaut
                    if (!state.currentFileName) {
                        state.currentFileName = "typing-demo.py";
                    }
                }
                return state;
            },
        }
    )
);

// Selectors pour optimiser les re-renders
export const useForgeCode = () => useForgeStore((state) => state.code);
export const useForgeCurrentFileName = () => useForgeStore((state) => state.currentFileName);
export const useForgeSimulationState = () => useForgeStore((state) => ({
    isSimulating: state.isSimulating,
    showVideoPreview: state.showVideoPreview,
}));
export const useForgeVideoState = () => useForgeStore((state) => ({
    recordedBlob: state.recordedBlob,
    videoPreviewUrl: state.videoPreviewUrl,
}));
export const useForgeTypingSettings = () => useForgeStore((state) => ({
    speed: state.speed,
    autoStart: state.autoStart,
    isLoopEnabled: state.isLoopEnabled,
    displayEffect: state.displayEffect,
    cursorType: state.cursorType,
    scrollEffect: state.scrollEffect,
}));
export const useForgeRecordingSettings = () => useForgeStore((state) => ({
    exportFormat: state.exportFormat,
    captureMode: state.captureMode,
    aspectRatio: state.aspectRatio,
}));
export const useForgeMp4Settings = () => useForgeStore((state) => ({
    mp4Quality: state.mp4Quality,
    mp4Preset: state.mp4Preset,
    mp4Resolution: state.mp4Resolution,
    saveWebmBackup: state.saveWebmBackup,
}));
