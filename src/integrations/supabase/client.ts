
// Secure Supabase client configuration using environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get credentials from environment variables or use the project defaults
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kyiwpwlxmysyuqjdxvyq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXdwd2x4bXlzeXVxamR4dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjgxNTUsImV4cCI6MjA2NDIwNDE1NX0.UqhmUIrT4imMoUqi7KOKiCyNegD09NUq3ZYXhPALqrM';

console.log('✅ Supabase client initialized successfully');

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
