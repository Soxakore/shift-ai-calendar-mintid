// Quick connection test for the web interface
console.log('🔌 Testing Frontend → Local Supabase Connection');

// This simulates what the frontend does
const testConnection = async () => {
  try {
    // Use the same environment variables as the frontend
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    console.log('🔗 Connecting to:', supabaseUrl);
    console.log('🔑 Using anon key (first 20 chars):', supabaseKey.substring(0, 20) + '...');
    
    // Test basic API connectivity
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?username=eq.org.admin.test&select=username,user_type`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!');
      console.log('📊 Found profiles:', data);
      
      if (data.length > 0) {
        console.log('\n🎉 Ready for web testing!');
        console.log('🌐 Login at: http://localhost:5173/login');
        console.log('🔑 Test with: org.admin.test / admin123');
      } else {
        console.log('⚠️ No profiles found - may need to check RLS policies');
      }
    } else {
      console.error('❌ Connection failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testConnection();
