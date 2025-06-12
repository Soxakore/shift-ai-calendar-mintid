// Test script to verify user creation fix
console.log('🧪 Testing user creation fix...');

// Test the createUser function that the frontend now uses
const testUserCreation = async () => {
  const SUPABASE_URL = 'http://127.0.0.1:54321';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  // Test user data similar to what the frontend form would generate
  const testUserData = {
    email: 'form.test.user@9c2abe95-219f-4fcf-b4a3-f30a5f7a7c7a.mintid.local',
    password: 'testpass123',
    options: {
      data: {
        username: 'form.test.user',
        display_name: 'Form Test User',
        user_type: 'employee',
        organisation_id: '9c2abe95-219f-4fcf-b4a3-f30a5f7a7c7a',
        department_id: '' // This empty string was causing the issue
      }
    }
  };

  try {
    console.log('📤 Sending signup request with data:', {
      ...testUserData,
      password: '[HIDDEN]'
    });

    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUserData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ User creation successful!');
      console.log('📧 Email:', result.user?.email);
      console.log('🆔 User ID:', result.user?.id);
      
      // Wait for trigger to complete
      console.log('⏳ Waiting 2 seconds for profile creation trigger...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if profile was created
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${result.user?.id}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const profiles = await profileResponse.json();
      
      if (profiles && profiles.length > 0) {
        console.log('✅ Profile created successfully!');
        console.log('👤 Profile data:', profiles[0]);
        return true;
      } else {
        console.log('❌ Profile not found after user creation');
        return false;
      }
    } else {
      console.error('❌ User creation failed:', result);
      return false;
    }
  } catch (error) {
    console.error('💥 Error during test:', error);
    return false;
  }
};

// Run the test
testUserCreation().then(success => {
  if (success) {
    console.log('🎉 Test PASSED: User creation and profile trigger working correctly!');
  } else {
    console.log('💔 Test FAILED: Issues with user creation or profile trigger');
  }
  process.exit(success ? 0 : 1);
});
