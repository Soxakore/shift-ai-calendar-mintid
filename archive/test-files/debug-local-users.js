// Debug local users script
import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLocalUsers() {
  console.log('🔍 Checking local database users...\n');
  
  try {
    // Check organisations
    const { data: orgs, error: orgError } = await supabase
      .from('organisations')
      .select('*')
      .order('name');
    
    if (orgError) {
      console.error('❌ Organisation error:', orgError);
    } else {
      console.log('🏢 Organisations found:', orgs?.length || 0);
      if (orgs && orgs.length > 0) {
        orgs.forEach(org => {
          console.log(`   - ${org.name} (ID: ${org.id})`);
        });
      }
    }
    
    // Check all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('❌ Profiles error:', profileError);
    } else {
      console.log('\n👥 All profiles found:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          console.log(`   - ${profile.display_name || profile.username} (${profile.user_type})`);
          console.log(`     Email: ${profile.email || 'N/A'}`);
          console.log(`     Organisation: ${profile.organisation_id || 'N/A'}`);
          console.log(`     Active: ${profile.is_active ? 'Yes' : 'No'}`);
          console.log('');
        });
      }
    }

    // Check organization admin users specifically
    const { data: orgAdmins, error: orgAdminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'org_admin')
      .order('created_at', { ascending: false });
    
    if (orgAdminError) {
      console.error('❌ Org admin error:', orgAdminError);
    } else {
      console.log('🏢 Organization Admin accounts found:', orgAdmins?.length || 0);
      if (orgAdmins && orgAdmins.length > 0) {
        orgAdmins.forEach(admin => {
          console.log(`   ✅ ${admin.display_name || admin.username}`);
          console.log(`      Username: ${admin.username}`);
          console.log(`      Email: ${admin.email || 'N/A'}`);
          console.log(`      Organisation: ${admin.organisation_id}`);
          console.log(`      Created: ${admin.created_at}`);
          console.log('');
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
}

debugLocalUsers();
