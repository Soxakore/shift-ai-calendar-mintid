#!/bin/bash

# GitHub OAuth Fix & Test Script
echo "🔧 GitHub OAuth Fix & Authentication Test"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}Step 1: Stopping existing development server...${NC}"
pkill -f "netlify dev" || echo "No existing netlify dev process found"
pkill -f "vite" || echo "No existing vite process found"

echo -e "\n${BLUE}Step 2: Verifying updated Supabase configuration...${NC}"

# Check if .env.local has the correct URL
if grep -q "vcjmwgbjbllkkivrkvqx.supabase.co" .env.local; then
    echo -e "${GREEN}✅ .env.local: Updated to MinTid 2.0 project${NC}"
else
    echo -e "${RED}❌ .env.local: Still has old URL${NC}"
    exit 1
fi

# Check if netlify.toml has the correct URL
if grep -q "vcjmwgbjbllkkivrkvqx.supabase.co" netlify.toml; then
    echo -e "${GREEN}✅ netlify.toml: Updated to MinTid 2.0 project${NC}"
else
    echo -e "${RED}❌ netlify.toml: Still has old URL${NC}"
    exit 1
fi

# Check if .env.production has the correct URL
if grep -q "vcjmwgbjbllkkivrkvqx.supabase.co" .env.production; then
    echo -e "${GREEN}✅ .env.production: Updated to MinTid 2.0 project${NC}"
else
    echo -e "${RED}❌ .env.production: Still has old URL${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 3: Testing Supabase connection...${NC}"
response=$(curl -s -w "%{http_code}" https://vcjmwgbjbllkkivrkvqx.supabase.co/rest/v1/ -o /dev/null)
if [ "$response" = "401" ]; then
    echo -e "${GREEN}✅ Supabase: MinTid 2.0 project is accessible${NC}"
else
    echo -e "${RED}❌ Supabase: Connection failed (HTTP $response)${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 4: Starting development server...${NC}"
echo "Starting Netlify dev server..."

# Start netlify dev in background
netlify dev > netlify-dev.log 2>&1 &
NETLIFY_PID=$!

# Wait for server to start
echo "Waiting for server to initialize..."
sleep 10

# Check if server is running
if kill -0 $NETLIFY_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Netlify dev server started (PID: $NETLIFY_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start Netlify dev server${NC}"
    cat netlify-dev.log
    exit 1
fi

echo -e "\n${BLUE}Step 5: Testing health check function...${NC}"
# Wait a bit more for functions to load
sleep 5

health_response=$(curl -s http://localhost:8888/.netlify/functions/health-check 2>/dev/null)
if echo "$health_response" | grep -q '"status":"ok"'; then
    supabase_status=$(echo "$health_response" | jq -r '.services.supabase' 2>/dev/null)
    if [ "$supabase_status" = "healthy" ]; then
        echo -e "${GREEN}✅ Health Check: Supabase connection healthy${NC}"
    else
        echo -e "${RED}❌ Health Check: Supabase status: $supabase_status${NC}"
    fi
else
    echo -e "${RED}❌ Health Check: Function not responding${NC}"
    echo "Response: $health_response"
fi

echo -e "\n${BLUE}Step 6: Opening application...${NC}"
echo -e "${GREEN}🌐 Application URL: http://localhost:8888${NC}"
echo -e "${GREEN}🔧 Functions URL: http://localhost:8888/.netlify/functions/${NC}"

# Open browser (macOS)
if command -v open &> /dev/null; then
    open http://localhost:8888
fi

echo -e "\n${YELLOW}📋 GitHub OAuth Configuration Checklist:${NC}"
echo "1. Go to: https://github.com/settings/developers"
echo "2. Update OAuth App settings:"
echo "   - Homepage URL: http://localhost:8888"
echo "   - Callback URL: https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback"
echo ""
echo "3. In Supabase Dashboard:"
echo "   - Go to: https://supabase.com/dashboard/project/vcjmwgbjbllkkivrkvqx"
echo "   - Navigate to: Authentication → Providers → GitHub"
echo "   - Enable GitHub and add your Client ID + Secret"
echo ""
echo "4. Test login at: http://localhost:8888"

echo -e "\n${GREEN}🚀 Ready for authentication testing!${NC}"
echo ""
echo "To view server logs: tail -f netlify-dev.log"
echo "To stop server: kill $NETLIFY_PID"
