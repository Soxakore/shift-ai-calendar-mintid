# 🇸🇪 mintid.se Domain Setup Guide

## Domain Information
- **Domain**: `mintid.se`
- **Provider**: One.com
- **Target**: Shift AI Calendar Application
- **GitHub Repository**: https://github.com/Soxakore/shift-ai-calendar-mintid

## 🚀 Quick Setup Steps

### Step 1: GitHub Pages Custom Domain Configuration

1. **Go to GitHub Pages Settings**:
   https://github.com/Soxakore/shift-ai-calendar-mintid/settings/pages

2. **Configure Domain**:
   - Under "Custom domain", enter: `mintid.se`
   - Check "Enforce HTTPS"
   - Click "Save"

### Step 2: One.com DNS Configuration for mintid.se

**Log into your One.com account and configure these DNS records:**

#### Root Domain Setup (Recommended):
```
Type: A
Name: @ (or leave blank for root domain)
Value: 185.199.108.153
TTL: 3600

Type: A  
Name: @ (or leave blank for root domain)
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @ (or leave blank for root domain)
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @ (or leave blank for root domain)
Value: 185.199.111.153
TTL: 3600
```

#### Optional: WWW Subdomain
```
Type: CNAME
Name: www
Value: mintid.se
TTL: 3600
```

### Step 3: One.com Control Panel Navigation

1. **Login to One.com**: https://www.one.com/admin/
2. **Navigate to Domain**: Find "mintid.se" in your domain list
3. **DNS Management**: Look for "DNS", "Zone Editor", or "Advanced DNS"
4. **Delete Old Records**: Remove any existing A records (parking pages)
5. **Add New Records**: Add the 4 GitHub Pages A records above

## 🎯 Expected Results

### Your Live URLs:
- **Main Application**: `https://mintid.se/`
- **Super Admin Dashboard**: `https://mintid.se/super-admin`
- **Org Admin Dashboard**: `https://mintid.se/org-admin`
- **Manager Dashboard**: `https://mintid.se/manager`
- **Employee Dashboard**: `https://mintid.se/employee`

### Test Accounts:
| Role | Username | Password | URL |
|------|----------|----------|-----|
| 👑 Super Admin | `tiktok` | `password123` | `https://mintid.se/super-admin` |
| 🏢 Org Admin | `youtube` | `password123` | `https://mintid.se/org-admin` |
| 👨‍💼 Manager | `instagram` | `password123` | `https://mintid.se/manager` |
| 👤 Employee | `twitter` | `password123` | `https://mintid.se/employee` |

## ⏱️ Timeline

- **DNS Setup**: 5 minutes
- **DNS Propagation**: 5-30 minutes (sometimes up to 2 hours for .se domains)
- **SSL Certificate**: 5-15 minutes after DNS propagation
- **Total Time**: 15-60 minutes

## 🔍 Verification Commands

```bash
# Check if DNS has propagated
dig mintid.se A

# Check from multiple locations
nslookup mintid.se

# Online checker
# Visit: https://dnschecker.org/ and enter "mintid.se"
```

## 🇸🇪 Sweden-Specific Notes

- **.se domains** may take slightly longer to propagate (up to 2 hours)
- **One.com Sweden** interface might be in Swedish
- **Time zone**: Consider CET/CEST for propagation timing

## 🆘 Troubleshooting

### If mintid.se shows 404 after setup:
1. **Verify GitHub Pages is enabled** with "GitHub Actions" source
2. **Check custom domain** is set to "mintid.se" in GitHub settings
3. **Wait longer** - .se domains can take up to 2 hours to propagate
4. **Clear browser cache** or try incognito mode

### If DNS not updating:
1. **Contact One.com support** if you can't find DNS settings
2. **Check domain status** - ensure domain is active and not locked
3. **Verify account permissions** - ensure you have DNS management rights

### Common One.com Sweden Issues:
- Some plans may have limited DNS management
- Look for "Avancerad DNS" or "DNS-inställningar" in Swedish interface
- May need to upgrade plan for full DNS control

## 📞 Support Contacts

- **One.com Sweden**: https://help.one.com/
- **GitHub Pages Help**: https://docs.github.com/en/pages
- **DNS Checker**: https://dnschecker.org/

## 🎉 Success Criteria

✅ **mintid.se** loads your application homepage
✅ **HTTPS** certificate is active (🔒 in browser)
✅ **Role-based URLs** work correctly
✅ **Test accounts** can log in successfully
✅ **Professional interface** with no demo language
✅ **Fast loading** (88.66 kB optimized build)

---

## 🚨 Important: GitHub Pages Prerequisites

**Before DNS setup, ensure:**
- [ ] GitHub Pages is enabled (Source: GitHub Actions)
- [ ] Repository secrets are added (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] GitHub Actions deployment workflow has run successfully

**If GitHub Pages shows 404:**
Complete the GitHub setup first, then return to DNS configuration.

---

**Next**: After DNS propagation, your professional shift scheduling application will be live at `https://mintid.se/`!
