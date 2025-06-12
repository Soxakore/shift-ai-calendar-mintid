# Shift AI Calendar - Project Organization

## 📁 Project Structure

This document outlines the organized structure of the Shift AI Calendar project after cleanup and reorganization.

### 🎯 Main Application
```
src/                          # React TypeScript application source
├── components/              # React components
│   ├── EnhancedOrgAdminDashboard.tsx  # ✅ ENHANCED - Main admin dashboard
│   ├── LiveReportsManager.tsx         # Live reporting system
│   ├── LiveScheduleAutomation.tsx     # Schedule automation
│   └── ui/                           # UI components
├── hooks/                   # Custom React hooks
├── integrations/           # Third-party integrations
└── ...                     # Other source files
```

### 📚 Documentation
```
docs/
├── setup/                  # Setup and installation guides
│   ├── COMPLETE_PROJECT_DOCUMENTATION.md
│   ├── ENHANCED_SURGICAL_GUIDE.md
│   └── COMPLETE_SYSTEM_SUMMARY.md
├── deployment/             # Deployment guides
│   ├── DEPLOYMENT_COMPLETION_FINAL.md
│   ├── FINAL_DEPLOYMENT_READY_STATUS.md
│   └── DEPLOYMENT_READY_SUMMARY.md
└── guides/                 # Feature and system guides
    ├── EDGE_FUNCTIONS_GUIDE.md
    ├── EMAIL_SETUP_RECOMMENDATIONS.md
    └── DUAL_AUTH_SYSTEM.md
```

### 🔧 Scripts
```
scripts/
├── deployment/             # Deployment automation
│   ├── deploy-functions.sh
│   ├── deploy-github-pages.sh
│   ├── deploy-live.sh
│   ├── deploy-to-production.sh
│   ├── check-deployment-status.sh
│   ├── check-deployment.sh
│   ├── check-netlify-status.sh
│   ├── deployment-assistant.sh
│   ├── domain-helper.sh
│   └── production-deploy.sh
├── maintenance/            # Maintenance and setup
│   ├── final-setup-check.sh
│   ├── final-status.sh
│   ├── setup-custom-domain.sh
│   ├── setup-guide.sh
│   ├── setup-mintid-se.sh
│   ├── setup-netlify-minatid.sh
│   ├── github-setup.sh
│   └── seo-audit.sh
└── testing/               # Test scripts (archived)
```

### 🗄️ Database
```
supabase/
├── config.toml            # Supabase configuration
├── seed.sql              # Initial data
├── migrations/           # Database migrations
│   ├── archive/         # Old migration files
│   │   ├── CHECK_MIGRATION_STATUS.sql
│   │   ├── COMPLETE_MIGRATION_SCRIPT.sql
│   │   ├── COMPREHENSIVE_SETUP_CHECK.sql
│   │   ├── CORRECTED_RLS_POLICIES_NO_RECURSION.sql
│   │   └── STEP_BY_STEP_SETUP.sql
│   └── [current migrations]
└── functions/            # Edge functions
```

### 📦 Archive
```
archive/
├── test-files/           # Archived test files
│   ├── complete-system-test.sh
│   ├── create-test-profiles.sql
│   ├── manual-test-instructions.sh
│   ├── quick-verify.js
│   ├── rls_performance_test.sql
│   ├── test_permissions.sql
│   ├── unified-login-test-guide.sh
│   ├── verify-fix.sh
│   ├── verify-oauth-setup.sh
│   ├── verify-role-based-live.sh
│   └── [other test files]
└── old-docs/             # Archived documentation
    ├── INFINITE_RECURSION_*.md
    ├── BRITISH_SPELLING_*.md
    ├── FIREBASE_*.md
    ├── OAUTH_*.md
    ├── SEO_*.md
    └── [other old reports]
```

## 🚀 Quick Start

### Development
```bash
cd /Users/ibe/new-project/shift-ai-calendar-mintid
npm run dev
```

### Build
```bash
npm run build
```

### Deploy
```bash
# Use organized deployment scripts
./scripts/deployment/deploy-live.sh
```

## ✅ Key Features Implemented

### Enhanced Organization Admin Dashboard
- ✅ **Real User Management** - Create, edit, delete users
- ✅ **Department Management** - Full CRUD operations  
- ✅ **Bulk Operations** - Multi-select and batch actions
- ✅ **Real-time Activity Feed** - Live monitoring
- ✅ **File Upload System** - Schedule file processing
- ✅ **Live Integration** - Reports and analytics
- ✅ **Data Export** - JSON export functionality

### Authentication System
- ✅ **Multi-role Authentication** - org_admin, manager, employee
- ✅ **Supabase Integration** - Complete backend integration
- ✅ **Role-based Access Control** - Comprehensive permissions

### Live Features
- ✅ **LiveReportsManager** - Real-time reporting
- ✅ **LiveScheduleAutomation** - Automated scheduling
- ✅ **Real-time Updates** - Live data synchronization

## 🔗 Important Links

- **Local Development**: http://localhost:5173/
- **Production**: [Your production URL]
- **Documentation**: `/docs/`
- **Scripts**: `/scripts/`

## 📝 Notes

- All test files have been archived for future reference
- Old documentation has been moved to archive
- Scripts are organized by function (deployment, maintenance)
- Main application source remains unchanged and functional
- Enhanced Organization Admin Dashboard is fully operational

---

**Last Updated**: June 11, 2025  
**Status**: ✅ Production Ready
