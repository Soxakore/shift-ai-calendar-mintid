# Deployment Guide

## Overview

This guide covers the deployment process for the MinTid Calendar Application to production and staging environments.

## Production Environment

### Current Deployment
- **URL**: https://mintid.netlify.app
- **Hosting**: Netlify
- **Database**: Supabase (vcjmwgbjbllkkivrkvqx)
- **CDN**: Netlify Edge
- **SSL**: Automatic HTTPS with Let's Encrypt

### Deployment Process

#### Automatic Deployment
1. **Push to Main Branch**
   ```bash
   git push origin main
   ```
   
2. **Netlify Build Process**
   - Automatic build trigger
   - Environment variables applied
   - Build optimizations
   - Deployment to production

3. **Post-Deployment Verification**
   - Automatic health checks
   - Error monitoring activation
   - Performance monitoring

#### Manual Deployment
1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   # Using Netlify CLI
   netlify deploy --prod --dir=dist
   ```

### Environment Variables

#### Production Environment
```env
VITE_SUPABASE_URL=https://vcjmwgbjbllkkivrkvqx.supabase.co
VITE_SUPABASE_ANON_KEY=[production-anon-key]
VITE_SUPABASE_SERVICE_ROLE_KEY=[production-service-role-key]
VITE_SUPER_ADMIN_GITHUB_USERNAME=Soxakore
NODE_ENV=production
```

#### Setting Environment Variables
1. **Netlify Dashboard**
   - Go to Site Settings > Environment Variables
   - Add each variable with production values
   - Save changes

2. **CLI Method**
   ```bash
   netlify env:set VITE_SUPABASE_URL "your-production-url"
   ```

### Build Configuration

#### Netlify Configuration (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### Vite Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

## Staging Environment

### Setup Staging
1. **Create Staging Site**
   ```bash
   netlify sites:create --name mintid-staging
   ```

2. **Configure Branch Deploy**
   - Branch: `staging`
   - Deploy context: `branch-deploy`
   - Environment: staging variables

3. **Staging Environment Variables**
   ```env
   VITE_SUPABASE_URL=[staging-supabase-url]
   VITE_SUPABASE_ANON_KEY=[staging-anon-key]
   NODE_ENV=staging
   ```

### Staging Workflow
1. **Create Staging Branch**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Auto-Deploy to Staging**
   - Automatic build on push
   - Staging URL generated
   - Testing environment ready

3. **Testing Process**
   - Functional testing
   - Integration testing
   - Performance testing
   - User acceptance testing

## Database Deployment

### Production Database
- **Provider**: Supabase
- **Project**: vcjmwgbjbllkkivrkvqx
- **Region**: US East
- **Backup**: Automatic daily backups

### Migration Process
1. **Development Migrations**
   ```bash
   # Create migration
   supabase migration new migration_name
   
   # Test locally
   supabase db reset
   ```

2. **Apply to Production**
   ```bash
   # Push to production
   supabase db push --linked
   
   # Verify changes
   supabase db diff
   ```

3. **Rollback if Needed**
   ```bash
   # Rollback migration
   supabase migration repair --version [version]
   ```

### Edge Functions Deployment
```bash
# Deploy specific function
supabase functions deploy function_name

# Deploy all functions
supabase functions deploy
```

## Monitoring and Maintenance

### Performance Monitoring
- **Netlify Analytics**: Built-in performance metrics
- **Web Vitals**: Core web vitals tracking
- **Custom Metrics**: Application-specific monitoring

### Error Tracking
- **Console Errors**: Browser console monitoring
- **API Errors**: Supabase error tracking
- **Build Errors**: Netlify build logs

### Health Checks
```bash
# Production health check
curl -I https://mintid.netlify.app

# API health check
curl https://vcjmwgbjbllkkivrkvqx.supabase.co/rest/v1/
```

### Backup Strategy
1. **Database Backups**
   - Automatic daily Supabase backups
   - Manual backup before major deployments
   - Point-in-time recovery available

2. **Code Backups**
   - Git repository (primary)
   - Netlify deployment history
   - Local development backups

## Security Considerations

### HTTPS Configuration
- **SSL Certificate**: Automatic Let's Encrypt
- **Force HTTPS**: All HTTP redirected to HTTPS
- **HSTS**: HTTP Strict Transport Security enabled

### Content Security Policy
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

### Environment Security
- **API Keys**: Never commit to repository
- **Environment Variables**: Secure storage in Netlify
- **Access Control**: Limited production access

## Rollback Procedures

### Application Rollback
1. **Netlify Dashboard**
   - Go to Deploys
   - Select previous working deployment
   - Click "Publish deploy"

2. **CLI Rollback**
   ```bash
   netlify rollback
   ```

### Database Rollback
1. **Migration Rollback**
   ```bash
   supabase migration repair --version [previous_version]
   ```

2. **Point-in-time Recovery**
   - Use Supabase dashboard
   - Select recovery point
   - Restore database

## Troubleshooting

### Common Deployment Issues

#### Build Failures
1. **Check Build Logs**
   ```bash
   netlify logs:function [function-name]
   ```

2. **Environment Variables**
   - Verify all required variables are set
   - Check for typos or missing values

3. **Dependency Issues**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

#### Runtime Errors
1. **Check Application Logs**
   - Browser console
   - Network tab
   - Supabase logs

2. **Database Connection**
   ```bash
   # Test database connection
   supabase status
   ```

3. **API Issues**
   - Verify API endpoints
   - Check authentication
   - Validate request/response format

### Emergency Procedures

#### Site Down
1. **Check Netlify Status**
   - Visit status.netlify.com
   - Check for service disruptions

2. **Rollback to Last Working Version**
   ```bash
   netlify rollback
   ```

3. **Emergency Maintenance Page**
   - Deploy maintenance page
   - Communicate with users

#### Database Issues
1. **Check Supabase Status**
   - Visit status.supabase.com
   - Check project health

2. **Failover Procedures**
   - Switch to backup database
   - Implement read-only mode

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build:analyze

# Optimize images
npm run optimize:images
```

### Runtime Optimization
- **CDN**: Netlify Edge for global distribution
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip compression enabled

### Database Optimization
- **Connection Pooling**: Supabase connection pooling
- **Query Optimization**: Indexed queries
- **Caching**: Application-level caching

## Maintenance Schedule

### Regular Maintenance
- **Weekly**: Dependency updates and security patches
- **Monthly**: Performance optimization review
- **Quarterly**: Major version updates and refactoring

### Scheduled Downtime
- **Maintenance Window**: Sundays 2-4 AM UTC
- **Emergency Maintenance**: As needed with user notification
- **Major Updates**: Planned 2 weeks in advance

## Contact and Support

### Deployment Issues
- **Primary**: Development team
- **Secondary**: Netlify support
- **Emergency**: On-call developer

### Database Issues
- **Primary**: Database administrator
- **Secondary**: Supabase support
- **Emergency**: Senior developer

## Documentation Updates

When updating this deployment guide:
1. Test all procedures
2. Update version numbers
3. Verify all URLs and commands
4. Review with team members
5. Update related documentation
