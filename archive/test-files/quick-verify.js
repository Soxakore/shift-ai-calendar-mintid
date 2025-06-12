import { createClient } from '@supabase/supabase-js';

console.log('🔍 Quick Authentication Verification');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

console.log('Testing profile lookup...');

const { data, error } = await supabase
  .from('profiles')
  .select('username, user_type')
  .in('username', ['org.admin.test', 'manager.test']);

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log('✅ Found profiles:', data);
  console.log('\n🎯 Ready for testing!');
  console.log('🌐 Login at: http://localhost:5173/login');
  console.log('\n📋 Test with these credentials:');
  data.forEach(profile => {
    console.log(`• Username: ${profile.username}`);
    console.log(`  Password: ${profile.username === 'org.admin.test' ? 'admin123' : 'manager123'}`);
    console.log(`  Role: ${profile.user_type}\n`);
  });
}
