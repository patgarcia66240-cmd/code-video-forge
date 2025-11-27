import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Video,
  Calendar,
  Clock,
  HardDrive,
  Monitor,
  Tag,
  Search,
  Filter,
  Grid3x3,
  List,
  Play,
  Download,
  Trash2,
  Share2,
  Edit,
  Plus,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types pour les vidéos enregistrées
interface SavedVideo {
  id: string;
  name: string;
  thumbnail?: string;
  url: string;
  blob: Blob;
  duration: number;
  size: number;
  format: string;
  resolution: string;
  createdAt: Date;
  tags?: string[];
  description?: string;
}

// Vidéos simulées pour la démonstration
const mockVideos: SavedVideo[] = [
  {
    id: '1',
    name: 'Algorithme de Tri Rapide',
    url: '#',
    blob: new Blob(),
    duration: 45,
    size: 8547328,
    format: 'MP4',
    resolution: '1920x1080',
    createdAt: new Date('2024-01-15T10:30:00'),
    tags: ['algorithm', 'sorting', 'javascript'],
    description: 'Démonstration de l\'algorithme quicksort avec visualisation des étapes'
  },
  {
    id: '2',
    name: 'API REST avec Express.js',
    url: '#',
    blob: new Blob(),
    duration: 68,
    size: 12456732,
    format: 'WebM',
    resolution: '1280x720',
    createdAt: new Date('2024-01-14T15:45:00'),
    tags: ['api', 'express', 'nodejs'],
    description: 'Création d\'une API RESTful avec Express.js et MongoDB'
  },
  {
    id: '3',
    name: 'Hook React Personnalisé',
    url: '#',
    blob: new Blob(),
    duration: 32,
    size: 6234567,
    format: 'MP4',
    resolution: '1920x1080',
    createdAt: new Date('2024-01-13T09:20:00'),
    tags: ['react', 'hooks', 'typescript'],
    description: 'Création d\'un hook personnalisé pour gérer l\'état local'
  },
  {
    id: '4',
    name: 'Animation CSS Avancée',
    url: '#',
    blob: new Blob(),
    duration: 55,
    size: 9876543,
    format: 'WebM',
    resolution: '1920x1080',
    createdAt: new Date('2024-01-12T14:15:00'),
    tags: ['css', 'animation', 'webdesign'],
    description: 'Techniques d\'animation CSS modernes avec keyframes et transitions'
  },
  {
    id: '5',
    name: 'Base de Données SQL',
    url: '#',
    blob: new Blob(),
    duration: 78,
    size: 15432876,
    format: 'MP4',
    resolution: '2560x1440',
    createdAt: new Date('2024-01-11T16:30:00'),
    tags: ['sql', 'database', 'tutorial'],
    description: 'Conception et implémentation d\'une base de données relationnelle'
  },
  {
    id: '6',
    name: 'Component React Réutilisable',
    url: '#',
    blob: new Blob(),
    duration: 41,
    size: 7456789,
    format: 'WebM',
    resolution: '1280x720',
    createdAt: new Date('2024-01-10T11:45:00'),
    tags: ['react', 'components', 'reusable'],
    description: 'Création de composants React réutilisables avec TypeScript'
  }
];

