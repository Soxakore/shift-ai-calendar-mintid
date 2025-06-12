#!/bin/bash

# 🎯 Master Surgical Integration Controller
# Unified interface for all surgical development tools

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Tool paths
SURGICAL_ENHANCED="./surgical-enhanced.sh"
TEST_ENHANCED="./test-enhanced.sh"
SURGICAL_BASIC="./surgical-dev.sh"
TEST_BASIC="./test-component.sh"

# Banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎯 MASTER SURGICAL CONTROL                ║"
    echo "║              Safe Development & Error Recovery               ║"
    echo "║                      MinTid Project                          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check system health
check_system_health() {
    echo -e "${BLUE}🔍 System Health Check${NC}"
    echo "======================"
    
    local health_score=0
    local max_score=6
    
    # Check if tools exist
    if [ -f "$SURGICAL_ENHANCED" ]; then
        echo -e "${GREEN}✓${NC} Enhanced surgical system found"
        ((health_score++))
    else
        echo -e "${RED}✗${NC} Enhanced surgical system missing"
    fi
    
    if [ -f "$TEST_ENHANCED" ]; then
        echo -e "${GREEN}✓${NC} Enhanced testing system found"
        ((health_score++))
    else
        echo -e "${RED}✗${NC} Enhanced testing system missing"
    fi
    
    # Check Node.js environment
    if command -v node >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Node.js available ($(node --version))"
        ((health_score++))
    else
        echo -e "${RED}✗${NC} Node.js not found"
    fi
    
    # Check npm/package.json
    if [ -f "package.json" ]; then
        echo -e "${GREEN}✓${NC} Package.json found"
        ((health_score++))
    else
        echo -e "${RED}✗${NC} Package.json missing"
    fi
    
    # Check git repository
    if git rev-parse --git-dir >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Git repository initialized"
        ((health_score++))
    else
        echo -e "${RED}✗${NC} Not a git repository"
    fi
    
    # Check TypeScript
    if npx tsc --version >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} TypeScript available"
        ((health_score++))
    else
        echo -e "${RED}✗${NC} TypeScript not available"
    fi
    
    echo
    local percentage=$((health_score * 100 / max_score))
    if [ $percentage -ge 90 ]; then
        echo -e "${GREEN}🎉 System Health: Excellent ($health_score/$max_score - $percentage%)${NC}"
    elif [ $percentage -ge 70 ]; then
        echo -e "${YELLOW}⚠️  System Health: Good ($health_score/$max_score - $percentage%)${NC}"
    else
        echo -e "${RED}🚨 System Health: Poor ($health_score/$max_score - $percentage%)${NC}"
    fi
    echo
}

# Quick project status
show_project_status() {
    echo -e "${BLUE}📊 Project Status${NC}"
    echo "================"
    
    # Git status
    echo -e "${CYAN}Git Status:${NC}"
    git status --porcelain | head -5
    
    # Current branch
    echo -e "${CYAN}Current Branch:${NC} $(git branch --show-current)"
    
    # Last commit
    echo -e "${CYAN}Last Commit:${NC} $(git log -1 --oneline)"
    
    # Safe points
    local safe_points=$(git tag -l "safe-point-*" | wc -l | tr -d ' ')
    echo -e "${CYAN}Safe Points:${NC} $safe_points"
    
    # Backups
    local backups=0
    if [ -d ".backups" ]; then
        backups=$(find .backups -name "*.backup_*" | wc -l | tr -d ' ')
    fi
    echo -e "${CYAN}File Backups:${NC} $backups"
    
    echo
}

# Quick development workflow
quick_workflow() {
    echo -e "${WHITE}🚀 Quick Development Workflow${NC}"
    echo "=============================="
    echo
    echo "Choose your workflow:"
    echo "1. 🔧 Fix/Debug Existing Component"
    echo "2. ✨ Add New Feature"
    echo "3. 🎨 Styling/UI Changes"
    echo "4. 🧪 Experimental Changes"
    echo "5. 🚨 Emergency Recovery"
    echo "6. Back to main menu"
    echo
    read -p "Choose workflow: " workflow_choice
    
    case $workflow_choice in
        1) workflow_fix_debug ;;
        2) workflow_new_feature ;;
        3) workflow_styling ;;
        4) workflow_experimental ;;
        5) workflow_emergency ;;
        6) return ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

# Workflow: Fix/Debug
workflow_fix_debug() {
    echo -e "${YELLOW}🔧 Fix/Debug Workflow${NC}"
    echo "===================="
    echo
    
    read -p "Enter file to fix: " file_path
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}File not found: $file_path${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Step 1:${NC} Creating backup..."
    "$SURGICAL_ENHANCED" backup "$file_path" "Pre-fix backup"
    
    echo -e "${BLUE}Step 2:${NC} Testing current state..."
    "$TEST_ENHANCED" comprehensive "$file_path"
    
    echo -e "${BLUE}Step 3:${NC} Ready for editing"
    echo "File backed up. You can now safely edit: $file_path"
    echo
    echo "After editing, run:"
    echo "  ./surgical-master.sh test-and-commit"
    echo "  OR"
    echo "  ./surgical-master.sh rollback-file $file_path"
}

