import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MdDownload, MdDelete, MdInfo, MdShare, MdContentCopy } from "react-icons/md";
import { FaYoutube, FaTwitter, FaLinkedin } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoInfoPanel from "./VideoInfoPanel";


interface VideoPreviewProps {
  videoUrl: string;
  videoBlob: Blob;
  onDownload: () => void;
  onDelete: () => void;
}

const VideoPreview = ({ videoUrl, videoBlob, onDownload, onDelete }: VideoPreviewProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState({
    name: `Animation de code - ${new Date().toLocaleDateString('fr-FR')}`,
    format: videoBlob.type.includes("mp4") ? "MP4" : "WebM",
    size: videoBlob.size,
    duration: 0,
    mimeType: videoBlob.type,
    width: 1920,
    height: 1080,
    status: 'ready' as const,
    createdAt: new Date(),
  });
  const metadataVideoRef = useRef<HTMLVideoElement>(null);

  // Fonction pour extraire la durée d'un blob vidéo avec gestion du bug Chrome
  const getDurationFromBlob = (blob: Blob): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        // Chrome bug fix : forcer le seek pour WebM qui ont duration = Infinity
        if (video.duration === Infinity) {
          video.currentTime = 1e101;
          video.ontimeupdate = () => {
            video.ontimeupdate = null;
            resolve(video.duration);
          };
        } else {
          resolve(video.duration);
        }
      };

      video.onerror = () => reject("Impossible de lire la durée de la vidéo");

      video.src = URL.createObjectURL(blob);
    });
  };

  // Charger les métadonnées réelles de la vidéo
  useEffect(() => {
    const loadVideoMetadata = async () => {
      if (!videoBlob) return;

      try {
        // Extraire la durée avec la fonction robuste
        const duration = await getDurationFromBlob(videoBlob);

        setVideoMetadata(prev => ({
          ...prev,
          duration: duration,
        }));

        // Utiliser l'élément vidéo pour les dimensions
        if (videoUrl && metadataVideoRef.current) {
          const video = metadataVideoRef.current;

          const handleLoadedMetadata = () => {
            setVideoMetadata(prev => ({
              ...prev,
              width: video.videoWidth,
              height: video.videoHeight,
            }));
          };

          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.src = videoUrl;

          return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          };
        }
      } catch (error) {
        console.error('Erreur lors du chargement des métadonnées vidéo:', error);
        // Fallback basique en cas d'erreur
        setVideoMetadata(prev => ({
          ...prev,
          duration: 0,
        }));
      }
    };

    loadVideoMetadata();
  }, [videoUrl, videoBlob]);

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
    setShowYouTubeDialog(true);
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
    <>
      <Dialog open={showYouTubeDialog} onOpenChange={setShowYouTubeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FaYoutube className="w-6 h-6 text-red-600" />
              Partager sur YouTube
            </DialogTitle>
            <DialogDescription>
              Suivez ces étapes pour publier votre vidéo sur YouTube
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-sm">Téléchargez d'abord votre vidéo en cliquant sur le bouton "Télécharger"</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-sm">Ouvrez YouTube et connectez-vous à votre compte</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-sm">Cliquez sur "Créer" puis "Importer une vidéo"</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <p className="text-sm">Sélectionnez votre fichier vidéo téléchargé et suivez les instructions</p>
              </div>
            </div>
            <Button
              onClick={() => {
                window.open("https://www.youtube.com", "_blank");
                setShowYouTubeDialog(false);
              }}
              className="w-full"
            >
              Ouvrir YouTube
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vidéo cachée pour charger les métadonnées */}
      <video ref={metadataVideoRef} className="hidden" />

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

          {/* Video Info Panel */}
          <VideoInfoPanel
            metadata={videoMetadata}
            videoUrl={videoUrl}
            compact={true}
            showActions={false}
            onDownload={onDownload}
            onDelete={onDelete}
          />

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
                  className="h-24 flex items-center justify-start gap-4 border-border hover:bg-secondary/50 px-6"
                >
                  <FaYoutube className="w-12 h-12 text-red-600" />
                  <span className="text-lg font-medium">YouTube</span>
                </Button>
                <Button
                  onClick={handleShareToTwitter}
                  variant="outline"
                  className="h-24 flex items-center justify-start gap-4 border-border hover:bg-secondary/50 px-6"
                >
                  <FaTwitter className="w-12 h-12 text-blue-400" />
                  <span className="text-lg font-medium">Twitter</span>
                </Button>
                <Button
                  onClick={handleShareToLinkedIn}
                  variant="outline"
                  className="h-24 flex items-center justify-start gap-4 border-border hover:bg-secondary/50 px-6"
                >
                  <FaLinkedin className="w-12 h-12 text-blue-700" />
                  <span className="text-lg font-medium">LinkedIn</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default VideoPreview;
