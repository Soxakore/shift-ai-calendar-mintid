// Test user creation using the actual frontend code path
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // anon key
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Script starting...');

async function createUserViaSignUp() {
  console.log('🚀 Creating user via signUp (like frontend does)...');
  
  const userData = {
    username: 'manager.test',
    password: 'manager123',
    display_name: 'Manager Test',
    user_type: 'manager',
    organisation_id: '746f677f-e234-4e8f-9688-695d53129354'
  };

  try {
    // Generate email for the user (same logic as in useSupabaseAuth)
    const email = `${userData.username.trim()}@${userData.organisation_id || 'system'}.mintid.local`;
    
    console.log('📧 Generated email:', email);
    console.log('🔑 Password:', userData.password);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: userData.password,
      options: {
        data: {
          username: userData.username.trim(),
          display_name: userData.display_name.trim(),
          user_type: userData.user_type,
          organisation_id: userData.organisation_id,
          created_by: 'test-script'
        }
      }
    });

    if (error) {
      console.error('❌ SignUp error:', error);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email:', data.user?.email);
    
    // Wait for the trigger to create the profile
    console.log('⏳ Waiting for profile creation...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, user_type, organisation_id')
      .eq('user_id', data.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Profile check error:', profileError);
      return;
    }
    
    if (profile) {
      console.log('✅ Profile created:', profile);
    } else {
      console.log('⚠️ No profile found');
    }
    
    // Now test authentication
    console.log('\n🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: userData.password,
    });
    
    if (authError) {
      console.error('❌ Auth test failed:', authError);
      return;
    }
    
    console.log('✅ Authentication test successful!');
    console.log('   Authenticated as:', authData.user?.email);
    
    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createUserViaSignUp().finally(() => {
  console.log('🏁 Script completed');
  process.exit(0);
});
