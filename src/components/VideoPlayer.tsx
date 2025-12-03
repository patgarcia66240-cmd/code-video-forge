import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Share,
  RotateCcw,
  SkipBack,
  SkipForward,
  Settings
} from 'lucide-react';
import { SavedVideo } from '@/hooks/useVideoStorage';

interface VideoPlayerProps {
  video: SavedVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (video: SavedVideo) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isOpen,
  onClose,
  onDownload
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showCenterIcon, setShowCenterIcon] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (isOpen && video) {
      setIsLoading(true);
      setCurrentTime(0);
      // Garder la durée de l'objet video comme base
      const videoDuration = video.duration || 0;
      setDuration(videoDuration);
    }
  }, [isOpen, video]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setShowCenterIcon(true); // Afficher l'icône pause
    } else {
      video.play();
      setShowCenterIcon(true); // Afficher l'icône play
    }
    setIsPlaying(!isPlaying);

    // Cacher l'icône après 600ms
    setTimeout(() => {
      setShowCenterIcon(false);
    }, 600);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    // Vérifier que la valeur est finie
    if (isFinite(newTime)) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setCurrentTime(0);
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const handleDownload = () => {
    if (video && onDownload) {
      onDownload(video);
    }
  };

  const handleShare = async () => {
    if (!video) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.name,
          url: video.url
        });
      } catch (error) {
        console.error('Erreur partage:', error);
      }
    } else {
      // Fallback: copier l'URL dans le presse-papier
      try {
        await navigator.clipboard.writeText(video.url);
        // Vous pourriez ajouter un toast ici
      } catch (error) {
        console.error('Erreur copie:', error);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden"
        aria-describedby="video-player-description"
      >
        <div
          className="relative w-full h-full bg-black flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onClick={togglePlay}
        >
          {/* Vidéo */}
          <video
            ref={videoRef}
            src={video.url}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            playsInline
            onLoadStart={() => {
              setIsLoading(true);
              setVideoError(null);
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                // Mettre à jour la durée seulement si elle est valide
                const videoElementDuration = videoRef.current.duration;
                if (videoElementDuration && videoElementDuration > 0) {
                  setDuration(videoElementDuration);
                }
              }
              setIsLoading(false);
              setVideoError(null);
            }}
            onCanPlay={() => {
              setIsLoading(false);
              setVideoError(null);
            }}
            onProgress={() => {
              // Si la vidéo a déjà commencé à jouer, s'assurer que le loader est désactivé
              if (videoRef.current && videoRef.current.readyState >= 2) {
                setIsLoading(false);
              }
            }}
            onLoadedData={() => {
              setIsLoading(false);
            }}
            onError={(e) => {
              setIsLoading(false);
              setVideoError('Impossible de lire cette vidéo. Le fichier peut être inaccessible ou le format non supporté.');
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onEnded={() => {
              setIsLoading(false);
              setIsPlaying(false);
              setVideoError(null);
            }}
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <div className="text-white text-lg">Chargement...</div>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center gap-4 p-6 text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-white text-lg">{videoError}</p>
                {onDownload && video && (
                  <Button
                    onClick={handleDownload}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger à la place
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Overlay contrôles */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

          {/* I centrale animée Play/Pause */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
              showCenterIcon ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="bg-black/60 rounded-full p-6 transform transition-all duration-300 scale-100 hover:scale-110">
              {!isPlaying ? (
                <Play className="w-16 h-16 text-white ml-1" />
              ) : (
                <Pause className="w-16 h-16 text-white" />
              )}
            </div>
          </div>

          {/* Contrôles principaux */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {/* Progress bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration > 0 ? duration : (video?.duration || 100)}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration > 0 ? duration : (video?.duration || 0))}</span>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Boutons de lecture */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestart}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSkip(-10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSkip(10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                {/* Vitesse de lecture */}
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm">Vitesse:</span>
                  <select
                    value={playbackRate}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="bg-white/20 text-white text-sm rounded px-1 py-0.5 border border-white/30"
                  >
                    <option value="0.25" className="text-black">0.25x</option>
                    <option value="0.5" className="text-black">0.5x</option>
                    <option value="0.75" className="text-black">0.75x</option>
                    <option value="1" className="text-black">1x</option>
                    <option value="1.25" className="text-black">1.25x</option>
                    <option value="1.5" className="text-black">1.5x</option>
                    <option value="2" className="text-black">2x</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20"
                >
                  <Share className="w-4 h-4" />
                </Button>

                {onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Description cachée pour l'accessibilité */}
          <div id="video-player-description" className="sr-only">
            Lecteur vidéo : {video.name}. Durée : {formatTime(video.duration)}. Format : {video.format}.
            Utilisez les contrôles pour lire, mettre en pause et naviguer dans la vidéo.
            Barre de progression disponible en bas de l'écran.
          </div>

          {/* Header avec infos vidéo */}
          {showControls && (
            <div className="absolute top-0 left-0 right-0 p-4">
              <DialogHeader className="text-left">
                <div>
                  <DialogTitle className="text-white text-xl mb-2">{video.name}</DialogTitle>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Badge variant="secondary">{video.format}</Badge>
                    <span>•</span>
                    <span>{formatTime(video.duration)}</span>
                    <span>•</span>
                    <span>{(video.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              </DialogHeader>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;