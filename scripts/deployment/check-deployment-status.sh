#!/bin/bash

echo "🔍 Shift AI Calendar - Deployment Status Check"
echo "=============================================="
echo ""

# Check current site status
echo "📡 Checking site availability..."
status=$(curl -s -o /dev/null -w "%{http_code}" https://soxakore.github.io/shift-ai-calendar-mintid/)

echo "Current Status: HTTP $status"
echo ""

case $status in
    200)
        echo "🎉 SUCCESS! Site is LIVE!"
        echo "🌐 Visit: https://soxakore.github.io/shift-ai-calendar-mintid/"
        echo ""
        echo "🧪 Test with these accounts:"
        echo "   Super Admin: tiktok / password123"
        echo "   Org Admin:   youtube / password123"
        echo "   Manager:     instagram / password123"
        echo "   Employee:    twitter / password123"
        ;;
    404)
        echo "⏳ Site not deployed yet (404)"
        echo ""
        echo "📋 Complete these steps:"
        echo "1. ⚙️  Enable GitHub Pages:"
        echo "   https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages"
        echo "   Set Source to 'GitHub Actions'"
        echo ""
        echo "2. 🔐 Add Repository Secrets:"
        echo "   https://github.com/Soxakore/shift-ai-calendar-mintid/settings/secrets/actions"
        echo "   VITE_SUPABASE_URL = https://kyiwpwlxmysyuqjdxvyq.supabase.co"
        echo "   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXdwd2x4bXlzeXVxamR4dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDI1NjYsImV4cCI6MjA1MDAxODU2Nn0.kzjHOkkBPOUjpNfBHqDHPGGD7rQ7rVZDI3QKBmn7VzE"
        echo ""
        echo "3. ▶️  Run Deployment:"
        echo "   https://github.com/Soxakore/shift-ai-calendar-mintid/actions"
        echo "   Click 'Deploy to GitHub Pages' → 'Run workflow'"
        ;;
    *)
        echo "⚠️  Unexpected status: $status"
        echo "Check GitHub Actions for details:"
        echo "https://github.com/Soxakore/shift-ai-calendar-mintid/actions"
        ;;
esac

echo ""
echo "📊 Repository Status:"
echo "   📁 Code: https://github.com/Soxakore/shift-ai-calendar-mintid"
echo "   ⚡ Actions: https://github.com/Soxakore/shift-ai-calendar-mintid/actions"
echo "   ⚙️  Settings: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages"
echo ""

# Show last commit
echo "📝 Last commit:"
git log --oneline -1
echo ""

echo "💡 Run this script again after setup to check deployment progress"
