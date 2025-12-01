#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (distante)
const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_flcBh7H3hRQ3-aO9OItUJQ_WIhlo5WZ';

// Création du client admin
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Interface utilisateur en ligne de commande
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createUserManually() {
  console.log('🚀 Création manuelle d\'utilisateur Supabase');
  console.log('=====================================\n');

  try {
    // Demander les informations
    const email = await question('📧 Email [xenatronics@gmx.fr]: ') || 'xenatronics@gmx.fr';
    const password = await question('🔑 Mot de passe [Garcia66240!]: ') || 'Garcia66240!';
    const name = await question('👤 Nom [Xenatronics]: ') || 'Xenatronics';
    const confirmEmail = await question('✅ Confirmer l\'email automatiquement? (O/n) ');

    const confirm = await question(`\n📋 Résumé:
   Email: ${email}
   Mot de passe: ${password.replace(/./g, '*')}
   Nom: ${name}
   Email confirmé: ${confirmEmail.toLowerCase() !== 'n' ? 'Oui' : 'Non'}

\nConfirmer la création? (O/n): `);

    if (confirm.toLowerCase() === 'n') {
      console.log('❌ Opération annulée');
      rl.close();
      return;
    }

    console.log('\n⏳ Création en cours...');

    // Créer l'utilisateur
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: confirmEmail.toLowerCase() !== 'n',
      user_metadata: {
        name: name,
        role: 'user',
        created_by: 'cli-script'
      }
    });

    if (error) {
      console.error('\n❌ Erreur lors de la création:');
      console.error('   Code:', error.status);
      console.error('   Message:', error.message);

      if (error.message.includes('already been registered')) {
        console.log('\n💡 L\'utilisateur existe déjà. Essayez de vous connecter.');
      } else if (error.message.includes('Database error')) {
        console.log('\n⚠️  Le service d\'authentification Supabase est temporairement en panne.');
        console.log('   Réessayez plus tard ou utilisez le dashboard Supabase.');
      }

      rl.close();
      return;
    }

    // Succès
    console.log('\n✅ Utilisateur créé avec succès !');
    console.log('=====================================');
    console.log(`📧 Email: ${data.user?.email}`);
    console.log(`🆔 ID: ${data.user?.id}`);
    console.log(`👤 Nom: ${data.user?.user_metadata?.name}`);
    console.log(`✅ Email confirmé: ${data.user?.email_confirmed_at ? 'Oui' : 'Non'}`);
    console.log(`📅 Créé le: ${data.user?.created_at}`);
    console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);

  } catch (err) {
    console.error('\n❌ Erreur inattendue:', err.message);
  }

  rl.close();
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Script de création d'utilisateur Supabase

Usage:
  node create-user-cli.js [options]

Options:
  --email <email>        Email de l'utilisateur
  --password <password>   Mot de passe
  --name <nom>          Nom de l'utilisateur
  --confirm             Confirmer l'email automatiquement
  --help, -h           Afficher cette aide

Exemples:
  node create-user-cli.js
  node create-user-cli.js --email user@example.com --password pass123 --confirm
  node create-user-cli.js --email xenatronics@gmx.fr --password Garcia66240! --name Xenatronics --confirm
  `);
  process.exit(0);
}

// Mode rapide avec arguments
if (args.includes('--email')) {
  const emailIndex = args.indexOf('--email') + 1;
  const passwordIndex = args.indexOf('--password') + 1;
  const nameIndex = args.indexOf('--name') + 1;

  const email = args[emailIndex] || 'xenatronics@gmx.fr';
  const password = args[passwordIndex] || 'Garcia66240!';
  const name = args[nameIndex] || 'Xenatronics';
  const confirm = args.includes('--confirm');

  console.log(`\n🚀 Création rapide de l'utilisateur...`);

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: confirm,
      user_metadata: {
        name: name,
        role: 'user',
        created_by: 'cli-script-quick'
      }
    });

    if (error) {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    }

    console.log('✅ Utilisateur créé avec succès !');
    console.log(`📧 Email: ${data.user?.email}`);
    console.log(`🆔 ID: ${data.user?.id}`);
    console.log(`✅ Confirmé: ${confirm ? 'Oui' : 'Non'}`);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

// Mode interactif par défaut
createUserManually();