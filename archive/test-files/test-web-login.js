#!/usr/bin/env node

/**
 * Test the web login functionality with our test users
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing Web Login Flow with Test Users');
console.log('==========================================');

const testUsers = [
  {
    username: 'org.admin.test',
    password: 'admin123',
    expectedRole: 'org_admin',
    expectedDashboard: '/org-admin'
  },
  {
    username: 'manager.test',
    password: 'manager123', 
    expectedRole: 'manager',
    expectedDashboard: '/manager'
  }
];

async function testUserLogin(user) {
  console.log(`\n👤 Testing: ${user.username}`);
  console.log('─'.repeat(30));
  
  try {
    // Step 1: Profile lookup (what the login form does)
    console.log('1️⃣ Looking up profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', user.username)
      .single();
    
    if (profileError) {
      console.error('❌ Profile lookup failed:', profileError.message);
      return false;
    }
    
    console.log('✅ Profile found:', {
      username: profile.username,
      user_type: profile.user_type,
      organisation_id: profile.organisation_id?.substring(0, 8) + '...'
    });
    
    // Step 2: Authentication (what happens when form is submitted)
    console.log('2️⃣ Authenticating...');
    const email = `${user.username}@mintid.test`;
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: user.password
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return false;
    }
    
    console.log('✅ Authentication successful!');
    console.log('   User ID:', authData.user?.id);
    console.log('   Email:', authData.user?.email);
    
    // Step 3: Verify role-based routing
    console.log('3️⃣ Checking role-based routing...');
    
    if (profile.user_type === user.expectedRole) {
      console.log(`✅ Role correct: ${profile.user_type}`);
      console.log(`✅ Should redirect to: ${user.expectedDashboard}`);
    } else {
      console.error(`❌ Role mismatch! Expected: ${user.expectedRole}, Got: ${profile.user_type}`);
      return false;
    }
    
    // Step 4: Clean up
    await supabase.auth.signOut();
    console.log('✅ Session cleaned up');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  let successCount = 0;
  
  for (const user of testUsers) {
    const success = await testUserLogin(user);
    if (success) {
      successCount++;
    }
    
    // Small delay between tests
    if (user !== testUsers[testUsers.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 TEST RESULTS');
  console.log('================');
  console.log(`✅ Passed: ${successCount}/${testUsers.length}`);
  console.log(`❌ Failed: ${testUsers.length - successCount}/${testUsers.length}`);
  
  if (successCount === testUsers.length) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n🌐 Ready for Web Testing!');
    console.log('📍 URL: http://localhost:5173/login');
    console.log('\n🔑 Test Credentials:');
    testUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.expectedRole.replace('_', ' ').toUpperCase()}:`);
      console.log(`      Username: ${user.username}`);
      console.log(`      Password: ${user.password}`);
      console.log(`      Expected: Redirect to ${user.expectedDashboard}\n`);
    });
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

main().catch(console.error);
