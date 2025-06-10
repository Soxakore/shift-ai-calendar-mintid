#!/bin/bash

echo "🌐 Netlify + minatid.se Deployment Setup"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🎯 Target Setup:${NC}"
echo "   Domain: minatid.se"
echo "   Hosting: Netlify"
echo "   Repository: https://github.com/Soxakore/shift-ai-calendar-mintid"
echo ""

echo -e "${GREEN}✅ Configuration Updated:${NC}"
echo "   📁 netlify.toml - Environment variables added"
echo "   ⚙️  vite.config.ts - Netlify optimized"
echo "   🌐 CNAME - Updated to minatid.se"
echo ""

echo -e "${YELLOW}📋 Deployment Steps:${NC}"
echo ""

echo -e "${GREEN}Step 1: Create Netlify Account${NC}"
echo "   🌐 Sign up: https://app.netlify.com/signup"
echo "   🔗 Connect GitHub account"
echo ""

echo -e "${GREEN}Step 2: Connect Repository${NC}"
echo "   📂 New site from Git → GitHub"
echo "   📍 Select: Soxakore/shift-ai-calendar-mintid"
echo "   ⚙️  Build settings auto-detected from netlify.toml"
echo ""

echo -e "${GREEN}Step 3: Configure Environment Variables${NC}"
echo "   🔐 Site Settings → Environment Variables"
echo "   📝 Add (already in netlify.toml but can override):"
echo "      VITE_SUPABASE_URL"
echo "      VITE_SUPABASE_ANON_KEY"
echo ""

echo -e "${GREEN}Step 4: Add Custom Domain${NC}"
echo "   🌐 Site Settings → Domain management"
echo "   📝 Add custom domain: minatid.se"
echo "   📋 Note DNS requirements from Netlify"
echo ""

echo -e "${GREEN}Step 5: Configure One.com DNS${NC}"
echo "   🔐 Login: https://www.one.com/admin/"
echo "   📍 Find: minatid.se domain"
echo "   📝 Add DNS records as provided by Netlify"
echo ""

echo -e "${BLUE}🎯 Expected Live URLs:${NC}"
echo "   🏠 Main App: https://minatid.se/"
echo "   👑 Super Admin: https://minatid.se/super-admin"
echo "   🏢 Org Admin: https://minatid.se/org-admin"
echo "   👨‍💼 Manager: https://minatid.se/manager"
echo "   👤 Employee: https://minatid.se/employee"
echo ""

echo -e "${GREEN}🧪 Test Accounts Ready:${NC}"
echo "   👑 Super Admin: tiktok / password123"
echo "   🏢 Org Admin: youtube / password123"
echo "   👨‍💼 Manager: instagram / password123"
echo "   👤 Employee: twitter / password123"
echo ""

echo -e "${YELLOW}⚡ Netlify Advantages:${NC}"
echo "   🔄 Auto-deploy on GitHub push"
echo "   🌿 Branch preview deployments"
echo "   🔒 Automatic SSL certificates"
echo "   ⚡ Global CDN performance"
echo "   📊 Built-in analytics"
echo "   🛡️  Security headers configured"
echo ""

echo -e "${BLUE}⏱️  Timeline:${NC}"
echo "   📋 Netlify Setup: 10 minutes"
echo "   🚀 Initial Deploy: 2-3 minutes"
echo "   🌐 DNS Propagation: 5-30 minutes"
echo "   🔒 SSL Certificate: 5-15 minutes"
echo ""

echo -e "${RED}📚 Complete Guide:${NC} NETLIFY_MINATID_DEPLOYMENT_GUIDE.md"
echo ""

echo "🚀 Ready to deploy to Netlify with minatid.se!"
echo ""

# Check current build status
echo -e "${BLUE}🔍 Current Build Status:${NC}"
if [ -d "dist" ]; then
    echo "   ✅ Build directory exists"
    du -sh dist 2>/dev/null && echo "   📦 Build size calculated"
else
    echo "   ⚠️  No build directory - run 'npm run build' first"
fi
