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
    Video,
    AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideoStorage, SavedVideo } from "@/hooks/useVideoStorage";
import { createTestVideoForEtremise, checkVideoNameAvailability } from "@/utils/createTestVideo";
import { debugSupabaseUpload, testDirectSupabaseInsert } from "@/utils/debugSupabaseUpload";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import { User, LogOut, LogIn } from "lucide-react";

interface GalleryProps {
    embedded?: boolean;
    onBack?: () => void;
}

const Gallery = ({ embedded = false, onBack }: GalleryProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { savedVideos, deleteVideo, getStats, isLoading, isSupabaseEnabled } = useVideoStorage();
    const { user, signOut } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [stats, setStats] = useState({
        totalVideos: 0,
        totalSize: 0,
        totalDuration: 0,
        formatBreakdown: {} as Record<string, number>
    });
    const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null);
    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<SavedVideo | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Charger les statistiques au chargement et quand les vidéos changent
    useEffect(() => {
        const loadStats = async () => {
            try {
                const currentStats = await getStats();
                setStats(currentStats);
            } catch (error) {
                console.error('Erreur chargement statistiques:', error);
            }
        };

        loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedVideos]);

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
        setSelectedVideo(video);
        setIsVideoPlayerOpen(true);
    };

    const handleDownloadVideo = (video: SavedVideo) => {
        // Créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = video.url;
        link.download = `${video.name.replace(/[^a-z0-9]/gi, '_')}.${video.format.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Téléchargement",
            description: `Téléchargement de "${video.name}" commencé`,
        });
    };

    const handleDeleteClick = (video: SavedVideo) => {
        setVideoToDelete(video);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!videoToDelete) return;

        try {
            // Si la vidéo est en cours de lecture dans le lecteur, fermer le lecteur
            if (selectedVideo?.id === videoToDelete.id) {
                setIsVideoPlayerOpen(false);
                setSelectedVideo(null);
            }

            // Supprimer la vidéo (cela supprimera aussi de Supabase Storage si configuré)
            await deleteVideo(videoToDelete.id);

            // Messages différents selon le mode de stockage
            if (isSupabaseEnabled) {
                toast({
                    title: "Vidéo supprimée définitivement",
                    description: `"${videoToDelete.name}" a été supprimée de Supabase Storage et de la base de données`,
                });
            } else {
                toast({
                    title: "Vidéo supprimée",
                    description: `"${videoToDelete.name}" a été supprimée de la galerie locale`,
                });
            }

            // Fermer le dialogue et réinitialiser
            setIsDeleteDialogOpen(false);
            setVideoToDelete(null);

        } catch (error) {
            console.error('Erreur suppression vidéo:', error);
            toast({
                title: "Erreur lors de la suppression",
                description: isSupabaseEnabled
                    ? "Impossible de supprimer la vidéo de Supabase. Vérifiez vos permissions."
                    : "Impossible de supprimer la vidéo de la galerie.",
                variant: "destructive",
            });
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setVideoToDelete(null);
    };

    const handleCreateTestVideo = async () => {
        try {
            toast({
                title: "Création vidéo test",
                description: "Création d'une vidéo test avec gestion du nom unique...",
            });

            await createTestVideoForEtremise();

            toast({
                title: "Vidéo test créée",
                description: "La vidéo test a été créée avec succès!",
            });

            // Recharger la liste des vidéos
            window.location.reload();

        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de créer la vidéo test",
                variant: "destructive",
            });
        }
    };

    const handleCheckName = async () => {
        const isAvailable = await checkVideoNameAvailability('pour etre mise');

        toast({
            title: isAvailable ? "Nom disponible" : "Nom déjà utilisé",
            description: isAvailable
                ? "Le nom 'pour etre mise' est disponible"
                : "Le nom 'pour etre mise' existe déjà, un nom unique sera généré",
            variant: isAvailable ? "default" : "destructive",
        });
    };

    const handleDebugUpload = async () => {
        try {
            toast({
                title: "Debug Supabase",
                description: "Lancement du debug pour l'erreur 'invalid input syntax for type integer'",
            });

            await debugSupabaseUpload();

            toast({
                title: "Debug terminé",
                description: "Vérifiez la console pour les détails",
            });

        } catch (error) {
            toast({
                title: "Erreur de debug",
                description: "Vérifiez la console pour l'erreur détaillée",
                variant: "destructive",
            });
        }
    };

    const handleDirectInsertTest = async () => {
        try {
            toast({
                title: "Test insertion directe",
                description: "Test d'insertion SQL directe dans Supabase",
            });

            await testDirectSupabaseInsert();

            toast({
                title: "Test terminé",
                description: "Vérifiez la console pour les résultats",
            });

        } catch (error) {
            toast({
                title: "Erreur test direct",
                description: "Vérifiez la console pour l'erreur",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="h-full bg-background overflow-auto">
            <div className="container max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {!embedded && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onBack ? onBack() : navigate('/')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </Button>
                        )}
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

                    {/* Bouton d'authentification */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/90 border border-gray-50 rounded-full">
                                <User className="w-4 h-4 text-blue-50" />
                                <span className="text-sm text-blue-50 font-medium">
                                    {user.email?.split('@')[0]}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={signOut}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Déconnexion
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate('/auth?redirect=/gallery')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <LogIn className="w-4 h-4" />
                            Se connecter
                        </Button>
                    )}
                </div>

                {/* Information Supabase */}
                {isSupabaseEnabled && (
                    <Card className="border-gray-400/20 bg-gray-850/80">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                    <Video className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-400">
                                        Stockage activé
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Vos vidéos sont sauvegardées dans le cloud Storage
                                    </div>
                                </div>
                            
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Video className="w-8 h-8 text-primary" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.totalVideos}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Vidéos {isSupabaseEnabled && "(Supabase)"}
                                    </div>
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
                                        {formatFileSize(stats.totalSize)}
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
                                        {formatDuration(stats.totalDuration)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Durée totale</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste des vidéos */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                {/* Skeleton video thumbnail */}
                                <div className="aspect-video bg-muted animate-pulse relative">
                                    <div className="absolute top-2 left-2">
                                        <div className="h-5 w-12 bg-muted-foreground/20 rounded" />
                                    </div>
                                    <div className="absolute bottom-2 right-2">
                                        <div className="h-5 w-10 bg-muted-foreground/20 rounded" />
                                    </div>
                                </div>
                                {/* Skeleton content */}
                                <CardHeader className="pb-3">
                                    <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded mt-2" />
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-9 flex-1 bg-muted animate-pulse rounded" />
                                        <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                                        <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : savedVideos.length === 0 ? (
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
                                                handleDeleteClick(video);
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Video Player Modal */}
                <VideoPlayer
                    video={selectedVideo}
                    isOpen={isVideoPlayerOpen}
                    onClose={() => {
                        setIsVideoPlayerOpen(false);
                        setSelectedVideo(null);
                    }}
                    onDownload={handleDownloadVideo}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Confirmer la suppression
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                                {videoToDelete && (
                                    <>
                                        <p className="mb-2">
                                            Êtes-vous sûr de vouloir supprimer la vidéo <strong>"{videoToDelete.name}"</strong> ?
                                        </p>
                                        {isSupabaseEnabled ? (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
                                                <p className="font-semibold text-red-800 mb-1">⚠️ Attention - Suppression définitive</p>
                                                <p className="text-red-700">
                                                    Cette action supprimera définitivement :
                                                </p>
                                                <ul className="list-disc list-inside text-red-700 mt-1">
                                                    <li>Le fichier vidéo de Supabase Storage</li>
                                                    <li>Les métadonnées de la base de données</li>
                                                </ul>
                                                <p className="text-red-800 font-medium mt-2">
                                                    Cette action est irréversible !
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm">
                                                <p className="font-semibold text-orange-800 mb-1">
                                                    Cette vidéo sera supprimée de la galerie locale
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCancelDelete}>
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer définitivement
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Auth Modal */}
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                />
            </div>
        </div>
    );
};

export default Gallery;
