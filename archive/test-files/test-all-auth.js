// Test both users authentication
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserAuth(username, password) {
  console.log(`\n🔐 Testing authentication for: ${username}`);
  
  try {
    // Step 1: Look up profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, organisation_id, user_type')
      .eq('username', username)
      .eq('is_active', true)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile lookup error:', profileError);
      return false;
    }

    if (!profileData) {
      console.log('❌ No profile found');
      return false;
    }

    console.log('✅ Profile found:', profileData);

    // Step 2: Construct email
    const email = `${username}@${profileData.organisation_id}.mintid.local`;
    console.log('📧 Email:', email);

    // Step 3: Authenticate
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }

    console.log('✅ Authentication successful!');
    console.log('   User Type:', profileData.user_type);
    console.log('   Email:', data.user?.email);

    // Sign out
    await supabase.auth.signOut();
    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

console.log('🎬 Starting authentication tests...');

async function testAllUsers() {
  console.log('🚀 Testing authentication for all users...');
  
  const testCases = [
    { username: 'org.admin.test', password: 'admin123' },
    { username: 'manager.test', password: 'manager123' }
  ];
  
  for (const testCase of testCases) {
    const success = await testUserAuth(testCase.username, testCase.password);
    if (!success) {
      console.log(`❌ Test failed for ${testCase.username}`);
    }
  }
  
  console.log('\n🎉 Authentication testing complete!');
}

testAllUsers().finally(() => process.exit(0));
