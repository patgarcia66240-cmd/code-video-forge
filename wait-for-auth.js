#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_flcBh7H3hRQ3-aO9OItUJQ_WIhlo5WZ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 Surveillance du service d\'authentification Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('⏰ Toutes les 30 secondes\n');

let checkCount = 0;

async function checkAuth() {
  checkCount++;

  try {
    const { error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ❌ Tentative ${checkCount}: ${error.message}`);
    } else {
      console.log(`\n🎉 SERVICE DISPONIBLE ! (après ${checkCount} tentatives)`);
      console.log('⏰ Heure:', new Date().toLocaleString('fr-FR'));
      console.log('\n✅ Vous pouvez maintenant créer l\'utilisateur avec:');
      console.log('   node create-user-cli.js --email xenatronics@gmx.fr --password Garcia66240! --name Xenatronics --confirm');
      console.log('\n✅ Ou via le dashboard:');
      console.log('   https://xarnkfrwnpehoyzqdkoc.supabase.co');
      process.exit(0);
    }
  } catch (err) {
    console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ❌ Tentative ${checkCount}: Erreur réseau`);
  }
}

// Vérification immédiate
checkAuth();

// Puis toutes les 30 secondes
setInterval(checkAuth, 30000);

// Permettre d'arrêter avec Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Surveillance arrêtée après', checkCount, 'vérifications');
  process.exit(0);
});