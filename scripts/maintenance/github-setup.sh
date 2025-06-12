#!/bin/bash

echo "🚀 GitHub Pages Deployment Setup"
echo "================================="
echo ""

echo "📋 Required Manual Steps:"
echo ""

echo "1️⃣  ENABLE GITHUB PAGES"
echo "   → Go to: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages"
echo "   → Set Source to: 'GitHub Actions'"
echo "   → Click Save"
echo ""

echo "2️⃣  ADD REPOSITORY SECRETS"
echo "   → Go to: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/secrets/actions"
echo "   → Add these secrets:"
echo ""
echo "   Secret Name: VITE_SUPABASE_URL"
echo "   Secret Value: https://kyiwpwlxmysyuqjdxvyq.supabase.co"
echo ""
echo "   Secret Name: VITE_SUPABASE_ANON_KEY"
echo "   Secret Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXdwd2x4bXlzeXVxamR4dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDI1NjYsImV4cCI6MjA1MDAxODU2Nn0.kzjHOkkBPOUjpNfBHqDHPGGD7rQ7rVZDI3QKBmn7VzE"
echo ""

echo "3️⃣  TRIGGER DEPLOYMENT"
echo "   → Go to: https://github.com/Soxakore/shift-ai-calendar-mintid/actions"
echo "   → Click 'Deploy to GitHub Pages'"
echo "   → Click 'Run workflow' → 'Run workflow'"
echo ""

echo "4️⃣  VERIFY DEPLOYMENT"
echo "   → Wait for green checkmark (2-3 minutes)"
echo "   → Visit: https://soxakore.github.io/shift-ai-calendar-mintid/"
echo ""

echo "🧪 TEST ACCOUNTS:"
echo "   Super Admin: tiktok / password123"
echo "   Org Admin:   youtube / password123"  
echo "   Manager:     instagram / password123"
echo "   Employee:    twitter / password123"
echo ""

echo "✅ All code is ready - just need manual GitHub setup!"
echo "📁 See FINAL_DEPLOYMENT_STEPS.md for detailed instructions"
