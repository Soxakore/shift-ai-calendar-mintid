#!/bin/bash

echo "🚨 GITHUB PAGES SETUP REQUIRED"
echo "=============================="
echo ""
echo "Current Status: 404 - Pages not enabled"
echo "Repository: https://github.com/Soxakore/shift-ai-calendar-mintid"
echo ""

echo "📋 STEP-BY-STEP SETUP INSTRUCTIONS:"
echo ""

echo "1️⃣  ENABLE GITHUB PAGES"
echo "   📍 URL: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages"
echo "   📝 Instructions:"
echo "   • Under 'Source', select 'GitHub Actions'"
echo "   • Click 'Save'"
echo ""

echo "2️⃣  ADD REPOSITORY SECRETS"
echo "   📍 URL: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/secrets/actions"
echo "   📝 Add these two secrets:"
echo ""
echo "   Secret 1:"
echo "   Name: VITE_SUPABASE_URL"
echo "   Value: https://kyiwpwlxmysyuqjdxvyq.supabase.co"
echo ""
echo "   Secret 2:"
echo "   Name: VITE_SUPABASE_ANON_KEY"
echo "   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXdwd2x4bXlzeXVxamR4dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDI1NjYsImV4cCI6MjA1MDAxODU2Nn0.kzjHOkkBPOUjpNfBHqDHPGGD7rQ7rVZDI3QKBmn7VzE"
echo ""

echo "3️⃣  TRIGGER DEPLOYMENT"
echo "   📍 URL: https://github.com/Soxakore/shift-ai-calendar-mintid/actions"
echo "   📝 Instructions:"
echo "   • Click 'Deploy to GitHub Pages' workflow"
echo "   • Click 'Run workflow'"
echo "   • Click 'Run workflow' again to confirm"
echo "   • Wait 2-3 minutes for completion"
echo ""

echo "🎯 EXPECTED RESULT:"
echo "   ✅ Live Site: https://soxakore.github.io/shift-ai-calendar-mintid/"
echo "   ⏱️  Deploy Time: 2-3 minutes after workflow completion"
echo ""

echo "🧪 TEST ACCOUNTS READY:"
echo "   👑 Super Admin: tiktok / password123"
echo "   🏢 Org Admin:   youtube / password123"
echo "   👨‍💼 Manager:     instagram / password123"
echo "   👤 Employee:    twitter / password123"
echo ""

echo "🔍 CHECK STATUS AFTER SETUP:"
echo "   Run: ./check-deployment-status.sh"
echo "   Or visit: https://soxakore.github.io/shift-ai-calendar-mintid/"
echo ""

echo "💡 TROUBLESHOOTING:"
echo "   • If still 404 after 5 minutes, check GitHub Actions logs"
echo "   • Ensure 'GitHub Actions' is selected as Pages source"
echo "   • Verify both repository secrets are added correctly"
