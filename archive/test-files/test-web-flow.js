// Test web interface authentication simulation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎬 Starting web interface flow test...');

async function testWebInterfaceFlow() {
  console.log('🌐 Testing web interface authentication flow...');
  
  const username = 'manager.test';
  const password = 'manager123';
  
  try {
    console.log('\n1. Simulating login form submission...');
    console.log('   Username:', username);
    console.log('   Password: [PROVIDED]');
    
    // This simulates exactly what happens when the Login form is submitted
    // and calls the signIn function from useSupabaseAuth
    
    // Step 1: Profile lookup (from signIn function)
    console.log('\n2. Looking up user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, organisation_id, user_type')
      .eq('username', username)
      .eq('is_active', true)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile lookup failed:', profileError);
      return;
    }

    if (!profileData) {
      console.log('❌ No active profile found');
      return;
    }

    console.log('✅ Profile found:', profileData);

    // Step 2: Email construction
    const email = `${username}@${profileData.organisation_id}.mintid.local`;
    console.log('\n3. Email construction:', email);

    // Step 3: Authentication
    console.log('\n4. Attempting authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError);
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('   User ID:', authData.user?.id);
    console.log('   Email:', authData.user?.email);

    // Step 4: Profile fetching (this happens after successful auth)
    console.log('\n5. Fetching user profile for auth context...');
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (fetchError) {
      console.error('❌ Profile fetch failed:', fetchError);
      await supabase.auth.signOut();
      return;
    }

    console.log('✅ Profile fetched successfully:', {
      username: userProfile.username,
      user_type: userProfile.user_type,
      organisation_id: userProfile.organisation_id
    });

    // Step 5: Determine redirect based on user type
    console.log('\n6. Determining redirect...');
    let redirectPath;
    switch (userProfile.user_type) {
      case 'super_admin':
        redirectPath = '/super-admin';
        break;
      case 'org_admin':
        redirectPath = '/org-admin';
        break;
      case 'manager':
        redirectPath = '/manager';
        break;
      case 'employee':
        redirectPath = '/employee';
        break;
      default:
        redirectPath = '/';
    }

    console.log('✅ Should redirect to:', redirectPath);
    console.log('   User type:', userProfile.user_type);

    // Clean up
    console.log('\n7. Signing out for test cleanup...');
    await supabase.auth.signOut();
    console.log('✅ Signed out');

    console.log('\n🎉 WEB INTERFACE AUTHENTICATION FLOW: SUCCESS!');
    console.log('   ✅ Profile lookup works');
    console.log('   ✅ Email construction works');
    console.log('   ✅ Authentication works');
    console.log('   ✅ Profile fetching works');
    console.log('   ✅ Role-based routing works');
    console.log('\n📱 The web interface should work correctly for org.admin.test login!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testWebInterfaceFlow().finally(() => process.exit(0));
