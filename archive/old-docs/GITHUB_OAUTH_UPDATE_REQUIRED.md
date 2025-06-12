# 🔧 URGENT: GitHub OAuth Configuration Update Required

## 🚨 Current Issue
Your GitHub OAuth app is still pointing to the **old Supabase project** (`kyiwpwlxmysyuqjdxvyq`) which no longer exists. This is causing the DNS error when you try to log in.

## ✅ SOLUTION: Update GitHub OAuth Settings

### Step 1: Go to GitHub Developer Settings
1. **Open**: https://github.com/settings/developers
2. **Click**: "OAuth Apps" tab
3. **Find**: Your MinTid application (or create a new one if needed)

### Step 2: Update OAuth App Configuration
**CRITICAL: Update the callback URL to the NEW Supabase project:**

```
Application name: MinTid Shift Scheduler
Homepage URL: http://localhost:8888
Authorization callback URL: https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback
```

**IMPORTANT**: The callback URL MUST be exactly:
```
https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback
```
(This is the NEW MinTid 2.0 project)

### Step 3: Copy OAuth Credentials
After updating, copy these values:
- **Client ID**: [copy this]
- **Client Secret**: [copy this]

### Step 4: Configure Supabase Authentication
1. **Go to**: https://supabase.com/dashboard/project/vcjmwgbjbllkkivrkvqx
2. **Navigate to**: Authentication → Providers
3. **Find**: GitHub provider
4. **Enable**: GitHub OAuth
5. **Add credentials**:
   - Client ID: [paste from GitHub]
   - Client Secret: [paste from GitHub]

### Step 5: Set Site URL in Supabase
In the same Auth settings, set:
```
Site URL: http://localhost:8888
Additional redirect URLs:
- https://minatid.se
- http://localhost:3000
- http://localhost:8080
- http://localhost:8081
- http://localhost:8082
```

## 🧪 Test Authentication Flow

### Current Status:
- ✅ **Supabase Project**: vcjmwgbjbllkkivrkvqx (MinTid 2.0) - HEALTHY
- ✅ **Development Server**: http://localhost:8888 - RUNNING
- ✅ **Health Check**: Supabase connection verified
- ✅ **User Profile**: Created for ibega8@gmail.com (super_admin)
- ❌ **GitHub OAuth**: NEEDS UPDATE (still pointing to old project)

### Expected Authentication Flow:
1. Click "Sign in with GitHub" on http://localhost:8888
2. Redirect to GitHub for authorization
3. GitHub redirects to: `https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback`
4. Supabase processes auth and redirects back to: `http://localhost:8888`
5. You're logged in as `ibe.admin` with super_admin privileges

## 🔍 Verification Steps

### After updating GitHub OAuth:
1. **Test the flow**: Try logging in at http://localhost:8888
2. **Check for errors**: No more DNS errors should occur
3. **Verify login**: Should be logged in as "Ibe Admin" (super_admin)
4. **Check profile**: Should have access to all admin features

### If still having issues:
1. **Clear browser cache** and cookies
2. **Check browser console** for any error messages
3. **Verify URLs** match exactly in both GitHub and Supabase
4. **Check network tab** to see the redirect flow

## 📱 Current URLs (For Reference)

### Development:
- **Application**: http://localhost:8888
- **Health Check**: http://localhost:8888/.netlify/functions/health-check
- **Supabase Project**: https://vcjmwgbjbllkkivrkvqx.supabase.co

### Production (When Ready):
- **Application**: https://minatid.se
- **GitHub OAuth Callback**: https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback

## 🎯 Expected Result

After completing these steps:
- ✅ No more DNS errors
- ✅ Successful GitHub OAuth login
- ✅ Access to MinTid system as super admin
- ✅ All features working properly

---

**IMPORTANT**: The key fix is updating the GitHub OAuth callback URL from the old project to:
`https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback`

This is the only remaining step to fix the authentication issue! 🚀
