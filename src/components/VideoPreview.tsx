import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MdDownload, MdDelete, MdInfo, MdShare, MdContentCopy } from "react-icons/md";
import { FaYoutube, FaTwitter, FaLinkedin } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface VideoPreviewProps {
  videoUrl: string;
  videoBlob: Blob;
  onDownload: () => void;
  onDelete: () => void;
}

const VideoPreview = ({ videoUrl, videoBlob, onDownload, onDelete }: VideoPreviewProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (blob: Blob) => {
    // Estimation basée sur la taille (très approximatif)
    return "Calculer...";
  };

  const videoFormat = videoBlob.type.includes("mp4") ? "MP4" : "WebM";
  const videoSize = formatFileSize(videoBlob.size);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Créer un fichier à partir du blob pour le partage
      const fileName = `typing-animation-${Date.now()}.${videoFormat.toLowerCase()}`;
      const file = new File([videoBlob], fileName, { type: videoBlob.type });

      // Vérifier si l'API Web Share est disponible
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Animation de code",
          text: "Regardez cette animation de code que j'ai créée !",
          files: [file],
        });

        toast({
          title: "Partagé !",
          description: "La vidéo a été partagée avec succès",
        });
      } else {
        // Fallback : copier les informations dans le presse-papier
        const shareText = `Animation de code - Format: ${videoFormat}, Taille: ${videoSize}`;
        await navigator.clipboard.writeText(shareText);

        toast({
          title: "Informations copiées",
          description: "Les détails de la vidéo ont été copiés. Pour partager la vidéo, téléchargez-la d'abord.",
        });
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de partager. Téléchargez la vidéo pour la partager.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyInfo = async () => {
    const info = `Animation de code typographique
Format: ${videoFormat}
Taille: ${videoSize}
Type: ${videoBlob.type}

Créé avec Code Typing Simulator`;

    try {
      await navigator.clipboard.writeText(info);
      toast({
        title: "Copié !",
        description: "Les informations de la vidéo ont été copiées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papier",
        variant: "destructive",
      });
    }
  };

  const handleShareToYouTube = () => {
    toast({
      title: "YouTube",
      description: "Téléchargez d'abord la vidéo, puis uploadez-la sur YouTube Studio",
    });
    window.open("https://studio.youtube.com/channel/upload", "_blank");
  };

  const handleShareToTwitter = () => {
    const text = encodeURIComponent(
      "Regardez cette animation de code que j'ai créée avec Code Typing Simulator ! 🎥💻 #coding #animation",
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    toast({
      title: "Twitter",
      description: "Téléchargez la vidéo et ajoutez-la à votre tweet",
    });
  };

  const handleShareToLinkedIn = () => {
    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
    toast({
      title: "LinkedIn",
      description: "Téléchargez la vidéo et ajoutez-la à votre post LinkedIn",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-background overflow-auto"
    >
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        {/* Video Player */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-border">
              <video src={videoUrl} controls className="w-full h-full" />
            </div>
          </CardContent>
        </Card>

        {/* Video Info */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MdInfo className="w-5 h-5" />
              Informations de la vidéo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Format</div>
                <div className="text-md font-semibold font-mono">{videoFormat}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Taille du fichier</div>
                <div className="text-md font-semibold">{videoSize}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Type MIME</div>
                <div className="text-sm font-mono text-muted-foreground mt-2">{videoBlob.type}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Statut</div>
                <div className="text-md font-semibold text-green-500">✓ Prêt</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-3">
          <Button onClick={onDownload} size="lg" className="h-14">
            <MdDownload className="w-5 h-5 mr-2" />
            Télécharger la vidéo
          </Button>
          <Button onClick={handleShare} variant="secondary" size="lg" disabled={isSharing} className="h-14">
            <MdShare className="w-5 h-5 mr-2" />
            Partager
          </Button>
          <Button onClick={handleCopyInfo} variant="secondary" size="lg" className="h-14">
            <MdContentCopy className="w-5 h-5 mr-2" />
            Copier
          </Button>
          {/* Delete Button */}
          <Button onClick={onDelete} variant="destructive" size="lg" className="w-full h-14">
            <MdDelete className="w-5 h-5 mr-2" />
            Supprimer la vidéo
          </Button>
        </div>

        {/* Social Media Share */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Partager sur les réseaux sociaux</CardTitle>
            <CardDescription>
              Téléchargez d'abord la vidéo, puis utilisez ces raccourcis pour la partager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={handleShareToYouTube}
                variant="outline"
                className="h-24 flex flex-row gap-3 border-border hover:bg-secondary/50"
              >
                <FaYoutube className="w-10 h-10 text-red-600" />
                <span className="text-sm font-medium">YouTube</span>
              </Button>
              <Button
                onClick={handleShareToTwitter}
                variant="outline"
                className="h-24 flex flex-row gap-3 border-border hover:bg-secondary/50"
              >
                <FaTwitter className="w-8 h-8 text-blue-400" />
                <span className="text-sm font-medium">Twitter</span>
              </Button>
              <Button
                onClick={handleShareToLinkedIn}
                variant="outline"
                className="h-24 flex flex-row gap-3 border-border hover:bg-secondary/50"
              >
                <FaLinkedin className="w-8 h-8 text-blue-700" />
                <span className="text-sm font-medium">LinkedIn</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default VideoPreview;
