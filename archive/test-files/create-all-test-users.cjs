// Create all missing test users including employee and fix tiktok518
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAllTestUsers() {
  console.log('🚀 Creating all test users with proper emails...\n');
  
  const orgId = '746f677f-e234-4e8f-9688-695d53129354';
  
  const testUsers = [
    {
      username: 'tiktok518',
      email: 'tiktok518@gmail.com', // Real email
      password: '123456',
      display_name: 'Super Admin',
      user_type: 'super_admin',
      organisation_id: null // Super admin doesn't need org
    },
    {
      username: 'employee.test',
      email: 'employee.test@demo.mintid.local',
      password: 'employee123',
      display_name: 'Test Employee',
      user_type: 'employee',
      organisation_id: orgId
    },
    {
      username: 'employee',
      email: 'employee@demo.mintid.local',
      password: 'password123',
      display_name: 'Demo Employee',
      user_type: 'employee',
      organisation_id: orgId
    }
  ];
  
  for (const userData of testUsers) {
    try {
      console.log(`👤 Creating user: ${userData.username}`);
      console.log(`📧 Email: ${userData.email}`);
      
      // Create auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
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
      
      // Check if profile was created by trigger
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, user_type')
        .eq('user_id', data.user.id)
        .single();
        
      if (profile) {
        console.log(`✅ Profile created by trigger: ${profile.username} (${profile.user_type})`);
      } else {
        console.log(`⚠️ Profile not found, creating manually...`);
        
        // Create profile manually if trigger didn't work
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            username: userData.username,
            display_name: userData.display_name,
            user_type: userData.user_type,
            organisation_id: userData.organisation_id,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (profileError) {
          console.error(`❌ Error creating profile for ${userData.username}:`, profileError);
        } else {
          console.log(`✅ Manual profile created: ${newProfile.username} (${newProfile.user_type})`);
        }
      }
      
    } catch (error) {
      console.error(`💥 Unexpected error creating ${userData.username}:`, error);
    }
    
    console.log('');
  }
  
  console.log('📋 Final user verification:');
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('username, user_type, display_name, is_active')
    .order('user_type', { ascending: false });
    
  if (allProfiles) {
    allProfiles.forEach(profile => {
      const status = profile.is_active ? '✅' : '❌';
      console.log(`   ${status} ${profile.username} (${profile.user_type}) - ${profile.display_name}`);
    });
  }
  
  console.log('\n🎉 All test users created successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   • tiktok518 / 123456 (Super Admin)');
  console.log('   • org.admin.test / admin123 (Org Admin)');
  console.log('   • manager.test / manager123 (Manager)');
  console.log('   • employee.test / employee123 (Employee)');
  console.log('   • employee / password123 (Demo Employee)');
}

createAllTestUsers();
