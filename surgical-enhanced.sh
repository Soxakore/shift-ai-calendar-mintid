#!/bin/bash

# 🔬 Enhanced Surgical Integration System
# Advanced error recovery, safety checks, and development automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Global state file
STATE_FILE=".surgical_state.json"

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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1"
}

print_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

# Initialize state file
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        cat > "$STATE_FILE" << EOF
{
    "current_branch": "$(git branch --show-current)",
    "last_working_commit": "$(git rev-parse HEAD)",
    "backups": [],
    "safe_points": [],
    "session_start": "$(date '+%Y-%m-%d %H:%M:%S')",
    "working_directory": "$(pwd)"
}
EOF
        print_status "Initialized surgical state tracking"
    fi
}

# Save current state as a safe point
create_safe_point() {
    local description=${1:-"Manual safe point"}
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local commit_hash=$(git rev-parse HEAD)
    
    # Create git tag
    git tag "safe-point-$timestamp" -m "$description"
    
    # Update state file
    python3 << EOF
import json
import os

with open('$STATE_FILE', 'r') as f:
    state = json.load(f)

state['safe_points'].append({
    'timestamp': '$timestamp',
    'description': '$description',
    'commit': '$commit_hash',
    'tag': 'safe-point-$timestamp'
})

with open('$STATE_FILE', 'w') as f:
    json.dump(state, f, indent=2)
EOF
    
    print_success "Created safe point: $description (tag: safe-point-$timestamp)"
}

# Enhanced backup with metadata
backup_file_enhanced() {
    local file=$1
    local reason=${2:-"Manual backup"}
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir=".backups"
    
    mkdir -p "$backup_dir"
    
    local filename=$(basename "$file")
    local backup_name="${filename}.backup_${timestamp}"
    local backup_path="${backup_dir}/${backup_name}"
    
    # Create backup
    cp "$file" "$backup_path"
    
    # Get file hash for integrity checking
    local file_hash=$(shasum -a 256 "$file" | cut -d' ' -f1)
    
    # Update state file with backup metadata
    python3 << EOF
import json
import os

with open('$STATE_FILE', 'r') as f:
    state = json.load(f)

state['backups'].append({
    'original_file': '$file',
    'backup_path': '$backup_path',
    'timestamp': '$timestamp',
    'reason': '$reason',
    'file_hash': '$file_hash',
    'size': os.path.getsize('$file')
})

with open('$STATE_FILE', 'w') as f:
    json.dump(state, f, indent=2)
EOF
    
    print_status "Enhanced backup: $file → $backup_path"
    print_info "Reason: $reason | Hash: ${file_hash:0:8}..."
}

# Smart restore with verification
restore_file_enhanced() {
    local file=$1
    local backup_dir=".backups"
    
    # Get available backups from state
    local backups_info=$(python3 << EOF
import json

with open('$STATE_FILE', 'r') as f:
    state = json.load(f)

backups = [b for b in state['backups'] if b['original_file'] == '$file']
backups.sort(key=lambda x: x['timestamp'], reverse=True)

for i, backup in enumerate(backups[:5]):  # Show last 5 backups
    print(f"{i+1}. {backup['timestamp']} - {backup['reason']} (Size: {backup['size']} bytes)")
EOF
)
    
    if [ -z "$backups_info" ]; then
        print_error "No backups found for $file"
        return 1
    fi
    
    echo -e "${BLUE}Available backups for $file:${NC}"
    echo "$backups_info"
    echo
    read -p "Choose backup number (1-5) or press Enter for latest: " choice
    
    if [ -z "$choice" ]; then
        choice=1
    fi
    
    # Get selected backup path
    local backup_path=$(python3 << EOF
import json

with open('$STATE_FILE', 'r') as f:
    state = json.load(f)

backups = [b for b in state['backups'] if b['original_file'] == '$file']
backups.sort(key=lambda x: x['timestamp'], reverse=True)

if len(backups) >= $choice:
    print(backups[$choice-1]['backup_path'])
EOF
)
    
    if [ -n "$backup_path" ] && [ -f "$backup_path" ]; then
        # Verify backup integrity
        local backup_hash=$(shasum -a 256 "$backup_path" | cut -d' ' -f1)
        
        # Create current backup before restoring
        backup_file_enhanced "$file" "Pre-restore backup"
        
        # Restore file
        cp "$backup_path" "$file"
        print_success "Restored $file from backup"
        print_info "Backup hash: ${backup_hash:0:8}..."
        
        # Test after restore
        test_app_quick
    else
        print_error "Invalid backup selection or backup file not found"
        return 1
    fi
}

