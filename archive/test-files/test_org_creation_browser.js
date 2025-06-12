
// Test organization creation in browser console
const testOrgCreation = async () => {
  try {
    console.log('Testing organization creation...');
    const response = await fetch('https://vcjmwgbjbllkkivrkvqx.supabase.co/rest/v1/organisations', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjam13Z2JqYmxsa2tpdnJrdnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTA0NjIsImV4cCI6MjA2NDY2NjQ2Mn0.-Z3F5KeBUbQYt_-HvvkSefBW1KcKx93kfwOEjjR2Uw4',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjam13Z2JqYmxsa2tpdnJrdnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTA0NjIsImV4cCI6MjA2NDY2NjQ2Mn0.-Z3F5KeBUbQYt_-HvvkSefBW1KcKx93kfwOEjjR2Uw4',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'Browser Test Organization ' + new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Organization created successfully:', data);
      return data;
    } else {
      const error = await response.text();
      console.error('❌ Organization creation failed:', error);
      return null;
    }
  } catch (error) {
    console.error('💥 Exception during organization creation:', error);
    return null;
  }
};

testOrgCreation();

