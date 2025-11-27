import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MdDownload } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";

interface VideoPreviewPanelProps {
    videoPreviewUrl: string | null;
    recordedBlob: Blob | null;
    onDownload: () => void;
}

export const VideoPreviewPanel = ({
    videoPreviewUrl,
    recordedBlob,
    onDownload
}: VideoPreviewPanelProps) => {
    const { toast } = useToast();

    if (!videoPreviewUrl || !recordedBlob) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full bg-panel-bg border-l border-border flex flex-col"
            data-video-preview
        >
            <div className="p-4 border-b border-border">
                <div className="text-sm text-muted-foreground font-medium mb-2">Aperçu de la vidéo</div>
                <div className="text-xs text-muted-foreground">
                    Format: {recordedBlob.type.includes("mp4") ? "MP4" : "WebM"} • Taille:{" "}
                    {((recordedBlob.size || 0) / 1024 / 1024).toFixed(2)} MB
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center p-4 gap-4">
                <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full max-h-[60vh] rounded border border-border bg-black"
                />
                <Button
                    onClick={() => {
                        onDownload();
                        toast({
                            title: "Téléchargement lancé",
                            description: "Votre vidéo a été téléchargée avec succès",
                        });
                    }}
                    className="w-auto px-4 py-2 rounded"
                >
                    <MdDownload className="w-4 h-4 mr-2" />
                    Télécharger la vidéo
                </Button>
            </div>
        </motion.div>
    );
};
