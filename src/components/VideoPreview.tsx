import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MdDownload, MdDelete, MdInfo } from "react-icons/md";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoPreviewProps {
  videoUrl: string;
  videoBlob: Blob;
  onDownload: () => void;
  onDelete: () => void;
}

const VideoPreview = ({ videoUrl, videoBlob, onDownload, onDelete }: VideoPreviewProps) => {
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
            onClick={onDelete}
            variant="destructive"
            size="lg"
          >
            <MdDelete className="w-5 h-5 mr-2" />
            Supprimer
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
                <li>Vous pouvez créer une nouvelle vidéo en retournant au simulateur</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default VideoPreview;
