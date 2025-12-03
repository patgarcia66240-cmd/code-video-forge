import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MdVideocam, MdStopCircle, MdDownload, MdMic, MdMicOff } from "react-icons/md";

interface RecordingControlsProps {
    isRecording: boolean;
    isConverting: boolean;
    conversionProgress: number;
    recordedBlob: Blob | null;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onCancelConversion: () => void;
    onDownloadRecording: () => void;
    audioEnabled?: boolean;
    audioSource?: "microphone" | "system" | "both";
}

export const RecordingControls = ({
    isRecording,
    isConverting,
    conversionProgress,
    recordedBlob,
    onStartRecording,
    onStopRecording,
    onCancelConversion,
    onDownloadRecording,
    audioEnabled = true,
    audioSource = "microphone"
}: RecordingControlsProps) => {
    return (
        <div className="flex items-center gap-2">
            {!isRecording && !isConverting ? (
                <Button
                    onClick={onStartRecording}
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                    {audioEnabled && (audioSource === "microphone" || audioSource === "both") ? (
                        <MdMic className="w-4 h-4 mr-2" />
                    ) : (
                        <MdMicOff className="w-4 h-4 mr-2 opacity-50" />
                    )}
                    Enregistrer {audioEnabled && (audioSource === "microphone" || audioSource === "both") ? "(🎤)" : ""}
                </Button>
            ) : isRecording ? (
                <Button
                    onClick={onStopRecording}
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white animate-pulse"
                >
                    <MdStopCircle className="w-4 h-4 mr-2" />
                    Arrêter
                </Button>
            ) : (
                <div className="flex items-center gap-3">
                    <Button disabled variant="outline" size="sm" className="border-border opacity-50">
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Conversion MP4...
                    </Button>
                    <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${conversionProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono min-w-[35px]">{conversionProgress}%</span>
                    </div>
                    <Button
                        onClick={onCancelConversion}
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                    >
                        <MdStopCircle className="w-4 h-4 mr-2" />
                        Annuler
                    </Button>
                </div>
            )}

            {recordedBlob && !isConverting && (
                <Button
                    onClick={onDownloadRecording}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                >
                    <MdDownload className="w-4 h-4 mr-2" />
                    Télécharger {recordedBlob.type.includes("mp4") ? "MP4" : "WebM"}
                </Button>
            )}
        </div>
    );
};
