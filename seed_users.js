const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const defaultUsers = [
  { email: 'vamsi@atomquest.com', password: 'Password123!', name: 'Vamsi', role: 'admin' },
  { email: 'krishna@atomquest.com', password: 'Password123!', name: 'Krishna', role: 'manager' },
  { email: 'raju@atomquest.com', password: 'Password123!', name: 'Raju', role: 'employee' }
];

async function seedUsers() {
  console.log('Starting user seeding...');

  for (const user of defaultUsers) {
    console.log(`Processing ${user.name} (${user.email})...`);
    
    // 1. Check if auth user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError.message);
      continue;
    }

    let authUser = users.find(u => u.email === user.email);

    if (!authUser) {
      // 2. Create Auth User
      const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name }
      });

      if (createError) {
        console.error(`Failed to create auth user ${user.email}:`, createError.message);
        continue;
      }
      authUser = newUser;
      console.log(`✅ Auth user created: ${user.email}`);
    } else {
      console.log(`ℹ️ Auth user already exists: ${user.email}`);
    }

    // 3. Upsert into public.users table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.role === 'admin' ? 'Management' : 'Engineering'
      }, { onConflict: 'id' });

    if (upsertError) {
      console.error(`Failed to upsert public profile for ${user.email}:`, upsertError.message);
    } else {
      console.log(`✅ Public profile synced for ${user.name}`);
    }
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seedUsers();
