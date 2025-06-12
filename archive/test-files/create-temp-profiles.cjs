// Create users with SQL instead of auth API
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUsersSQL() {
  console.log('Creating users through SQL...');
  
  const orgId = '956dd2b0-75ea-4b79-ba90-b4faa865d1a6'; // Updated org ID
  
  try {
    // First create profiles directly without auth users for testing
    const profiles = [
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        username: 'tiktok518',
        display_name: 'Super Admin',
        user_type: 'super_admin',
        organisation_id: null,
        is_active: true
      },
      {
        user_id: '22222222-2222-2222-2222-222222222222', 
        username: 'org.admin.test',
        display_name: 'Organization Admin Test',
        user_type: 'org_admin',
        organisation_id: orgId,
        is_active: true
      },
      {
        user_id: '33333333-3333-3333-3333-333333333333',
        username: 'manager.test', 
        display_name: 'Manager Test',
        user_type: 'manager',
        organisation_id: orgId,
        is_active: true
      },
      {
        user_id: '44444444-4444-4444-4444-444444444444',
        username: 'employee',
        display_name: 'Demo Employee',
        user_type: 'employee', 
        organisation_id: orgId,
        is_active: true
      }
    ];
    
    // Insert profiles
    for (const profile of profiles) {
      console.log(`Creating profile: ${profile.username}`);
      const { error } = await supabase
        .from('profiles')
        .upsert(profile);
        
      if (error) {
        console.error(`Error creating ${profile.username}:`, error);
      } else {
        console.log(`✅ Profile created: ${profile.username}`);
      }
    }
    
    console.log('\n✅ All profiles created!');
    console.log('\n📝 These are temporary profiles for testing the UI');
    console.log('You can use any password since auth is bypassed for testing');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createUsersSQL();
