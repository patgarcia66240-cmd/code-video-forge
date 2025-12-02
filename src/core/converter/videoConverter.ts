/**
 * Convertisseur vidéo - logique pure indépendante de React
 * Classe testable unitairement
 */

export interface VideoConversionOptions {
    preset?: 'ultrafast' | 'fast' | 'medium';
    crf?: number; // 0-51, qualité (plus bas = meilleure qualité)
    scale?: string | null; // format: "scale=-2:1080" pour 1080p, etc.
    format?: 'mp4' | 'webm';
    audioCodec?: string;
    videoCodec?: string;
    preserveAudio?: boolean; // Nouvelle option pour préserver l'audio
}

export interface ConversionResult {
    blob: Blob;
    duration: number; // en millisecondes
    size: number; // en octets
    format: string;
}

export interface ConversionProgress {
    stage: 'loading' | 'converting' | 'finalizing';
    progress: number; // 0-100
    message: string;
}

export class VideoConverter {
    private worker: Worker | null = null;
    private isConverting = false;
    private currentConversionId: string | null = null;

    constructor() {
        this.initializeWorker();
    }

    /**
     * Initialise le Web Worker pour les conversions
     */
    private initializeWorker(): void {
        if (this.worker) return;

        try {
            this.worker = new Worker(new URL('../../workers/ffmpeg.worker.ts', import.meta.url), {
                type: 'module'
            });
        } catch (error) {
            console.error("[VideoConverter] Erreur lors de l'initialisation du worker:", error);
            throw new Error("Impossible d'initialiser le convertisseur vidéo");
        }
    }

    /**
     * Convertit une vidéo WebM en MP4
     */
    async convertWebMToMP4(
        webmBlob: Blob,
        options: VideoConversionOptions = {},
        onProgress?: (progress: ConversionProgress) => void
    ): Promise<ConversionResult> {
        if (this.isConverting) {
            throw new Error("Une conversion est déjà en cours");
        }

        if (!this.worker) {
            throw new Error("Worker non initialisé");
        }

        const startTime = Date.now();
        this.isConverting = true;
        this.currentConversionId = `conversion-${Date.now()}`;

        return new Promise((resolve, reject) => {
            const handleWorkerMessage = (e: MessageEvent<any>) => {
                const { type, progress, blob, error, id } = e.data;

                // Vérifier que le message correspond à notre conversion
                if (id !== this.currentConversionId) return;

                switch (type) {
                    case 'progress':
                        if (onProgress && progress !== undefined) {
                            onProgress({
                                stage: 'converting',
                                progress: Math.round(progress),
                                message: `Conversion en cours: ${Math.round(progress)}%`
                            });
                        }
                        break;

                    case 'success':
                        if (blob) {
                            this.worker!.removeEventListener('message', handleWorkerMessage);
                            this.isConverting = false;
                            this.currentConversionId = null;

                            const result: ConversionResult = {
                                blob,
                                duration: Date.now() - startTime,
                                size: blob.size,
                                format: 'video/mp4'
                            };

                            if (onProgress) {
                                onProgress({
                                    stage: 'finalizing',
                                    progress: 100,
                                    message: 'Conversion terminée'
                                });
                            }

                            resolve(result);
                        } else {
                            this.worker!.removeEventListener('message', handleWorkerMessage);
                            this.isConverting = false;
                            this.currentConversionId = null;
                            reject(new Error("Aucun blob reçu du worker"));
                        }
                        break;

                    case 'error':
                        this.worker!.removeEventListener('message', handleWorkerMessage);
                        this.isConverting = false;
                        this.currentConversionId = null;
                        reject(new Error(error || "Erreur lors de la conversion"));
                        break;
                }
            };

            this.worker.addEventListener('message', handleWorkerMessage);

            // Démarrer la conversion
            if (onProgress) {
                onProgress({
                    stage: 'loading',
                    progress: 0,
                    message: 'Initialisation de la conversion...'
                });
            }

            const convertMessage = {
                type: 'convert',
                webmBlob,
                options: {
                    preset: options.preset || 'ultrafast',
                    crf: options.crf || 28,
                    scale: options.scale || null,
                    preserveAudio: options.preserveAudio !== false // par défaut true
                },
                id: this.currentConversionId
            };

            this.worker.postMessage(convertMessage);
        });
    }

    /**
     * Annule la conversion en cours
     */
    async cancelConversion(): Promise<void> {
        if (!this.worker || !this.isConverting) return;

        return new Promise((resolve) => {
            const cancelId = `cancel-${Date.now()}`;

            const handleCancelResponse = (e: MessageEvent<any>) => {
                if (e.data.type === 'cancelled' && e.data.id === cancelId) {
                    this.worker!.removeEventListener('message', handleCancelResponse);
                    this.isConverting = false;
                    this.currentConversionId = null;
                    resolve();
                }
            };

            this.worker.addEventListener('message', handleCancelResponse);

            const cancelMessage = {
                type: 'cancel',
                id: cancelId
            };

            this.worker.postMessage(cancelMessage);
        });
    }

    /**
     * Vérifie si le convertisseur est disponible
     */
    isAvailable(): boolean {
        return !!this.worker && typeof Worker !== 'undefined';
    }

    /**
     * Retourne l'état actuel du convertisseur
     */
    getState(): {
        isConverting: boolean;
        currentConversionId: string | null;
    } {
        return {
            isConverting: this.isConverting,
            currentConversionId: this.currentConversionId
        };
    }

    /**
     * Nettoie les ressources
     */
    destroy(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.isConverting = false;
        this.currentConversionId = null;
    }
}

// Fonction utilitaire pour créer une instance de convertisseur
export function createVideoConverter(): VideoConverter {
    return new VideoConverter();
}

// Fonctions utilitaires pour les options de conversion
export function createConversionOptions(quality: 'high' | 'medium' | 'fast' = 'medium', preserveAudio: boolean = true): VideoConversionOptions {
    const qualitySettings = {
        high: { preset: 'medium' as const, crf: 18 },
        medium: { preset: 'fast' as const, crf: 23 },
        fast: { preset: 'ultrafast' as const, crf: 28 }
    };

    return {
        ...qualitySettings[quality],
        preserveAudio
    };
}

export function createScaleOption(resolution: 'original' | '1080p' | '720p' | '480p'): string | null {
    const scaleOptions = {
        original: null,
        '1080p': 'scale=-2:1080',
        '720p': 'scale=-2:720',
        '480p': 'scale=-2:480'
    };

    return scaleOptions[resolution];
}
