import { supabase, VIDEOS_BUCKET } from '@/lib/supabase';
import type {
  VideoRecord,
  PublicVideo,
  CreateVideoData,
  VideoNameValidation,
  VideoStats,
  VideoFilters,
  VideoSortOptions,
  VideosResponse,
  SUPABASE_CONFIG
} from '@/types/supabase';

export interface SavedVideo {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  createdAt: Date;
  format: 'MP4' | 'WebM';
  storagePath: string;
}

class SupabaseStorageService {
  private bucketName = VIDEOS_BUCKET;

  /**
   * Initialise le bucket pour les vidéos s'il n'existe pas
   */
  async initializeBucket(): Promise<void> {
    try {
      console.log(`✅ Utilisation du bucket "${this.bucketName}" (configuration manuelle requise si erreur)`);

      // Le bucket est supposé exister déjà
      // Pour créer le bucket manuellement: allez dans Dashboard > Storage > New bucket
      return;

      // Code de vérification désactivé pour éviter les erreurs RLS
      // Décommentez si vous avez correctement configuré les politiques RLS

      /*
      // Vérifier si le bucket existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        console.warn('Erreur listing buckets (politiques RLS?):', listError);
        console.log('💡 Assurez-vous que le bucket "videos" existe manuellement dans votre dashboard');
        return;
      }

      const videoBucket = buckets?.find(bucket => bucket.name === this.bucketName);

      if (!videoBucket) {
        console.warn(`⚠️ Bucket "${this.bucketName}" non trouvé. Créez-le manuellement dans le dashboard Supabase.`);
        return;
      } else {
        console.log(`✅ Bucket "${this.bucketName}" trouvé et prêt à l'emploi`);
      }
      */
    } catch (error) {
      console.log('💡 Bucket considéré comme existant. Continue avec le bucket "videos"');
      // Ne pas bloquer l'application
      return;
    }
  }

