const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const users = [
  {
    email: 'admin@atomsphere.com',
    password: 'admin123',
    data: { full_name: 'Nexus Admin', role: 'admin' }
  },
  {
    email: 'manager@atomsphere.com',
    password: 'manager123',
    data: { full_name: 'Tactical Manager', role: 'manager' }
  },
  {
    email: 'employee@atomsphere.com',
    password: 'employee123',
    data: { full_name: 'Mission Specialist', role: 'employee' }
  }
];

async function seedUsers() {
  console.log('🚀 Initializing Tactical User Seeding...');
  
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.data
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`✅ User ${user.email} already exists.`);
      } else {
        console.error(`❌ Error creating ${user.email}:`, error.message);
      }
    } else {
      console.log(`✨ Successfully created ${user.email} with role: ${user.data.role}`);
    }
  }

  console.log('🏁 Seeding Complete.');
}

seedUsers();
