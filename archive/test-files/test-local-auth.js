#!/usr/bin/env node

/**
 * Test live web authentication flow - LOCAL VERSION
 * This script tests against the local Supabase instance
 */

import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test users to verify
const testUsers = [
  {
    username: 'org.admin.test',
    password: 'admin123',
    expectedRole: 'org_admin',
    expectedRedirect: '/org-admin'
  },
  {
    username: 'manager.test', 
    password: 'manager123',
    expectedRole: 'manager',
    expectedRedirect: '/manager'
  }
];

async function testLocalWebAuthFlow(testUser) {
  console.log(`\n🧪 Testing login for: ${testUser.username}`);
  console.log('================================================');
  
  try {
    // Step 1: Look up user profile by username (same as web interface)
    console.log('1️⃣ Looking up user profile by username...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', testUser.username)
      .single();

    if (profileError) {
      console.error('❌ Profile lookup failed:', profileError.message);
      console.error('Error details:', profileError);
      return false;
    }

    if (!profile) {
      console.error('❌ No profile found for username:', testUser.username);
      return false;
    }

    console.log('✅ Profile found:', {
      id: profile.id,
      username: profile.username,
      user_type: profile.user_type,
      organisation_id: profile.organisation_id
    });

    // Step 2: Construct email and attempt authentication
    const email = `${testUser.username}@mintid.test`;
    console.log(`2️⃣ Attempting authentication with email: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: testUser.password
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.error('Error details:', authError);
      return false;
    }

    if (!authData.user) {
      console.error('❌ No user data returned from authentication');
      return false;
    }

    console.log('✅ Authentication successful:', {
      userId: authData.user.id,
      email: authData.user.email,
      emailConfirmed: authData.user.email_confirmed_at ? 'Yes' : 'No'
    });

    // Step 3: Verify session and profile access
    console.log('3️⃣ Verifying session and profile access...');
    
    const { data: sessionProfile, error: sessionError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (sessionError) {
      console.error('❌ Session profile lookup failed:', sessionError.message);
      console.error('Error details:', sessionError);
      return false;
    }

    console.log('✅ Session profile verified:', {
      id: sessionProfile.id,
      username: sessionProfile.username,
      user_type: sessionProfile.user_type,
      organisation_id: sessionProfile.organisation_id
    });

    // Step 4: Verify role-based routing
    console.log('4️⃣ Verifying role-based routing...');
    
    const actualRole = sessionProfile.user_type;
    if (actualRole === testUser.expectedRole) {
      console.log(`✅ Role matches expected: ${actualRole}`);
      console.log(`✅ Should redirect to: ${testUser.expectedRedirect}`);
    } else {
      console.error(`❌ Role mismatch. Expected: ${testUser.expectedRole}, Got: ${actualRole}`);
      return false;
    }

    // Step 5: Clean up session
    console.log('5️⃣ Cleaning up session...');
    await supabase.auth.signOut();
    console.log('✅ Session cleaned up successfully');

    console.log(`\n🎉 ALL TESTS PASSED for ${testUser.username}`);
    return true;

  } catch (error) {
    console.error('❌ Unexpected error during authentication test:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting LOCAL Web Authentication Flow Tests');
  console.log('===============================================');
  console.log(`🔗 Testing against: ${supabaseUrl} (LOCAL)`);
  console.log(`📝 Total test users: ${testUsers.length}\n`);

  let passedTests = 0;
  
  for (const testUser of testUsers) {
    const success = await testLocalWebAuthFlow(testUser);
    if (success) {
      passedTests++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${testUsers.length}`);
  console.log(`❌ Failed: ${testUsers.length - passedTests}/${testUsers.length}`);
  
  if (passedTests === testUsers.length) {
    console.log('\n🎉 ALL LOCAL AUTHENTICATION TESTS PASSED!');
    console.log('💡 The authentication flow is working correctly!');
    console.log('\n📋 Test Credentials for Web Interface:');
    testUsers.forEach(user => {
      console.log(`   • ${user.expectedRole}: username "${user.username}", password "${user.password}"`);
    });
    console.log('\n🌐 Test at: http://localhost:5173/login');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
