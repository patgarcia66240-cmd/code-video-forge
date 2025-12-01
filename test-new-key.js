// Script pour tester la nouvelle clé publishable
import https from 'https';

const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const NEW_PUBLISHABLE_KEY = 'sb_publishable_HEqJFXgucqPIjWag5N3lww_RTCa_Bqf';

function testNewKey() {
  return new Promise((resolve) => {
    // Tester l'API REST d'abord
    const options = {
      hostname: 'xarnkfrwnpehoyzqdkoc.supabase.co',
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NEW_PUBLISHABLE_KEY}`,
        'apikey': NEW_PUBLISHABLE_KEY
      }
    };

    console.log('🧪 Test de la nouvelle clé publishable...');
    console.log('URL:', SUPABASE_URL);
    console.log('Clé:', NEW_PUBLISHABLE_KEY.substring(0, 20) + '...');
    console.log('');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Clé valide ! API REST fonctionne');
            console.log('Status:', res.statusCode);

            // Maintenant essayer de créer un utilisateur avec signup
            tryCreateUser();
          } else {
            console.log('❌ Clé invalide ou erreur API');
            console.log('Status:', res.statusCode);
            console.log('Response:', JSON.stringify(jsonData, null, 2));
          }
        } catch (e) {
          console.log('❌ Erreur parsing JSON:', e);
          console.log('Response brute:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erreur de requête:', e.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      req.abort();
      console.error('❌ Timeout');
      resolve();
    });

    req.end();
  });
}

function tryCreateUser() {
  const userData = {
    email: 'xenatronics@gmx.fr',
    password: 'Garcia66240!'
  };

  const postData = JSON.stringify(userData);

  const options = {
    hostname: 'xarnkfrwnpehoyzqdkoc.supabase.co',
    port: 443,
    path: '/auth/v1/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NEW_PUBLISHABLE_KEY}`,
      'apikey': NEW_PUBLISHABLE_KEY,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n🚀 Tentative de création utilisateur avec signup...');

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Utilisateur créé avec succès !');
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        } else {
          console.log('❌ Erreur lors de la création:');
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(jsonData, null, 2));

          if (jsonData.error_description || jsonData.msg) {
            console.log('Message d\'erreur:', jsonData.error_description || jsonData.msg);
          }
        }
      } catch (e) {
        console.log('❌ Erreur parsing:', e);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erreur requête:', e.message);
  });

  req.setTimeout(15000, () => {
    req.abort();
    console.error('❌ Timeout');
  });

  req.write(postData);
  req.end();
}

testNewKey();