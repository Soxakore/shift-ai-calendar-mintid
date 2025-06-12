// Create test users programmatically
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // service_role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUsers() {
  console.log('🚀 Creating test users...');
  
  // Get the organization ID using known ID from database
  const orgId = '746f677f-e234-4e8f-9688-695d53129354';
  const orgName = 'MinTid Demo Company';
  const org = { id: orgId, name: orgName };
    
  console.log('✅ Using organization:', org.name, org.id);
  
  const testUsers = [
    {
      username: 'org.admin.test',
      password: 'admin123',
      display_name: 'Organization Admin Test',
      user_type: 'org_admin',
      organisation_id: org.id
    },
    {
      username: 'manager.test',
      password: 'manager123', 
      display_name: 'Manager Test',
      user_type: 'manager',
      organisation_id: org.id
    }
  ];
  
  for (const userData of testUsers) {
    try {
      console.log(`\n👤 Creating user: ${userData.username}`);
      
      // Generate email
      const email = `${userData.username}@${userData.organisation_id}.mintid.local`;
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
        console.error(`❌ Error creating user ${userData.username}:`, error);
        continue;
      }
      
      console.log(`✅ Auth user created: ${data.user.id}`);
      
      // The trigger should create the profile automatically, but let's verify
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger
      
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
  
  console.log('\n🎉 Test user creation complete!');
}

createTestUsers();
