const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const usersToSeed = [
  {
    email: 'admin@atomsphere.com',
    password: 'admin123',
    name: 'Nexus Admin',
    role: 'admin',
    department: 'Management'
  },
  {
    email: 'manager@atomsphere.com',
    password: 'manager123',
    name: 'Tactical Manager',
    role: 'manager',
    department: 'Engineering'
  },
  {
    email: 'employee@atomsphere.com',
    password: 'employee123',
    name: 'Mission Specialist',
    role: 'employee',
    department: 'Engineering'
  }
];

async function runSeeding() {
  console.log('🚀 Starting Robust Tactical User Seeding (No manager_id)...');
  
  // 1. Fetch existing auth users to avoid duplicates
  const { data: { users: existingAuthUsers }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Error listing auth users:', listError.message);
    process.exit(1);
  }

  const seededProfiles = [];

  for (const user of usersToSeed) {
    console.log(`Processing ${user.email}...`);
    let authUser = existingAuthUsers.find(u => u.email === user.email);

    if (!authUser) {
      // Create user if not existing
      const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.name, role: user.role }
      });

      if (createError) {
        console.error(`❌ Failed to create auth user ${user.email}:`, createError.message);
        continue;
      }
      authUser = newUser;
      console.log(`✅ Created Auth User for ${user.email}`);
    } else {
      console.log(`ℹ️ Auth User already exists for ${user.email} (ID: ${authUser.id})`);
      
      // Let's update their user metadata role just in case
      const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
        user_metadata: { full_name: user.name, role: user.role }
      });
      if (updateError) {
        console.warn(`⚠️ Warning: Failed to update user metadata for ${user.email}:`, updateError.message);
      }
    }

    seededProfiles.push({
      id: authUser.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department
    });
  }

  console.log('Syncing public profiles to public.users...');
  for (const profile of seededProfiles) {
    const payload = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      department_id: profile.department_id
    };

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' });

    if (upsertError) {
      console.error(`❌ Failed to upsert public profile for ${profile.email}:`, upsertError.message);
    } else {
      console.log(`✅ Upserted public profile for ${profile.email}`);
    }
  }

  console.log('🏁 Robust Seeding Complete.');
  process.exit(0);
}

runSeeding();
