const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const { data, error } = await supabase.rpc('get_tables'); // This might not work if RPC is not set up
  // Try a generic query to a common table
  const { data: data2, error: error2 } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
  
  if (error2) {
    console.log('Error checking tables:', error2.message);
  } else {
    console.log('Tables in public schema:', data2);
  }
}

checkTables();
