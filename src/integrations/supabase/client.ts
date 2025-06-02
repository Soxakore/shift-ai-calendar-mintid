// Secure Supabase client configuration using environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that required environment variables are present
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required Supabase environment variables. Please check your .env.local file contains:\n' +
    'VITE_SUPABASE_URL=your_supabase_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key'
  );
}

console.log('✅ Supabase client initialized successfully');

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);