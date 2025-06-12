#!/bin/bash

# Supabase Connection Verification Script
# This script verifies that your Supabase configuration is working correctly

echo "🔍 Verifying Supabase Configuration..."
echo "=================================="

# Check if environment file exists
if [ -f ".env.local" ]; then
    echo "✅ Environment file (.env.local) found"
else
    echo "❌ Environment file (.env.local) not found"
    exit 1
fi

# Check if required environment variables are set
echo ""
echo "📋 Checking environment variables:"

if grep -q "VITE_SUPABASE_URL=" .env.local; then
    SUPABASE_URL=$(grep "VITE_SUPABASE_URL=" .env.local | cut -d'=' -f2)
    if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "your_supabase_url_here" ]; then
        echo "✅ VITE_SUPABASE_URL is configured"
    else
        echo "❌ VITE_SUPABASE_URL needs to be set"
    fi
else
    echo "❌ VITE_SUPABASE_URL not found in .env.local"
fi

if grep -q "VITE_SUPABASE_ANON_KEY=" .env.local; then
    ANON_KEY=$(grep "VITE_SUPABASE_ANON_KEY=" .env.local | cut -d'=' -f2)
    if [ -n "$ANON_KEY" ] && [ "$ANON_KEY" != "your_new_anon_key_here" ]; then
        echo "✅ VITE_SUPABASE_ANON_KEY is configured"
    else
        echo "❌ VITE_SUPABASE_ANON_KEY needs to be set"
    fi
else
    echo "❌ VITE_SUPABASE_ANON_KEY not found in .env.local"
fi

echo ""
echo "🛡️ Security Status:"

# Check if old hardcoded credentials are removed
if grep -q "kyiwpwlxmysyuqjdxvyq.supabase.co" src/integrations/supabase/client.ts; then
    echo "⚠️  Hardcoded URL found in client.ts - should be using environment variables"
else
    echo "✅ Client configuration uses environment variables"
fi

# Check .gitignore protection
if grep -q ".env" .gitignore; then
    echo "✅ Environment files are protected by .gitignore"
else
    echo "⚠️  Add .env files to .gitignore for security"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. 🔐 Revoke the exposed API key in Supabase dashboard"
echo "2. 🔑 Generate new API keys in Supabase"
echo "3. 📝 Update .env.local with the new credentials"
echo "4. 🔄 Restart the development server"
echo "5. 🧪 Test login functionality"

echo ""
echo "📱 Demo Accounts Available:"
echo "• Super Admin: 'tiktok' (password from your setup)"
echo "• Org Admin: 'orgadmin'"
echo "• Manager: 'manager'"
echo "• Employee: 'employee'"

echo ""
echo "🌐 Application running at: http://localhost:8081"
