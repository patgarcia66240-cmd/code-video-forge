import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Interface pour les messages du worker
interface WorkerMessage {
  type: 'convert' | 'cancel';
  webmBlob?: Blob;
  options?: ConversionOptions;
  id?: string;
}

interface WorkerResponse {
  type: 'progress' | 'success' | 'error' | 'cancelled';
  progress?: number;
  blob?: Blob;
  error?: string;
  id?: string;
}

// Instance du worker FFmpeg
let ffmpegWorker: Worker | null = null;
let isWorkerLoading = false;

// Fonction pour obtenir/initialiser le worker
const getFFmpegWorker = (): Worker => {
  if (ffmpegWorker) {
    return ffmpegWorker;
  }

  if (isWorkerLoading) {
    // Attendre que le worker soit prêt
    while (isWorkerLoading) {
      // Busy wait - en pratique, cela devrait être géré différemment
      // mais pour la simplicité, on garde cette approche
    }
    if (ffmpegWorker) return ffmpegWorker;
  }

  isWorkerLoading = true;

  try {
    console.log("[FFmpeg] Initialisation du worker...");
    ffmpegWorker = new Worker(new URL('../workers/ffmpeg.worker.ts', import.meta.url), {
      type: 'module'
    });
    console.log("[FFmpeg] Worker initialisé");
    return ffmpegWorker;
  } catch (error) {
    console.error("[FFmpeg] Erreur lors de l'initialisation du worker:", error);
    throw error;
  } finally {
    isWorkerLoading = false;
  }
};

// Fonction de compatibilité pour l'ancien code (maintenant obsolète)
export const loadFFmpeg = async (): Promise<FFmpeg> => {
  throw new Error("FFmpeg est maintenant exécuté dans un Web Worker. Utilisez convertWebMToMP4 directement.");
};

export const cancelConversion = async (): Promise<void> => {
  const worker = getFFmpegWorker();

  return new Promise((resolve) => {
    const cancelId = `cancel-${Date.now()}`;

    const handleCancelResponse = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === 'cancelled' && e.data.id === cancelId) {
        worker.removeEventListener('message', handleCancelResponse);
        console.log("[FFmpeg] Annulation envoyée au worker");
        resolve();
      }
    };

    worker.addEventListener('message', handleCancelResponse);

    const cancelMessage: WorkerMessage = {
      type: 'cancel',
      id: cancelId
    };

    worker.postMessage(cancelMessage);
  });
};

export interface ConversionOptions {
  preset?: 'ultrafast' | 'fast' | 'medium';
  crf?: number;
  scale?: string | null;
}

export const convertWebMToMP4 = async (
  webmBlob: Blob,
  options: ConversionOptions = {},
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const { preset = 'ultrafast', crf = 28, scale = null } = options;
  console.log("[Convert] Démarrage conversion via worker, taille:", webmBlob.size);

  const worker = getFFmpegWorker();
  const conversionId = `conversion-${Date.now()}`;

  return new Promise((resolve, reject) => {
    const handleWorkerMessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, progress, blob, error, id } = e.data;

      // Vérifier que le message correspond à notre conversion
      if (id !== conversionId) return;

      switch (type) {
        case 'progress':
          if (onProgress && progress !== undefined) {
            console.log(`[Worker Progress] ${progress}%`);
            onProgress(progress);
          }
          break;

        case 'success':
          if (blob) {
            worker.removeEventListener('message', handleWorkerMessage);
            console.log("[Convert] Conversion terminée via worker, taille MP4:", blob.size);
            resolve(blob);
          } else {
            worker.removeEventListener('message', handleWorkerMessage);
            reject(new Error("Aucun blob reçu du worker"));
          }
          break;

        case 'error':
          worker.removeEventListener('message', handleWorkerMessage);
          console.error("[Convert] Erreur du worker:", error);
          reject(new Error(error || "Erreur lors de la conversion"));
          break;

        case 'cancelled':
          worker.removeEventListener('message', handleWorkerMessage);
          console.log("[Convert] Conversion annulée");
          reject(new Error("Conversion annulée"));
          break;
      }
    };

    worker.addEventListener('message', handleWorkerMessage);

    // Envoyer le message de conversion au worker
    const convertMessage: WorkerMessage = {
      type: 'convert',
      webmBlob,
      options: { preset, crf, scale },
      id: conversionId
    };

    console.log("[Convert] Envoi de la conversion au worker...");
    worker.postMessage(convertMessage);
  });
};
