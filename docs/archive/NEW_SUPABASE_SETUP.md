# 🚀 NEW SUPABASE PROJECT SETUP

## ✅ Current Status
- **New Supabase Project**: `https://vcjmwgbjbllkkivrkvqx.supabase.co`
- **Previous Project**: `kyiwpwlxmysyuqjdxvyq.supabase.co` (DELETED/BROKEN)
- **GitHub Username**: `Soxakore` (correctly configured)

## 🔧 IMMEDIATE SETUP REQUIRED

### Step 1: Get Your New Supabase Keys
1. **Go to**: https://app.supabase.com/project/vcjmwgbjbllkkivrkvqx/settings/api
2. **Copy these keys**:
   - **Project URL**: `https://vcjmwgbjbllkkivrkvqx.supabase.co` ✅ (already updated)
   - **anon public key**: Copy this value
   - **service_role key**: Copy this value (keep secure!)

### Step 2: Update Environment Variables
**Edit your `.env.local` file** and replace the placeholder values:

```bash
# Current file has placeholders - replace with actual keys:
VITE_SUPABASE_URL=https://vcjmwgbjbllkkivrkvqx.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY_FROM_DASHBOARD
VITE_SUPABASE_SERVICE_ROLE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_FROM_DASHBOARD
```

### Step 3: Set Up Database Schema
Your new Supabase project needs the database tables. Run this SQL in the Supabase SQL Editor:

```sql
-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Departments table  
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('super_admin', 'org_admin', 'manager', 'employee')) NOT NULL,
  organisation_id UUID REFERENCES organizations(id),
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true,
  tracking_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Basic policies (you can refine these later)
CREATE POLICY "Allow authenticated users to read organizations" ON organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read departments" ON departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read profiles" ON profiles
  FOR SELECT TO authenticated USING (true);
```

### Step 4: Configure GitHub OAuth (NEW PROJECT)
1. **Create GitHub OAuth App** (if not done):
   - Go to: https://github.com/settings/applications/new
   - **Application name**: `MinTid Calendar - Soxakore`
   - **Homepage URL**: `https://soxakore.github.io/shift-ai-calendar-mintid/`
   - **Authorization callback URL**: `https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback`
   - Click "Register application"

2. **Configure in NEW Supabase Dashboard**:
   - Go to: https://app.supabase.com/project/vcjmwgbjbllkkivrkvqx/auth/providers
   - Find GitHub provider
   - Toggle ON "Enable sign in with GitHub"
   - Enter your GitHub App's Client ID and Client Secret
   - Save configuration

### Step 5: Test Authentication
1. **Update environment file** with real keys (Step 2)
2. **Restart dev server**: `npm run dev`
3. **Test GitHub OAuth**: Should work with new project
4. **Test username/password**: May need to create test users

## 🎯 QUICK START COMMANDS

### Update Environment (after getting keys)
```bash
cd /Users/ibe/new-project/shift-ai-calendar-mintid

# Edit .env.local with your actual keys
nano .env.local

# Restart development server
npm run dev
```

### Test Configuration
```bash
# Check new configuration
source .env.local
echo "New Supabase URL: $VITE_SUPABASE_URL"
echo "GitHub Username: $VITE_SUPER_ADMIN_GITHUB_USERNAME"

# Test connectivity (should show 200 if keys are correct)
curl -I "$VITE_SUPABASE_URL/rest/v1/" -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

## 🔧 EXPECTED RESULTS

### After Setup:
1. ✅ **No DNS errors** - new Supabase URL should resolve
2. ✅ **GitHub OAuth button** appears in login
3. ✅ **GitHub OAuth flow** works without "SUPABASE_URL" errors
4. ✅ **Super admin detection** works for username "Soxakore"
5. ✅ **Auto-redirect** to `/super-admin` dashboard

### Authentication Options:
- **GitHub OAuth**: Username "Soxakore" → Super Admin access
- **Username/Password**: After creating users in new database
- **Email/Password**: Super admin email authentication

## 🆘 TROUBLESHOOTING

### If GitHub OAuth still fails:
1. **Verify callback URL** in GitHub App matches exactly: `https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback`
2. **Check Supabase keys** are correctly copied (no extra spaces/characters)
3. **Ensure GitHub provider** is enabled in new Supabase dashboard

### If database errors occur:
1. **Run the SQL schema** (Step 3) in Supabase SQL Editor
2. **Check RLS policies** are applied correctly
3. **Create test users** through the interface after basic setup

---

**NEXT ACTION**: Get your actual Supabase keys from the dashboard and update `.env.local`

**Dashboard URL**: https://app.supabase.com/project/vcjmwgbjbllkkivrkvqx/settings/api
