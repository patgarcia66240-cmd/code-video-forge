// Script alternatif pour créer un utilisateur avec l'API Supabase
import https from 'https';

const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcm5rZnJ3bnBlaW95enFka29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjQ3NjEzOCwiZXhwIjoyMDU4MDUyMTM4fQ.bk2L27lp7LZPLXK2uMtC931cl3eEPgrK1sf8NFMdWTI';

function createUser() {
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

  console.log('🚀 Tentative de création utilisateur via HTTPS...');

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Utilisateur créé avec succès!');
          console.log(JSON.stringify(jsonData, null, 2));
        } else {
          console.error('❌ Erreur lors de la création:');
          console.log(JSON.stringify(jsonData, null, 2));
        }
      } catch (e) {
        console.error('❌ Erreur de parsing JSON:', e);
        console.log('Response brute:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erreur de requête:', e.message);
  });

  // Ajouter un timeout
  req.setTimeout(30000, () => {
    req.abort();
    console.error('❌ Timeout après 30 secondes');
  });

  req.write(postData);
  req.end();
}

// Tester aussi l'API signup normale
function trySignup() {
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
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcm5rZnJ3bnBlaW95enFka29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzYxMzgsImV4cCI6MjA1ODA1MjEzOH0.KqganJWX3j4U9MyHN2IEronOcREcN0xVZoEp46REHnw`,
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcm5rZnJ3bnBlaW95enFka29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzYxMzgsImV4cCI6MjA1ODA1MjEzOH0.KqganJWX3j4U9MyHN2IEronOcREcN0xVZoEp46REHnw',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n🔄 Tentative avec API signup normale...');

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Inscription réussie!');
          console.log(JSON.stringify(jsonData, null, 2));
        } else {
          console.error('❌ Erreur inscription:');
          console.log(JSON.stringify(jsonData, null, 2));
        }
      } catch (e) {
        console.error('❌ Erreur parsing:', e);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erreur requête:', e.message);
  });

  req.setTimeout(30000, () => {
    req.abort();
    console.error('❌ Timeout après 30 secondes');
  });

  req.write(postData);
  req.end();
}

console.log('🚀 Tests de création utilisateur distant...');
console.log('URL:', SUPABASE_URL);
console.log('Email: xenatronics@gmx.fr\n');

createUser();
setTimeout(trySignup, 2000);