// Script final pour créer l'utilisateur avec la clé service_role
import https from 'https';

const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_flcBh7H3hRQ3-aO9OItUJQ_WIhlo5WZ';

function createUserWithServiceRole() {
  const userData = {
    email: 'xenatronics@gmx.fr',
    password: 'Garcia66240!',
    email_confirm: true,
    user_metadata: {
      name: 'Xenatronics',
      role: 'user'
    }
  };

  const postData = JSON.stringify(userData);

  const options = {
    hostname: 'xarnkfrwnpehoyzqdkoc.supabase.co',
    port: 443,
    path: '/auth/v1/admin/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🚀 Création utilisateur avec clé service_role...');
  console.log('URL:', SUPABASE_URL);
  console.log('Email:', userData.email);
  console.log('');

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Utilisateur créé avec succès !');
          console.log('Status:', res.statusCode);
          console.log('');
          console.log('Détails:');
          console.log('- Email:', jsonData.email);
          console.log('- ID:', jsonData.id);
          console.log('- Confirmé:', jsonData.email_confirmed_at ? 'Oui' : 'Non');
          console.log('- Créé le:', jsonData.created_at);
          console.log('');
          console.log('🎉 Vous pouvez maintenant vous connecter avec:');
          console.log('📧 Email: xenatronics@gmx.fr');
          console.log('🔑 Mot de passe: Garcia66240!');
        } else {
          console.log('❌ Erreur lors de la création:');
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(jsonData, null, 2));

          // Vérifier si l'utilisateur existe déjà
          if (jsonData.message && jsonData.message.includes('already been registered')) {
            console.log('');
            console.log('ℹ️ L\'utilisateur existe déjà. Essayez de vous connecter.');
          }
        }
      } catch (e) {
        console.log('❌ Erreur parsing JSON:', e);
        console.log('Response brute:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erreur de requête:', e.message);
  });

  req.setTimeout(15000, () => {
    req.abort();
    console.error('❌ Timeout après 15 secondes');
  });

  req.write(postData);
  req.end();
}

// D'abord tester si la clé fonctionne
function testServiceRoleKey() {
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

  console.log('🔍 Test de la clé service_role...');

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Clé service_role valide !');
      console.log('');
      createUserWithServiceRole();
    } else {
      console.log('❌ Clé service_role invalide');
      console.log('Status:', res.statusCode);

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Response:', data);
        }
      });
    }
  });

  req.on('error', (e) => {
    console.error('❌ Erreur test clé:', e.message);
  });

  req.setTimeout(10000, () => {
    req.abort();
    console.error('❌ Timeout test clé');
  });

  req.end();
}

testServiceRoleKey();