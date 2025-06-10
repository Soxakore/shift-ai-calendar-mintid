# 🌐 Custom Domain Setup Guide - One.com to GitHub Pages

## Overview
Connect your One.com domain to your Shift AI Calendar application hosted on GitHub Pages.

## Current Status
- **Repository**: https://github.com/Soxakore/shift-ai-calendar-mintid
- **GitHub Pages URL**: https://soxakore.github.io/shift-ai-calendar-mintid/
- **Domain Provider**: One.com
- **Target**: Custom domain pointing to your application

## 📋 Step-by-Step Setup Process

### Phase 1: GitHub Pages Configuration

#### Step 1: Enable GitHub Pages (if not done yet)
1. Go to: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages
2. Under "Source", select **"GitHub Actions"**
3. Click **Save**

#### Step 2: Add Repository Secrets (if not done yet)
1. Go to: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/secrets/actions
2. Add these secrets:
   ```
   VITE_SUPABASE_URL = https://kyiwpwlxmysyuqjdxvyq.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXdwd2x4bXlzeXVxamR4dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDI1NjYsImV4cCI6MjA1MDAxODU2Nn0.kzjHOkkBPOUjpNfBHqDHPGGD7rQ7rVZDI3QKBmn7VzE
   ```

#### Step 3: Configure Custom Domain in GitHub
1. Go to: https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages
2. In the **"Custom domain"** field, enter your domain (e.g., `yourdomain.com`)
3. Check **"Enforce HTTPS"** (recommended)
4. Click **Save**

### Phase 2: One.com DNS Configuration

#### Option A: Root Domain (yourdomain.com)
Configure these DNS records in your One.com control panel:

```
Type: A
Name: @ (or leave blank for root)
Value: 185.199.108.153
TTL: 3600

Type: A  
Name: @ (or leave blank for root)
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @ (or leave blank for root)  
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @ (or leave blank for root)
Value: 185.199.111.153
TTL: 3600
```

#### Option B: Subdomain (www.yourdomain.com or app.yourdomain.com)
Configure this DNS record:

```
Type: CNAME
Name: www (or app, or your preferred subdomain)
Value: soxakore.github.io
TTL: 3600
```

### Phase 3: One.com Control Panel Steps

#### Step 1: Access DNS Management
1. Log into your One.com account
2. Go to **"My Products"** or **"Domains"**
3. Find your domain and click **"Manage"** or **"DNS"**
4. Look for **"DNS Zone"** or **"Advanced DNS"**

#### Step 2: Add DNS Records
**For Root Domain (recommended):**
1. Delete any existing A records pointing to parked pages
2. Add the 4 GitHub Pages A records listed above
3. Optionally add a CNAME for www pointing to your root domain

**For Subdomain:**
1. Add the CNAME record pointing to `soxakore.github.io`

#### Step 3: Save Changes
1. Save all DNS changes
2. Wait 5-30 minutes for propagation

### Phase 4: Verification & Testing

#### Step 1: Check DNS Propagation
```bash
# Check A records (for root domain)
dig yourdomain.com A

# Check CNAME records (for subdomain)  
dig www.yourdomain.com CNAME

# Or use online tools:
# https://dnschecker.org/
```

#### Step 2: Test Your Domain
1. Wait 5-30 minutes for DNS propagation
2. Visit your custom domain
3. Verify SSL certificate is active (🔒 in browser)

## 🔧 Configuration Files to Update

### Update Vite Config for Custom Domain
```typescript
// vite.config.ts
export default defineConfig({
  // Change this to your custom domain path
  base: '/', // For root domain
  // base: '/app/', // For subdomain with path
  
  // ... rest of config
})
```

### Create CNAME File for GitHub Pages
This will be created automatically when you set the custom domain in GitHub settings.

## 🚀 Expected Timeline

- **DNS Setup**: 5 minutes
- **DNS Propagation**: 5-30 minutes  
- **SSL Certificate**: 5-15 minutes after DNS propagation
- **Total Time**: 15-50 minutes

## 🧪 Test Your Setup

### Test Accounts Ready:
| Role | Username | Password | Direct Access |
|------|----------|----------|---------------|
| 👑 Super Admin | `tiktok` | `password123` | `yourdomain.com/super-admin` |
| 🏢 Org Admin | `youtube` | `password123` | `yourdomain.com/org-admin` |
| 👨‍💼 Manager | `instagram` | `password123` | `yourdomain.com/manager` |
| 👤 Employee | `twitter` | `password123` | `yourdomain.com/employee` |

## 🆘 Troubleshooting

### Common Issues:

**DNS not propagating:**
- Wait up to 24 hours (usually 5-30 minutes)
- Clear browser cache
- Try incognito/private browsing

**SSL certificate issues:**
- Ensure "Enforce HTTPS" is enabled in GitHub Pages settings
- Wait 15 minutes after DNS propagation for SSL provisioning

**404 errors:**
- Verify GitHub Pages is enabled and deployed
- Check that the custom domain is correctly set in GitHub settings

**One.com specific:**
- Some One.com plans may have limitations on DNS management
- Contact One.com support if DNS options are not available

## 📞 Support Resources

- **One.com DNS Help**: https://help.one.com/hc/en-us/articles/115005593829
- **GitHub Pages Custom Domains**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **DNS Checker Tool**: https://dnschecker.org/

---

## 🎯 Quick Start Checklist

- [ ] GitHub Pages enabled with "GitHub Actions" source
- [ ] Repository secrets added (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Custom domain configured in GitHub Pages settings
- [ ] DNS records added in One.com control panel
- [ ] Wait 15-30 minutes for propagation
- [ ] Test domain access and SSL certificate
- [ ] Verify application loads with test accounts

**Need help with your specific domain name or One.com interface? Let me know your domain name and I can provide more specific instructions!**
