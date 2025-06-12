#!/bin/bash

# Test script for Netlify Functions
# This script tests all the serverless functions for the minatid.se shift scheduling app

echo "🔍 Testing Netlify Functions for minatid.se"
echo "============================================"

BASE_URL="http://localhost:8888/.netlify/functions"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Health Check Function
echo -e "\n${YELLOW}Testing Health Check Function...${NC}"
response=$(curl -s "$BASE_URL/health-check")
status=$(echo "$response" | jq -r '.status' 2>/dev/null)

if [ "$status" = "ok" ]; then
    echo -e "${GREEN}✅ Health Check: PASSED${NC}"
    echo "   - Status: $status"
    echo "   - Supabase: $(echo "$response" | jq -r '.services.supabase')"
    echo "   - Response Time: $(echo "$response" | jq -r '.performance.responseTime')"
else
    echo -e "${RED}❌ Health Check: FAILED${NC}"
    echo "$response"
fi

# Test Email Validation Function
echo -e "\n${YELLOW}Testing Email Validation Function...${NC}"

# Test valid email
valid_response=$(curl -s -X POST "$BASE_URL/validate-email" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@minatid.se"}')

valid_status=$(echo "$valid_response" | jq -r '.isValid' 2>/dev/null)

if [ "$valid_status" = "true" ]; then
    echo -e "${GREEN}✅ Email Validation (valid): PASSED${NC}"
    echo "   - Email: admin@minatid.se"
    echo "   - Valid: $valid_status"
    echo "   - Business Email: $(echo "$valid_response" | jq -r '.isBusinessEmail')"
else
    echo -e "${RED}❌ Email Validation (valid): FAILED${NC}"
    echo "$valid_response"
fi

# Test invalid email
invalid_response=$(curl -s -X POST "$BASE_URL/validate-email" \
    -H "Content-Type: application/json" \
    -d '{"email": "invalid-email"}')

invalid_status=$(echo "$invalid_response" | jq -r '.isValid' 2>/dev/null)

if [ "$invalid_status" = "false" ]; then
    echo -e "${GREEN}✅ Email Validation (invalid): PASSED${NC}"
    echo "   - Email: invalid-email"
    echo "   - Valid: $invalid_status"
    echo "   - Suggestions: $(echo "$invalid_response" | jq -r '.suggestions[]')"
else
    echo -e "${RED}❌ Email Validation (invalid): FAILED${NC}"
    echo "$invalid_response"
fi

# Test Export Schedule Function (should require auth)
echo -e "\n${YELLOW}Testing Export Schedule Function...${NC}"
export_response=$(curl -s -X POST "$BASE_URL/export-schedule" \
    -H "Content-Type: application/json" \
    -d '{"scheduleId": "test-123", "format": "json"}')

export_error=$(echo "$export_response" | jq -r '.error' 2>/dev/null)

if [ "$export_error" = "Authorization required" ]; then
    echo -e "${GREEN}✅ Export Schedule (auth check): PASSED${NC}"
    echo "   - Correctly requires authorization"
else
    echo -e "${RED}❌ Export Schedule (auth check): FAILED${NC}"
    echo "$export_response"
fi

# Test Webhook Handler Function
echo -e "\n${YELLOW}Testing Webhook Handler Function...${NC}"
webhook_response=$(curl -s -X POST "$BASE_URL/webhook-handler" \
    -H "Content-Type: application/json" \
    -d '{"source": "test", "event": "test.event", "data": {"message": "test webhook"}}')

webhook_success=$(echo "$webhook_response" | jq -r '.success' 2>/dev/null)

if [ "$webhook_success" = "true" ]; then
    echo -e "${GREEN}✅ Webhook Handler: PASSED${NC}"
    echo "   - Success: $webhook_success"
    echo "   - Message: $(echo "$webhook_response" | jq -r '.message')"
    echo "   - Timestamp: $(echo "$webhook_response" | jq -r '.timestamp')"
else
    echo -e "${RED}❌ Webhook Handler: FAILED${NC}"
    echo "$webhook_response"
fi

# Test CORS for all functions
echo -e "\n${YELLOW}Testing CORS Headers...${NC}"
cors_response=$(curl -s -I -X OPTIONS "$BASE_URL/health-check")

if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS Headers: PASSED${NC}"
    echo "   - Access-Control-Allow-Origin header present"
else
    echo -e "${RED}❌ CORS Headers: FAILED${NC}"
    echo "$cors_response"
fi

echo -e "\n${YELLOW}Function Test Summary Complete${NC}"
echo "============================================"
echo "🌐 Local dev server: http://localhost:8888"
echo "📊 Functions dashboard: http://localhost:8888/.netlify/functions"
echo ""
echo "Ready for deployment to minatid.se! 🚀"