# Workflow: New Feature
workflow_new_feature() {
    echo -e "${GREEN}✨ New Feature Workflow${NC}"
    echo "======================"
    echo
    
    read -p "Enter feature name: " feature_name
    
    echo -e "${BLUE}Step 1:${NC} Creating safe point..."
    "$SURGICAL_ENHANCED" safe-point "Before implementing: $feature_name"
    
    echo -e "${BLUE}Step 2:${NC} Creating feature branch..."
    git checkout -b "feature/$feature_name"
    
    echo -e "${BLUE}Step 3:${NC} Ready for development"
    echo "Safe point created and feature branch ready."
    echo
    echo "Development tips:"
    echo "  - Use './surgical-master.sh backup <file>' before major changes"
    echo "  - Test frequently with './surgical-master.sh test'"
    echo "  - Commit safely with './surgical-master.sh test-and-commit'"
}

# Workflow: Styling
workflow_styling() {
    echo -e "${PURPLE}🎨 Styling/UI Workflow${NC}"
    echo "====================="
    echo
    
    echo "Common files for UI changes:"
    echo "1. src/pages/Index.tsx (Main page)"
    echo "2. src/components/Footer.tsx (Footer)"
    echo "3. src/index.css (Global styles)"
    echo "4. tailwind.config.ts (Tailwind config)"
    echo "5. Custom file path"
    echo
    read -p "Choose file (1-5): " style_choice
    
    local file_path=""
    case $style_choice in
        1) file_path="src/pages/Index.tsx" ;;
        2) file_path="src/components/Footer.tsx" ;;
        3) file_path="src/index.css" ;;
        4) file_path="tailwind.config.ts" ;;
        5) read -p "Enter file path: " file_path ;;
        *) echo -e "${RED}Invalid option${NC}"; return 1 ;;
    esac
    
    echo -e "${BLUE}Step 1:${NC} Creating backup..."
    "$SURGICAL_ENHANCED" backup "$file_path" "Pre-styling backup"
    
    echo -e "${BLUE}Step 2:${NC} Ready for styling"
    echo "File backed up: $file_path"
    echo "After changes, test with: ./surgical-master.sh test"
}

# Workflow: Experimental
workflow_experimental() {
    echo -e "${CYAN}🧪 Experimental Workflow${NC}"
    echo "========================"
    echo
    
    read -p "Enter experiment description: " experiment_desc
    
    echo -e "${BLUE}Step 1:${NC} Creating experimental branch..."
    git checkout -b "experiment/$(date +%Y%m%d_%H%M%S)"
    
    echo -e "${BLUE}Step 2:${NC} Creating safe point..."
    "$SURGICAL_ENHANCED" safe-point "Experiment: $experiment_desc"
    
    echo -e "${BLUE}Step 3:${NC} Ready for experimentation"
    echo "Experimental environment ready!"
    echo
    echo "Experiment safely:"
    echo "  - All changes are isolated in this branch"
    echo "  - Use './surgical-master.sh emergency' if things go wrong"
    echo "  - Merge to main only if experiment succeeds"
}

# Workflow: Emergency
workflow_emergency() {
    echo -e "${RED}🚨 Emergency Recovery${NC}"
    echo "==================="
    echo
    
    "$SURGICAL_ENHANCED" emergency
}

# Test and commit workflow
test_and_commit() {
    echo -e "${BLUE}🧪 Test and Commit Workflow${NC}"
    echo "==========================="
    echo
    
    echo -e "${BLUE}Step 1:${NC} Running comprehensive tests..."
    if "$SURGICAL_ENHANCED" test; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        echo
        read -p "Enter commit message: " commit_msg
        "$SURGICAL_ENHANCED" commit "$commit_msg"
        echo -e "${GREEN}🎉 Changes committed safely!${NC}"
    else
        echo -e "${RED}❌ Tests failed!${NC}"
        echo
        echo "Options:"
        echo "1. Fix the issues and try again"
        echo "2. Rollback changes"
        echo "3. Emergency recovery"
        echo
        read -p "Choose option (1-3): " fix_choice
        
        case $fix_choice in
            1) echo "Fix the issues and run './surgical-master.sh test-and-commit' again" ;;
            2) "$SURGICAL_ENHANCED" rollback ;;
            3) "$SURGICAL_ENHANCED" emergency ;;
        esac
    fi
}

# Rollback specific file
rollback_file() {
    local file_path=$1
    
    if [ -z "$file_path" ]; then
        read -p "Enter file to rollback: " file_path
    fi
    
    echo -e "${YELLOW}Rolling back file: $file_path${NC}"
    "$SURGICAL_ENHANCED" restore "$file_path"
}

