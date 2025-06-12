#!/bin/bash

# 🔬 Surgical Development System
# Safe, precise changes with instant rollback capability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[SURGICAL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup before any change
backup_file() {
    local file=$1
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir=".backups"
    
    mkdir -p "$backup_dir"
    cp "$file" "$backup_dir/$(basename $file).backup_$timestamp"
    print_status "Backed up $file to $backup_dir/$(basename $file).backup_$timestamp"
}

# Restore file from backup
restore_file() {
    local file=$1
    local backup_dir=".backups"
    local latest_backup=$(ls -t "$backup_dir/$(basename $file).backup_"* 2>/dev/null | head -1)
    
    if [ -n "$latest_backup" ]; then
        cp "$latest_backup" "$file"
        print_status "Restored $file from $latest_backup"
    else
        print_error "No backup found for $file"
        return 1
    fi
}

# Create feature branch
create_feature_branch() {
    local feature_name=$1
    git checkout -b "feature/$feature_name"
    print_status "Created feature branch: feature/$feature_name"
}

# Safe commit with automatic backup
safe_commit() {
    local message=$1
    
    # Check if app builds before committing
    print_status "Testing build before commit..."
    if npm run build >/dev/null 2>&1; then
        git add .
        git commit -m "✅ $message"
        print_status "Committed: $message"
    else
        print_error "Build failed! Not committing changes."
        return 1
    fi
}

# Quick rollback to last working state
quick_rollback() {
    print_warning "Rolling back to last commit..."
    git reset --hard HEAD
    print_status "Rolled back successfully"
}

# Rollback specific file
rollback_file() {
    local file=$1
    git checkout HEAD -- "$file"
    print_status "Rolled back $file to last commit"
}

# Test current state
test_app() {
    print_status "Testing application..."
    
    # Check TypeScript compilation
    if npx tsc --noEmit; then
        print_status "✅ TypeScript compilation passed"
    else
        print_error "❌ TypeScript compilation failed"
        return 1
    fi
    
    # Check build
    if npm run build >/dev/null 2>&1; then
        print_status "✅ Build successful"
    else
        print_error "❌ Build failed"
        return 1
    fi
    
    print_status "🎉 All tests passed!"
}

# Interactive menu
show_menu() {
    echo
    echo -e "${BLUE}🔬 SURGICAL DEVELOPMENT SYSTEM${NC}"
    echo "================================"
    echo "1. Create feature branch"
    echo "2. Backup file before editing"
    echo "3. Test current state"
    echo "4. Safe commit (with build test)"
    echo "5. Quick rollback (to last commit)"
    echo "6. Rollback specific file"
    echo "7. Restore file from backup"
    echo "8. Show git status"
    echo "9. Exit"
    echo
    read -p "Choose option: " choice
    
    case $choice in
        1)
            read -p "Enter feature name: " feature_name
            create_feature_branch "$feature_name"
            ;;
        2)
            read -p "Enter file path: " file_path
            backup_file "$file_path"
            ;;
        3)
            test_app
            ;;
        4)
            read -p "Enter commit message: " commit_msg
            safe_commit "$commit_msg"
            ;;
        5)
            quick_rollback
            ;;
        6)
            read -p "Enter file path: " file_path
            rollback_file "$file_path"
            ;;
        7)
            read -p "Enter file path: " file_path
            restore_file "$file_path"
            ;;
        8)
            git status
            ;;
        9)
            exit 0
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
    
    show_menu
}

# Main execution
if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        "backup")
            backup_file "$2"
            ;;
        "restore")
            restore_file "$2"
            ;;
        "test")
            test_app
            ;;
        "commit")
            safe_commit "$2"
            ;;
        "rollback")
            if [ -n "$2" ]; then
                rollback_file "$2"
            else
                quick_rollback
            fi
            ;;
        "branch")
            create_feature_branch "$2"
            ;;
        *)
            echo "Usage: $0 [backup|restore|test|commit|rollback|branch] [args]"
            ;;
    esac
fi
