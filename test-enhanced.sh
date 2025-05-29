#!/bin/bash

# 🧪 Enhanced Component Testing System
# Advanced testing with integration to surgical system

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

SURGICAL_ENHANCED="./surgical-enhanced.sh"

print_test() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test TypeScript compilation for specific file
test_typescript() {
    local file=$1
    local temp_config="tsconfig.test.json"
    
    print_test "Testing TypeScript compilation for $(basename "$file")"
    
    # Create temporary tsconfig for single file
    cat > "$temp_config" << EOF
{
  "extends": "./tsconfig.json",
  "include": ["$file"],
  "compilerOptions": {
    "noEmit": true,
    "skipLibCheck": true
  }
}
EOF
    
    if npx tsc --project "$temp_config" 2>/dev/null; then
        print_pass "TypeScript compilation successful"
        rm "$temp_config"
        return 0
    else
        print_fail "TypeScript compilation failed"
        echo
        echo -e "${YELLOW}Detailed errors:${NC}"
        npx tsc --project "$temp_config"
        rm "$temp_config"
        return 1
    fi
}

# Test imports and dependencies
test_imports() {
    local file=$1
    print_test "Testing imports for $(basename "$file")"
    
    # Extract import statements
    local imports=$(grep -E "^import.*from" "$file" || true)
    
    if [ -z "$imports" ]; then
        print_warning "No imports found"
        return 0
    fi
    
    echo -e "${BLUE}Found imports:${NC}"
    echo "$imports"
    
    # Try to resolve each import
    local failed_imports=()
    
    while IFS= read -r import_line; do
        if [ -n "$import_line" ]; then
            # Extract module name (rough parsing)
            local module=$(echo "$import_line" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/")
            
            # Check if it's a relative import
            if [[ "$module" == ./* ]] || [[ "$module" == ../* ]]; then
                local resolved_path=$(dirname "$file")/"$module"
                
                # Try different extensions
                if [ -f "${resolved_path}.tsx" ] || [ -f "${resolved_path}.ts" ] || [ -f "${resolved_path}/index.tsx" ] || [ -f "${resolved_path}/index.ts" ]; then
                    echo -e "  ${GREEN}✓${NC} $module"
                else
                    echo -e "  ${RED}✗${NC} $module (not found)"
                    failed_imports+=("$module")
                fi
            else
                # Check if it's an installed package
                if [ -d "node_modules/$module" ] || [ -f "node_modules/$module" ]; then
                    echo -e "  ${GREEN}✓${NC} $module"
                else
                    echo -e "  ${YELLOW}?${NC} $module (package may not be installed)"
                fi
            fi
        fi
    done <<< "$imports"
    
    if [ ${#failed_imports[@]} -eq 0 ]; then
        print_pass "All imports resolved"
        return 0
    else
        print_fail "Some imports failed to resolve"
        return 1
    fi
}

# Test component syntax
test_syntax() {
    local file=$1
    print_test "Testing syntax for $(basename "$file")"
    
    # Basic syntax checks
    local errors=()
    
    # Check for balanced braces
    local open_braces=$(grep -o '{' "$file" | wc -l)
    local close_braces=$(grep -o '}' "$file" | wc -l)
    
    if [ "$open_braces" -ne "$close_braces" ]; then
        errors+=("Mismatched braces: $open_braces open, $close_braces close")
    fi
    
    # Check for balanced parentheses
    local open_parens=$(grep -o '(' "$file" | wc -l)
    local close_parens=$(grep -o ')' "$file" | wc -l)
    
    if [ "$open_parens" -ne "$close_parens" ]; then
        errors+=("Mismatched parentheses: $open_parens open, $close_parens close")
    fi
    
    # Check for React component export
    if ! grep -q "export.*default\|export.*function\|export.*const.*=" "$file"; then
        errors+=("No default export found")
    fi
    
    if [ ${#errors[@]} -eq 0 ]; then
        print_pass "Syntax checks passed"
        return 0
    else
        print_fail "Syntax errors found:"
        printf '  %s\n' "${errors[@]}"
        return 1
    fi
}

# Test component with isolation
test_component_isolated() {
    local file=$1
    local component_name=$(basename "$file" .tsx)
    local test_dir="test_isolated"
    local test_file="$test_dir/test_${component_name}.tsx"
    
    print_test "Creating isolated test for $component_name"
    
    mkdir -p "$test_dir"
    
    # Create test file
    cat > "$test_file" << EOF
import React from 'react';
import { createRoot } from 'react-dom/client';
import $component_name from '../$file';

// Mock any external dependencies that might not be available
const mockProps = {
  // Add common props here
  children: 'Test content',
  className: 'test-class',
  onClick: () => console.log('Test click'),
};

const TestWrapper = () => {
  try {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Isolated Test: $component_name</h1>
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <$component_name {...mockProps} />
        </div>
        <p style={{ color: 'green' }}>Component rendered successfully!</p>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Test Failed: $component_name</h1>
        <pre>{error.toString()}</pre>
      </div>
    );
  }
};

// Test rendering
console.log('Testing component: $component_name');

export default TestWrapper;
EOF
    
    # Test TypeScript compilation of test file
    if test_typescript "$test_file"; then
        print_pass "Isolated test created successfully"
        echo -e "${BLUE}Test file created at: $test_file${NC}"
        echo -e "${YELLOW}You can now test this component in a browser${NC}"
    else
        print_fail "Failed to create valid isolated test"
    fi
    
    # Clean up after confirmation
    read -p "Press Enter to clean up test files..."
    rm -rf "$test_dir"
    print_info "Cleaned up test files"
}

# Run comprehensive test suite
run_comprehensive_test() {
    local file=$1
    print_test "Running comprehensive test suite for $(basename "$file")"
    
    local test_results=()
    local failed_tests=0
    
    echo -e "${BLUE}Test 1/4: Syntax Check${NC}"
    if test_syntax "$file"; then
        test_results+=("✅ Syntax")
    else
        test_results+=("❌ Syntax")
        ((failed_tests++))
    fi
    
    echo
    echo -e "${BLUE}Test 2/4: Import Resolution${NC}"
    if test_imports "$file"; then
        test_results+=("✅ Imports")
    else
        test_results+=("⚠️ Imports")
    fi
    
    echo
    echo -e "${BLUE}Test 3/4: TypeScript Compilation${NC}"
    if test_typescript "$file"; then
        test_results+=("✅ TypeScript")
    else
        test_results+=("❌ TypeScript")
        ((failed_tests++))
    fi
    
    echo
    echo -e "${BLUE}Test 4/4: Integration Test${NC}"
    # Run the enhanced surgical system's quick test
    if [ -f "$SURGICAL_ENHANCED" ]; then
        if "$SURGICAL_ENHANCED" quick-test >/dev/null 2>&1; then
            test_results+=("✅ Integration")
        else
            test_results+=("❌ Integration")
            ((failed_tests++))
        fi
    else
        test_results+=("? Integration (surgical system not found)")
    fi
    
    echo
    echo -e "${BLUE}=== TEST RESULTS ===${NC}"
    printf '%s\n' "${test_results[@]}"
    echo
    
    if [ $failed_tests -eq 0 ]; then
        print_pass "All tests passed! Component is ready for integration."
        return 0
    else
        print_fail "$failed_tests critical tests failed. Component needs fixes."
        return 1
    fi
}

# Interactive test menu
show_test_menu() {
    local file=${1:-""}
    
    if [ -z "$file" ]; then
        read -p "Enter component file path: " file
    fi
    
    if [ ! -f "$file" ]; then
        print_fail "File not found: $file"
        return 1
    fi
    
    echo
    echo -e "${BLUE}🧪 ENHANCED COMPONENT TESTING${NC}"
    echo "File: $(basename "$file")"
    echo "=============================="
    echo "1. Syntax check"
    echo "2. Import resolution test"
    echo "3. TypeScript compilation test"
    echo "4. Isolated component test"
    echo "5. Comprehensive test suite"
    echo "6. Integration with surgical system"
    echo "7. Change file"
    echo "8. Exit"
    echo
    read -p "Choose test: " choice
    
    case $choice in
        1)
            test_syntax "$file"
            ;;
        2)
            test_imports "$file"
            ;;
        3)
            test_typescript "$file"
            ;;
        4)
            test_component_isolated "$file"
            ;;
        5)
            run_comprehensive_test "$file"
            ;;
        6)
            if [ -f "$SURGICAL_ENHANCED" ]; then
                # Create backup before testing
                "$SURGICAL_ENHANCED" backup "$file" "Pre-test backup"
                echo
                "$SURGICAL_ENHANCED" test
            else
                print_warning "Enhanced surgical system not found"
            fi
            ;;
        7)
            show_test_menu
            return
            ;;
        8)
            exit 0
            ;;
        *)
            print_fail "Invalid option"
            ;;
    esac
    
    echo
    read -p "Press Enter to continue..."
    show_test_menu "$file"
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        show_test_menu
    elif [ $# -eq 1 ]; then
        show_test_menu "$1"
    else
        case $1 in
            "syntax")
                test_syntax "$2"
                ;;
            "imports")
                test_imports "$2"
                ;;
            "ts"|"typescript")
                test_typescript "$2"
                ;;
            "isolated")
                test_component_isolated "$2"
                ;;
            "comprehensive"|"all")
                run_comprehensive_test "$2"
                ;;
            *)
                echo "Enhanced Component Testing Usage:"
                echo "$0 [syntax|imports|ts|isolated|comprehensive] <file>"
                echo "Or run without arguments for interactive mode"
                ;;
        esac
    fi
}

main "$@"
