// Create additional demo users for testing
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoUsers() {
  console.log('🚀 Creating additional demo users...');
  
  const orgId = '746f677f-e234-4e8f-9688-695d53129354';
  
  const demoUsers = [
    {
      username: 'tiktok',
      password: 'password123',
      display_name: 'Super Admin',
      user_type: 'super_admin',
      organisation_id: orgId
    },
    {
      username: 'orgadmin',
      password: 'password123',
      display_name: 'Organization Admin',
      user_type: 'org_admin',
      organisation_id: orgId
    },
    {
      username: 'manager',
      password: 'password123',
      display_name: 'Manager',
      user_type: 'manager',
      organisation_id: orgId
    },
    {
      username: 'employee',
      password: 'password123',
      display_name: 'Employee',
      user_type: 'employee',
      organisation_id: orgId
    }
  ];
  
  for (const userData of demoUsers) {
    try {
      console.log(`\n👤 Creating user: ${userData.username}`);
      
      const email = `${userData.username}@demo.mintid.local`;
      console.log(`📧 Email: ${email}`);
      
      // Create auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          username: userData.username,
          display_name: userData.display_name,
          user_type: userData.user_type,
          organisation_id: userData.organisation_id
        }
      });
      
      if (error) {
        if (error.status === 422 && error.code === 'email_exists') {
          console.log(`⚠️ User ${userData.username} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating user ${userData.username}:`, error);
        }
        continue;
      }
      
      console.log(`✅ Auth user created: ${data.user.id}`);
      
      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, user_type')
        .eq('user_id', data.user.id)
        .single();
        
      if (profile) {
        console.log(`✅ Profile created: ${profile.username} (${profile.user_type})`);
      } else {
        console.log(`⚠️ Profile not found for ${userData.username}`);
      }
      
    } catch (error) {
      console.error(`💥 Unexpected error creating ${userData.username}:`, error);
    }
  }
  
  console.log('\n🎉 Demo user creation complete!');
  
  // List all users to verify
  console.log('\n📋 All users in database:');
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('username, user_type, display_name');
    
  if (allProfiles) {
    allProfiles.forEach(profile => {
      console.log(`   - ${profile.username} (${profile.user_type}) - ${profile.display_name}`);
    });
  }
}

createDemoUsers();
