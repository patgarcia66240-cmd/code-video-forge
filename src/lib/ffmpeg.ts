import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // Attendre que le chargement en cours se termine
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (ffmpegInstance) {
          clearInterval(checkInterval);
          resolve(ffmpegInstance);
        }
      }, 100);
    });
    return ffmpegInstance!;
  }

  isLoading = true;
  const ffmpeg = new FFmpeg();

  try {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegInstance = ffmpeg;
    isLoading = false;
    return ffmpeg;
  } catch (error) {
    isLoading = false;
    throw error;
  }
};

export const convertWebMToMP4 = async (webmBlob: Blob): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();

  // Écrire le fichier d'entrée
  await ffmpeg.writeFile("input.webm", await fetchFile(webmBlob));

  // Convertir en MP4 avec de bons paramètres
  await ffmpeg.exec([
    "-i", "input.webm",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "23",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "output.mp4"
  ]);

  // Lire le fichier de sortie
  const data = await ffmpeg.readFile("output.mp4");
  
  // Nettoyer les fichiers temporaires
  await ffmpeg.deleteFile("input.webm");
  await ffmpeg.deleteFile("output.mp4");

  // Créer un ArrayBuffer standard à partir du FileData
  if (data instanceof Uint8Array) {
    // Créer un nouveau ArrayBuffer et copier les données
    const buffer = new ArrayBuffer(data.length);
    const view = new Uint8Array(buffer);
    view.set(data);
    return new Blob([buffer], { type: "video/mp4" });
  } else {
    // Si c'est une string, la convertir
    const encoder = new TextEncoder();
    return new Blob([encoder.encode(data as string)], { type: "video/mp4" });
  }
};
