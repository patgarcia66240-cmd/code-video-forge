import React, { useState } from 'react';
import VideoInfoPanel from '@/components/VideoInfoPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  FileVideo,
  Settings,
  Eye,
  Edit,
  Download,
  Share,
  Trash2,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VideoInfoPanelExample: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'normal' | 'compact'>('normal');
  const [showActions, setShowActions] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Métadonnées exemples
  const [videoMetadata, setVideoMetadata] = useState({
    // Informations de base
    name: 'Demo Animation Code.mp4',
    format: 'MP4',
    size: 8547328, // ~8.5 MB
    duration: 45, // 45 secondes
    mimeType: 'video/mp4',

    // Propriétés vidéo
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 1500, // kbps
    codec: 'H.264',
    colorSpace: 'YUV 4:2:0',

    // Propriétés audio
    hasAudio: false,

    // Statut et lecture
    status: 'ready' as const,
    isPlaying: false,
    currentTime: 12,
    volume: 0.8,
    playbackSpeed: 1,

    // Métadonnées additionnelles
    createdAt: new Date('2024-01-15T10:30:00'),
    modifiedAt: new Date('2024-01-15T14:20:00'),
    author: 'Jean Dupont',
    tags: ['coding', 'animation', 'tutorial', 'javascript'],
    description: 'Animation de code montrant la création d\'une fonction récursive en JavaScript avec effet de frappe progressive.',

    // Informations système
    compressionRatio: 0.75
  });

  // Fonctions de gestion
  const handleEdit = (newMetadata: Partial<typeof videoMetadata>) => {
    setVideoMetadata(prev => ({
      ...prev,
      ...newMetadata,
      modifiedAt: new Date()
    }));

    toast({
      title: 'Métadonnées modifiées',
      description: 'Les informations de la vidéo ont été mises à jour'
    });
  };

  const handleDownload = () => {
    toast({
      title: 'Téléchargement démarré',
      description: 'La vidéo est en cours de téléchargement'
    });
  };

  const handleShare = () => {
    toast({
      title: 'Partage',
      description: 'Options de partage disponibles'
    });
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      toast({
        title: 'Vidéo supprimée',
        description: 'La vidéo a été supprimée avec succès'
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setVideoMetadata(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const simulateProgress = () => {
    let progress = videoMetadata.currentTime || 0;
    const interval = setInterval(() => {
      progress += 1;
      if (progress >= videoMetadata.duration) {
        clearInterval(interval);
        setIsPlaying(false);
        setVideoMetadata(prev => ({
          ...prev,
          currentTime: videoMetadata.duration,
          isPlaying: false
        }));
      } else {
        setVideoMetadata(prev => ({
          ...prev,
          currentTime: progress
        }));
      }
    }, 1000);
  };

  // Différents scénarios de test
  const testScenarios = [
    {
      name: 'Vidéo 4K',
      metadata: {
        ...videoMetadata,
        name: 'Presentation_4K.mp4',
        format: 'MP4',
        size: 45678048, // ~45 MB
        width: 3840,
        height: 2160,
        frameRate: 60,
        bitrate: 8000,
        codec: 'H.265',
        hasAudio: true,
        audioCodec: 'AAC',
        audioBitrate: 320,
        sampleRate: 48000,
        audioChannels: 2,
        tags: ['4k', 'presentation', 'pro']
      }
    },
    {
      name: 'Vidéo HD Rapide',
      metadata: {
        ...videoMetadata,
        name: 'Quick_Tutorial_HD.webm',
        format: 'WebM',
        size: 2345678, // ~2.3 MB
        width: 1280,
        height: 720,
        frameRate: 24,
        bitrate: 800,
        codec: 'VP9',
        duration: 15,
        status: 'processing' as const,
        tags: ['tutorial', 'quick', 'webm']
      }
    },
    {
      name: 'Animation GIF',
      metadata: {
        ...videoMetadata,
        name: 'Code_Animation.gif',
        format: 'GIF',
        size: 567890, // ~567 KB
        width: 800,
        height: 600,
        frameRate: 15,
        bitrate: 120,
        codec: 'GIF',
        duration: 8,
        hasAudio: false,
        tags: ['gif', 'animation', 'code']
      }
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileVideo className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Panneau d'Informations Vidéo</h1>
          <Badge variant="outline">Composant</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Composant complet pour afficher et gérer les métadonnées vidéo avec différents modes et fonctionnalités.
        </p>
      </div>

      {/* Contrôles de l'interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration de l'interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Mode d'affichage</Label>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'normal' | 'compact')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="normal" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Normal
                  </TabsTrigger>
                  <TabsTrigger value="compact" className="flex items-center gap-2">
                    <FileVideo className="w-4 h-4" />
                    Compact
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button
                variant={showActions ? 'default' : 'outline'}
                onClick={() => setShowActions(!showActions)}
                className="w-full"
              >
                {showActions ? 'Cacher' : 'Afficher'} les actions
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Lecture</Label>
              <Button
                variant="outline"
                onClick={handlePlayPause}
                className="w-full"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Lecture
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Simulation</Label>
              <Button
                variant="secondary"
                onClick={simulateProgress}
                disabled={isPlaying}
                className="w-full"
              >
                Simuler la progression
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vue principale */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <FileVideo className="w-5 h-5" />
          Vidéo Actuelle
          <Badge variant="secondary">{viewMode}</Badge>
        </div>

        <VideoInfoPanel
          metadata={videoMetadata}
          viewMode={viewMode}
          showActions={showActions}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={handleDelete}
        />
      </div>

      {/* Scénarios de test */}
      <div className="space-y-6">
        <div className="text-lg font-semibold">Scénarios de Test</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testScenarios.map((scenario, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <Badge variant="outline">
                    {scenario.metadata.format}
                  </Badge>
                </div>
                <CardDescription>
                  {getResolutionLabel(scenario.metadata.width, scenario.metadata.height)} •
                  {' '}{formatFileSize(scenario.metadata.size)} •
                  {' '}{formatDuration(scenario.metadata.duration)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoInfoPanel
                  metadata={scenario.metadata}
                  viewMode="compact"
                  showActions={true}
                  className="border-0 shadow-none"
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onDelete={() => {
                    toast({
                      title: 'Test',
                      description: `Suppression de ${scenario.name} (test)`
                    });
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Documentation des métadonnées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Édition des métadonnées
          </CardTitle>
          <CardDescription>
            Testez l'édition en direct des métadonnées de la vidéo principale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="video-name">Nom de la vidéo</Label>
              <Input
                id="video-name"
                value={videoMetadata.name}
                onChange={(e) => handleEdit({ name: e.target.value })}
                placeholder="Nom de la vidéo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-author">Auteur</Label>
              <Input
                id="video-author"
                value={videoMetadata.author || ''}
                onChange={(e) => handleEdit({ author: e.target.value })}
                placeholder="Auteur de la vidéo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-status">Statut</Label>
              <select
                id="video-status"
                value={videoMetadata.status}
                onChange={(e) => handleEdit({ status: e.target.value as any })}
                className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value="ready">Prêt</option>
                <option value="processing">En cours</option>
                <option value="error">Erreur</option>
                <option value="loading">Chargement</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={videoMetadata.description || ''}
                onChange={(e) => handleEdit({ description: e.target.value })}
                placeholder="Description de la vidéo"
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="video-tags">Tags</Label>
              <Input
                id="video-tags"
                value={videoMetadata.tags?.join(', ') || ''}
                onChange={(e) => handleEdit({
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="Tags séparés par des virgules"
              />
              {videoMetadata.tags && videoMetadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {videoMetadata.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de la vidéo */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques en temps réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-500">
                {videoMetadata.width}×{videoMetadata.height}
              </div>
              <div className="text-sm text-muted-foreground">Résolution</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-500">
                {formatDuration(videoMetadata.duration)}
              </div>
              <div className="text-sm text-muted-foreground">Durée totale</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-500">
                {formatFileSize(videoMetadata.size)}
              </div>
              <div className="text-sm text-muted-foreground">Taille fichier</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-500">
                {videoMetadata.bitrate ? `${(videoMetadata.bitrate / 1000).toFixed(1)} Mbps` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Bitrate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fonctions utilitaires
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default VideoInfoPanelExample;