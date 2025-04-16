import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

let client;

try {
  client = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test the connection
  client.from('categories').select('count').single().then(() => {
    console.log('Successfully connected to Supabase');
  }).catch((error) => {
    console.error('Failed to connect to Supabase:', error.message);
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw error;
}

export const supabase = client;