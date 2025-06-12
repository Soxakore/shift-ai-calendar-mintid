// Simple script to create just the employee user
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createEmployee() {
  const orgId = '746f677f-e234-4e8f-9688-695d53129354';
  
  console.log('Creating employee user...');
  
  try {
    // Create employee auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'employee@demo.mintid.local',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        username: 'employee',
        display_name: 'Demo Employee',
        user_type: 'employee',
        organisation_id: orgId
      }
    });
    
    if (error) {
      if (error.code === 'email_exists') {
        console.log('Employee already exists!');
        return;
      }
      console.error('Error:', error);
      return;
    }
    
    console.log('Employee created!', data.user.id);
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        username: 'employee',
        display_name: 'Demo Employee',
        user_type: 'employee',
        organisation_id: orgId,
        is_active: true
      });
      
    if (profileError) {
      console.error('Profile error:', profileError);
    } else {
      console.log('Profile created!');
    }
    
  } catch (err) {
    console.error('Exception:', err);
  }
}

createEmployee();
