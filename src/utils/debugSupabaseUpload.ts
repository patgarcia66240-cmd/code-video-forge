/**
 * Utilitaire de debug pour identifier l'erreur "invalid input syntax for type integer"
 */

import { supabaseStorage } from '@/services/supabaseStorage';

export async function debugSupabaseUpload(): Promise<void> {
  console.log('🔍 DÉBUT DU DEBUG SUPABASE UPLOAD');

  try {
    // Créer un blob test très petit
    const testBlob = new Blob(['test'], { type: 'video/mp4' });

    console.log('📦 Blob créé:', {
      size: testBlob.size,
      type: testBlob.type,
      isNumber: typeof testBlob.size === 'number'
    });

    // Préparer les métadonnées manuellement
    const metadata = {
      name: 'debug-video-test',
      duration: 5.0,
      format: 'MP4' as const
    };

    console.log('📋 Métadonnées préparées:', {
      name: metadata.name,
      duration: metadata.duration,
      durationType: typeof metadata.duration,
      format: metadata.format
    });

    // Appeler la méthode saveVideo avec logging détaillé
    console.log('🚀 Appel de supabaseStorage.saveVideo()...');

    const result = await supabaseStorage.saveVideo(testBlob, metadata);

    console.log('✅ Résultat:', result);

  } catch (error) {
    console.error('❌ Erreur détaillée:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      stack: error.stack
    });

    // Analyser spécifiquement l'erreur de type
    if (error.message?.includes('invalid input syntax for type integer')) {
      console.log('🔎 Analyse de l\'erreur integer:');
      console.log('- Probable cause: La colonne "size" reçoit une chaîne au lieu d\'un nombre');
      console.log('- Vérifier: INSERT INTO videos (size, ...) VALUES ("chaîne", ...)');

      // Suggérer la correction
      console.log('💡 Solution possible: Vérifier les types de données dans l\'INSERT');
    }
  }

  console.log('🏁 FIN DU DEBUG');
}

// Fonction pour tester directement l'insertion Supabase
export async function testDirectSupabaseInsert(): Promise<void> {
  console.log('🧪 TEST DIRECT SUPABASE INSERT');

  try {
    // Importer le client Supabase directement
    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(
      'https://xarnkfrwnpehoyzqdkoc.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcm5rZnJ3bnBlc3hveW95kocCIsInJlZiI6ImlhdXQiOjE3NDI0NzYxMzgsImV4cCI6MjA1ODA1MjEzOH0KqganJWX3j4U9MyHN2IEronOcREcN0xVZoEp46REHnw'
    );

    // Test d'insertion direct avec des valeurs garanties
    const { data, error } = await supabase
      .from('videos')
      .insert({
        name: 'direct-test-video',
        storage_path: 'videos/direct_test.mp4',
        duration: 10.5,
        size: 1024, // Valeur numérique explicite
        format: 'MP4'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion directe:', error);
    } else {
      console.log('✅ Insertion directe réussie:', data);
    }

  } catch (error) {
    console.error('❌ Erreur test direct:', error);
  }
}

export default debugSupabaseUpload;