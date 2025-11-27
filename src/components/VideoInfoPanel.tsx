import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Video,
  File,
  Clock,
  Settings,
  Info,
  Download,
  Share,
  Copy,
  Trash2,
  Monitor,
  Zap,
  HardDrive,
  Calendar,
  User,
  Play,
  Pause,
  Volume2,
  Maximize,
  Film,
  Camera,
  Wifi,
  Cpu,
  MemoryStick,
  Music,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoMetadata {
  // Informations de base
  name?: string;
  format: string;
  size: number;
  duration: number;
  mimeType: string;

  // Propriétés vidéo
  width: number;
  height: number;
  frameRate?: number;
  bitrate?: number;
  codec?: string;
  colorSpace?: string;

  // Propriétés audio
  hasAudio?: boolean;
  audioCodec?: string;
  audioBitrate?: number;
  sampleRate?: number;
  audioChannels?: number;

  // Statut et lecture
  status: 'ready' | 'processing' | 'error' | 'loading';
  isPlaying?: boolean;
  currentTime?: number;
  volume?: number;
  playbackSpeed?: number;

  // Métadonnées additionnelles
  createdAt?: Date;
  modifiedAt?: Date;
  author?: string;
  tags?: string[];
  description?: string;

  // Informations système
  filePath?: string;
  compressionRatio?: number;
}

