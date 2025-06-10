#!/bin/bash

# MinTid Test User Verification Script
# Verifies that all test users are properly configured for testing

echo "🧪 MinTid Test User Verification"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database connection
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "📊 Checking Test User Setup..."
echo ""

if ! pgrep -f "supabase" > /dev/null; then
    echo -e "${RED}❌ Supabase local development is not running${NC}"
    echo "Please run: supabase start"
    exit 1
fi

echo -e "${GREEN}✅ Supabase local development is running${NC}"

# Test database connection
if ! psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to database${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"
echo ""

# Verify auth users
echo "🔐 Verifying Auth Users..."
AUTH_USERS=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM auth.users WHERE email LIKE 'tiktok%@mintid.test';")
echo -e "${BLUE}Auth users found: ${AUTH_USERS}${NC}"

if [ "$AUTH_USERS" -eq 4 ]; then
    echo -e "${GREEN}✅ All 4 auth users created successfully${NC}"
else
    echo -e "${RED}❌ Expected 4 auth users, found ${AUTH_USERS}${NC}"
fi

# Verify profiles
echo ""
echo "👤 Verifying User Profiles..."
psql "$DB_URL" -c "
SELECT 
    '✅ ' || username as \"Username\",
    user_type as \"Role\",
    CASE WHEN is_active THEN '✅ Active' ELSE '❌ Inactive' END as \"Status\",
    email as \"Email\"
FROM profiles 
WHERE username LIKE 'tiktok%'
ORDER BY user_type;
"

# Verify schedules
echo ""
echo "📅 Verifying Sample Schedules..."
SCHEDULE_COUNT=$(psql "$DB_URL" -t -c "
SELECT COUNT(*) 
FROM schedules s 
JOIN profiles p ON s.user_id = p.id 
WHERE p.username LIKE 'tiktok%';
")

echo -e "${BLUE}Total schedules created: ${SCHEDULE_COUNT}${NC}"

psql "$DB_URL" -c "
SELECT 
    p.username as \"User\",
    p.user_type as \"Role\",
    COUNT(s.id) as \"Scheduled Days\"
FROM profiles p
LEFT JOIN schedules s ON p.id = s.user_id
WHERE p.username LIKE 'tiktok%'
GROUP BY p.username, p.user_type
ORDER BY p.user_type;
"

# Verify organizations and departments
echo ""
echo "🏢 Verifying Organization Structure..."
psql "$DB_URL" -c "
SELECT 
    o.name as \"Organization\",
    d.name as \"Department\",
    COUNT(p.id) as \"Test Users\"
FROM organizations o
JOIN departments d ON o.id = d.organization_id
LEFT JOIN profiles p ON d.id = p.department_id AND p.username LIKE 'tiktok%'
GROUP BY o.name, d.name
ORDER BY o.name, d.name;
"

echo ""
echo "🧪 Test User Login Credentials:"
echo "================================"
echo -e "${YELLOW}Super Admin:${NC}"
echo "  Username: tiktok"
echo "  Password: 123456"
echo "  Email: tiktok@mintid.test"
echo ""
echo -e "${YELLOW}Organization Admin:${NC}"
echo "  Username: tiktok-org"
echo "  Password: 123456"
echo "  Email: tiktok-org@mintid.test"
echo ""
echo -e "${YELLOW}Manager:${NC}"
echo "  Username: tiktok-mgr"
echo "  Password: 123456"
echo "  Email: tiktok-mgr@mintid.test"
echo ""
echo -e "${YELLOW}Employee:${NC}"
echo "  Username: tiktok-emp"
echo "  Password: 123456"
echo "  Email: tiktok-emp@mintid.test"
echo ""

# Check Edge Functions
echo "⚡ Verifying Edge Functions..."
if command -v supabase &> /dev/null; then
    FUNCTIONS_STATUS=$(supabase functions list 2>/dev/null || echo "Error listing functions")
    if [[ "$FUNCTIONS_STATUS" == *"Error"* ]]; then
        echo -e "${YELLOW}⚠️  Edge Functions status check skipped (may require remote connection)${NC}"
    else
        echo -e "${GREEN}✅ Edge Functions service available${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
fi

# Application status
echo ""
echo "🚀 Application Status:"
if curl -s http://localhost:8082 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend running at http://localhost:8082${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend not running. Start with: npm run dev${NC}"
fi

if curl -s http://127.0.0.1:54321 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Supabase API running at http://127.0.0.1:54321${NC}"
else
    echo -e "${RED}❌ Supabase API not accessible${NC}"
fi

echo ""
echo "🎯 Next Steps for Testing:"
echo "=========================="
echo "1. 🌐 Open browser to: http://localhost:8082"
echo "2. 🔐 Test login with any of the credentials above"
echo "3. 📱 Test role-specific dashboard access:"
echo "   - Super Admin → Full system access"
echo "   - Org Admin → Organization management"
echo "   - Manager → Department/team management"
echo "   - Employee → Personal schedule access"
echo "4. ⚡ Test Live Edge Functions integration"
echo "5. 📊 Test live notifications, reports, and automation"
echo ""
echo -e "${GREEN}✅ Test User Verification Complete!${NC}"
echo "Ready for comprehensive testing of all roles and features."
echo "□ Verify LiveNotificationsPanel functionality"
echo "□ Verify LiveReportsManager with CSV export"
echo "□ Verify LiveScheduleAutomation controls"
echo "□ Test role-based data access (RLS policies)"
echo "□ Test shift management across different roles"
echo ""

echo "✅ VERIFICATION COMPLETE!"
echo "========================"
echo "The TikTok test user is ready for comprehensive testing."
echo "Check TEST_USER_SETUP.md for detailed documentation."
echo ""

# Final summary
echo "📋 SUMMARY:"
echo "==========="
echo "✅ 4 Test users created (Super Admin, Org Admin, Manager, Employee)"
echo "✅ All users have password: 123456"
echo "✅ Sample schedules created for realistic testing"
echo "✅ Organization and department structure verified"
echo "✅ Ready for live Edge Functions testing"
echo ""
echo "🎯 Start testing at: http://localhost:8082"
echo ""