const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllTables() {
  const tables = ['users', 'goals', 'goal_updates', 'shared_goals', 'goal_templates', 'discussions', 'messages', 'audit_logs'];
  console.log('Checking tables...');
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': Ready`);
    }
  }
  process.exit(0);
}

checkAllTables();
