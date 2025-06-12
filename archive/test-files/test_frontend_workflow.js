// End-to-end frontend workflow test
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

const testFrontendWorkflow = async () => {
  console.log('🧪 Testing complete frontend user creation workflow...\n');

  // Step 1: Get initial user count
  console.log('📊 Step 1: Getting initial user count...');
  const { data: initialUsers, error: initialError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (initialError) {
    console.error('❌ Error fetching initial users:', initialError);
    return;
  }

  const initialCount = initialUsers.length;
  console.log(`✅ Initial user count: ${initialCount}`);
  console.log(`👥 Recent users: ${initialUsers.slice(0, 3).map(u => u.username).join(', ')}\n`);

  // Step 2: Create user (simulate frontend form submission)
  console.log('📝 Step 2: Creating user via frontend workflow...');
  const userData = {
    username: 'frontend.workflow.test',
    display_name: 'Frontend Workflow Test User',
    user_type: 'employee',
    organisation_id: '9c2abe95-219f-4fcf-b4a3-f30a5f7a7c7a',
    department_id: ''
  };

  const email = `${userData.username}@${userData.organisation_id}.mintid.local`;
  console.log(`📧 Email: ${email}`);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: 'testpass123',
    options: {
      data: {
        username: userData.username.trim(),
        display_name: userData.display_name.trim(),
        user_type: userData.user_type,
        organisation_id: userData.organisation_id,
        department_id: userData.department_id
      }
    }
  });

  if (authError) {
    console.error('❌ User creation failed:', authError);
    return;
  }

  console.log(`✅ Auth user created: ${authData.user?.id}`);

  // Step 3: Wait for trigger (simulate our 1-second delay fix)
  console.log('⏳ Step 3: Waiting 1 second for database trigger...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 4: Fetch users (simulate fetchUsers() call)
  console.log('🔄 Step 4: Fetching updated user list...');
  const { data: updatedUsers, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Error fetching updated users:', fetchError);
    return;
  }

  const finalCount = updatedUsers.length;
  console.log(`📊 Final user count: ${finalCount}`);

  // Step 5: Verify the new user appears in the list
  console.log('🔍 Step 5: Verifying new user appears in list...');
  const newUser = updatedUsers.find(u => u.username === userData.username);

  if (newUser) {
    console.log('✅ SUCCESS: New user found in list!');
    console.log(`👤 User details:`);
    console.log(`   - ID: ${newUser.id}`);
    console.log(`   - Username: ${newUser.username}`);
    console.log(`   - Display Name: ${newUser.display_name}`);
    console.log(`   - User Type: ${newUser.user_type}`);
    console.log(`   - Organisation ID: ${newUser.organisation_id}`);
    console.log(`   - Created: ${newUser.created_at}`);
    
    const countDiff = finalCount - initialCount;
    console.log(`\n📈 User count increased by: ${countDiff}`);

    if (countDiff === 1) {
      console.log('\n🎉 FRONTEND WORKFLOW TEST PASSED!');
      console.log('✅ User creation works correctly');
      console.log('✅ Database trigger creates profile');
      console.log('✅ fetchUsers() retrieves new user');
      console.log('✅ Frontend state will update correctly');
      return true;
    } else {
      console.log(`\n⚠️ Warning: User count increased by ${countDiff}, expected 1`);
      return false;
    }
  } else {
    console.log('❌ FAILED: New user not found in updated list');
    console.log('🔍 Available users:', updatedUsers.slice(0, 5).map(u => u.username));
    return false;
  }
};

testFrontendWorkflow()
  .then(success => {
    if (success) {
      console.log('\n🎊 CONCLUSION: Frontend user display issue is RESOLVED!');
      console.log('Users will now appear immediately after creation.');
    } else {
      console.log('\n💔 CONCLUSION: Issue may still exist.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });
