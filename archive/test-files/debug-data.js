// Quick database debug script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhbfvnlfqsqpjrcqrfpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYmZ2bmxmcXNxcGpyY3FyZnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4Nzg5MzAsImV4cCI6MjA0NjQ1NDkzMH0.u6aRdV6kLo6J5fNK_u1z6bnMLGQ4cNhI6pzKPB6czxY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugData() {
  console.log('🔍 Starting database debug...');
  
  try {
    // Test organization fetch
    console.log('\n🏢 Testing organisation fetch...');
    const { data: orgs, error: orgError } = await supabase
      .from('organisations')
      .select('*')
      .order('name');
    
    if (orgError) {
      console.error('❌ Organisation error:', orgError);
    } else {
      console.log('✅ Organisations found:', orgs?.length || 0);
      console.log('📋 Sample organisations:', orgs?.slice(0, 3));
    }
    
    // Test profiles fetch
    console.log('\n👥 Testing profiles fetch...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('❌ Profiles error:', profileError);
    } else {
      console.log('✅ Profiles found:', profiles?.length || 0);
      console.log('📋 Sample profiles:', profiles?.slice(0, 3));
    }
    
    // Test RLS bypassing
    console.log('\n🔓 Testing service role access...');
    const { data: authUser } = await supabase.auth.getUser();
    console.log('🔐 Current auth user:', authUser?.user?.email || 'Not authenticated');
    
  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
}

debugData();
