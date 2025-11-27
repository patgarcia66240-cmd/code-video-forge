/**
 * Enregistreur d'écran - logique pure indépendante de React
 * Classe testable unitairement
 */

export interface RecordingOptions {
    mimeType?: string;
    audio?: boolean;
    video?: boolean;
    width?: number;
    height?: number;
    frameRate?: number;
}

export interface RecordingState {
    isRecording: boolean;
    isPaused: boolean;
    duration: number; // en millisecondes
    startTime?: number;
    pauseTime?: number;
    totalPausedTime: number; // temps total en pause
}

export class ScreenRecorder {
    private recorder: RecordRTC | null = null; // RecordRTC instance
    private stream: MediaStream | null = null;
    private state: RecordingState;
    private chunks: Blob[] = [];

    constructor(options: RecordingOptions = {}) {
        this.state = {
            isRecording: false,
            isPaused: false,
            duration: 0,
            totalPausedTime: 0
        };
    }

    /**
     * Démarre l'enregistrement d'écran
     */
    async startRecording(options: RecordingOptions = {}): Promise<MediaStream> {
        if (this.state.isRecording) {
            throw new Error("Enregistrement déjà en cours");
        }

        try {
            // Demander l'autorisation d'accès à l'écran
            const displayMediaOptions: DisplayMediaStreamOptions = {
                video: {
                    width: options.width || 1920,
                    height: options.height || 1080,
                    frameRate: options.frameRate || 30
                },
                audio: options.audio !== false // audio par défaut activé
            };

            this.stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

            // Créer l'enregistreur RecordRTC
            this.recorder = new RecordRTC(this.stream, {
                type: 'video',
                mimeType: options.mimeType || 'video/webm',
                disableLogs: false, // logs pour le développement
                timeSlice: 1000, // callback chaque seconde
                ondataavailable: (blob: Blob) => {
                    this.chunks.push(blob);
                }
            });

            // Démarrer l'enregistrement
            this.recorder.startRecording();

            // Mettre à jour l'état
            this.state.isRecording = true;
            this.state.isPaused = false;
            this.state.startTime = Date.now();
            this.state.pauseTime = undefined;
            this.state.totalPausedTime = 0;
            this.chunks = [];

            return this.stream;
        } catch (error) {
            console.error("[ScreenRecorder] Erreur lors du démarrage:", error);
            throw new Error(`Impossible de démarrer l'enregistrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Arrête l'enregistrement et retourne le blob vidéo
     */
    async stopRecording(): Promise<Blob> {
        if (!this.state.isRecording) {
            throw new Error("Aucun enregistrement en cours");
        }

        if (!this.recorder) {
            throw new Error("Enregistreur non initialisé");
        }

        return new Promise((resolve, reject) => {
            this.recorder!.onstop = () => {
                try {
                    // Créer le blob final à partir des chunks
                    const finalBlob = new Blob(this.chunks, {
                        type: this.recorder!.getBlob().type
                    });

                    // Nettoyer
                    this.cleanup();

                    resolve(finalBlob);
                } catch (error) {
                    reject(error);
                }
            };

            this.recorder!.onerror = (error) => {
                reject(error);
            };

            // Arrêter l'enregistrement
            this.recorder!.stopRecording(() => {
                // Callback appelé quand l'arrêt est terminé
                console.log("[ScreenRecorder] Enregistrement arrêté");
            });
        });
    }

    /**
     * Met en pause l'enregistrement
     */
    pauseRecording(): void {
        if (!this.state.isRecording || this.state.isPaused) {
            return;
        }

        if (this.recorder) {
            this.recorder.pauseRecording();
            this.state.isPaused = true;
            this.state.pauseTime = Date.now();
        }
    }

    /**
     * Reprend l'enregistrement après une pause
     */
    resumeRecording(): void {
        if (!this.state.isRecording || !this.state.isPaused) {
            return;
        }

        if (this.recorder && this.state.pauseTime) {
            this.recorder.resumeRecording();
            this.state.isPaused = false;
            this.state.totalPausedTime += Date.now() - this.state.pauseTime;
            this.state.pauseTime = undefined;
        }
    }

    /**
     * Annule l'enregistrement en cours
     */
    cancelRecording(): void {
        if (this.recorder && this.state.isRecording) {
            this.recorder.stopRecording();
        }
        this.cleanup();
    }

    /**
     * Retourne l'état actuel de l'enregistrement
     */
    getState(): RecordingState {
        // Calculer la durée actuelle
        if (this.state.startTime && this.state.isRecording) {
            const now = Date.now();
            const pausedTime = this.state.isPaused && this.state.pauseTime
                ? now - this.state.pauseTime
                : 0;

            this.state.duration = (now - this.state.startTime) - this.state.totalPausedTime - pausedTime;
        }

        return { ...this.state };
    }

    /**
     * Retourne les informations sur le stream actuel
     */
    getStreamInfo(): {
        hasVideo: boolean;
        hasAudio: boolean;
        width?: number;
        height?: number;
    } | null {
        if (!this.stream) {
            return null;
        }

        const videoTrack = this.stream.getVideoTracks()[0];
        const audioTrack = this.stream.getAudioTracks()[0];

        const settings = videoTrack?.getSettings();

        return {
            hasVideo: !!videoTrack,
            hasAudio: !!audioTrack,
            width: settings?.width,
            height: settings?.height
        };
    }

    /**
     * Vérifie si l'enregistrement est supporté
     */
    static isSupported(): boolean {
        return !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getDisplayMedia &&
            typeof RecordRTC !== 'undefined'
        );
    }

    /**
     * Nettoie les ressources
     */
    private cleanup(): void {
        // Arrêter tous les tracks du stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }

        // Reset de l'état
        this.state = {
            isRecording: false,
            isPaused: false,
            duration: 0,
            totalPausedTime: 0
        };

        this.recorder = null;
        this.chunks = [];
    }
}

// Types pour RecordRTC (chargé via CDN)
interface RecordRTCOptions {
    type?: string;
    mimeType?: string;
    disableLogs?: boolean;
    timeSlice?: number;
    ondataavailable?: (blob: Blob) => void;
}

declare global {
    class RecordRTC {
        constructor(stream: MediaStream, options?: RecordRTCOptions);
        startRecording(): void;
        stopRecording(callback?: () => void): void;
        pauseRecording(): void;
        resumeRecording(): void;
        getBlob(): Blob;
        onstop?: () => void;
        onerror?: (error: any) => void;
    }
}
