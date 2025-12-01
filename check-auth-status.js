// Script pour vérifier quand le service d'auth sera de nouveau disponible
import https from 'https';

const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_flcBh7H3hRQ3-aO9OItUJQ_WIhlo5WZ';

function checkAuthStatus() {
  const options = {
    hostname: 'xarnkfrwnpehoyzqdkoc.supabase.co',
    port: 443,
    path: '/auth/v1/admin/users',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);

        if (res.statusCode === 200) {
          console.log('✅ Service d\'authentification DISPONIBLE !');
          console.log('');
          console.log('Vous pouvez maintenant créer l\'utilisateur avec:');
          console.log('node create-user-final.js');
        } else {
          console.log('❌ Service toujours en panne:');
          console.log(`Status: ${res.statusCode}`);
          console.log(`Erreur: ${jsonData.msg || jsonData.message}`);
          console.log(`ID: ${jsonData.error_id || 'N/A'}`);
        }
      } catch (e) {
        console.log('❌ Erreur parsing:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erreur réseau:', e.message);
  });

  req.setTimeout(10000, () => {
    req.abort();
    console.error('❌ Timeout');
  });

  req.end();
}

console.log('🔍 Vérification du statut du service d\'authentification...');
console.log('Heure:', new Date().toLocaleString('fr-FR'));
console.log('');

checkAuthStatus();

// Pour tester automatiquement toutes les 30 secondes
setInterval(() => {
  console.log('\n' + '='.repeat(50));
  console.log('🔍 Nouvelle vérification...');
  console.log('Heure:', new Date().toLocaleString('fr-FR'));
  checkAuthStatus();
}, 30000);