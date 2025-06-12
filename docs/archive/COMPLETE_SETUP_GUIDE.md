# 🚨 NEW SUPABASE PROJECT SETUP - COMPLETE SOLUTION

## 🔍 **Problem Identified**
- ✅ **Connection working**: New Supabase project `vcjmwgbjbllkkivrkvqx.supabase.co` is active
- ✅ **Service role key**: JWT token is valid  
- ❌ **Database empty**: Fresh project with no tables or proper users
- ❌ **Invalid user ID**: Your script references users that don't exist in this database

## 🚀 **STEP-BY-STEP FIX**

### **Step 1: Set Up Database Schema**
1. **Open Supabase SQL Editor**: https://app.supabase.com/project/vcjmwgbjbllkkivrkvqx/sql
2. **Copy the SQL** from `setup-database-schema.sql` 
3. **Run the SQL** to create all tables (organizations, departments, profiles)
4. **Verify success**: Should see "Success" message

### **Step 2: Create Test User**
**Option A - Via Supabase Dashboard:**
1. Go to: https://app.supabase.com/project/vcjmwgbjbllkkivrkvqx/auth/users
2. Click "Add user"
3. **Email**: `ibe@test.mintid.live`
4. **Password**: `test123`
5. **Auto-confirm**: Yes
6. Click "Create user"

**Option B - Via Browser Test:**
1. Open `test-database.html` in browser 
2. Check console for database status
3. Use manual testing functions

### **Step 3: Update Your Script**
Replace the hardcoded user info in `reset-ibe-password.js`:

```javascript
// OLD (invalid user):
const userId = 'ca19be79-b817-4e19-82b3-b6d3327d6ef9';
const email = 'ibe@395ee500-5aa4-49e5-9f90-afb12e608746.mintid.local';

// NEW (after creating user):
const userId = 'YOUR_ACTUAL_USER_ID_FROM_DASHBOARD';
const email = 'ibe@test.mintid.live';
```

### **Step 4: Test Authentication**
1. **Run your script**: `node reset-ibe-password.js`
2. **Should work** with the new user ID/email
3. **Test login** at http://localhost:5176/

## 🎯 **GitHub OAuth Setup (After Database Setup)**

### **Step 1: Enable GitHub OAuth**
1. **Go to**: https://app.supabase.com/project/vcjmwgbjbllkkivrkvqx/auth/providers
2. **Find GitHub**: Toggle ON "Enable sign in with GitHub"

### **Step 2: Create GitHub OAuth App**
1. **Go to**: https://github.com/settings/applications/new
2. **App name**: `MinTid Calendar - Soxakore`
3. **Homepage**: `https://soxakore.github.io/shift-ai-calendar-mintid/`
4. **Callback URL**: `https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback`
5. **Save Client ID and Secret**

### **Step 3: Configure in Supabase**
1. **Add GitHub credentials** to Supabase Auth providers
2. **Save configuration**

### **Step 4: Test GitHub OAuth**
1. **Open**: http://localhost:5176/
2. **Click**: "Sign in with GitHub"  
3. **Expected**: Login as super admin with username "Soxakore"

## 🔧 **Current File Status**

### ✅ **Ready Files:**
- `.env.local` - Updated with correct Supabase URLs and keys
- `setup-database-schema.sql` - Database schema ready to run
- `test-database.html` - Browser testing tool
- Authentication code - Configured for "Soxakore" GitHub username

### 🔄 **Files to Update After Database Setup:**
- `reset-ibe-password.js` - Update with real user ID
- Any other scripts referencing user IDs

## 🎯 **Expected Results After Setup**

### **Database Setup:**
- ✅ Tables created (organizations, departments, profiles)
- ✅ Basic RLS policies applied
- ✅ Default organization created

### **User Authentication:**
- ✅ Test user can login with email/password
- ✅ GitHub OAuth button appears
- ✅ GitHub OAuth redirects properly 
- ✅ Username "Soxakore" detected as super admin

### **Application Access:**
- ✅ Development server works: http://localhost:5176/
- ✅ Authentication flows work
- ✅ Super admin dashboard accessible

## 🆘 **If Issues Persist**

### **Database Issues:**
- Check SQL ran successfully in Supabase dashboard
- Verify tables exist in Database → Tables section
- Check RLS policies are active

### **Authentication Issues:**
- Verify user exists in Auth → Users section
- Check email is confirmed
- Try password reset if needed

### **GitHub OAuth Issues:**
- Ensure callback URL matches exactly
- Check GitHub App is active and accessible
- Verify Client ID/Secret are correct

---

**NEXT ACTION**: Run the SQL schema in Supabase Dashboard, then create a test user!

**Dashboard**: https://app.supabase.com/project/vcjmwgbjbllkkivrkvqx
