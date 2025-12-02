/// <reference lib="webworker" />

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Interface pour les messages du worker
interface WorkerMessage {
    type: 'convert' | 'cancel';
    webmBlob?: Blob;
    options?: ConversionOptions;
    id?: string;
}

interface ConversionOptions {
    preset?: 'ultrafast' | 'fast' | 'medium';
    crf?: number;
    scale?: string | null;
    preserveAudio?: boolean;
}

interface WorkerResponse {
    type: 'progress' | 'success' | 'error' | 'cancelled';
    progress?: number;
    blob?: Blob;
    error?: string;
    id?: string;
}

// Instance FFmpeg partagée
let ffmpeg: FFmpeg | null = null;
let isLoading = false;
let currentConversionId: string | null = null;

// Fonction pour charger FFmpeg dans le worker
const loadFFmpeg = async (): Promise<FFmpeg> => {
    if (ffmpeg) {
        return ffmpeg;
    }

    if (isLoading) {
        // Attendre que le chargement en cours se termine
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (ffmpeg) return ffmpeg;
    }

    isLoading = true;

    try {
        const ffmpegInstance = new FFmpeg();

        // Logs pour débogage (optionnel - peut être désactivé en prod)
        ffmpegInstance.on("log", ({ message }) => {
            console.log("[FFmpeg Worker]", message);
        });

        ffmpegInstance.on("progress", ({ progress }) => {
            // Envoyer la progression au thread principal
            const progressMessage: WorkerResponse = {
                type: 'progress',
                progress: Math.round(progress * 100),
                id: currentConversionId || undefined
            };
            self.postMessage(progressMessage);
        });

        console.log("[FFmpeg Worker] Chargement démarré...");

        // Charger FFmpeg depuis unpkg (même version que dans le code principal)
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

        await ffmpegInstance.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
        });

        console.log("[FFmpeg Worker] Chargement terminé");
        ffmpeg = ffmpegInstance;
        return ffmpegInstance;
    } catch (error) {
        console.error("[FFmpeg Worker] Erreur de chargement:", error);
        throw error;
    } finally {
        isLoading = false;
    }
};

// Fonction de conversion dans le worker
const convertWebMToMP4 = async (
    webmBlob: Blob,
    options: ConversionOptions = {},
    conversionId: string
): Promise<Blob> => {
    const { preset = 'ultrafast', crf = 28, scale = null, preserveAudio = true } = options;

    console.log("[Worker Convert] Démarrage conversion, taille:", webmBlob.size);

    const ffmpegInstance = await loadFFmpeg();

    currentConversionId = conversionId;

    try {
        console.log("[Worker Convert] Écriture du fichier d'entrée...");

        // Écrire le fichier d'entrée
        await ffmpegInstance.writeFile("input.webm", await fetchFile(webmBlob));

        console.log("[Worker Convert] Conversion en MP4...");
        console.log(`[Worker Convert] Paramètres: preset=${preset}, crf=${crf}, scale=${scale || 'original'}, preserveAudio=${preserveAudio}`);

        // Analyser le fichier d'entrée pour vérifier l'audio
        console.log("[Worker Convert] Analyse du fichier WebM d'entrée...");

        // D'abord, analyser le fichier pour voir s'il contient de l'audio
        const analyzeArgs = ["-i", "input.webm"];
        await ffmpegInstance.exec(analyzeArgs);

        // Construire les arguments FFmpeg
        const ffmpegArgs = [
            "-i", "input.webm",
            "-c:v", "libx264",
            "-preset", preset,
            "-crf", crf.toString(),
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
        ];

        // Ajouter le support audio si demandé
        if (preserveAudio) {
            ffmpegArgs.push("-c:a", "aac");  // Convertir en AAC
            ffmpegArgs.push("-b:a", "128k");  // Bitrate audio de 128kbps
            ffmpegArgs.push("-ar", "44100");  // Sample rate standard
            ffmpegArgs.push("-ac", "2");      // Audio stéréo
            console.log("[Worker Convert] ✅ Support audio activé avec codec AAC (128kbps, 44.1kHz, stéréo)");
        } else {
            ffmpegArgs.push("-an");  // Ne pas inclure l'audio
            console.log("[Worker Convert] ❌ Audio désactivé par paramètre");
        }

        // Ajouter le filtre de résolution si demandé
        if (scale) {
            ffmpegArgs.push("-vf", scale);
        }

        ffmpegArgs.push("output.mp4");

        // Convertir en MP4
        await ffmpegInstance.exec(ffmpegArgs);

        console.log("[Worker Convert] Lecture du fichier de sortie...");

        // Lire le fichier de sortie
        const data = await ffmpegInstance.readFile("output.mp4");

        console.log("[Worker Convert] Nettoyage...");

        // Nettoyer les fichiers temporaires
        await ffmpegInstance.deleteFile("input.webm");
        await ffmpegInstance.deleteFile("output.mp4");

        console.log("[Worker Convert] Création du Blob MP4...");

        // Créer le blob de sortie
        if (data instanceof Uint8Array) {
            const buffer = new ArrayBuffer(data.length);
            const view = new Uint8Array(buffer);
            view.set(data);
            console.log("[Worker Convert] ✅ Conversion terminée, taille MP4:", buffer.byteLength);

            // Analyse finale du MP4 pour vérifier l'audio
            if (preserveAudio) {
                console.log("[Worker Convert] 🔍 Vérification finale: conversion audio activée terminée");
                console.log("[Worker Convert] ✅ Le fichier MP4 devrait contenir l'audio (AAC 128kbps)");
            } else {
                console.log("[Worker Convert] ℹ️ Le fichier MP4 ne contient pas d'audio (option désactivée)");
            }

            return new Blob([buffer], { type: "video/mp4" });
        } else {
            const encoder = new TextEncoder();
            return new Blob([encoder.encode(data as string)], { type: "video/mp4" });
        }
    } finally {
        currentConversionId = null;
    }
};

// Gestionnaire de messages du worker
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    const { type, webmBlob, options, id } = e.data;

    try {
        if (type === 'convert') {
            if (!webmBlob || !options) {
                throw new Error("Paramètres manquants pour la conversion");
            }

            const conversionId = id || `conversion-${Date.now()}`;
            const mp4Blob = await convertWebMToMP4(webmBlob, options, conversionId);

            const successMessage: WorkerResponse = {
                type: 'success',
                blob: mp4Blob,
                id: conversionId
            };

            self.postMessage(successMessage);

        } else if (type === 'cancel') {
            if (ffmpeg) {
                console.log("[FFmpeg Worker] Annulation demandée...");
                currentConversionId = null;

                // Terminer FFmpeg si nécessaire
                try {
                    await ffmpeg.terminate();
                    ffmpeg = null;
                } catch (error) {
                    console.error("[FFmpeg Worker] Erreur lors de l'annulation:", error);
                }

                const cancelMessage: WorkerResponse = {
                    type: 'cancelled',
                    id: id
                };

                self.postMessage(cancelMessage);
            }
        }
    } catch (error) {
        console.error("[FFmpeg Worker] Erreur:", error);

        const errorMessage: WorkerResponse = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            id: id
        };

        self.postMessage(errorMessage);
    }
};
