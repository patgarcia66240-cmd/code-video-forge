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

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('ended', handleEnded);
    };
  }, [video]);

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
      setDuration(video.duration || 0);
    }
  }, [isOpen, video]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
    setCurrentTime(newTime);
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
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden">
        <div
          className="relative w-full h-full bg-black flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Vidéo */}
          <video
            ref={videoRef}
            src={video.url}
            className="max-w-full max-h-full object-contain"
            onClick={togglePlay}
            playsInline
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-lg">Chargement...</div>
            </div>
          )}

          {/* Overlay contrôles */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

          {/* Contrôles principaux */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {/* Progress bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
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
                    <option value="0.25">0.25x</option>
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
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

          {/* Header avec infos vidéo */}
          {showControls && (
            <div className="absolute top-0 left-0 right-0 p-4">
              <DialogHeader className="text-left">
                <div className="flex items-start justify-between">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    ×
                  </Button>
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