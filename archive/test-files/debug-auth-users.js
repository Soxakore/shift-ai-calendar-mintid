const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAuthUsers() {
  console.log('🔍 Checking authentication users in auth.users table...\n');
  
  try {
    // Get all users from auth.users
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`👥 Found ${users.users.length} auth users:`);
    
    users.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id}`);
      console.log(`      Email: ${user.email || 'N/A'}`);
      console.log(`      Username: ${user.user_metadata?.username || 'N/A'}`);
      console.log(`      Created: ${user.created_at}`);
      console.log(`      Last Sign In: ${user.last_sign_in_at || 'Never'}`);
      console.log('');
    });
    
    // Also check profiles table for reference
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
      
    if (!profileError && profiles) {
      console.log(`📋 Profiles in database: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.display_name} (${profile.user_type}) - User ID: ${profile.user_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAuthUsers();
