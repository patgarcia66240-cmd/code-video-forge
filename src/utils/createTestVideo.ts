/**
 * Utilitaire pour créer une vidéo test dans Supabase
 * Pour tester la contrainte de nom unique
 */

import { supabaseStorage } from '@/services/supabaseStorage';

/**
 * Crée une vidéo test avec le nom "pour etre mise"
 * Si le nom existe déjà, il sera automatiquement modifié
 */
export async function createTestVideoForEtremise(): Promise<void> {
  try {
    console.log('Création d\'une vidéo test avec le nom "pour etre mise"...');

    // Créer un blob vidéo factice plus petit (pour le test)
    const testVideoData = new Blob(
      ['TEST VIDEO DATA'],
      { type: 'video/mp4' }
    );

    const result = await supabaseStorage.saveVideo(testVideoData, {
      name: 'pour etre mise',
      duration: 10.5, // 10 secondes et demi
      format: 'MP4'
    });

    console.log('✅ Vidéo test créée avec succès:', {
      id: result.id,
      name: result.name,
      url: result.url,
      size: result.size,
      duration: result.duration
    });

    // Afficher un message à l'utilisateur
    alert(`✅ Vidéo test "pour etre mise" créée avec succès!\n\n` +
          `ID: ${result.id}\n` +
          `Nom: ${result.name}\n` +
          `Durée: ${result.duration}s\n` +
          `Taille: ${(result.size / 1024).toFixed(2)} KB\n\n` +
          `Rendez-vous dans la galerie pour voir votre vidéo.`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la vidéo test:', error);

    // Afficher un message d'erreur à l'utilisateur
    alert(`❌ Erreur lors de la création de la vidéo test:\n\n${error}\n\n` +
          'Vérifiez votre configuration Supabase dans le fichier .env');
  }
}

/**
 * Valide si un nom de vidéo est disponible
 */
export async function checkVideoNameAvailability(name: string): Promise<boolean> {
  try {
    const validation = await supabaseStorage.checkNameExists(name);

    if (validation.isValid) {
      console.log(`✅ Le nom "${name}" est disponible`);
      return true;
    } else {
      console.warn(`❌ Le nom "${name}" n'est pas disponible:`, validation.error);
      if (validation.suggestion) {
        console.log(`💡 Suggestion: "${validation.suggestion}"`);
      }
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la validation du nom:', error);
    return false;
  }
}

/**
 * Crée plusieurs vidéos test pour tester la gestion des noms uniques
 */
export async function createMultipleTestVideos(): Promise<void> {
  const testNames = [
    'pour etre mise',
    'pour etre mise',
    'pour etre mise',
    'animation de test',
    'ma premiere video',
    'demo'
  ];

  console.log('Création de vidéos test pour la gestion des noms uniques...');

  for (const [index, name] of testNames.entries()) {
    console.log(`\n--- Test ${index + 1}/${testNames.length}: "${name}" ---`);

    try {
      // Créer un blob vidéo factice avec différentes tailles
      const testVideoData = new Blob(
        [`TEST VIDEO ${index + 1} - ${name} - ${Date.now()}`],
        { type: index % 2 === 0 ? 'video/mp4' : 'video/webm' }
      );

      const result = await supabaseStorage.saveVideo(testVideoData, {
        name,
        duration: Math.random() * 60, // durée aléatoire entre 0 et 60s
        format: index % 2 === 0 ? 'MP4' : 'WebM'
      });

      console.log(`✅ Vidéo ${index + 1} créée:`, result.name);

    } catch (error) {
      console.error(`❌ Erreur pour la vidéo ${index + 1}:`, error);
    }

    // Petit délai entre les créations
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Création des vidéos test terminée!');
  alert('Création des vidéos test terminée! Vérifiez la galerie.');
}

export default createTestVideoForEtremise;