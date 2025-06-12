// Debug authentication issue for org.admin.test user
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuth() {
  console.log('🔍 Debugging authentication for org.admin.test');
  
  const username = 'org.admin.test';
  const password = 'admin123';
  
  try {
    // Step 1: Look up the profile
    console.log('\n1. Looking up profile for username:', username);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, organisation_id')
      .eq('username', username)
      .eq('is_active', true)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile lookup error:', profileError);
      return;
    }

    if (!profileData) {
      console.log('❌ No profile found');
      return;
    }

    console.log('✅ Profile found:', profileData);

    // Step 2: Construct email
    const email = `${username}@${profileData.organisation_id || profileData.id}.mintid.local`;
    console.log('\n2. Constructed email:', email);

    // Step 3: Attempt authentication
    console.log('\n3. Attempting authentication...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('❌ Authentication error:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('   User email:', data.user?.email);
    console.log('   User ID:', data.user?.id);

    // Step 4: Sign out to clean up
    await supabase.auth.signOut();
    console.log('\n4. Signed out successfully');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugAuth();