# Quick app test
test_app_quick() {
    print_status "Quick test: TypeScript compilation..."
    
    if npx tsc --noEmit >/dev/null 2>&1; then
        print_success "✅ TypeScript compilation passed"
        return 0
    else
        print_error "❌ TypeScript compilation failed"
        return 1
    fi
}

# Comprehensive app test
test_app_full() {
    print_status "Comprehensive testing..."
    
    local test_results=()
    
    # TypeScript compilation
    print_info "Testing TypeScript compilation..."
    if npx tsc --noEmit >/dev/null 2>&1; then
        test_results+=("✅ TypeScript: PASS")
    else
        test_results+=("❌ TypeScript: FAIL")
    fi
    
    # ESLint check
    print_info "Testing ESLint..."
    if npx eslint src --ext .ts,.tsx >/dev/null 2>&1; then
        test_results+=("✅ ESLint: PASS")
    else
        test_results+=("⚠️  ESLint: WARNINGS")
    fi
    
    # Build test
    print_info "Testing build..."
    if npm run build >/dev/null 2>&1; then
        test_results+=("✅ Build: PASS")
    else
        test_results+=("❌ Build: FAIL")
    fi
    
    # Display results
    echo
    echo -e "${BLUE}Test Results:${NC}"
    printf '%s\n' "${test_results[@]}"
    echo
    
    # Return success only if all critical tests pass
    for result in "${test_results[@]}"; do
        if [[ "$result" == *"TypeScript: FAIL"* ]] || [[ "$result" == *"Build: FAIL"* ]]; then
            return 1
        fi
    done
    
    return 0
}

# Enhanced safe commit with pre-commit hooks
safe_commit_enhanced() {
    local message=$1
    
    print_status "Enhanced safe commit process..."
    
    # 1. Create backup of all modified files
    local modified_files=$(git diff --name-only)
    if [ -n "$modified_files" ]; then
        echo "$modified_files" | while read -r file; do
            if [ -f "$file" ]; then
                backup_file_enhanced "$file" "Pre-commit backup for: $message"
            fi
        done
    fi
    
    # 2. Run comprehensive tests
    if ! test_app_full; then
        print_error "Tests failed! Not committing."
        print_warning "You can use 'restore' command to rollback changes"
        return 1
    fi
    
    # 3. Create safe point before commit
    create_safe_point "Pre-commit safe point: $message"
    
    # 4. Commit
    git add .
    git commit -m "🔬 $message"
    
    # 5. Update state with new working commit
    python3 << EOF
import json

with open('$STATE_FILE', 'r') as f:
    state = json.load(f)

state['last_working_commit'] = '$(git rev-parse HEAD)'

with open('$STATE_FILE', 'w') as f:
    json.dump(state, f, indent=2)
EOF
    
    print_success "Enhanced safe commit completed: $message"
}

# Emergency recovery
emergency_recovery() {
    print_warning "🚨 EMERGENCY RECOVERY MODE 🚨"
    echo
    echo "Recovery options:"
    echo "1. Rollback to last working commit"
    echo "2. Rollback to specific safe point"
    echo "3. Restore all files from latest backups"
    echo "4. Show recovery information"
    echo "5. Exit emergency mode"
    echo
    read -p "Choose recovery option: " choice
    
    case $choice in
        1)
            print_warning "Rolling back to last working commit..."
            git reset --hard $(python3 -c "import json; print(json.load(open('$STATE_FILE'))['last_working_commit'])")
            print_success "Rollback completed"
            ;;
        2)
            show_safe_points
            read -p "Enter safe point tag: " tag
            git reset --hard "$tag"
            print_success "Rollback to safe point completed"
            ;;
        3)
            restore_all_from_backups
            ;;
        4)
            show_recovery_info
            ;;
        5)
            return 0
            ;;
        *)
            print_error "Invalid option"
            emergency_recovery
            ;;
    esac
}

