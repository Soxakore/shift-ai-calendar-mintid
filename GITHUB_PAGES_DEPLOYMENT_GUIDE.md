# GitHub Pages Deployment Guide for mintid.github.io

## Overview
This guide will help you deploy your Shift AI Calendar application to GitHub Pages at https://mintid.github.io/

## Prerequisites
1. GitHub account with username `mintid`
2. Repository named `mintid.github.io` (for user/organization pages) or any repository name (for project pages)

## Option 1: Deploy to mintid.github.io (User/Organization Site)

### Step 1: Create Repository
1. Go to https://github.com and login as `mintid`
2. Create a new repository named `mintid.github.io`
3. Make it public
4. Don't initialize with README, .gitignore, or license (we'll push existing code)

### Step 2: Update Remote Origin
```bash
cd /Users/ibe/new-project/shift-ai-calendar-mintid
git remote set-url origin https://github.com/mintid/mintid.github.io.git
```

### Step 3: Set Up GitHub Secrets
1. Go to your repository settings
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `VITE_SUPABASE_URL`: `https://kyiwpwlxmysyuqjdxvyq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `[Your Supabase anonymous key]`

### Step 4: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Save

### Step 5: Deploy
```bash
# Add all changes
git add .

# Commit changes
git commit -m "feat: prepare for GitHub Pages deployment

- Add GitHub Actions workflow for automated deployment
- Configure Vite for GitHub Pages
- Add production environment configuration
- Ready for live deployment at mintid.github.io"

# Push to main branch
git push origin main
```

## Option 2: Deploy to Project Repository

### Step 1: Use Current Repository
Keep using `https://github.com/Soxakore/shift-ai-calendar-mintid.git`

### Step 2: Update Vite Config for Project Base
```typescript
// In vite.config.ts, update the base path:
base: process.env.NODE_ENV === 'production' ? '/shift-ai-calendar-mintid/' : '/',
```

### Step 3: Follow steps 3-5 from Option 1
The site will be available at: `https://soxakore.github.io/shift-ai-calendar-mintid/`

## Production Environment Variables

The following environment variables are configured in GitHub Secrets:

```env
VITE_SUPABASE_URL=https://kyiwpwlxmysyuqjdxvyq.supabase.co
VITE_SUPABASE_ANON_KEY=[Your anonymous key]
NODE_ENV=production
```

## Deployment Features

✅ **Automated Deployment**: Deploys automatically on push to main branch
✅ **Optimized Build**: Production-optimized bundle with tree shaking
✅ **Environment Variables**: Secure handling via GitHub Secrets
✅ **GitHub Actions**: CI/CD pipeline for consistent deployments
✅ **Performance**: Code splitting and lazy loading for fast load times

## Post-Deployment Steps

1. **Test the live site**: Visit https://mintid.github.io/
2. **Verify Supabase connection**: Test login and data loading
3. **Check responsive design**: Test on mobile and desktop
4. **Monitor performance**: Use browser dev tools to check load times

## Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs in the repository
2. Verify all secrets are set correctly
3. Ensure Supabase URLs are accessible from the domain

### If app doesn't load:
1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase allowed origins include your GitHub Pages domain

## Security Notes

- Supabase anonymous key is safe to expose in client-side code
- GitHub Secrets protect sensitive configuration
- RLS policies in Supabase protect your data
- HTTPS is automatically enabled on GitHub Pages

## Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Set up monitoring and analytics
3. Configure email system for notifications
4. Apply database migrations from CORRECTED_RLS_POLICIES_NO_RECURSION.sql
