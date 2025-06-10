#!/bin/bash

# Email Testing Script for MinTid
# This script tests various email scenarios in development

echo "📧 MinTid Email Testing Script"
echo "=============================="
echo ""

# Check if Supabase is running
if ! curl -s http://127.0.0.1:54321/health > /dev/null; then
    echo "❌ Supabase is not running. Please start with: npx supabase start"
    exit 1
fi

echo "✅ Supabase is running"
echo ""

# Check Inbucket (local email testing)
if curl -s http://127.0.0.1:54324 > /dev/null; then
    echo "✅ Inbucket email testing service is running"
    echo "🌐 View emails at: http://127.0.0.1:54324"
else
    echo "❌ Inbucket is not running"
fi

echo ""
echo "📋 Email Testing Checklist:"
echo ""
echo "1. 📧 Confirm Signup Email"
echo "   - Create a new user via web interface"
echo "   - Check Inbucket for welcome email"
echo ""
echo "2. 🔗 Magic Link Email"  
echo "   - Use 'Sign in with magic link' option"
echo "   - Check Inbucket for login link"
echo ""
echo "3. 🔑 Password Reset Email"
echo "   - Click 'Forgot password' on login"
echo "   - Check Inbucket for reset email"
echo ""
echo "4. 👥 User Invitation Email"
echo "   - Admin creates new user via interface"
echo "   - Check Inbucket for invitation email"
echo ""

# Test database connection for user creation
echo "🔍 Testing database connection..."
if psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT COUNT(*) FROM auth.users;" > /dev/null 2>&1; then
    USER_COUNT=$(psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c "SELECT COUNT(*) FROM auth.users;" | xargs)
    echo "✅ Database connected. Current users: $USER_COUNT"
else
    echo "❌ Database connection failed"
fi

echo ""
echo "🚀 Ready to test emails!"
echo "📱 Open the app: http://localhost:8089"
echo "📧 Monitor emails: http://127.0.0.1:54324"
