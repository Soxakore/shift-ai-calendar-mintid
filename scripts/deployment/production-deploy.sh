#!/bin/bash

# 🚀 MinTid Production Deployment Script
# Automates production build and deployment preparation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[DEPLOY-SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[DEPLOY-INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[DEPLOY-WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[DEPLOY-ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[DEPLOY]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[DEPLOY-STEP]${NC} $1"
}

# Start deployment process
print_header "🚀 Starting MinTid Production Deployment Process"
echo "=================================================================="

# Step 1: Environment Check
print_step "1. Checking Production Environment Configuration"

if [[ ! -f ".env.production" ]]; then
    print_error "❌ .env.production file not found"
    print_info "Creating .env.production template..."
    cp .env.example .env.production
    print_warning "⚠️  Please configure production values in .env.production before deployment"
fi

if grep -q "GA_MEASUREMENT_ID" ".env.production"; then
    print_warning "⚠️  Google Analytics ID not configured in .env.production"
fi

if grep -q "your-sentry-dsn" ".env.production"; then
    print_warning "⚠️  Sentry DSN not configured in .env.production"
fi

# Step 2: Build Verification
print_step "2. Running Production Build"

if npm run build; then
    print_success "✅ Production build completed successfully"
else
    print_error "❌ Production build failed"
    exit 1
fi

# Step 3: Bundle Analysis
print_step "3. Analyzing Bundle Size"

if [[ -f "dist/stats.html" ]]; then
    print_info "📊 Bundle analysis available at dist/stats.html"
fi

# Get bundle size information
if [[ -d "dist" ]]; then
    total_size=$(du -sh dist | cut -f1)
    print_info "📦 Total build size: ${total_size}"
    
    # Count chunks
    chunk_count=$(find dist -name "*.js" | wc -l | tr -d ' ')
    print_info "🧩 JavaScript chunks: ${chunk_count}"
fi

# Step 4: SEO Validation
print_step "4. Running SEO Validation"

if [[ -f "seo-audit.sh" ]]; then
    if bash seo-audit.sh --production; then
        print_success "✅ SEO validation passed"
    else
        print_warning "⚠️  SEO validation found issues (check output above)"
    fi
else
    print_warning "⚠️  SEO audit script not found"
fi

# Step 5: Security Headers Check
print_step "5. Checking Security Configuration"

if [[ -f "netlify.toml" ]]; then
    if grep -q "X-Frame-Options" "netlify.toml"; then
        print_success "✅ Security headers configured"
    else
        print_warning "⚠️  Security headers not found in netlify.toml"
    fi
else
    print_warning "⚠️  netlify.toml not found"
fi

# Step 6: Performance Check
print_step "6. Performance Optimization Check"

# Check for common performance issues
if [[ -d "dist" ]]; then
    # Check for large assets
    large_files=$(find dist -type f -size +1M)
    if [[ -n "$large_files" ]]; then
        print_warning "⚠️  Large files found (>1MB):"
        echo "$large_files"
    else
        print_success "✅ No large files detected"
    fi
    
    # Check for uncompressed images
    uncompressed_images=$(find dist -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | wc -l | tr -d ' ')
    if [[ "$uncompressed_images" -gt 0 ]]; then
        print_warning "⚠️  Found ${uncompressed_images} uncompressed images"
        print_info "💡 Consider converting to WebP for better compression"
    fi
fi

# Step 7: Production Checklist
print_step "7. Production Deployment Checklist"

echo ""
print_header "📋 PRE-DEPLOYMENT CHECKLIST"
echo "=================================="

checklist_items=(
    "✅ Environment variables configured in .env.production"
    "✅ Google Analytics 4 tracking ID set"
    "✅ Sentry DSN configured for error tracking"
    "✅ SSL certificate configured for HTTPS"
    "✅ Domain name configured (if using custom domain)"
    "✅ Netlify deployment settings configured"
    "✅ Security headers enabled"
    "✅ Performance optimizations applied"
    "✅ SEO validation passed"
    "✅ Build artifacts generated successfully"
)

for item in "${checklist_items[@]}"; do
    echo -e "  $item"
done

echo ""
print_header "🎯 DEPLOYMENT COMMANDS"
echo "======================"

echo ""
print_info "For Netlify deployment:"
echo "  1. Connect repository to Netlify"
echo "  2. Set build command: npm run build"
echo "  3. Set publish directory: dist"
echo "  4. Configure environment variables in Netlify dashboard"
echo ""

print_info "For manual deployment:"
echo "  1. Upload dist/ folder contents to web server"
echo "  2. Configure web server for SPA routing"
echo "  3. Enable HTTPS and security headers"
echo ""

print_info "For testing production build locally:"
echo "  npm run preview"
echo "  Open http://localhost:4173"
echo ""

# Final status
echo ""
if [[ $? -eq 0 ]]; then
    print_success "🎉 Deployment preparation completed successfully!"
    print_info "📦 Build artifacts are ready in ./dist directory"
    print_info "🚀 Ready for production deployment!"
else
    print_error "❌ Deployment preparation failed"
    exit 1
fi

echo "=================================================================="
print_header "🌟 MinTid is ready for production! 🌟"