  /**
   * Sauvegarde une vidéo dans Supabase Storage
   */
  async saveVideo(
    videoBlob: Blob,
    metadata: {
      name: string;
      duration: number;
      format: 'MP4' | 'WebM';
    }
  ): Promise<SavedVideo> {
    try {
      // S'assurer que le bucket existe
      await this.initializeBucket();

      // Valider et générer un nom unique si nécessaire
      const nameValidation = await this.checkNameExists(metadata.name);

      if (!nameValidation.isValid && nameValidation.suggestion) {
        console.warn(`Nom "${metadata.name}" déjà utilisé, suggestion: "${nameValidation.suggestion}"`);
        metadata.name = nameValidation.suggestion;
      }

      // Générer un nom de fichier unique
      const fileName = this.createUniqueFileName(metadata.name, metadata.format);
      const filePath = `videos/${fileName}`;

      // Uploader le fichier
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, videoBlob, {
          contentType: metadata.format === 'MP4' ? 'video/mp4' : 'video/webm',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erreur upload vidéo:', uploadError);
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      // Sauvegarder les métadonnées dans la base de données
      const videoData: CreateVideoData = {
        name: metadata.name,
        storage_path: filePath,
        duration: metadata.duration,
        size: videoBlob.size,
        format: metadata.format,
        description: `Vidéo générée le ${new Date().toLocaleDateString('fr-FR')}`,
        tags: ['animation-code', 'auto-générée'],
      };

      const { data: savedMetadata, error: metadataError } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (metadataError) {
        // Gérer les différentes erreurs possibles
        if (metadataError.message?.includes('row-level security policy')) {
          console.warn('⚠️ Erreur RLS: Politiques insuffisantes pour insérer dans la table videos');
          console.log('💡 Solution: Exécutez le script fix_rls_policies.sql dans votre dashboard Supabase');
        } else if (metadataError.message?.includes('relation "videos" does not exist')) {
          console.warn('⚠️ Erreur: La table "videos" n\'existe pas encore');
          console.log('💡 Solution: Exécutez le script setup_table_videos.sql dans votre dashboard Supabase');
        } else {
          console.warn('⚠️ Erreur lors de l\'insertion dans la table videos:', metadataError);
        }

        // Créer un enregistrement local temporaire (fallback)
        const tempSavedVideo: SavedVideo = {
          id: uploadData.path || Date.now().toString(),
          name: metadata.name,
          url: publicUrl,
          duration: metadata.duration,
          size: videoBlob.size,
          createdAt: new Date(),
          format: metadata.format,
          storagePath: filePath,
        };

        console.log('🔄 Utilisation du mode fallback local');
        return tempSavedVideo;
      }

      return {
        id: savedMetadata.id,
        name: savedMetadata.name,
        url: publicUrl,
        duration: savedMetadata.duration,
        size: savedMetadata.size,
        createdAt: new Date(savedMetadata.created_at),
        format: savedMetadata.format,
        storagePath: savedMetadata.storage_path,
      };

    } catch (error) {
      console.error('Erreur sauvegarde vidéo:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les vidéos sauvegardées
   */
  async getAllVideos(): Promise<SavedVideo[]> {
    try {
      console.log('🔍 Début getAllVideos - Récupération depuis la DB...');
      
      // Essayer de récupérer depuis la base de données
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Résultat requête DB:', { 
        videosCount: videos?.length, 
        error: error?.message,
        videos: videos 
      });

      if (error) {
        console.warn('❌ Erreur récupération vidéos depuis DB:', error);
        console.log('🔄 Fallback: récupération depuis Storage...');
        // Fallback: lister les fichiers directement depuis Storage
        return this.getVideosFromStorage();
      }

      // Transformer les métadonnées en SavedVideo avec URLs signées (fonctionne pour buckets privés)
      const savedVideos: SavedVideo[] = await Promise.all(
        videos.map(async (metadata: VideoRecord) => {
          // Essayer d'abord une URL signée (pour buckets privés)
          const { data: signedUrlData, error: signedError } = await supabase.storage
            .from(this.bucketName)
            .createSignedUrl(metadata.storage_path, 3600); // 1 heure d'expiration

          let videoUrl: string;
          
          if (signedError || !signedUrlData?.signedUrl) {
            // Fallback sur URL publique
            console.warn('⚠️ Signed URL échouée, utilisation URL publique:', signedError);
            const { data: { publicUrl } } = supabase.storage
              .from(this.bucketName)
              .getPublicUrl(metadata.storage_path);
            videoUrl = publicUrl;
          } else {
            videoUrl = signedUrlData.signedUrl;
            console.log('✅ URL signée générée pour:', metadata.name);
          }

          return {
            id: metadata.id,
            name: metadata.name,
            url: videoUrl,
            duration: metadata.duration,
            size: metadata.size,
            createdAt: new Date(metadata.created_at),
            format: metadata.format,
            storagePath: metadata.storage_path,
          };
        })
      );

      return savedVideos;

    } catch (error) {
      console.error('Erreur récupération vidéos:', error);
      return [];
    }
  }

  /**
   * Récupère les vidéos directement depuis Storage (fallback)
   */
  private async getVideosFromStorage(): Promise<SavedVideo[]> {
    try {
      const { data: files, error } = await supabase.storage
        .from(this.bucketName)
        .list('videos');

      if (error) {
        console.error('Erreur listing fichiers Storage:', error);
        return [];
      }

      const videos: SavedVideo[] = files
        .filter(file => file.name.endsWith('.mp4') || file.name.endsWith('.webm'))
        .map((file, index) => {
          const filePath = `videos/${file.name}`;
          const { data: { publicUrl } } = supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

          // Extraire le nom du fichier sans timestamp et extension
          const cleanName = file.name
            .replace(/^\d+_/, '') // Enlever le timestamp
            .replace(/\.(mp4|webm)$/i, '') // Enlever l'extension
            .replace(/_/g, ' '); // Remplacer les underscores par des espaces

          return {
            id: file.id || `file_${index}`,
            name: cleanName || `Vidéo ${index + 1}`,
            url: publicUrl,
            duration: 0, // Non disponible depuis Storage seul
            size: file.metadata?.size || 0,
            createdAt: new Date(file.created_at || Date.now()),
            format: file.name.endsWith('.mp4') ? 'MP4' : 'WebM',
            storagePath: filePath,
          };
        });

      return videos;

    } catch (error) {
      console.error('Erreur fallback vidéos Storage:', error);
      return [];
    }
  }

  /**
   * Supprime une vidéo
   */
  async deleteVideo(videoId: string, storagePath: string): Promise<void> {
    try {
      console.log('🗑️ Début suppression vidéo:', { videoId, storagePath });

      // D'abord supprimer les métadonnées de la base de données
      console.log('🔍 Recherche de la vidéo à supprimer:', videoId);

      // Vérifier d'abord si la vidéo existe
      const { data: existingVideo, error: checkError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      console.log('🔍 Vérification vidéo existante:', { existingVideo, checkError });

      if (checkError) {
        console.error('❌ Impossible de vérifier la vidéo:', checkError);
      } else if (!existingVideo) {
        console.warn('⚠️ La vidéo n\'existe pas dans la table DB, ID:', videoId);
      } else {
        console.log('✅ Vidéo trouvée dans la DB:', existingVideo.name);
      }

      // Tenter la suppression avec retour complet
      const { data: deleteResult, error: dbError, count } = await supabase
        .from('videos')
        .delete({ count: 'exact' })
        .eq('id', videoId)
        .select();

      console.log('📊 Résultat suppression DB:', {
        deleteResult,
        dbError,
        count,
        deleteResultLength: deleteResult?.length,
        countNumber: count
      });

      // Vérifier si la suppression a vraiment fonctionné
      if (dbError) {
        console.error('❌ Erreur suppression métadonnées DB:', dbError);

        // Analyse détaillée de l'erreur RLS
        if (dbError.message?.includes('row-level security policy')) {
          console.error('🚨 ERREUR RLS: Politiques insuffisantes pour DELETE sur la table videos');
          console.log('💡 Solution: Exécutez ce script SQL dans votre dashboard Supabase:');
          console.log(`
-- Politique RLS pour permettre la suppression
CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE TO authenticated
  USING (auth.uid()::text = user_id);

-- OU politique plus permissive pour les tests
CREATE POLICY "Allow delete operations" ON videos
  FOR DELETE
  USING (true);
          `);
        } else if (dbError.message?.includes('relation "videos" does not exist')) {
          console.error('🚨 ERREUR: La table "videos" n\'existe pas');
          console.log('💡 Solution: Créez la table avec le script SQL fourni');
        } else {
          console.error('🚨 Erreur inattendue DB:', dbError);
        }

        throw new Error(`Impossible de supprimer les métadonnées: ${dbError.message}`);
      } else if (count === 0) {
        // Cas étrange: pas d'erreur mais 0 lignes supprimées
        console.warn('⚠️ AUCUNE LIGNE SUPPRIMÉE - RLS bloque la suppression silencieusement');
        console.error('🚨 PROBLÈME: La suppression retourne succès mais ne supprime rien');
        console.log('💡 Solution probable: Politique RLS trop restrictive');

        // Vérifier les politiques actuelles
        console.log('🔍 Vérification des politiques RLS...');
        console.log('💡 SOLUTION IMMÉDIATE: Exécutez le script SQL debug_rls_permissions.sql dans votre dashboard Supabase');
        console.log('🚨 Ce script va créer une politique DELETE très permissive pour permettre la suppression');

        throw new Error('Suppression bloquée par RLS - 0 lignes supprimées. Exécutez debug_rls_permissions.sql dans Supabase.');
      } else {
        console.log(`✅ Suppression DB réussie: ${count} ligne(s) supprimée(s)`);
      }

      // Ensuite supprimer le fichier du Storage
      console.log('📁 Suppression fichier Storage:', storagePath);
      const { data: storageData, error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([storagePath]);

      console.log('📁 Résultat suppression Storage:', { storageData, storageError });

      if (storageError) {
        console.error('❌ Erreur suppression fichier Storage:', storageError);

        // Ne pas bloquer si la DB est déjà supprimée
        console.warn('⚠️ Le fichier n\'a pas pu être supprimé du Storage, mais les métadonnées DB sont supprimées');
        console.log('💡 Vous devrez peut-être supprimer manuellement le fichier:', storagePath);
      }

      console.log('✅ Suppression vidéo terminée avec succès');

    } catch (error) {
      console.error('💥 Erreur générale suppression vidéo:', error);
      throw error;
    }
  }

  /**
   * Calcule les statistiques sur les vidéos
   */
  async getStats(): Promise<{
    totalVideos: number;
    totalSize: number;
    totalDuration: number;
    formatBreakdown: Record<string, number>;
  }> {
    try {
      const videos = await this.getAllVideos();

      const totalVideos = videos.length;
      const totalSize = videos.reduce((acc, video) => acc + video.size, 0);
      const totalDuration = videos.reduce((acc, video) => acc + video.duration, 0);

      const formatBreakdown = videos.reduce((acc, video) => {
        acc[video.format] = (acc[video.format] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalVideos,
        totalSize,
        totalDuration,
        formatBreakdown,
      };

    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return {
        totalVideos: 0,
        totalSize: 0,
        totalDuration: 0,
        formatBreakdown: {},
      };
    }
  }

  /**
   * Vérifie si un nom de vidéo existe déjà
   */
  async checkNameExists(name: string): Promise<VideoNameValidation> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('name')
        .eq('name', name)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erreur vérification nom:', error);
        return {
          isValid: false,
          error: 'Impossible de vérifier le nom',
          suggestion: `${name}_${Date.now()}`
        };
      }

      const nameExists = data !== null;

      if (nameExists) {
        return {
          isValid: false,
          error: 'Ce nom de vidéo existe déjà',
          suggestion: this.generateUniqueName(name)
        };
      }

      return {
        isValid: true
      };

    } catch (error) {
      console.error('Erreur validation nom:', error);
      return {
        isValid: false,
        error: 'Erreur lors de la validation du nom',
        suggestion: `${name}_${Date.now()}`
      };
    }
  }

  /**
   * Génère un nom unique basé sur un nom existant
   */
  generateUniqueName(baseName: string): string {
    const timestamp = new Date().toISOString();
    const shortTimestamp = timestamp.replace(/[:.]/g, '-').slice(0, 19);
    return `${baseName}_${shortTimestamp}`;
  }

  /**
   * Crée un nom de fichier unique basé sur le nom de la vidéo
   */
  createUniqueFileName(name: string, format: 'MP4' | 'WebM'): string {
    const timestamp = Date.now();
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 50); // Limiter la longueur

    return `${timestamp}_${sanitizedName}.${format.toLowerCase()}`;
  }
}

export const supabaseStorage = new SupabaseStorageService();
export default supabaseStorage;
