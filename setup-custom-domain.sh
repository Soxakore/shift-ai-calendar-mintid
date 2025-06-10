#!/bin/bash

echo "🌐 Custom Domain Setup Assistant"
echo "==============================="
echo ""

# Get domain name from user
echo "📝 What's your domain name from One.com?"
echo "   Example: mycompany.com or app.mycompany.com"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 GitHub Configuration Steps:${NC}"
echo ""

echo -e "${GREEN}Step 1: Enable GitHub Pages${NC}"
echo "   🌐 URL: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages"
echo "   📝 Set Source to 'GitHub Actions'"
echo "   📝 Add your domain in 'Custom domain' field"
echo "   📝 Enable 'Enforce HTTPS'"
echo ""

echo -e "${GREEN}Step 2: Add Repository Secrets (if not done)${NC}"
echo "   🔐 URL: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/secrets/actions"
echo "   📝 Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
echo ""

echo -e "${BLUE}🌍 One.com DNS Configuration:${NC}"
echo ""

echo -e "${GREEN}Option A: Root Domain (yourdomain.com)${NC}"
echo "   Add these 4 A records in One.com DNS:"
echo "   185.199.108.153"
echo "   185.199.109.153" 
echo "   185.199.110.153"
echo "   185.199.111.153"
echo ""

echo -e "${GREEN}Option B: Subdomain (www.yourdomain.com)${NC}"
echo "   Add this CNAME record:"
echo "   Name: www"
echo "   Value: soxakore.github.io"
echo ""

echo -e "${YELLOW}⏱️  Expected Timeline:${NC}"
echo "   📋 Setup: 5 minutes"
echo "   🌐 DNS Propagation: 5-30 minutes"
echo "   🔒 SSL Certificate: 5-15 minutes"
echo "   ✅ Total: 15-50 minutes"
echo ""

echo -e "${BLUE}🧪 Test URLs (replace with your domain):${NC}"
echo "   🏠 Main App: https://yourdomain.com/"
echo "   👑 Super Admin: https://yourdomain.com/super-admin"
echo "   🏢 Org Admin: https://yourdomain.com/org-admin"
echo "   👨‍💼 Manager: https://yourdomain.com/manager"
echo "   👤 Employee: https://yourdomain.com/employee"
echo ""

echo -e "${GREEN}🔍 Check DNS Propagation:${NC}"
echo "   Online: https://dnschecker.org/"
echo "   Command: dig yourdomain.com A"
echo ""

echo -e "${RED}📚 Full Guide:${NC} ONE_COM_DOMAIN_SETUP_GUIDE.md"
echo ""

echo "🎯 Ready to configure your custom domain!"
