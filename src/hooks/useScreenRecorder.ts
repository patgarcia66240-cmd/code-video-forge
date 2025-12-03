import { useState, useRef, useEffect, useCallback } from "react";
import { ScreenRecorder } from "@/core/recording/screenRecorder";
import { useToast } from "@/hooks/use-toast";

interface UseScreenRecorderProps {
    addLog: (message: string) => void;
    onVideoRecorded?: (blob: Blob) => void;
    audioEnabled?: boolean;
    audioSource?: "microphone" | "system" | "both";
}

export const useScreenRecorder = ({ addLog, onVideoRecorded, audioEnabled = true, audioSource = "microphone" }: UseScreenRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [captureMode, setCaptureMode] = useState<"screen" | "window" | "tab">(() => {
        const saved = localStorage.getItem("typingSimulatorCaptureMode");
        return (saved as "screen" | "window" | "tab") || "tab";
    });

    const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:3" | "21:9">(() => {
        const saved = localStorage.getItem("typingSimulatorAspectRatio");
        return (saved as "16:9" | "9:16" | "1:1" | "4:3" | "21:9") || "16:9";
    });

    const screenRecorderRef = useRef<ScreenRecorder | null>(null);
    const { toast } = useToast();

    // Initialize screen recorder
    useEffect(() => {
        screenRecorderRef.current = new ScreenRecorder();
    }, []);

    useEffect(() => {
        localStorage.setItem("typingSimulatorCaptureMode", captureMode);
    }, [captureMode]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorAspectRatio", aspectRatio);
    }, [aspectRatio]);

    // Handle Escape key to exit fullscreen
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen && (!isRecording || recordedBlob)) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isFullscreen, isRecording, recordedBlob]);

    const stopRecording = useCallback(async () => {
        if (!screenRecorderRef.current) return;

        try {
            addLog("Arrêt de l'enregistrement...");
            const webmBlob = await screenRecorderRef.current.stopRecording();
            setIsRecording(false);

            addLog(`Fichier WebM obtenu (${webmBlob.size} octets)`);

            // Analyser le blob pour vérifier la présence d'audio
            addLog("🔍 Analyse du fichier pour l'audio...");
            const audioAnalysis = await screenRecorderRef.current.analyzeBlobForAudio(webmBlob);

            if (audioAnalysis.hasAudio) {
                addLog(`✅ Audio détecté dans le fichier WebM: ${audioAnalysis.audioCodec || 'codec inconnu'}`);
                if (audioAnalysis.audioBitrate) {
                    addLog(`🎵 Bitrate audio: ${(audioAnalysis.audioBitrate / 1000).toFixed(0)}kbps`);
                }
            } else {
                addLog("❌ Aucun audio détecté dans le fichier WebM");
                if (audioAnalysis.error) {
                    addLog(`⚠️ Erreur d'analyse: ${audioAnalysis.error}`);
                }
            }

            if (captureMode === "tab" && isFullscreen) {
                setIsFullscreen(false);
                addLog("Mode plein écran désactivé");
            }

            setRecordedBlob(webmBlob);
            onVideoRecorded?.(webmBlob);
        } catch (error) {
            console.error("Erreur lors de l'arrêt de l'enregistrement:", error);
            addLog("Erreur lors de l'arrêt de l'enregistrement");
            toast({
                title: "Erreur",
                description: "Impossible d'arrêter l'enregistrement correctement.",
                variant: "destructive",
            });
        }
    }, [addLog, captureMode, isFullscreen, onVideoRecorded, toast]);

    const startRecording = useCallback(async () => {
        if (!screenRecorderRef.current) return;

        try {
            // If tab mode, go fullscreen first
            if (captureMode === "tab" && !isFullscreen) {
                setIsFullscreen(true);
                addLog("Mode plein écran activé pour capture d'onglet");
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            addLog("Demande de partage d'écran...");

            // Démarrer le compte à rebours
            addLog("Lancement du compte à rebours...");
            for (let i = 3; i > 0; i--) {
                setCountdown(i);
                await new Promise((resolve) => setTimeout(resolve, 900));
            }
            setCountdown(null);

            // Attendre suffisamment pour que l'animation de sortie du countdown se termine complètement
            addLog("Attente pour éviter la capture du countdown...");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            addLog("Démarrage de l'enregistrement...");

            // Calculer les dimensions basées sur l'aspect ratio
            const getDimensions = (aspectRatio: string) => {
                switch (aspectRatio) {
                    case "16:9":
                        return { width: 1920, height: 1080 };
                    case "9:16":
                        return { width: 1080, height: 1920 };
                    case "1:1":
                        return { width: 1080, height: 1080 };
                    case "4:3":
                        return { width: 1440, height: 1080 };
                    case "21:9":
                        return { width: 2520, height: 1080 };
                    default:
                        return { width: 1920, height: 1080 };
                }
            };

            const dimensions = getDimensions(aspectRatio);

            const stream = await screenRecorderRef.current.startRecording({
                width: dimensions.width,
                height: dimensions.height,
                frameRate: 30,
                mimeType: "video/webm",
                audio: audioEnabled,
                audioSource: audioSource
            });

            setIsRecording(true);

            // Vérifier si l'audio est disponible dans le stream
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                addLog(`🎵 Audio détecté: ${audioTracks.length} piste(s) audio active(s)`);
            } else {
                addLog("⚠️ Aucune piste audio détectée dans le stream");
                addLog("💡 Le navigateur n'a probablement pas autorisé l'audio");
            }

            // Écouter la fin du stream
            stream.getVideoTracks()[0].addEventListener("ended", () => {
                addLog("Partage d'écran arrêté par l'utilisateur");
                stopRecording();
            });

        } catch (error) {
            console.error("Erreur lors du démarrage de l'enregistrement:", error);
            addLog("Erreur lors du démarrage de l'enregistrement");
            setCountdown(null);
            toast({
                title: "Erreur",
                description: "Impossible de démarrer l'enregistrement. Assurez-vous d'avoir autorisé le partage d'écran.",
                variant: "destructive",
            });
        }
    }, [addLog, captureMode, isFullscreen, stopRecording, toast]);

    return {
        isRecording,
        recordedBlob,
        setRecordedBlob,
        countdown,
        isFullscreen,
        setIsFullscreen,
        captureMode,
        setCaptureMode,
        aspectRatio,
        setAspectRatio,
        startRecording,
        stopRecording,
    };
};
