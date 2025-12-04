import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SavedCode {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
  user_id: string;
  thumbnail?: string;
  description?: string;
  tags?: string[];
}

export const useCodeStorage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseEnabled, setIsSupabaseEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      loadCodes();
    }
  }, [user]);

  const loadCodes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement codes:', error);
        // Si la table n'existe pas, créer les tables nécessaires
        if (error.code === 'PGRST204') {
          await initializeTables();
        }
        setSavedCodes([]);
      } else {
        setSavedCodes(data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setIsSupabaseEnabled(false);
      setSavedCodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTables = async () => {
    try {
      // Créer la table saved_codes
      const { error: createTableError } = await supabase.rpc('create_saved_codes_table');
      if (createTableError) {
        console.warn('Impossible de créer la table saved_codes:', createTableError);
        setIsSupabaseEnabled(false);
      }
    } catch (error) {
      console.warn('Erreur initialisation tables:', error);
      setIsSupabaseEnabled(false);
    }
  };

  const saveCode = async (code: string, language: string, title?: string, description?: string, tags?: string[]) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour sauvegarder votre code",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const codeData = {
        title: title || `Code ${new Date().toLocaleDateString('fr-FR')}`,
        code,
        language,
        user_id: user.id,
        description: description || '',
        tags: tags || [],
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('saved_codes')
        .insert([codeData])
        .select()
        .single();

      if (error) {
        // Si la table n'existe pas, essayer de la créer
        if (error.code === 'PGRST204' || error.message.includes('relation "saved_codes" does not exist')) {
          await initializeTables();
          // Réessayer après création
          const retryResult = await supabase
            .from('saved_codes')
            .insert([codeData])
            .select()
            .single();

          if (retryResult.error) {
            throw retryResult.error;
          }
          setSavedCodes(prev => [retryResult.data, ...prev]);
          toast({
            title: "Code sauvegardé !",
            description: "Votre code a été ajouté à vos collections",
          });
          return retryResult.data;
        }
        throw error;
      }

      setSavedCodes(prev => [data, ...prev]);
      toast({
        title: "Code sauvegardé !",
        description: "Votre code a été ajouté à vos collections",
      });
      return data;

    } catch (error) {
      console.error('Erreur sauvegarde code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le code",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_codes')
        .delete()
        .eq('id', codeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedCodes(prev => prev.filter(code => code.id !== codeId));
      toast({
        title: "Code supprimé",
        description: "Le code a été retiré de vos collections",
      });

    } catch (error) {
      console.error('Erreur suppression code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le code",
        variant: "destructive",
      });
    }
  };

  const updateCode = async (codeId: string, updates: Partial<SavedCode>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('saved_codes')
        .update(updates)
        .eq('id', codeId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSavedCodes(prev =>
        prev.map(code =>
          code.id === codeId ? { ...code, ...data } : code
        )
      );

      toast({
        title: "Code mis à jour",
        description: "Votre code a été modifié avec succès",
      });

      return data;

    } catch (error) {
      console.error('Erreur mise à jour code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le code",
        variant: "destructive",
      });
      return null;
    }
  };

  const getStats = () => {
    return {
      totalCodes: savedCodes.length,
      totalSize: savedCodes.reduce((acc, code) => acc + (code.code?.length || 0), 0),
      languages: [...new Set(savedCodes.map(code => code.language))].length,
    };
  };

  return {
    savedCodes,
    isLoading,
    isSupabaseEnabled,
    saveCode,
    deleteCode,
    updateCode,
    loadCodes,
    getStats,
  };
};