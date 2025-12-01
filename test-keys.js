// Script pour tester les clés API Supabase
import https from 'https';

// Clé ANON (devrait toujours fonctionner pour les opérations publiques)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcm5rZnJ3bnBlaW95enFka29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzYxMzgsImV4cCI6MjA1ODA1MjEzOH0.KqganJWX3j4U9MyHN2IEronOcREcN0xVZoEp46REHnw';

const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';

function testKey(key, keyType, endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'xarnkfrwnpehoyzqdkoc.supabase.co',
      port: 443,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            keyType,
            endpoint,
            status: res.statusCode,
            success: res.statusCode === 200,
            response: jsonData
          });
        } catch (e) {
          resolve({
            keyType,
            endpoint,
            status: res.statusCode,
            success: false,
            response: data
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        keyType,
        endpoint,
        status: 'ERROR',
        success: false,
        error: e.message
      });
    });

    req.setTimeout(10000, () => {
      req.abort();
      resolve({
        keyType,
        endpoint,
        status: 'TIMEOUT',
        success: false
      });
    });

    req.end();
  });
}

async function testAllKeys() {
  console.log('🔍 Test des clés API Supabase...\n');

  // Tester avec la clé ANON sur l'API REST
  console.log('Test 1: Clé ANON sur API REST (/rest/v1/)');
  const restTest = await testKey(ANON_KEY, 'ANON', '/rest/v1/');
  console.log(`Status: ${restTest.status}, Success: ${restTest.success}`);
  if (!restTest.success) {
    console.log('Response:', restTest.response);
  }

  // Tester si l'endpoint auth est accessible
  console.log('\nTest 2: Clé ANON sur endpoint auth');
  const authTest = await testKey(ANON_KEY, 'ANON', '/auth/v1/settings');
  console.log(`Status: ${authTest.status}, Success: ${authTest.success}`);
  if (!authTest.success) {
    console.log('Response:', authTest.response);
  }

  // Vérifier si l'endpoint signup répond
  console.log('\nTest 3: Test endpoint signup (sans auth)');
  const signupTest = await testKey(ANON_KEY, 'ANON', '/auth/v1/user');
  console.log(`Status: ${signupTest.status}, Success: ${signupTest.success}`);
  if (!signupTest.success) {
    console.log('Response:', signupTest.response);
  }

  console.log('\n📋 Résumé:');
  if (restTest.success) {
    console.log('✅ API REST fonctionne - La base de données est accessible');
  } else {
    console.log('❌ API REST ne fonctionne pas');
  }

  if (authTest.success || signupTest.status === 401) {
    console.log('✅ Endpoint Auth est accessible');
  } else {
    console.log('❌ Endpoint Auth a des problèmes');
  }
}

testAllKeys();