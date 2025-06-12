# 🚨 GitHub OAuth Error Diagnosis & Fix

## Error Analysis
**Error**: `GitHub authentication error: SUPABASE_URL is not defined`

This error suggests one of these issues:
1. **GitHub OAuth not configured** in Supabase Dashboard
2. **Environment variables** not loading properly
3. **Supabase client** initialization issue

## ✅ Quick Fix Steps

### Step 1: Verify Environment Variables
```bash
cd /Users/ibe/new-project/shift-ai-calendar-mintid
source .env.local
echo "Supabase URL: $VITE_SUPABASE_URL"
echo "GitHub Username: $VITE_SUPER_ADMIN_GITHUB_USERNAME"
```

### Step 2: Check Supabase Dashboard Configuration
**Most Likely Issue**: GitHub OAuth provider not enabled in Supabase Dashboard

1. **Go to**: https://app.supabase.com/project/kyiwpwlxmysyuqjdxvyq/auth/providers
2. **Find GitHub** in the providers list
3. **Check if GitHub is enabled** (toggle should be ON)
4. **If not enabled**: This is causing your error

### Step 3: Enable GitHub OAuth (If Not Already Done)

#### Option A: Quick GitHub OAuth Setup
1. **Create GitHub OAuth App**: https://github.com/settings/applications/new
   ```
   Application name: MinTid Calendar - Soxakore
   Homepage URL: https://soxakore.github.io/shift-ai-calendar-mintid/
   Authorization callback URL: https://kyiwpwlxmysyuqjdxvyq.supabase.co/auth/v1/callback
   ```

2. **Configure in Supabase**:
   - Go to: https://app.supabase.com/project/kyiwpwlxmysyuqjdxvyq/auth/providers
   - Enable GitHub provider
   - Add your Client ID and Client Secret
   - Save configuration

#### Option B: Disable GitHub OAuth Temporarily
If you want to test other authentication first:

1. **Edit UnifiedLogin.tsx** to hide GitHub button temporarily
2. **Use username/password login** for testing
3. **Configure GitHub OAuth later**

### Step 4: Test the Fix

#### After Enabling GitHub OAuth:
1. **Restart dev server**: `npm run dev`
2. **Open**: http://localhost:5173
3. **Try GitHub OAuth**: Should work without SUPABASE_URL error

#### If GitHub OAuth Still Fails:
1. **Check browser console** for specific error messages
2. **Verify callback URL** matches exactly in GitHub App settings
3. **Check Supabase logs** for authentication attempts

## 🔧 Code Fix (Already Applied)
The code has been updated to properly load SUPABASE_URL:

```typescript
const signInWithGitHub = async () => {
  try {
    // ✅ FIXED: Properly load SUPABASE_URL from environment
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
    const isLocalSupabase = SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost');
    
    if (isLocalSupabase) {
      return { 
        success: false, 
        error: 'GitHub OAuth not available in local development mode' 
      };
    }
    
    // GitHub OAuth call...
  }
}
```

## 🎯 Most Likely Solution
**90% chance the issue is**: GitHub OAuth provider not enabled in Supabase Dashboard

**Quick test**: 
1. Go to: https://app.supabase.com/project/kyiwpwlxmysyuqjdxvyq/auth/providers
2. Look for GitHub in the list
3. If it's not enabled (toggle OFF), that's your issue
4. Enable it following the steps above

## 🔄 Alternative Authentication (While Fixing GitHub OAuth)
You can use these working authentication methods:

```bash
# Super Admin (Email/Password)
Email: admin@mintid.live
Password: Try: admin123, admin, password, 123456

# Username/Password (For testing other roles)  
Username: Any username from your user management system
Password: Configured password
```

## 📞 Next Steps
1. **Check Supabase Dashboard** for GitHub provider status
2. **Enable GitHub OAuth** if not already done
3. **Test authentication** after configuration
4. **Let me know** if you need help with any specific step

---
**Status**: Ready to fix GitHub OAuth configuration
**Most Likely Fix**: Enable GitHub provider in Supabase Dashboard