const VideoGallery = () => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<SavedVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'duration' | 'size'>('date');
  const [filterFormat, setFilterFormat] = useState<'all' | 'mp4' | 'webm'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  // Charger les vidéos depuis le localStorage
  useEffect(() => {
    const savedVideos = localStorage.getItem('codeVideoForge_videos');
    if (savedVideos) {
      try {
        const parsed = JSON.parse(savedVideos);
        setVideos(parsed);
        setFilteredVideos(parsed);
      } catch (error) {
        console.error('Erreur lors du chargement des vidéos:', error);
      }
    } else {
      // Utiliser les vidéos de démonstration
      setVideos(mockVideos);
      setFilteredVideos(mockVideos);
    }
  }, []);

  // Filtrer les vidéos
  useEffect(() => {
    let filtered = videos;

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrer par format
    if (filterFormat !== 'all') {
      filtered = filtered.filter(video => video.format.toLowerCase() === filterFormat);
    }

    // Trier les vidéos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          return b.duration - a.duration;
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    setFilteredVideos(filtered);
  }, [videos, searchTerm, sortBy, filterFormat]);

  // Utilitaires
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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

  const getResolutionLabel = (width: number, height: number): string => {
    const resolutions: { [key: string]: string } = {
      '3840x2160': '4K UHD',
      '2560x1440': 'QHD',
      '1920x1080': 'Full HD',
      '1280x720': 'HD',
      '854x480': 'SD',
      '640x360': '360p'
    };
    return resolutions[`${width}x${height}`] || `${width}×${height}`;
  };

  const handleDeleteVideo = (videoId: string) => {
    const videoToDelete = videos.find(v => v.id === videoId);
    if (videoToDelete) {
      // Révoquer l'URL de la vidéo
      if (videoToDelete.url && videoToDelete.url !== '#') {
        URL.revokeObjectURL(videoToDelete.url);
      }

      // Supprimer du localStorage
      const updatedVideos = videos.filter(v => v.id !== videoId);
      localStorage.setItem('codeVideoForge_videos', JSON.stringify(updatedVideos));
      setVideos(updatedVideos);

      // Supprimer du blob (si nécessaire)
      if (videoToDelete.blob.size > 0) {
        // Note: Les blobs ne peuvent pas être directement supprimés de cette manière
      }

      // Notification
      toast({
        title: 'Vidéo supprimée',
        description: `"${videoToDelete.name}" a été supprimée avec succès`,
      });
    }
  };

  const handleDownloadVideo = (video: SavedVideo) => {
    if (video.url && video.url !== '#') {
      const a = document.createElement('a');
      a.href = video.url;
      a.download = `${video.name}.${video.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: 'Téléchargement démarré',
        description: `Téléchargement de "${video.name}" en cours...`,
      });
    } else {
      toast({
        title: 'Téléchargement impossible',
        description: 'Cette vidéo est une démonstration et ne peut pas être téléchargée',
        variant: 'destructive',
      });
    }
  };

  const handleShareVideo = (video: SavedVideo) => {
    if (video.url && video.url !== '#') {
      if (navigator.share) {
        navigator.share({
          title: video.name,
          text: video.description || `Regardez cette vidéo de code créée avec Code Video Forge !`,
          url: window.location.origin
        }).catch(console.error);
      } else {
        // Fallback: copier dans le presse-papier
        navigator.clipboard.writeText(
          `${video.name}\n${video.description}\n\nCréé avec Code Video Forge`
        );
        toast({
          title: 'Informations copiées',
          description: 'Les détails de la vidéo ont été copiés dans le presse-papier',
        });
      }
    }
  };

  const handleSelectVideo = (videoId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Sélection multiple avec Ctrl/Cmd + clic
      setSelectedVideos(prev =>
        prev.includes(videoId)
          ? prev.filter(id => id !== videoId)
          : [...prev, videoId]
      );
    } else {
      // Sélection simple
      setSelectedVideos([videoId]);
    }
  };

  const handleSelectAll = () => {
    setSelectedVideos(videos.map(v => v.id));
  };

  const handleClearSelection = () => {
    setSelectedVideos([]);
  };

  const handleBulkDelete = () => {
    if (selectedVideos.length === 0) return;

    const videosToDelete = videos.filter(v => selectedVideos.includes(v.id));
    let deletedCount = 0;

    videosToDelete.forEach(video => {
      if (video.url && video.url !== '#') {
        URL.revokeObjectURL(video.url);
      }
      deletedCount++;
    });

    const updatedVideos = videos.filter(v => !selectedVideos.includes(v.id));
    localStorage.setItem('codeVideoForge_videos', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
    setSelectedVideos([]);

    toast({
      title: 'Vidéos supprimées',
      description: `${deletedCount} vidéo(s) supprimée(s) avec succès`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Video className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Galerie Vidéo</h1>
                <p className="text-sm text-muted-foreground">
                  {videos.length} vidéo{videos.length > 1 ? 's' : ''} enregistrée{videos.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle vidéo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="border-b border-border bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des vidéos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Filtre format */}
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous formats</SelectItem>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="duration">Durée</SelectItem>
                  <SelectItem value="size">Taille</SelectItem>
                </SelectContent>
              </Select>

              {/* Mode d'affichage */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sélection multiple */}
            {selectedVideos.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{selectedVideos.length} sélectionnée{selectedVideos.length > 1 ? 's' : ''}</span>
                <Button variant="outline" size="sm" onClick={handleClearSelection}>
                  Effacer la sélection
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer la sélection
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredVideos.length === 0 ? (
          // État vide
          <div className="text-center py-16">
            <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune vidéo trouvée</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm || filterFormat !== 'all'
                ? 'Essayez de modifier vos filtres de recherche ou de format.'
                : 'Commencez par créer votre première vidéo de code animée !'}
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/'}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une vidéo
            </Button>
          </div>
        ) : (
          <>
            {/* Actions en haut */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''} trouvée{filteredVideos.length > 1 ? 's' : ''}
              </div>

              {selectedVideos.length === 0 && videos.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Sélectionner tout
                </Button>
              )}
            </div>

            {/* Grille de vidéos */}
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={(e) => handleSelectVideo(video.id, e)}
                  className={`relative group cursor-pointer ${
                    selectedVideos.includes(video.id)
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:ring-2 hover:ring-primary hover:ring-offset-2'
                  } rounded-lg overflow-hidden transition-all`}
                >
                  {viewMode === 'grid' ? (
                    // Mode grille
                    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {/* Miniature */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Video className="w-12 h-12 text-primary/60" />
                        </div>

                        {/* Badge de format */}
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant={video.format === 'MP4' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {video.format}
                          </Badge>
                        </div>

                        {/* Badge de durée */}
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatDuration(video.duration)}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <CardHeader className="p-0 pb-2">
                          <CardTitle className="text-base line-clamp-2 leading-tight">
                            {video.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-xs">
                            {video.description}
                          </CardDescription>
                        </CardHeader>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {video.createdAt.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {formatFileSize(video.size)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Monitor className="w-3 h-3" />
                              {getResolutionLabel(parseInt(video.resolution.split('x')[0]), parseInt(video.resolution.split('x')[1]))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadVideo(video);
                                }}
                                className="h-8 px-2"
                              >
                                <Download className="w-3 h-3" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareVideo(video);
                                }}
                                className="h-8 px-2"
                              >
                                <Share2 className="w-3 h-3" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVideo(video.id);
                                }}
                                className="h-8 px-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Tags */}
                          {video.tags && video.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {video.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // Mode liste
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Miniature */}
                          <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Video className="w-8 h-8 text-primary/60" />
                            </div>

                            {/* Badge de format */}
                            <div className="absolute top-1 left-1">
                              <Badge
                                variant={video.format === 'MP4' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {video.format}
                              </Badge>
                            </div>
                          </div>

                          {/* Informations */}
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg line-clamp-2 leading-tight">
                                  {video.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-3 text-sm mt-1">
                                  {video.description}
                                </CardDescription>

                                {/* Métadonnées */}
                                <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {video.createdAt.toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatDuration(video.duration)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <HardDrive className="w-4 h-4" />
                                    {formatFileSize(video.size)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Monitor className="w-4 h-4" />
                                    {getResolutionLabel(parseInt(video.resolution.split('x')[0]), parseInt(video.resolution.split('x')[1]))}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadVideo(video);
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareVideo(video);
                                  }}
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVideo(video.id);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Tags */}
                            {video.tags && video.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {video.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoGallery;