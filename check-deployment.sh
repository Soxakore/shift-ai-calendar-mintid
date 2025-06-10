#!/bin/bash

echo "🚀 Checking Deployment Status..."
echo "Repository: https://github.com/Soxakore/shift-ai-calendar-mintid"
echo "Expected Live URL: https://soxakore.github.io/shift-ai-calendar-mintid/"
echo ""

echo "📋 Next Steps to Complete Deployment:"
echo "1. Go to GitHub repository: https://github.com/Soxakore/shift-ai-calendar-mintid"
echo "2. Check Actions tab to see if workflow is running"
echo "3. Go to Settings > Pages and enable GitHub Pages"
echo "4. Add repository secrets for Supabase:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""

echo "🔍 Checking if site is live..."
curl -s -o /dev/null -w "%{http_code}" https://soxakore.github.io/shift-ai-calendar-mintid/ | {
    read status
    if [ "$status" = "200" ]; then
        echo "✅ Site is LIVE at: https://soxakore.github.io/shift-ai-calendar-mintid/"
    elif [ "$status" = "404" ]; then
        echo "⏳ Site not yet deployed (404). Check GitHub Actions progress."
    else
        echo "⚠️  Site status: $status"
    fi
}
