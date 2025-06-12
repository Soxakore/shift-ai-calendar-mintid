#!/bin/bash

echo "🌐 NETLIFY DEPLOYMENT STATUS CHECK"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📊 Current Configuration:${NC}"
echo "   🌐 Target Domain: minatid.se"
echo "   🏗️  Hosting Platform: Netlify"
echo "   📂 Repository: https://github.com/Soxakore/shift-ai-calendar-mintid"
echo ""

echo -e "${GREEN}✅ Migration Completed:${NC}"
echo "   📁 netlify.toml configured with environment variables"
echo "   ⚙️  vite.config.ts optimized for Netlify"
echo "   🌐 CNAME file updated to minatid.se"
echo "   📚 Documentation and guides created"
echo "   🔄 All changes committed and pushed to GitHub"
echo ""

echo -e "${YELLOW}📋 Ready for Deployment:${NC}"
echo ""

echo -e "${GREEN}Step 1: Netlify Account Setup${NC}"
echo "   🌐 Sign up: https://app.netlify.com/signup"
echo "   🔗 Connect with GitHub account"
echo ""

echo -e "${GREEN}Step 2: Connect Repository${NC}"
echo "   📂 New site from Git → GitHub"
echo "   📍 Select: Soxakore/shift-ai-calendar-mintid"
echo "   ⚙️  Build settings: Auto-detected from netlify.toml"
echo "   🚀 Deploy site"
echo ""

echo -e "${GREEN}Step 3: Configure Custom Domain${NC}"
echo "   🌐 Site Settings → Domain management"
echo "   📝 Add custom domain: minatid.se"
echo "   📋 Note DNS configuration from Netlify"
echo ""

echo -e "${GREEN}Step 4: Update One.com DNS${NC}"
echo "   🔐 Login: https://www.one.com/admin/"
echo "   📍 Manage: minatid.se domain"
echo "   📝 Add DNS records as provided by Netlify"
echo ""

echo -e "${BLUE}🎯 Expected Live URLs:${NC}"
echo "   🏠 Main App: https://minatid.se/"
echo "   👑 Super Admin: https://minatid.se/super-admin"
echo "   🏢 Org Admin: https://minatid.se/org-admin"
echo "   👨‍💼 Manager: https://minatid.se/manager"
echo "   👤 Employee: https://minatid.se/employee"
echo ""

echo -e "${GREEN}🧪 Test Accounts:${NC}"
echo "   👑 Super Admin: tiktok / password123"
echo "   🏢 Org Admin: youtube / password123"
echo "   👨‍💼 Manager: instagram / password123"
echo "   👤 Employee: twitter / password123"
echo ""

echo -e "${YELLOW}⏱️  Timeline:${NC}"
echo "   📋 Netlify Setup: 10 minutes"
echo "   🚀 Initial Deploy: 2-3 minutes"
echo "   🌐 DNS Propagation: 5-30 minutes"
echo "   🔒 SSL Certificate: 5-15 minutes"
echo ""

echo -e "${BLUE}🔍 Verification:${NC}"
echo "   Check deployment: curl -s -o /dev/null -w \"%{http_code}\" https://minatid.se/"
echo "   Check DNS: dig minatid.se A"
echo "   Online DNS checker: https://dnschecker.org/"
echo ""

echo -e "${RED}📚 Documentation:${NC}"
echo "   📄 NETLIFY_MINATID_DEPLOYMENT_GUIDE.md - Complete guide"
echo "   📄 NETLIFY_MIGRATION_COMPLETE.md - Migration summary"
echo "   📄 setup-netlify-minatid.sh - Quick setup script"
echo ""

echo -e "${GREEN}🎉 READY FOR NETLIFY DEPLOYMENT!${NC}"
echo "Complete the 4 steps above to deploy your professional"
echo "shift scheduling application to https://minatid.se/"
