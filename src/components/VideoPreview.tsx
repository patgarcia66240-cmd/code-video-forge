import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MdDownload, MdDelete, MdInfo, MdShare, MdContentCopy } from "react-icons/md";
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
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          title: 'Animation de code',
          text: 'Regardez cette animation de code que j\'ai créée !',
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
      console.error('Erreur lors du partage:', error);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-background overflow-auto"
    >
      <div className="container max-w-5xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Aperçu de la vidéo</h1>
          <p className="text-muted-foreground">
            Votre vidéo est prête à être téléchargée ou visionnée
          </p>
        </div>

        {/* Video Player */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdInfo className="w-5 h-5" />
              Lecteur vidéo
            </CardTitle>
            <CardDescription>
              Visualisez votre animation avant de la télécharger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-border">
              <video
                src={videoUrl}
                controls
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Video Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdInfo className="w-5 h-5" />
              Informations de la vidéo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Format</div>
                <div className="text-lg font-semibold font-mono">{videoFormat}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Taille du fichier</div>
                <div className="text-lg font-semibold">{videoSize}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Type MIME</div>
                <div className="text-sm font-mono text-muted-foreground">{videoBlob.type}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Statut</div>
                <div className="text-lg font-semibold text-green-500">✓ Prêt</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={onDownload}
            size="lg"
            className="flex-1"
          >
            <MdDownload className="w-5 h-5 mr-2" />
            Télécharger la vidéo
          </Button>
          <Button
            onClick={handleShare}
            variant="secondary"
            size="lg"
            disabled={isSharing}
          >
            <MdShare className="w-5 h-5 mr-2" />
            Partager
          </Button>
          <Button
            onClick={handleCopyInfo}
            variant="outline"
            size="lg"
          >
            <MdContentCopy className="w-5 h-5 mr-2" />
            Copier
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            size="lg"
          >
            <MdDelete className="w-5 h-5" />
          </Button>
        </div>

        {/* Tips */}
        <Card className="bg-accent/50">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">💡 Conseil</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>La vidéo est stockée temporairement dans votre navigateur</li>
                <li>Téléchargez-la avant de fermer la page</li>
                <li>Utilisez le bouton "Partager" pour envoyer directement la vidéo</li>
                <li>Le bouton "Copier" copie les informations de la vidéo</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default VideoPreview;
