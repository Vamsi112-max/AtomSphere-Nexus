const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl);
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('Connection successful! Found', data.length, 'user(s).');
    process.exit(0);
  }
}

testConnection();