# Main menu
show_main_menu() {
    show_banner
    check_system_health
    show_project_status
    
    echo -e "${WHITE}🎛️  MASTER CONTROL MENU${NC}"
    echo "========================"
    echo
    echo "📋 WORKFLOWS:"
    echo "  1.  🚀 Quick Development Workflow"
    echo "  2.  🧪 Test and Commit"
    echo "  3.  ⏪ Rollback File"
    echo
    echo "🔧 INDIVIDUAL TOOLS:"
    echo "  4.  🔬 Enhanced Surgical System"
    echo "  5.  🧪 Enhanced Testing System"
    echo "  6.  🔄 Basic Surgical System"
    echo "  7.  📝 Basic Testing System"
    echo
    echo "📊 INFORMATION:"
    echo "  8.  🏥 System Health Check"
    echo "  9.  📊 Project Status"
    echo "  10. 📚 Documentation"
    echo
    echo "  11. 🚪 Exit"
    echo
    read -p "Choose option: " choice
    
    case $choice in
        1) quick_workflow ;;
        2) test_and_commit ;;
        3) rollback_file ;;
        4) "$SURGICAL_ENHANCED" ;;
        5) "$TEST_ENHANCED" ;;
        6) "$SURGICAL_BASIC" ;;
        7) "$TEST_BASIC" ;;
        8) check_system_health ;;
        9) show_project_status ;;
        10) show_documentation ;;
        11) exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
    
    echo
    read -p "Press Enter to continue..."
    show_main_menu
}

# Documentation
show_documentation() {
    echo -e "${BLUE}📚 Available Documentation${NC}"
    echo "=========================="
    echo
    echo "1. 🔬 Enhanced Surgical Integration Guide"
    echo "2. 🏥 Responsive Testing Guide"
    echo "3. 🚀 Final Deployment Report"
    echo "4. 👥 Role-Based System Guide"
    echo "5. 🔐 Authentication System Guide"
    echo "6. 📖 Project README"
    echo
    read -p "Choose documentation (1-6): " doc_choice
    
    case $doc_choice in
        1) 
            if [ -f "ENHANCED_SURGICAL_GUIDE.md" ]; then
                echo "Opening Enhanced Surgical Guide..."
                open "ENHANCED_SURGICAL_GUIDE.md" 2>/dev/null || cat "ENHANCED_SURGICAL_GUIDE.md" | head -50
            else
                echo -e "${RED}Enhanced Surgical Guide not found${NC}"
            fi
            ;;
        2)
            if [ -f "RESPONSIVE_TEST_GUIDE.md" ]; then
                echo "Opening Responsive Test Guide..."
                open "RESPONSIVE_TEST_GUIDE.md" 2>/dev/null || cat "RESPONSIVE_TEST_GUIDE.md" | head -50
            else
                echo -e "${RED}Responsive Test Guide not found${NC}"
            fi
            ;;
        3)
            if [ -f "FINAL_DEPLOYMENT_REPORT.md" ]; then
                echo "Opening Deployment Report..."
                open "FINAL_DEPLOYMENT_REPORT.md" 2>/dev/null || cat "FINAL_DEPLOYMENT_REPORT.md" | head -50
            else
                echo -e "${RED}Deployment Report not found${NC}"
            fi
            ;;
        4)
            if [ -f "ROLE_BASED_SYSTEM_GUIDE.md" ]; then
                echo "Opening Role-Based System Guide..."
                open "ROLE_BASED_SYSTEM_GUIDE.md" 2>/dev/null || cat "ROLE_BASED_SYSTEM_GUIDE.md" | head -50
            else
                echo -e "${RED}Role-Based System Guide not found${NC}"
            fi
            ;;
        5)
            if [ -f "DUAL_AUTH_SYSTEM.md" ]; then
                echo "Opening Authentication Guide..."
                open "DUAL_AUTH_SYSTEM.md" 2>/dev/null || cat "DUAL_AUTH_SYSTEM.md" | head -50
            else
                echo -e "${RED}Authentication Guide not found${NC}"
            fi
            ;;
        6)
            if [ -f "README.md" ]; then
                echo "Opening Project README..."
                open "README.md" 2>/dev/null || cat "README.md" | head -50
            else
                echo -e "${RED}README not found${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        show_main_menu
    else
        case $1 in
            "health")
                check_system_health
                ;;
            "status")
                show_project_status
                ;;
            "test-and-commit")
                test_and_commit
                ;;
            "rollback-file")
                rollback_file "$2"
                ;;
            "workflow")
                quick_workflow
                ;;
            "emergency")
                workflow_emergency
                ;;
            "docs")
                show_documentation
                ;;
            *)
                echo "Master Surgical Controller Usage:"
                echo "$0 [health|status|test-and-commit|rollback-file|workflow|emergency|docs]"
                echo "Or run without arguments for interactive mode"
                ;;
        esac
    fi
}

main "$@"
