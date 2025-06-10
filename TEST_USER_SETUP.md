# Test User Setup - TikTok User

## 🎯 TEST USER CREATED SUCCESSFULLY!

### **Login Credentials**
- **Username**: `tiktok`
- **Password**: `123456`
- **Email**: `tiktok@mintid.test`

### **Multi-Role Access**
The test user has been created with profiles for all role types in the system:

#### 1. **Super Admin Role**
- **Username**: `tiktok`
- **Display Name**: TikTok Test User (Super Admin)
- **Access**: Full system access, all organizations
- **Tracking ID**: `tiktok-super-admin`

#### 2. **Organization Admin Role**
- **Username**: `tiktok-org`
- **Display Name**: TikTok Test User (Org Admin)
- **Access**: Organization-level administration
- **Tracking ID**: `tiktok-org-admin`

#### 3. **Manager Role**
- **Username**: `tiktok-mgr`
- **Display Name**: TikTok Test User (Manager)
- **Access**: Department and team management
- **Tracking ID**: `tiktok-manager`

#### 4. **Employee Role**
- **Username**: `tiktok-emp`
- **Display Name**: TikTok Test User (Employee)
- **Access**: Basic employee functions
- **Tracking ID**: `tiktok-employee`

### **Organization & Department Assignment**
- **Organization**: MinTid System
- **Department**: IT Department
- **Phone**: +46701234567
- **QR Code**: Enabled for all profiles

### **Sample Shifts Created**
The test user has sample shifts scheduled for the next week:
- **Employee**: 3 shifts (8-16 hours, some confirmed, some draft)
- **Manager**: 3 shifts (9-17 hours, management duties)
- **Super Admin**: 2 shifts (oversight and review meetings)

### **Authentication Details**
- **Auth User ID**: `2fd7b125-c923-4a6c-b6c0-2f6177afff7e`
- **Email Confirmed**: ✅ Yes
- **Role**: `authenticated`
- **Provider**: Email

### **Testing Different Roles**

#### **To Test Super Admin Access:**
1. Login with `tiktok` / `123456`
2. Access SuperAdminDashboard.tsx
3. Should see LiveReportsManager and LiveScheduleAutomation
4. Full system access to all organizations

#### **To Test Manager Access:**
1. Login with `tiktok-mgr` / `123456` 
2. Access ManagerDashboard.tsx
3. Should see department management features
4. Access to team schedules and reports

#### **To Test Employee Access:**
1. Login with `tiktok-emp` / `123456`
2. Access SchedulePage.tsx
3. Should see personal schedule and LiveNotificationsPanel
4. Limited to own data and basic functions

#### **To Test Org Admin Access:**
1. Login with `tiktok-org` / `123456`
2. Access EnhancedOrgAdminDashboard.tsx
3. Should see organization-level management
4. Access to all departments within the organization

### **Live Edge Functions Integration**
All roles have access to the live Edge Functions:
- **LiveNotificationsPanel**: Real-time notifications
- **LiveReportsManager**: Analytics and reporting with CSV export
- **LiveScheduleAutomation**: Automated scheduling controls

### **Database Records Summary**
```sql
-- Auth user record
✅ auth.users: 1 record (email: tiktok@mintid.test)

-- Profile records (profiles table)
✅ super_admin profile: tiktok
✅ org_admin profile: tiktok-org  
✅ manager profile: tiktok-mgr
✅ employee profile: tiktok-emp

-- User records (users table)
✅ super_admin user: tiktok
✅ manager user: tiktok-mgr
✅ employee user: tiktok-emp

-- Sample shifts
✅ 8 shifts created across all roles
```

### **Verification Queries**
```sql
-- Verify all user roles
SELECT username, role, email, department, plan 
FROM users 
WHERE auth_user_id = '2fd7b125-c923-4a6c-b6c0-2f6177afff7e'
ORDER BY role;

-- Verify all profiles
SELECT username, display_name, user_type, is_active 
FROM profiles 
WHERE username LIKE 'tiktok%'
ORDER BY user_type;

-- Verify auth user
SELECT email, aud, role, email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email = 'tiktok@mintid.test';

-- Check shifts
SELECT u.username, u.role, s.start_time, s.end_time, s.status, s.note
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE u.auth_user_id = '2fd7b125-c923-4a6c-b6c0-2f6177afff7e'
ORDER BY s.start_time;
```

## 🚀 Ready for Testing!

The test user is now fully set up and ready for comprehensive testing of all roles and features in the MinTid Smart Work Schedule Calendar application with live Edge Functions integration.

### **Next Steps**
1. Test login with each role
2. Verify role-specific dashboard access
3. Test live Edge Functions integration
4. Verify data access permissions (RLS)
5. Test schedule management features
6. Validate notification and reporting systems

**Created on**: 2025-06-09
**Project**: MinTid Smart Work Schedule Calendar
**Status**: ✅ COMPLETE - Ready for Testing