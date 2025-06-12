console.log('🚀 Testing Local Authentication Flow');
console.log('===================================');

// Import using dynamic import to handle ES modules
const test = async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );

    // Test 1: Organization Admin
    console.log('\n🧪 Testing org.admin.test authentication...');
    
    const { data: profile1, error: profileError1 } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'org.admin.test')
      .single();

    if (profileError1) {
      console.error('❌ Profile lookup failed:', profileError1.message);
      return;
    }

    console.log('✅ Profile found:', {
      username: profile1.username,
      user_type: profile1.user_type,
      organisation_id: profile1.organisation_id
    });

    const { data: authData1, error: authError1 } = await supabase.auth.signInWithPassword({
      email: 'org.admin.test@mintid.test',
      password: 'admin123'
    });

    if (authError1) {
      console.error('❌ Auth failed:', authError1.message);
      return;
    }

    console.log('✅ org.admin.test authenticated successfully!');
    console.log('   User ID:', authData1.user?.id);
    console.log('   Should redirect to: /org-admin');
    
    await supabase.auth.signOut();

    // Test 2: Manager
    console.log('\n🧪 Testing manager.test authentication...');
    
    const { data: profile2, error: profileError2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'manager.test')
      .single();

    if (profileError2) {
      console.error('❌ Profile lookup failed:', profileError2.message);
      return;
    }

    console.log('✅ Profile found:', {
      username: profile2.username,
      user_type: profile2.user_type,
      organisation_id: profile2.organisation_id
    });

    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'manager.test@mintid.test',
      password: 'manager123'
    });

    if (authError2) {
      console.error('❌ Auth failed:', authError2.message);
      return;
    }

    console.log('✅ manager.test authenticated successfully!');
    console.log('   User ID:', authData2.user?.id);
    console.log('   Should redirect to: /manager');
    
    await supabase.auth.signOut();

    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');
    console.log('\n📋 Ready for Web Testing:');
    console.log('🌐 Login at: http://localhost:5173/login');
    console.log('\n🔑 Test Credentials:');
    console.log('   • Organization Admin: username "org.admin.test", password "admin123"');
    console.log('   • Manager: username "manager.test", password "manager123"');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
};

test();
