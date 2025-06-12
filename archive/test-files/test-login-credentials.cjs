// Test login credentials with the actual authentication system
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🧪 Testing unified login credentials...\n');
  
  const testCredentials = [
    { username: 'org.admin.test', password: 'admin123', expectedRole: 'org_admin' },
    { username: 'manager.test', password: 'manager123', expectedRole: 'manager' },
    { username: 'tiktok518', password: '123456', expectedRole: 'super_admin' }
  ];
  
  for (const cred of testCredentials) {
    console.log(`🔑 Testing: ${cred.username}`);
    
    try {
      // First, check if the profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, user_type, is_active, organisation_id')
        .eq('username', cred.username)
        .maybeSingle();
        
      if (profileError) {
        console.log(`   ❌ Profile lookup error: ${profileError.message}`);
        continue;
      }
      
      if (!profile) {
        console.log(`   ⚠️  Profile not found for ${cred.username}`);
        continue;
      }
      
      console.log(`   ✅ Profile found: ${profile.user_type} (active: ${profile.is_active})`);
      
      // Construct email like the signIn function does
      let email;
      if (cred.username === 'tiktok518') {
        email = 'tiktok518@gmail.com';
      } else {
        email = `${cred.username}@${profile.organisation_id || profile.id}.mintid.local`;
      }
      
      console.log(`   📧 Constructed email: ${email}`);
      
      // Test the actual login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: cred.password,
      });
      
      if (authError) {
        console.log(`   ❌ Authentication failed: ${authError.message}`);
      } else {
        console.log(`   ✅ Authentication successful! User ID: ${authData.user.id}`);
        
        // Sign out for next test
        await supabase.auth.signOut();
      }
      
    } catch (error) {
      console.log(`   💥 Unexpected error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎉 Test complete!');
}

testLogin();
