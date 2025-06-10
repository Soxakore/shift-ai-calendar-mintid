#!/bin/bash

# GitHub Pages Deployment Script
# This script prepares and deploys the Shift AI Calendar to GitHub Pages

set -e

echo "🚀 GitHub Pages Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm ci

echo -e "${YELLOW}Step 2: Running production build...${NC}"
NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 3: Checking Git status...${NC}"
git status

echo -e "${YELLOW}Step 4: Adding all changes to Git...${NC}"
git add .

echo -e "${YELLOW}Step 5: Committing changes...${NC}"
git commit -m "feat: deploy to GitHub Pages

- Automated deployment configuration
- Production build optimization
- GitHub Actions workflow
- Environment variables configuration
- Ready for live deployment" || echo "No changes to commit"

echo -e "${YELLOW}Step 6: Current Git remote:${NC}"
git remote -v

read -p "Do you want to push to the current remote? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Pushing to GitHub...${NC}"
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
        echo -e "${GREEN}🌐 Your site will be available shortly at your GitHub Pages URL${NC}"
        echo -e "${YELLOW}📋 Next steps:${NC}"
        echo "1. Go to your repository settings"
        echo "2. Navigate to Settings → Secrets and variables → Actions"
        echo "3. Add your Supabase secrets:"
        echo "   - VITE_SUPABASE_URL: https://kyiwpwlxmysyuqjdxvyq.supabase.co"
        echo "   - VITE_SUPABASE_ANON_KEY: [Your Supabase anonymous key]"
        echo "4. Enable GitHub Pages in Settings → Pages"
        echo "5. Select 'GitHub Actions' as the source"
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Push cancelled. You can manually push later with: git push origin main${NC}"
fi

echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
