# 🚀 MinTid Production Environment Configuration Guide

## 📋 **Required Environment Variables**

Before deploying to production, you must configure the following environment variables. This ensures proper analytics tracking, error monitoring, and SEO functionality.

### **Step 1: Google Analytics 4 Configuration**

1. **Create a Google Analytics 4 property**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new property for your MinTid deployment
   - Get your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Configure in .env.production**:
   ```env
   VITE_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
   ```

### **Step 2: Sentry Error Tracking Configuration**

1. **Create a Sentry project**:
   - Go to [Sentry.io](https://sentry.io/)
   - Create a new React project
   - Get your DSN from the project settings

2. **Configure in .env.production**:
   ```env
   VITE_SENTRY_DSN=https://your-actual-dsn@o123456.ingest.sentry.io/123456
   ```

### **Step 3: Application Configuration**

Update the application settings for your production environment:

```env
# Application Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_APP_URL=https://your-actual-domain.com
VITE_APP_NAME=MinTid

# SEO Configuration
VITE_CANONICAL_URL=https://your-actual-domain.com
VITE_OG_IMAGE=https://your-actual-domain.com/og-image.png
```

### **Step 4: Feature Flags Configuration**

Enable or disable features for production:

```env
# Production Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_SEO=true
VITE_DEMO_MODE=false  # Set to false for production
```

### **Step 5: Performance & Security Configuration**

```env
# Performance Monitoring
VITE_PERFORMANCE_SAMPLE_RATE=0.1    # 10% sampling in production
VITE_ERROR_SAMPLE_RATE=1.0          # 100% error tracking

# Security Configuration
VITE_SECURITY_HEADERS=true
VITE_CSP_ENABLED=true
```

## 🔧 **Deployment Platform Configuration**

### **For Netlify Deployment**

1. **Environment Variables in Netlify Dashboard**:
   - Go to Site Settings → Environment Variables
   - Add all the variables from your `.env.production` file
   - Make sure to use the same variable names (with `VITE_` prefix)

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node.js version: 18.x

### **For Vercel Deployment**

1. **Environment Variables in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add all variables for Production environment
   - Ensure proper `VITE_` prefix for client-side variables

2. **Build Settings**:
   - Framework Preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### **For Custom Server Deployment**

1. **Create production .env file on server**:
   ```bash
   # On your server
   cp .env.production .env.local
   # Edit .env.local with your actual values
   ```

2. **Build and serve**:
   ```bash
   npm install
   npm run build
   # Serve dist/ folder with your web server
   ```

## ✅ **Verification Checklist**

After configuration, verify everything is working:

### **1. Analytics Verification**
- [ ] Google Analytics tracking is working
- [ ] Page views are being recorded
- [ ] Custom events are firing correctly

### **2. Error Tracking Verification**
- [ ] Sentry is receiving error reports
- [ ] Performance metrics are being collected
- [ ] User context is being captured

### **3. SEO Verification**
- [ ] Meta tags are properly set
- [ ] Open Graph images are loading
- [ ] Structured data is valid
- [ ] Sitemap is accessible

### **4. Performance Verification**
- [ ] Core Web Vitals are being monitored
- [ ] Bundle sizes are optimized
- [ ] Lazy loading is working correctly

## 🛡️ **Security Considerations**

### **Environment Variable Security**
- ✅ Never commit `.env.production` to version control
- ✅ Use different values for development and production
- ✅ Regularly rotate sensitive credentials
- ✅ Use read-only keys where possible

### **Analytics Privacy**
- ✅ Google Analytics configured with privacy settings
- ✅ IP anonymization enabled
- ✅ Ad personalization disabled
- ✅ Cookie consent implemented (if required)

### **Error Tracking Privacy**
- ✅ Sentry configured to filter sensitive data
- ✅ User emails and PII are masked
- ✅ Environment-specific sampling rates
- ✅ Error filtering for non-actionable issues

## 🔄 **Environment Migration**

### **From Development to Production**
1. Copy `.env.example` to `.env.production`
2. Replace all placeholder values with production values
3. Test in staging environment first
4. Deploy to production with verified configuration

### **Staging Environment Setup**
For a staging environment, use production-like configuration but with:
- Separate Google Analytics property
- Separate Sentry project
- Staging domain URLs
- Higher sampling rates for testing

## 📞 **Support & Troubleshooting**

### **Common Issues**

**Google Analytics not tracking:**
- Verify Measurement ID format (`G-XXXXXXXXXX`)
- Check browser network tab for GA requests
- Ensure `VITE_ENABLE_ANALYTICS=true`

**Sentry not receiving errors:**
- Verify DSN format
- Check console for Sentry initialization logs
- Test with a manual error trigger

**SEO issues:**
- Run `./seo-audit.sh --production` for validation
- Check meta tags in browser dev tools
- Verify OG images are loading correctly

### **Need Help?**
- Check the console logs for initialization messages
- Use browser dev tools to debug tracking
- Review the SEO Dashboard for real-time validation
- Run production build locally with `npm run preview`

---

*This configuration ensures MinTid has production-grade analytics, monitoring, and SEO capabilities.*
