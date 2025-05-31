# Admin Account Setup Instructions

## Quick Setup for tiktok/Hrpr0dect3421! Login

Your MinTid application is now configured to allow login with:
- **Username:** `tiktok`
- **Password:** `Hrpr0dect3421!`
- **Email (stored in Supabase):** `tiktok518@gmail.com`

## Setup Steps:

### 1. Apply Database Schema
1. Go to your Supabase dashboard: https://app.supabase.com/project/kyiwpwlxmysyuqjdxvyq/sql/new
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Click "Run" to create all tables and policies

### 2. Create Admin Auth User Manually
1. Go to Supabase Authentication: https://app.supabase.com/project/kyiwpwlxmysyuqjdxvyq/auth/users
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email:** `tiktok518@gmail.com`
   - **Password:** `Hrpr0dect3421!`
   - **Auto Confirm User:** ✅ (checked)
4. Click "Create user"

### 3. Link Profile to Auth User
After creating the auth user, you need to link it to the profile:
1. Go to Supabase SQL Editor
2. Run this SQL to update the profile with the correct auth user ID:

```sql
-- Get the auth user ID first
SELECT id, email FROM auth.users WHERE email = 'tiktok518@gmail.com';

-- Update the profile with the auth user ID (replace 'AUTH_USER_ID' with actual ID from above)
UPDATE profiles 
SET id = 'AUTH_USER_ID' 
WHERE username = 'tiktok';
```

### 4. Test Login
1. Visit your app: http://localhost:8080
2. Login with:
   - **Username:** `tiktok`
   - **Password:** `Hrpr0dect3421!`
3. You should be redirected to the Super Admin dashboard

## How It Works:

- When you enter username `tiktok` and password `Hrpr0dect3421!`, the app detects this as admin credentials
- It automatically uses the email `tiktok518@gmail.com` for Supabase authentication
- This allows you to use your preferred username while maintaining the email-based auth system
- Your profile in the database has `user_type: 'super_admin'` for full system access

## Security Notes:

- The admin bypass is hardcoded for your specific credentials only
- All other users will use the normal username → email mapping system
- Your admin email `tiktok518@gmail.com` is preserved in the TwoFactorManagement component
- The password `Hrpr0dect3421!` should be kept secure and can be changed in Supabase dashboard if needed

## Troubleshooting:

If login fails:
1. Verify the auth user was created correctly in Supabase
2. Check that the profile ID matches the auth user ID
3. Ensure the profile has `user_type = 'super_admin'`
4. Check browser console for detailed error messages
