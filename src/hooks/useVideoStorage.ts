import { useState, useEffect } from 'react';
import { supabaseStorage } from '@/services/supabaseStorage';
import { SavedVideo as SupabaseSavedVideo } from '@/services/supabaseStorage';

// Interface pour une vidéo sauvegardée (compatible avec l'existante)
export interface SavedVideo {
    id: string;
    name: string;
    url: string;
    blob?: Blob; // Optionnel car Supabase gère le stockage
    duration: number;
    size: number;
    createdAt: Date;
    format: 'MP4' | 'WebM';
    storagePath?: string; // Ajouté pour Supabase
}

const STORAGE_KEY = 'savedVideos';
const MAX_VIDEOS = 50; // Limite pour éviter de saturer le stockage

// Option pour basculer entre localStorage et Supabase
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export const useVideoStorage = () => {
    const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les vidéos depuis localStorage ou Supabase au démarrage
    useEffect(() => {
        const loadVideos = async () => {
            try {
                if (USE_SUPABASE) {
                    // Utiliser Supabase Storage avec gestion d'erreur
                    try {
                        const videos = await supabaseStorage.getAllVideos();
                        setSavedVideos(videos);
                    } catch (supabaseError) {
                        console.warn('⚠️ Supabase non disponible, utilisation du mode local:', supabaseError);
                        setSavedVideos([]);
                    }
                } else {
                    // Utiliser localStorage (fallback)
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
                        setSavedVideos([]);
                    }
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
        try {
            let newVideo: SavedVideo;

            if (USE_SUPABASE) {
                // Utiliser Supabase Storage
                const savedVideo = await supabaseStorage.saveVideo(
                    videoData.blob,
                    {
                        name: videoData.name,
                        duration: videoData.duration,
                        format: videoData.format,
                    }
                );

                newVideo = savedVideo;
            } else {
                // Utiliser localStorage (fallback)
                newVideo = {
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
            }

            // Rafraîchir la liste depuis Supabase si nécessaire
            if (USE_SUPABASE) {
                const videos = await supabaseStorage.getAllVideos();
                setSavedVideos(videos);
            }

            return newVideo;

        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la vidéo:', error);
            throw error;
        }
    };

    // Supprimer une vidéo
    const deleteVideo = async (videoId: string): Promise<void> => {
        try {
            if (USE_SUPABASE) {
                // Utiliser Supabase Storage
                const videoToDelete = savedVideos.find(v => v.id === videoId);
                if (videoToDelete?.storagePath) {
                    await supabaseStorage.deleteVideo(videoId, videoToDelete.storagePath);
                }

                // Rafraîchir la liste
                const videos = await supabaseStorage.getAllVideos();
                setSavedVideos(videos);
            } else {
                // Utiliser localStorage (fallback)
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
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la vidéo:', error);
            throw error;
        }
    };

    // Obtenir les statistiques
    const getStats = async () => {
        if (USE_SUPABASE) {
            return await supabaseStorage.getStats();
        } else {
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
        }
    };

    // Nettoyer toutes les vidéos (pour debug)
    const clearAllVideos = async () => {
        try {
            if (USE_SUPABASE) {
                // Supprimer toutes les vidéos de Supabase
                for (const video of savedVideos) {
                    if (video.storagePath) {
                        try {
                            await supabaseStorage.deleteVideo(video.id, video.storagePath);
                        } catch (error) {
                            console.error('Erreur suppression vidéo:', video.id, error);
                        }
                    }
                }
            } else {
                // Libérer les URLs des objets
                savedVideos.forEach(video => {
                    if (video.url) {
                        URL.revokeObjectURL(video.url);
                    }
                });
                localStorage.removeItem(STORAGE_KEY);
            }

            setSavedVideos([]);
        } catch (error) {
            console.error('Erreur nettoyage vidéos:', error);
        }
    };

    return {
        savedVideos,
        isLoading,
        saveVideo,
        deleteVideo,
        getStats,
        clearAllVideos,
        isSupabaseEnabled: USE_SUPABASE,
        // Fonction pour rafraîchir les URLs (régénère les signed URLs)
        refreshVideos: async () => {
            setIsLoading(true);
            try {
                if (USE_SUPABASE) {
                    const videos = await supabaseStorage.getAllVideos();
                    setSavedVideos(videos);
                }
            } catch (error) {
                console.error('Erreur rafraîchissement vidéos:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };
};