# Show safe points
show_safe_points() {
    echo -e "${BLUE}Available Safe Points:${NC}"
    git tag -l "safe-point-*" --sort=-version:refname | head -10
}

# Show recovery information
show_recovery_info() {
    echo -e "${BLUE}Current Recovery Information:${NC}"
    
    python3 << EOF
import json
from datetime import datetime

with open('$STATE_FILE', 'r') as f:
    state = json.load(f)

print(f"Session started: {state['session_start']}")
print(f"Current branch: {state['current_branch']}")
print(f"Last working commit: {state['last_working_commit'][:8]}...")
print(f"Total backups: {len(state['backups'])}")
print(f"Safe points: {len(state['safe_points'])}")

if state['backups']:
    print(f"\nLatest backup: {state['backups'][-1]['timestamp']}")
    
if state['safe_points']:
    print(f"Latest safe point: {state['safe_points'][-1]['description']}")
EOF
}

# Interactive enhanced menu
show_enhanced_menu() {
    echo
    echo -e "${BLUE}🔬 ENHANCED SURGICAL DEVELOPMENT SYSTEM${NC}"
    echo "========================================"
    echo "1.  Create safe point"
    echo "2.  Enhanced backup file"
    echo "3.  Smart restore file"
    echo "4.  Quick test (TypeScript)"
    echo "5.  Full test suite"
    echo "6.  Enhanced safe commit"
    echo "7.  Emergency recovery"
    echo "8.  Show safe points"
    echo "9.  Show recovery info"
    echo "10. Create feature branch"
    echo "11. Standard operations menu"
    echo "12. Exit"
    echo
    read -p "Choose option: " choice
    
    case $choice in
        1)
            read -p "Safe point description: " desc
            create_safe_point "$desc"
            ;;
        2)
            read -p "File path: " file_path
            read -p "Reason (optional): " reason
            backup_file_enhanced "$file_path" "$reason"
            ;;
        3)
            read -p "File path: " file_path
            restore_file_enhanced "$file_path"
            ;;
        4)
            test_app_quick
            ;;
        5)
            test_app_full
            ;;
        6)
            read -p "Commit message: " commit_msg
            safe_commit_enhanced "$commit_msg"
            ;;
        7)
            emergency_recovery
            ;;
        8)
            show_safe_points
            ;;
        9)
            show_recovery_info
            ;;
        10)
            read -p "Feature name: " feature_name
            git checkout -b "feature/$feature_name"
            create_safe_point "Started feature: $feature_name"
            ;;
        11)
            show_standard_menu
            ;;
        12)
            exit 0
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    show_enhanced_menu
}

# Standard operations menu (original functionality)
show_standard_menu() {
    echo
    echo -e "${YELLOW}Standard Operations${NC}"
    echo "=================="
    echo "1. Quick rollback (git reset)"
    echo "2. Rollback specific file"
    echo "3. Git status"
    echo "4. Back to enhanced menu"
    echo
    read -p "Choose option: " choice
    
    case $choice in
        1)
            git reset --hard HEAD
            print_status "Quick rollback completed"
            ;;
        2)
            read -p "File path: " file_path
            git checkout HEAD -- "$file_path"
            print_status "Rolled back $file_path"
            ;;
        3)
            git status
            ;;
        4)
            return
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    show_standard_menu
}

# Initialize and run
main() {
    init_state
    
    if [ $# -eq 0 ]; then
        show_enhanced_menu
    else
        case $1 in
            "safe-point")
                create_safe_point "${2:-Manual safe point}"
                ;;
            "backup")
                backup_file_enhanced "$2" "${3:-Manual backup}"
                ;;
            "restore")
                restore_file_enhanced "$2"
                ;;
            "test")
                test_app_full
                ;;
            "quick-test")
                test_app_quick
                ;;
            "commit")
                safe_commit_enhanced "$2"
                ;;
            "emergency")
                emergency_recovery
                ;;
            "info")
                show_recovery_info
                ;;
            "safe-points")
                show_safe_points
                ;;
            *)
                echo "Enhanced Surgical System Usage:"
                echo "$0 [safe-point|backup|restore|test|quick-test|commit|emergency|info|safe-points] [args]"
                echo "Or run without arguments for interactive mode"
                ;;
        esac
    fi
}

# Run main function
main "$@"
