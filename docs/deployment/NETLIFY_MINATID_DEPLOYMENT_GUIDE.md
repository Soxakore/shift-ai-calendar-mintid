# 🌐 Netlify Deployment Guide - minatid.se

## Overview
Deploy your Shift AI Calendar application to Netlify with custom domain `minatid.se`

## Current Setup
- **Repository**: https://github.com/Soxakore/shift-ai-calendar-mintid
- **Domain**: `minatid.se` (One.com)
- **Hosting**: Netlify
- **Build**: Optimized Vite/React application

## 🚀 Step-by-Step Netlify Deployment

### Step 1: Create Netlify Account & Connect Repository

1. **Sign up for Netlify**: https://app.netlify.com/signup
2. **Connect GitHub**: 
   - Click "New site from Git"
   - Choose "GitHub"
   - Authorize Netlify to access your repositories
   - Select `Soxakore/shift-ai-calendar-mintid`

### Step 2: Configure Build Settings

**Build Settings (Auto-detected from netlify.toml):**
```
Build command: npm run build
Publish directory: dist
```

**Environment Variables:**
```
VITE_SUPABASE_URL = https://kyiwpwlxmysyuqjdxvyq.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXdwd2x4bXlzeXVxamR4dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDI1NjYsImV4cCI6MjA1MDAxODU2Nn0.kzjHOkkBPOUjpNfBHqDHPGGD7rQ7rVZDI3QKBmn7VzE
```

### Step 3: Initial Deployment

1. **Deploy**: Click "Deploy site"
2. **Wait**: 2-3 minutes for initial build
3. **Get URL**: Note your temporary Netlify URL (e.g., `amazing-app-123.netlify.app`)

### Step 4: Configure Custom Domain (minatid.se)

#### In Netlify Dashboard:
1. **Go to Domain settings**: Site Settings → Domain management
2. **Add custom domain**: Enter `minatid.se`
3. **Verify domain**: Netlify will provide DNS configuration

#### Expected DNS Configuration for minatid.se:
```
Type: CNAME
Name: @ (or leave blank for root)
Value: [your-netlify-subdomain].netlify.app

OR

Type: A
Name: @ (or leave blank for root)  
Value: 75.2.60.5

Type: CNAME
Name: www
Value: minatid.se
```

### Step 5: One.com DNS Configuration

1. **Login to One.com**: https://www.one.com/admin/
2. **Find minatid.se**: Go to domain management
3. **DNS Settings**: Look for "DNS", "Zone Editor", or "Avancerad DNS"
4. **Add Records**: Use the DNS configuration provided by Netlify

## 🎯 Expected Results

### Your Live URLs:
- **Main Application**: `https://minatid.se/`
- **Super Admin Dashboard**: `https://minatid.se/super-admin`
- **Org Admin Dashboard**: `https://minatid.se/org-admin`
- **Manager Dashboard**: `https://minatid.se/manager`
- **Employee Dashboard**: `https://minatid.se/employee`

### Test Accounts:
| Role | Username | Password | URL |
|------|----------|----------|-----|
| 👑 Super Admin | `tiktok` | `password123` | `https://minatid.se/super-admin` |
| 🏢 Org Admin | `youtube` | `password123` | `https://minatid.se/org-admin` |
| 👨‍💼 Manager | `instagram` | `password123` | `https://minatid.se/manager` |
| 👤 Employee | `twitter` | `password123` | `https://minatid.se/employee` |

## ⚡ Netlify Advantages over GitHub Pages

✅ **Continuous Deployment**: Auto-deploy on every GitHub push
✅ **Environment Variables**: Built-in support for secrets
✅ **Custom Headers**: Security headers pre-configured
✅ **Instant Rollbacks**: Easy rollback to previous deployments
✅ **Branch Previews**: Deploy preview for every pull request
✅ **Better Performance**: Global CDN and optimizations
✅ **SSL Certificate**: Automatic HTTPS with Let's Encrypt

## 🔧 Netlify Configuration Features

### Auto-Configured in netlify.toml:
- ✅ **SPA Routing**: All routes redirect to index.html
- ✅ **Security Headers**: CSP, XSS protection, etc.
- ✅ **Cache Optimization**: Static assets cached for 1 year
- ✅ **Environment Variables**: Supabase credentials included

### Available Features:
- 🔄 **Auto-deploys**: On every GitHub push to main
- 🌿 **Branch deploys**: Preview deployments for branches
- 📊 **Analytics**: Built-in site analytics
- ⚡ **Edge Functions**: Serverless functions if needed
- 🔒 **Identity**: User authentication (we use Supabase instead)

## ⏱️ Timeline

- **Netlify Setup**: 10 minutes
- **Initial Deployment**: 2-3 minutes
- **DNS Propagation**: 5-30 minutes
- **SSL Certificate**: 5-15 minutes after DNS
- **Total Time**: 20-60 minutes

## 🔍 Verification Steps

### 1. Check Deployment Status
```bash
# Check if site is live on temporary URL first
curl -s -o /dev/null -w "%{http_code}" https://[your-site].netlify.app/

# Then check custom domain
curl -s -o /dev/null -w "%{http_code}" https://minatid.se/
```

### 2. Test Application Features
- [ ] Login with test accounts
- [ ] Role-based dashboard routing
- [ ] Responsive design
- [ ] HTTPS certificate active
- [ ] No demo language visible

### 3. DNS Verification
```bash
# Check DNS propagation
dig minatid.se A
nslookup minatid.se

# Online checker
# Visit: https://dnschecker.org/ and enter "minatid.se"
```

## 🆘 Troubleshooting

### Common Issues:

**Build Failures:**
- Check environment variables are set in Netlify
- Verify build command in netlify.toml
- Check build logs in Netlify dashboard

**Domain Not Working:**
- Verify DNS records match Netlify requirements
- Wait up to 24 hours for DNS propagation
- Check domain status in Netlify dashboard

**SSL Certificate Issues:**
- Ensure custom domain is properly configured
- Wait 15 minutes after DNS propagation
- Check "Force HTTPS" is enabled in Netlify

## 📋 Deployment Checklist

### Pre-Deployment:
- [ ] Code pushed to GitHub repository
- [ ] netlify.toml configured with environment variables
- [ ] Vite config updated for Netlify
- [ ] CNAME file updated to minatid.se

### Netlify Setup:
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Initial deployment successful
- [ ] Environment variables configured
- [ ] Custom domain (minatid.se) added

### DNS Configuration:
- [ ] Netlify DNS requirements noted
- [ ] One.com DNS records updated
- [ ] DNS propagation verified
- [ ] SSL certificate active

### Testing:
- [ ] Application loads at https://minatid.se/
- [ ] All test accounts work
- [ ] Role-based routing functional
- [ ] No demo language visible
- [ ] Performance optimized (88.66 kB)

## 🎉 Success Criteria

✅ **minatid.se** loads your professional shift scheduling application
✅ **Automatic Deployments** on every GitHub push
✅ **HTTPS Certificate** active and secure
✅ **Role-Based Access** working perfectly
✅ **Clean Interface** with no demo language
✅ **Fast Performance** with global CDN

---

## 🚀 Next Steps After Deployment

1. **Monitor Performance**: Use Netlify Analytics
2. **Set Up Monitoring**: Configure uptime monitoring
3. **Branch Previews**: Use for testing new features
4. **Custom Email**: Set up professional email with minatid.se domain

**Your professional shift scheduling application will be live at `https://minatid.se/` with continuous deployment from GitHub!**
