import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Download,
    Trash2,
    Calendar,
    Clock,
    HardDrive,
    ArrowLeft,
    Video
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideoStorage, SavedVideo } from "@/hooks/useVideoStorage";

const Gallery = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { savedVideos, deleteVideo, getStats, isLoading } = useVideoStorage();

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDuration = (seconds: number): string => {
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

    const handlePlayVideo = (video: SavedVideo) => {
        toast({
            title: "Lecture vidéo",
            description: `Ouverture de "${video.name}"`,
        });
        // Ici on pourrait naviguer vers VideoPreview ou ouvrir un modal
    };

    const handleDownloadVideo = (video: SavedVideo) => {
        // Simulation du téléchargement
        toast({
            title: "Téléchargement",
            description: `Téléchargement de "${video.name}" commencé`,
        });
    };

    const handleDeleteVideo = async (videoId: string) => {
        try {
            await deleteVideo(videoId);
            toast({
                title: "Vidéo supprimée",
                description: "La vidéo a été supprimée de la galerie",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer la vidéo",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="h-full bg-background overflow-auto">
            <div className="container max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Video className="w-6 h-6" />
                            Galerie des vidéos
                        </h1>
                        <p className="text-muted-foreground">
                            Toutes vos animations de code sauvegardées
                        </p>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Video className="w-8 h-8 text-primary" />
                                <div>
                                    <div className="text-2xl font-bold">{savedVideos.length}</div>
                                    <div className="text-sm text-muted-foreground">Vidéos</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <HardDrive className="w-8 h-8 text-primary" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {formatFileSize(savedVideos.reduce((acc, v) => acc + v.size, 0))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Espace utilisé</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-8 h-8 text-primary" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {formatDuration(savedVideos.reduce((acc, v) => acc + v.duration, 0))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Durée totale</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste des vidéos */}
                {savedVideos.length === 0 ? (
                    <Card className="p-12 text-center">
                        <CardContent>
                            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Aucune vidéo sauvegardée</h3>
                            <p className="text-muted-foreground mb-4">
                                Créez votre première animation de code pour la voir apparaître ici.
                            </p>
                            <Button onClick={() => navigate('/')}>
                                Créer une animation
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedVideos.map((video) => (
                            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-video bg-black relative group cursor-pointer" onClick={() => handlePlayVideo(video)}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                                            <Play className="w-8 h-8 text-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {video.format}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        {formatDuration(video.duration)}
                                    </div>
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base line-clamp-2" title={video.name}>
                                        {video.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        {video.createdAt.toLocaleDateString('fr-FR')}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <HardDrive className="w-3 h-3" />
                                            {formatFileSize(video.size)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayVideo(video);
                                            }}
                                            className="flex-1"
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Voir
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadVideo(video);
                                            }}
                                        >
                                            <Download className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteVideo(video.id);
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
