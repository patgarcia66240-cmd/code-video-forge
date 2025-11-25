import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // Attendre que le chargement en cours se termine avec timeout
    await new Promise((resolve, reject) => {
      let elapsed = 0;
      const checkInterval = setInterval(() => {
        elapsed += 100;
        if (ffmpegInstance) {
          clearInterval(checkInterval);
          resolve(ffmpegInstance);
        }
        if (elapsed > 30000) { // Timeout après 30s
          clearInterval(checkInterval);
          reject(new Error("FFmpeg loading timeout"));
        }
      }, 100);
    });
    return ffmpegInstance!;
  }

  isLoading = true;
  const ffmpeg = new FFmpeg();

  // Ajouter des logs pour déboguer
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
    });

    console.log("[FFmpeg] Chargement terminé");
    ffmpegInstance = ffmpeg;
    isLoading = false;
    return ffmpeg;
  } catch (error) {
    console.error("[FFmpeg] Erreur de chargement:", error);
    isLoading = false;
    throw error;
  }
};

export const convertWebMToMP4 = async (
  webmBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
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
  // Convertir en MP4 avec de bons paramètres
  await ffmpeg.exec([
    "-i", "input.webm",
    "-c:v", "libx264",
    "-preset", "ultrafast", // Plus rapide
    "-crf", "28", // Compression plus rapide
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "output.mp4"
  ]);

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
