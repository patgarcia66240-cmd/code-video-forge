// create-auth-user.js
// Création d'un utilisateur Supabase

// Configuration Supabase (distante)
const SUPABASE_URL = 'https://xarnkfrwnpehoyzqdkoc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcm5rZnJ3bnBlaG95enFka29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjQ3NjEzOCwiZXhwIjoyMDU4MDUyMTM4fQ.bk2L27lp7LZPLXK2uMtC931cl3eEPgrK1sf8NFMdWTI';

// Replace these with the new user's details
const newUser = {
  email: 'xenatronics@gmx.fr',
  password: 'Garcia66240!',        // plain password — Admin API will hash it
  phone: null,                  // optional
  email_confirm: true,          // set true to mark email as confirmed
  user_metadata: { role: 'user', name: 'Xenatronics' },
  // app_metadata: { provider: 'email' }, // optional
};

async function createUser() {
  try {
    const url = new URL('/auth/v1/admin/users', SUPABASE_URL).toString();

    const body = {
      email: newUser.email,
      password: newUser.password,
      email_confirm: newUser.email_confirm === true,
      user_metadata: newUser.user_metadata ?? undefined,
      phone: newUser.phone ?? undefined,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        // Note: For Supabase projects, you may include "apikey" header with service role key as well:
        apikey: SERVICE_ROLE_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Error creating user:', res.status, data);
      process.exit(1);
    }

    console.log('User created successfully:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createUser();