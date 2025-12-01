import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec la clé service_role
const supabaseUrl = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcm5rZnJ3bnBlaG95enFka29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjQ3NjEzOCwiZXhwIjoyMDU4MDUyMTM4fQ.bk2L27lp7LZPLXK2uMtC931cl3eEPgrK1sf8NFMdWTI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  try {
    console.log('🚀 Création d\'un utilisateur de test...');

    // Créer l'utilisateur avec auth.admin (nécessite la clé service_role)
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        name: 'Test User',
        created_by: 'script'
      }
    });

    if (error) {
      console.error('❌ Erreur lors de la création:', error.message);

      // Si erreur de base de données, essayer avec signUp
      if (error.message.includes('Database error')) {
        console.log('🔄 Tentative avec méthode d\'inscription...');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              name: 'Test User'
            }
          }
        });

        if (signUpError) {
          console.error('❌ Erreur avec signUp:', signUpError.message);
          return;
        }

        console.log('✅ Utilisateur créé avec succès (signUp) !');
        console.log('📧 Email:', signUpData.user?.email);
        console.log('🆔 ID:', signUpData.user?.id);
      }
      return;
    }

    console.log('✅ Utilisateur créé avec succès (admin) !');
    console.log('📧 Email:', data.user?.email);
    console.log('🆔 ID:', data.user?.id);
    console.log('👤 Nom:', data.user?.user_metadata?.name);

  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
  }
}

// Fonction pour vérifier si l'utilisateur existe déjà
async function checkUserExists() {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Erreur lors de la vérification:', error.message);
      return false;
    }

    const existingUser = users.find(user => user.email === 'test@example.com');

    if (existingUser) {
      console.log('ℹ️ L\'utilisateur test@example.com existe déjà:');
      console.log('🆔 ID:', existingUser.id);
      console.log('📧 Email:', existingUser.email);
      console.log('✅ Confirmé:', existingUser.email_confirmed_at ? 'Oui' : 'Non');
      return true;
    }

    return false;
  } catch (err) {
    console.error('Erreur lors de la vérification:', err.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Vérification si l\'utilisateur existe déjà...');
  const userExists = await checkUserExists();

  if (!userExists) {
    console.log('📝 L\'utilisateur n\'existe pas, création en cours...');
    await createUser();
  } else {
    console.log('✅ Utilisateur déjà présent, pas besoin de le créer.');
  }
}

main();