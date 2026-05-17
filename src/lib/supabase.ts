import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const isPlaceholderConfig = 
  supabaseUrl.includes('placeholder-url') || 
  supabaseAnonKey === 'placeholder-key';

// Safeguard against build-time crashes if environment variables are missing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
