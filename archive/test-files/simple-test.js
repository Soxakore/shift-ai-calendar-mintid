import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

console.log('🧪 Testing profile lookup...');

try {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'org.admin.test')
    .single();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Profile found:', data);
    
    // Test authentication
    console.log('\n🧪 Testing authentication...');
    const email = 'org.admin.test@mintid.test';
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Auth Error:', authError);
    } else {
      console.log('✅ Authentication successful!');
      console.log('User ID:', authData.user?.id);
      console.log('Email:', authData.user?.email);
      
      // Clean up
      await supabase.auth.signOut();
      console.log('✅ Signed out');
    }
  }
} catch (err) {
  console.error('❌ Unexpected error:', err);
}
