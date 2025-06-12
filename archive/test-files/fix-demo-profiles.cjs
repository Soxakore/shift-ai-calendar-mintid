// Fix profiles for demo users
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDemoUserProfiles() {
  console.log('🔧 Fixing demo user profiles...');
  
  const orgId = '746f677f-e234-4e8f-9688-695d53129354';
  
  // Get all auth users
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }
  
  const demoUsers = [
    { email: 'tiktok@demo.mintid.local', username: 'tiktok', user_type: 'super_admin', display_name: 'Super Admin' },
    { email: 'orgadmin@demo.mintid.local', username: 'orgadmin', user_type: 'org_admin', display_name: 'Organization Admin' },
    { email: 'manager@demo.mintid.local', username: 'manager', user_type: 'manager', display_name: 'Manager' },
    { email: 'employee@demo.mintid.local', username: 'employee', user_type: 'employee', display_name: 'Employee' }
  ];
  
  for (const demoUser of demoUsers) {
    // Find the auth user
    const authUser = users.users.find(u => u.email === demoUser.email);
    if (!authUser) {
      console.log(`⚠️ Auth user not found for ${demoUser.email}`);
      continue;
    }
    
    console.log(`\n👤 Processing ${demoUser.username} (${authUser.id})`);
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();
      
    if (existingProfile) {
      console.log(`✅ Profile already exists for ${demoUser.username}`);
      continue;
    }
    
    // Create the profile manually
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authUser.id,
        username: demoUser.username,
        display_name: demoUser.display_name,
        user_type: demoUser.user_type,
        organisation_id: orgId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (profileError) {
      console.error(`❌ Error creating profile for ${demoUser.username}:`, profileError);
    } else {
      console.log(`✅ Profile created for ${demoUser.username} (${demoUser.user_type})`);
    }
  }
  
  console.log('\n📋 Final user list:');
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('username, user_type, display_name, is_active');
    
  if (allProfiles) {
    allProfiles.forEach(profile => {
      const status = profile.is_active ? '✅' : '❌';
      console.log(`   ${status} ${profile.username} (${profile.user_type}) - ${profile.display_name}`);
    });
  }
  
  console.log('\n🎉 Demo user profile fix complete!');
}

fixDemoUserProfiles();
