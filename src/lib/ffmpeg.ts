import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  // Utiliser une promesse partagée plutôt qu'un timeout manuel
  // pour éviter les erreurs "FFmpeg loading timeout" lorsque
  // plusieurs conversions démarrent en parallèle.
  let existingLoadPromise = (loadFFmpeg as any)._loadingPromise as Promise<FFmpeg> | undefined;
  if (existingLoadPromise) {
    return existingLoadPromise;
  }

  const loadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    // Logs pour débogage
    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });

    ffmpeg.on("progress", ({ progress }) => {
      console.log("[FFmpeg Progress]", Math.round(progress * 100) + "%");
    });

    try {
      console.log("[FFmpeg] Chargement démarré...");
      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
      });

      console.log("[FFmpeg] Chargement terminé");
      ffmpegInstance = ffmpeg;
      (loadFFmpeg as any)._loadingPromise = undefined;
      return ffmpeg;
    } catch (error) {
      console.error("[FFmpeg] Erreur de chargement:", error);
      (loadFFmpeg as any)._loadingPromise = undefined;
      throw error;
    }
  })();

  (loadFFmpeg as any)._loadingPromise = loadPromise;
  return loadPromise;
};

export const cancelConversion = async (): Promise<void> => {
  if (ffmpegInstance) {
    console.log("[FFmpeg] Annulation de la conversion en cours...");
    try {
      await ffmpegInstance.terminate();
      ffmpegInstance = null;
      (loadFFmpeg as any)._loadingPromise = undefined;
      console.log("[FFmpeg] Instance terminée avec succès");
    } catch (error) {
      console.error("[FFmpeg] Erreur lors de l'annulation:", error);
    }
  }
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
  console.log("[Convert] Démarrage conversion, taille:", webmBlob.size);
  
  const ffmpeg = await loadFFmpeg();

  // Écouter les événements de progression
  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  console.log("[Convert] Écriture du fichier d'entrée...");
  // Écrire le fichier d'entrée
  await ffmpeg.writeFile("input.webm", await fetchFile(webmBlob));

  console.log("[Convert] Conversion en MP4...");
  console.log(`[Convert] Paramètres: preset=${preset}, crf=${crf}, scale=${scale || 'original'}`);
  
  // Construire les arguments FFmpeg
  const ffmpegArgs = [
    "-i", "input.webm",
    "-c:v", "libx264",
    "-preset", preset,
    "-crf", crf.toString(),
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
  ];
  
  // Ajouter le filtre de résolution si demandé
  if (scale) {
    ffmpegArgs.push("-vf", scale);
  }
  
  ffmpegArgs.push("output.mp4");
  
  // Convertir en MP4 avec les paramètres configurés
  await ffmpeg.exec(ffmpegArgs);

  console.log("[Convert] Lecture du fichier de sortie...");
  // Lire le fichier de sortie
  const data = await ffmpeg.readFile("output.mp4");
  
  console.log("[Convert] Nettoyage...");
  // Nettoyer les fichiers temporaires
  await ffmpeg.deleteFile("input.webm");
  await ffmpeg.deleteFile("output.mp4");

  console.log("[Convert] Création du Blob MP4...");
  // Créer un ArrayBuffer standard à partir du FileData
  if (data instanceof Uint8Array) {
    // Créer un nouveau ArrayBuffer et copier les données
    const buffer = new ArrayBuffer(data.length);
    const view = new Uint8Array(buffer);
    view.set(data);
    console.log("[Convert] Conversion terminée, taille MP4:", buffer.byteLength);
    return new Blob([buffer], { type: "video/mp4" });
  } else {
    // Si c'est une string, la convertir
    const encoder = new TextEncoder();
    return new Blob([encoder.encode(data as string)], { type: "video/mp4" });
  }
};
