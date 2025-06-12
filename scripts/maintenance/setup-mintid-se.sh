#!/bin/bash

echo "🇸🇪 mintid.se Domain Setup Assistant"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🎯 Setting up: mintid.se${NC}"
echo -e "${BLUE}📍 Provider: One.com${NC}"
echo ""

echo -e "${GREEN}Step 1: GitHub Pages Configuration${NC}"
echo "   🌐 URL: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages"
echo "   📝 Custom domain: mintid.se"
echo "   📝 Source: GitHub Actions"  
echo "   📝 Enforce HTTPS: ✅"
echo ""

echo -e "${GREEN}Step 2: One.com DNS Records for mintid.se${NC}"
echo "   🔐 Login: https://www.one.com/admin/"
echo "   📝 Find 'mintid.se' domain"
echo "   📝 Go to DNS/Zone management"
echo ""
echo "   Add these 4 A records:"
echo "   185.199.108.153"
echo "   185.199.109.153"
echo "   185.199.110.153" 
echo "   185.199.111.153"
echo ""

echo -e "${YELLOW}🇸🇪 Sweden-Specific Notes:${NC}"
echo "   • .se domains may take up to 2 hours to propagate"
echo "   • One.com interface might be in Swedish"
echo "   • Look for 'Avancerad DNS' or 'DNS-inställningar'"
echo ""

echo -e "${BLUE}🎯 Your Live URLs (after setup):${NC}"
echo "   🏠 Main App: https://mintid.se/"
echo "   👑 Super Admin: https://mintid.se/super-admin"
echo "   🏢 Org Admin: https://mintid.se/org-admin"
echo "   👨‍💼 Manager: https://mintid.se/manager" 
echo "   👤 Employee: https://mintid.se/employee"
echo ""

echo -e "${GREEN}🧪 Test Accounts:${NC}"
echo "   👑 Super Admin: tiktok / password123"
echo "   🏢 Org Admin: youtube / password123"
echo "   👨‍💼 Manager: instagram / password123"
echo "   👤 Employee: twitter / password123"
echo ""

echo -e "${YELLOW}⏱️ Expected Timeline:${NC}"
echo "   📋 Setup: 5 minutes"
echo "   🌐 DNS Propagation: 5-30 minutes (.se can take up to 2 hours)"
echo "   🔒 SSL Certificate: 5-15 minutes after DNS"
echo ""

echo -e "${BLUE}🔍 Check Progress:${NC}"
echo "   DNS Status: dig mintid.se A"
echo "   Online Checker: https://dnschecker.org/"
echo ""

echo -e "${GREEN}✅ Current GitHub Pages Status:${NC}"
curl -s -o /dev/null -w "   GitHub Pages: HTTP %{http_code}" https://soxakore.github.io/shift-ai-calendar-mintid/
echo ""
echo ""

echo -e "${RED}📚 Complete Guide:${NC} MINTID_SE_DOMAIN_SETUP.md"
echo ""

echo "🚀 Ready to set up mintid.se!"
