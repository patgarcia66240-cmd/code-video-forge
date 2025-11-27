import { useState, useEffect } from 'react';

// Interface pour une vidéo sauvegardée
export interface SavedVideo {
    id: string;
    name: string;
    url: string;
    blob: Blob;
    duration: number;
    size: number;
    createdAt: Date;
    format: 'MP4' | 'WebM';
}

const STORAGE_KEY = 'savedVideos';
const MAX_VIDEOS = 50; // Limite pour éviter de saturer le stockage

export const useVideoStorage = () => {
    const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les vidéos depuis localStorage au démarrage
    useEffect(() => {
        const loadVideos = async () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const videoData = JSON.parse(stored);

                    // Recréer les Blobs et URLs depuis les données sérialisées
                    const videos: SavedVideo[] = await Promise.all(
                        videoData.map(async (data: any) => {
                            // Pour les vidéos réelles, on devrait stocker les blobs dans IndexedDB
                            // Pour l'instant, on utilise des données mockées
                            const blob = new Blob([], { type: data.format === 'MP4' ? 'video/mp4' : 'video/webm' });
                            const url = URL.createObjectURL(blob);

                            return {
                                ...data,
                                blob,
                                url,
                                createdAt: new Date(data.createdAt)
                            };
                        })
                    );

                    setSavedVideos(videos);
                } else {
                    // Données d'exemple si rien n'est stocké
                    setSavedVideos([]);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des vidéos:', error);
                setSavedVideos([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadVideos();
    }, []);

    // Sauvegarder une vidéo
    const saveVideo = async (videoData: {
        name: string;
        blob: Blob;
        duration: number;
        format: 'MP4' | 'WebM';
    }): Promise<SavedVideo> => {
        const newVideo: SavedVideo = {
            id: Date.now().toString(),
            name: videoData.name,
            url: URL.createObjectURL(videoData.blob),
            blob: videoData.blob,
            duration: videoData.duration,
            size: videoData.blob.size,
            createdAt: new Date(),
            format: videoData.format
        };

        const updatedVideos = [newVideo, ...savedVideos];

        // Limiter le nombre de vidéos stockées
        if (updatedVideos.length > MAX_VIDEOS) {
            updatedVideos.splice(MAX_VIDEOS);
        }

        setSavedVideos(updatedVideos);

        // Sauvegarder dans localStorage (version simplifiée)
        // Note: Les Blobs ne peuvent pas être sérialisés directement dans localStorage
        // Pour une vraie implémentation, il faudrait utiliser IndexedDB
        try {
            const serializableVideos = updatedVideos.map(video => ({
                id: video.id,
                name: video.name,
                duration: video.duration,
                size: video.size,
                createdAt: video.createdAt.toISOString(),
                format: video.format
                // Note: blob et url ne sont pas sérialisables
            }));

            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableVideos));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }

        return newVideo;
    };

    // Supprimer une vidéo
    const deleteVideo = async (videoId: string): Promise<void> => {
        const updatedVideos = savedVideos.filter(video => video.id !== videoId);

        // Libérer l'URL de l'objet
        const videoToDelete = savedVideos.find(v => v.id === videoId);
        if (videoToDelete) {
            URL.revokeObjectURL(videoToDelete.url);
        }

        setSavedVideos(updatedVideos);

        // Mettre à jour localStorage
        try {
            const serializableVideos = updatedVideos.map(video => ({
                id: video.id,
                name: video.name,
                duration: video.duration,
                size: video.size,
                createdAt: video.createdAt.toISOString(),
                format: video.format
            }));

            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableVideos));
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    // Obtenir les statistiques
    const getStats = () => {
        const totalVideos = savedVideos.length;
        const totalSize = savedVideos.reduce((acc, video) => acc + video.size, 0);
        const totalDuration = savedVideos.reduce((acc, video) => acc + video.duration, 0);

        return {
            totalVideos,
            totalSize,
            totalDuration,
            formatBreakdown: savedVideos.reduce((acc, video) => {
                acc[video.format] = (acc[video.format] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    };

    // Nettoyer toutes les vidéos (pour debug)
    const clearAllVideos = () => {
        savedVideos.forEach(video => URL.revokeObjectURL(video.url));
        setSavedVideos([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        savedVideos,
        isLoading,
        saveVideo,
        deleteVideo,
        getStats,
        clearAllVideos
    };
};
