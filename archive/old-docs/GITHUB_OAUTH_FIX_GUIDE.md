# 🔧 GitHub OAuth Configuration Fix for MinTid 2.0

## Current Issue
The application is still getting DNS errors because the GitHub OAuth app is configured for the old Supabase project. We need to update the GitHub OAuth settings to work with the new MinTid 2.0 Supabase project.

## ✅ Step 1: Update GitHub OAuth App Settings

### Go to GitHub Developer Settings:
1. Visit: https://github.com/settings/developers
2. Click on "OAuth Apps" 
3. Find your MinTid application (or create a new one)

### Update OAuth App Configuration:
```
Application name: MinTid Shift Scheduler
Homepage URL: http://localhost:8888 (for development)
             https://minatid.se (for production)

Authorization callback URL: 
https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback

Application description: AI-powered shift scheduling system
```

### Get OAuth Credentials:
- **Client ID**: Copy this value
- **Client Secret**: Generate/copy this value

## ✅ Step 2: Configure Supabase Authentication

### In Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/vcjmwgbjbllkkivrkvqx
2. Navigate to: **Authentication** → **Providers**
3. Find **GitHub** provider
4. Enable GitHub OAuth
5. Add your GitHub OAuth credentials:
   - **Client ID**: [from GitHub]
   - **Client Secret**: [from GitHub]

### Site URL Configuration:
```
Site URL: http://localhost:8888
Additional redirect URLs:
- https://minatid.se
- http://localhost:3000
- http://localhost:8080
- http://localhost:8081
- http://localhost:8082
```

## ✅ Step 3: Update Application Configuration

### Current Supabase Project Details:
- **Project ID**: vcjmwgbjbllkkivrkvqx
- **Project URL**: https://vcjmwgbjbllkkivrkvqx.supabase.co
- **Auth URL**: https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1

### Environment Variables (Already Updated):
```env
VITE_SUPABASE_URL=https://vcjmwgbjbllkkivrkvqx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjam13Z2JqYmxsa2tpdnJrdnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTA0NjIsImV4cCI6MjA2NDY2NjQ2Mn0.-Z3F5KeBUbQYt_-HvvkSefBW1KcKx93kfwOEjjR2Uw4
```

## ✅ Step 4: Test Authentication Flow

### Local Testing:
1. Start development server: `npm run dev` or `netlify dev`
2. Navigate to: http://localhost:8888
3. Click "Sign in with GitHub"
4. Should redirect to GitHub → authorize → redirect back successfully

### Expected Behavior:
- GitHub redirects to: `https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback`
- Supabase processes auth and redirects to: `http://localhost:8888`
- User is logged in with profile: `ibe.admin` (super_admin)

## ✅ Step 5: Verify Database Integration

### User Profile Check:
```sql
-- Your profile should exist:
SELECT * FROM profiles WHERE user_id = 'a76de14f-e437-4c1c-ad25-c43e7811855d';

-- Your user record should exist:
SELECT * FROM users WHERE auth_user_id = 'a76de14f-e437-4c1c-ad25-c43e7811855d';
```

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid redirect URI"
**Solution**: Make sure the callback URL in GitHub exactly matches:
```
https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback
```

### Issue 2: "Application suspended"
**Solution**: Check if GitHub OAuth app is active and approved

### Issue 3: DNS still failing
**Solution**: Clear browser cache and cookies, restart development server

### Issue 4: User not created after OAuth
**Solution**: Check Supabase RLS policies and triggers

## 🔧 Quick Fix Script

If you need to quickly test the GitHub OAuth setup:

```bash
# 1. Restart the development server
pkill -f "netlify dev"
netlify dev

# 2. Test the health check
curl -s http://localhost:8888/.netlify/functions/health-check | jq '.services.supabase'

# 3. Open the application
open http://localhost:8888
```

## 📞 Need Help?

If the issue persists, provide:
1. Screenshots of GitHub OAuth app settings
2. Supabase Auth provider configuration
3. Any console errors when trying to log in
4. Network tab showing the redirect URLs

## 🎯 Expected Result

After completing these steps:
- ✅ GitHub OAuth redirects to correct Supabase project
- ✅ Authentication completes successfully  
- ✅ User is logged in as `ibe.admin` with super_admin privileges
- ✅ No more DNS errors
- ✅ Full access to MinTid Shift Scheduler

---

**Status**: Ready for GitHub OAuth configuration update
