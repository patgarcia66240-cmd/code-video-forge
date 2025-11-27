import { useState, useEffect, useCallback, useRef } from "react";
import { VideoConverter, createConversionOptions, createScaleOption, ConversionProgress } from "@/core/converter/videoConverter";
import { useToast } from "@/hooks/use-toast";

interface UseVideoConverterProps {
    addLog: (message: string) => void;
    onVideoRecorded?: (blob: Blob) => void;
}

export const useVideoConverter = ({ addLog, onVideoRecorded }: UseVideoConverterProps) => {
    const [isConverting, setIsConverting] = useState(false);
    const [conversionProgress, setConversionProgress] = useState(0);

    const [exportFormat, setExportFormat] = useState<"webm" | "mp4">(() => {
        const saved = localStorage.getItem("typingSimulatorExportFormat");
        return (saved as "webm" | "mp4") || "webm";
    });

    const [mp4Quality, setMp4Quality] = useState<"high" | "medium" | "fast">(() => {
        const saved = localStorage.getItem("typingSimulatorMp4Quality");
        return (saved as "high" | "medium" | "fast") || "medium";
    });

    const [mp4Preset, setMp4Preset] = useState<"ultrafast" | "fast" | "medium">(() => {
        const saved = localStorage.getItem("typingSimulatorMp4Preset");
        return (saved as "ultrafast" | "fast" | "medium") || "ultrafast";
    });

    const [mp4Resolution, setMp4Resolution] = useState<"original" | "1080p" | "720p">(() => {
        const saved = localStorage.getItem("typingSimulatorMp4Resolution");
        return (saved as "original" | "1080p" | "720p") || "original";
    });

    const [saveWebmBackup, setSaveWebmBackup] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorSaveWebmBackup");
        return saved ? JSON.parse(saved) : true;
    });

    const { toast } = useToast();
    const videoConverterRef = useRef<VideoConverter | null>(null);

    // Initialize video converter
    useEffect(() => {
        videoConverterRef.current = new VideoConverter();
        return () => {
            videoConverterRef.current?.destroy();
        };
    }, []);

    useEffect(() => { localStorage.setItem("typingSimulatorExportFormat", exportFormat); }, [exportFormat]);
    useEffect(() => { localStorage.setItem("typingSimulatorMp4Quality", mp4Quality); }, [mp4Quality]);
    useEffect(() => { localStorage.setItem("typingSimulatorMp4Preset", mp4Preset); }, [mp4Preset]);
    useEffect(() => { localStorage.setItem("typingSimulatorMp4Resolution", mp4Resolution); }, [mp4Resolution]);
    useEffect(() => { localStorage.setItem("typingSimulatorSaveWebmBackup", JSON.stringify(saveWebmBackup)); }, [saveWebmBackup]);

    const convertVideo = useCallback(async (webmBlob: Blob) => {
        // If WebM format, just return the blob
        if (exportFormat === "webm") {
            onVideoRecorded?.(webmBlob);
            addLog("Mode WebM : aucun traitement supplémentaire, prêt à télécharger.");
            toast({
                title: "Vidéo prête !",
                description: "Votre vidéo WebM est prête à être téléchargée",
            });
            return webmBlob;
        }

        // Save WebM backup if enabled
        if (saveWebmBackup) {
            addLog("Sauvegarde du WebM de secours avant conversion...");
            const url = URL.createObjectURL(webmBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `code-typing-backup-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            addLog("Backup WebM téléchargé automatiquement.");
        }

        // Convert to MP4
        toast({
            title: "Conversion en MP4",
            description: "Conversion de la vidéo en cours...",
        });
        addLog("Démarrage de la conversion MP4 via FFmpeg...");

        try {
            if (!videoConverterRef.current) {
                throw new Error("Convertisseur vidéo non initialisé");
            }

            setIsConverting(true);
            setConversionProgress(0);

            // Créer les options de conversion à partir des paramètres utilisateur
            const qualityOptions = createConversionOptions(mp4Quality);
            const scaleOption = createScaleOption(mp4Resolution);

            const conversionOptions = {
                ...qualityOptions,
                preset: mp4Preset,
                scale: scaleOption
            };

            // Effectuer la conversion
            const result = await videoConverterRef.current.convertWebMToMP4(
                webmBlob,
                conversionOptions,
                (progress: ConversionProgress) => {
                    setConversionProgress(progress.progress);
                    addLog(`${progress.message}`);
                }
            );

            onVideoRecorded?.(result.blob);
            setIsConverting(false);
            setConversionProgress(0);
            addLog(`Conversion MP4 terminée avec succès (${(result.size / 1024 / 1024).toFixed(2)} MB).`);

            toast({
                title: "Vidéo prête !",
                description: "Votre vidéo MP4 est prête à être téléchargée",
            });

            return result.blob;
        } catch (error) {
            console.error("Erreur lors de la conversion:", error);
            setIsConverting(false);
            setConversionProgress(0);
            addLog("Erreur lors de la conversion MP4. Fallback en WebM.");

            // Fallback to WebM
            onVideoRecorded?.(webmBlob);

            toast({
                title: "Conversion échouée",
                description: "Vidéo sauvegardée en WebM",
                variant: "destructive",
            });

            return webmBlob;
        }
    }, [exportFormat, saveWebmBackup, mp4Quality, mp4Preset, mp4Resolution, addLog, onVideoRecorded, toast]);

    const cancelConversion = useCallback(async () => {
        if (!videoConverterRef.current) return;

        addLog("Annulation de la conversion demandée...");
        try {
            await videoConverterRef.current.cancelConversion();
            setIsConverting(false);
            setConversionProgress(0);
            addLog("Conversion annulée.");

            toast({
                title: "Conversion annulée",
                description: "La conversion MP4 a été interrompue",
                variant: "destructive",
            });
        } catch (error) {
            console.error("Erreur lors de l'annulation:", error);
            addLog("Erreur lors de l'annulation de la conversion.");
        }
    }, [addLog, toast]);

    return {
        isConverting,
        conversionProgress,
        exportFormat,
        setExportFormat,
        mp4Quality,
        setMp4Quality,
        mp4Preset,
        setMp4Preset,
        mp4Resolution,
        setMp4Resolution,
        saveWebmBackup,
        setSaveWebmBackup,
        convertVideo,
        cancelConversion,
    };
};
