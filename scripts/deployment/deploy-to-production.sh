#!/bin/bash

# MinTid Production Deployment Script
echo "🚀 MinTid Production Deployment to minatid.se"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo -e "${RED}❌ Error: netlify.toml not found. Run this script from the project root.${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 1: Building for production...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 2: Running pre-deployment tests...${NC}"

# Test Supabase connection
echo "Testing Supabase connection..."
if command -v curl &> /dev/null; then
    response=$(curl -s -w "%{http_code}" https://vcjmwgbjbllkkivrkvqx.supabase.co/rest/v1/ -o /dev/null)
    if [ "$response" = "401" ]; then
        echo -e "${GREEN}✅ Supabase: Connection verified${NC}"
    else
        echo -e "${RED}❌ Supabase: Connection failed (HTTP $response)${NC}"
        exit 1
    fi
fi

# Check if Netlify CLI is available
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
fi

echo -e "\n${BLUE}Step 3: Deploying to production...${NC}"
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
    echo ""
    echo -e "${BLUE}Production URLs:${NC}"
    echo "🌐 Main Application: https://minatid.se"
    echo "🔧 Health Check: https://minatid.se/.netlify/functions/health-check"
    echo "📧 Email Validation: https://minatid.se/.netlify/functions/validate-email"
    echo "📊 Export Function: https://minatid.se/.netlify/functions/export-schedule"
    echo "🔗 Webhook Handler: https://minatid.se/.netlify/functions/webhook-handler"
    echo ""
    echo -e "${YELLOW}Post-deployment checklist:${NC}"
    echo "1. ✅ Test login with GitHub OAuth"
    echo "2. ✅ Verify health check endpoint"
    echo "3. ✅ Test function endpoints"
    echo "4. ✅ Check Supabase RLS policies"
    echo "5. ✅ Update GitHub OAuth callback URL to production"
    echo ""
    echo -e "${GREEN}🚀 MinTid Shift Scheduler is now LIVE at minatid.se!${NC}"
else
    echo -e "${RED}❌ Deployment failed. Please check the errors above.${NC}"
    exit 1
fi
