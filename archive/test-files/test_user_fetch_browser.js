
// Test user fetching in browser console
const testUserFetch = async () => {
  try {
    console.log('Testing user fetch...');
    const { data, error } = await window.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error fetching users:', error);
    } else {
      console.log('✅ Users fetched successfully:', data);
      console.log('📊 Total users:', data?.length || 0);
    }
    
    return { data, error };
  } catch (exception) {
    console.error('💥 Exception:', exception);
  }
};

testUserFetch();