interface VideoInfoPanelProps {
  metadata: VideoMetadata;
  videoUrl?: string;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
  onEdit?: (metadata: Partial<VideoMetadata>) => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const VideoInfoPanel: React.FC<VideoInfoPanelProps> = ({
  metadata,
  videoUrl,
  className = '',
  showActions = true,
  compact = false,
  onEdit,
  onDelete,
  onDownload,
  onShare
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState(metadata);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Formatters
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    // Gérer les cas où seconds est NaN, Infinity, undefined ou négatif
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return 'N/A';
    }

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatBitrate = (kbps: number): string => {
    if (kbps < 1000) return `${Math.round(kbps)} kbps`;
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  };

  const getResolutionLabel = (width: number, height: number): string => {
    const resolutions: { [key: string]: string } = {
      '3840x2160': '4K UHD',
      '2560x1440': 'QHD',
      '1920x1080': 'Full HD',
      '1280x720': 'HD',
      '854x480': 'SD',
      '640x360': '360p'
    };

    const key = `${width}x${height}`;
    return resolutions[key] || `${width}×${height}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ready':
        return { color: 'bg-green-500', text: 'Prêt', icon: '✓' };
      case 'processing':
        return { color: 'bg-blue-500', text: 'En cours', icon: '⟳' };
      case 'error':
        return { color: 'bg-red-500', text: 'Erreur', icon: '✗' };
      case 'loading':
        return { color: 'bg-yellow-500', text: 'Chargement', icon: '⋯' };
      default:
        return { color: 'bg-gray-500', text: status, icon: '?' };
    }
  };

  const handleCopyInfo = async () => {
    const info = `Informations Vidéo
${'='.repeat(50)}

FICHIER:
  Nom: ${metadata.name || 'Non défini'}
  Format: ${metadata.format}
  Taille: ${formatFileSize(metadata.size)}
  Type MIME: ${metadata.mimeType}
  Créé le: ${metadata.createdAt?.toLocaleDateString() || 'Inconnu'}

VIDÉO:
  Résolution: ${getResolutionLabel(metadata.width, metadata.height)}
  Dimensions: ${metadata.width}×${metadata.height}
  Durée: ${formatDuration(metadata.duration)}
  Bitrate: ${metadata.bitrate ? formatBitrate(metadata.bitrate) : 'Inconnu'}
  Codec: ${metadata.codec || 'Inconnu'}
  FPS: ${metadata.frameRate || 'Inconnu'}
  Espace couleur: ${metadata.colorSpace || 'Inconnu'}

AUDIO:
  Audio: ${metadata.hasAudio ? 'Oui' : 'Non'}
  ${metadata.hasAudio ? `
  Codec audio: ${metadata.audioCodec || 'Inconnu'}
  Bitrate audio: ${metadata.audioBitrate ? formatBitrate(metadata.audioBitrate) : 'Inconnu'}
  Fréquence: ${metadata.sampleRate ? `${metadata.sampleRate} Hz` : 'Inconnu'}
  Canaux: ${metadata.audioChannels || 'Inconnu'}
  ` : ''}

LECTURE:
  État: ${getStatusConfig(metadata.status).text}
  Position: ${metadata.currentTime ? formatDuration(metadata.currentTime) : '0:00'}
  Volume: ${metadata.volume ? `${Math.round(metadata.volume * 100)}%` : '0%'}
  Vitesse: ${metadata.playbackSpeed || '1'}x

COMPRESSION:
  Ratio: ${metadata.compressionRatio ? `${(metadata.compressionRatio * 100).toFixed(1)}%` : 'Inconnu'}

${metadata.tags?.length ? `TAGS:
  ${metadata.tags.join(', ')}
` : ''}

Généré avec Code Typing Simulator`;

    try {
      await navigator.clipboard.writeText(info);
      toast({
        title: 'Informations copiées',
        description: 'Les métadonnées de la vidéo ont été copiées dans le presse-papier'
      });
    } catch (error) {
      toast({
        title: 'Erreur de copie',
        description: 'Impossible de copier les informations',
        variant: 'destructive'
      });
    }
  };

  const handleSaveEdit = () => {
    onEdit?.(editingMetadata);
    setIsEditing(false);
    toast({
      title: 'Modifications sauvegardées',
      description: 'Les métadonnées ont été mises à jour'
    });
  };

  const handleCancelEdit = () => {
    setEditingMetadata(metadata);
    setIsEditing(false);
  };

  // Charger les métadonnées depuis la vidéo si disponible
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        if (onEdit) {
          onEdit({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          });
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.src = videoUrl;

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoUrl, onEdit]);

  const statusConfig = getStatusConfig(metadata.status);

  if (compact) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">
                  {metadata.name || `Vidéo ${metadata.format}`}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {metadata.format}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  {getResolutionLabel(metadata.width, metadata.height)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(metadata.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(metadata.size)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={metadata.status === 'ready' ? 'default' : 'secondary'}>
                {statusConfig.text}
              </Badge>
              {showActions && (
                <div className="flex gap-1">
                  {onDownload && (
                    <Button size="sm" variant="ghost" onClick={onDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {onShare && (
                    <Button size="sm" variant="ghost" onClick={onShare}>
                      <Share className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="ghost" onClick={onDelete}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Vidéo cachée pour charger les métadonnées */}
      {videoUrl && (
        <video ref={videoRef} className="hidden" />
      )}

      {/* En-tête principal */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingMetadata.name || ''}
                      onChange={(e) => setEditingMetadata({ ...editingMetadata, name: e.target.value })}
                      className="bg-transparent border-b border-border outline-none"
                      placeholder="Nom de la vidéo"
                    />
                  ) : (
                    metadata.name || `Vidéo ${metadata.format}`
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{metadata.format}</Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {metadata.createdAt?.toLocaleDateString() || 'Date inconnue'}
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig.color} text-white`}>
                {statusConfig.icon} {statusConfig.text}
              </Badge>
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveEdit();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? 'Sauvegarder' : 'Modifier'}
                </Button>
              )}
              {isEditing && (
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Format et taille */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <File className="w-4 h-4" />
                Fichier
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <Badge variant="secondary">{metadata.format}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taille:</span>
                  <span className="font-mono">{formatFileSize(metadata.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type MIME:</span>
                  <span className="font-mono text-xs">{metadata.mimeType}</span>
                </div>
                {metadata.compressionRatio && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compression:</span>
                    <span className="font-mono">{(metadata.compressionRatio * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Propriétés vidéo */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Film className="w-4 h-4" />
                Vidéo
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Résolution:</span>
                  <div className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    <span className="font-mono">{getResolutionLabel(metadata.width, metadata.height)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-mono">{metadata.width}×{metadata.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">{formatDuration(metadata.duration)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FPS:</span>
                  <span className="font-mono">{metadata.frameRate || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Propriétés techniques */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Technique
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bitrate:</span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span className="font-mono">{metadata.bitrate ? formatBitrate(metadata.bitrate) : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Codec:</span>
                  <span className="font-mono">{metadata.codec || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Espace couleur:</span>
                  <span className="font-mono">{metadata.colorSpace || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Audio */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Music className="w-4 h-4" />
                Audio
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Piste audio:</span>
                  <Badge variant={metadata.hasAudio ? 'default' : 'secondary'}>
                    {metadata.hasAudio ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                {metadata.hasAudio && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Codec audio:</span>
                      <span className="font-mono">{metadata.audioCodec || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bitrate audio:</span>
                      <span className="font-mono">
                        {metadata.audioBitrate ? formatBitrate(metadata.audioBitrate) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Canaux:</span>
                      <span className="font-mono">{metadata.audioChannels || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État de lecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            État de lecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progression */}
            <div className="space-y-3">
              <h4 className="font-medium">Progression</h4>
              <div className="space-y-2">
                <Progress
                  value={metadata.currentTime && metadata.duration > 0
                    ? (metadata.currentTime / metadata.duration) * 100
                    : 0}
                  className="h-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{metadata.currentTime ? formatDuration(metadata.currentTime) : '0:00'}</span>
                  <span>{formatDuration(metadata.duration)}</span>
                </div>
              </div>
            </div>

            {/* Contrôles actifs */}
            <div className="space-y-3">
              <h4 className="font-medium">Contrôles</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {metadata.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    Lecture:
                  </span>
                  <Badge variant={metadata.isPlaying ? 'default' : 'secondary'}>
                    {metadata.isPlaying ? 'En cours' : 'Arrêté'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Volume:
                  </span>
                  <span className="font-mono">{metadata.volume ? `${Math.round(metadata.volume * 100)}%` : '0%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vitesse:</span>
                  <span className="font-mono">{metadata.playbackSpeed || '1'}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">État:</span>
                  <Badge className={`${statusConfig.color} text-white`}>
                    {statusConfig.text}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métadonnées additionnelles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Métadonnées
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Masquer' : 'Afficher'} les détails
            </Button>
          </div>
        </CardHeader>
        {showDetails && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations créateur */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Créateur
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auteur:</span>
                    <span>{metadata.author || 'Inconnu'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créé le:</span>
                    <span>{metadata.createdAt?.toLocaleString() || 'Inconnu'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modifié le:</span>
                    <span>{metadata.modifiedAt?.toLocaleString() || 'Inconnu'}</span>
                  </div>
                </div>
              </div>

              {/* Tags et description */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tags et description
                </h4>
                <div className="space-y-3">
                  {metadata.description && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Description:</div>
                      <p className="text-sm bg-muted p-2 rounded">{metadata.description}</p>
                    </div>
                  )}
                  {metadata.tags && metadata.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations système */}
            {metadata.filePath && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Système
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chemin:</span>
                    <span className="font-mono text-xs truncate max-w-xs">{metadata.filePath}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      {showActions && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {onDownload && (
                <Button onClick={onDownload} className="h-14">
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger
                </Button>
              )}
              {onShare && (
                <Button onClick={onShare} variant="secondary" className="h-14">
                  <Share className="w-5 h-5 mr-2" />
                  Partager
                </Button>
              )}
              <Button onClick={handleCopyInfo} variant="secondary" className="h-14">
                <Copy className="w-5 h-5 mr-2" />
                Copier infos
              </Button>
              {onDelete && (
                <Button onClick={onDelete} variant="destructive" className="h-14">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoInfoPanel;
