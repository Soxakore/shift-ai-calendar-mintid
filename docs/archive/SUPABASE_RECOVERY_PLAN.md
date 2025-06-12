# 🚨 EMERGENCY: Supabase Project Recovery Plan

## Issue Confirmed
**Problem**: Supabase project `kyiwpwlxmysyuqjdxvyq.supabase.co` no longer exists
**Impact**: Complete authentication system failure
**Status**: CRITICAL - Immediate action required

## 🆘 Recovery Steps

### Step 1: Create New Supabase Project
1. **Go to**: https://supabase.com/dashboard
2. **Click**: "New Project"
3. **Organization**: Select your organization
4. **Project Name**: `MinTid Calendar - Soxakore`
5. **Database Password**: Choose a secure password
6. **Region**: Choose closest to your location
7. **Click**: "Create new project"
8. **Wait**: 2-3 minutes for project initialization

### Step 2: Get New Project Credentials
After project creation:
1. **Go to**: Settings → API
2. **Copy the new URLs and keys**:
   - Project URL: `https://[new-project-id].supabase.co`
   - Anon/Public Key: `eyJ...` (new key)
   - Service Role Key: `eyJ...` (new key - keep secure!)

### Step 3: Update Environment Variables
**Edit `.env.local`**:
```bash
# New Supabase Configuration
VITE_SUPABASE_URL=https://[NEW-PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=[NEW-ANON-KEY]
VITE_SUPABASE_SERVICE_ROLE_KEY=[NEW-SERVICE-ROLE-KEY]

# Keep existing GitHub configuration
VITE_SUPER_ADMIN_GITHUB_USERNAME=Soxakore
VITE_SUPER_ADMIN_EMAIL=admin@mintid.live
```

### Step 4: Set Up Database Schema
**Apply database migrations** (we have these ready):
1. **Go to**: New Supabase Dashboard → SQL Editor
2. **Run the schema setup** from our migration files
3. **Create necessary tables** and functions

### Step 5: Configure GitHub OAuth (New Project)
1. **Update GitHub OAuth App**:
   - Go to: https://github.com/settings/developers
   - Update callback URL to: `https://[NEW-PROJECT-ID].supabase.co/auth/v1/callback`
2. **Configure in new Supabase**:
   - Enable GitHub provider
   - Add GitHub OAuth credentials

## 🔧 Quick Recovery Script

I'll create an automated script to help with the recovery process.

## 📋 What We'll Recover
- ✅ **Database schema**: All tables and relationships
- ✅ **Authentication system**: Username/password and GitHub OAuth
- ✅ **User roles**: Super admin, org admin, manager, employee
- ✅ **RLS policies**: Security and access control
- ✅ **Edge functions**: Email and other services
- ✅ **GitHub OAuth**: Super admin detection for Soxakore

## ⏱️ Recovery Timeline
- **Step 1-2**: 5 minutes (create project, get credentials)
- **Step 3**: 2 minutes (update environment variables)
- **Step 4**: 10 minutes (set up database schema)
- **Step 5**: 5 minutes (configure GitHub OAuth)
- **Total**: ~25 minutes to full recovery

## 🚨 Immediate Action
**Start with Step 1** - Create new Supabase project immediately to get the system back online.

---
**Status**: CRITICAL - Production system down
**Next Action**: Create new Supabase project
**Priority**: HIGHEST
