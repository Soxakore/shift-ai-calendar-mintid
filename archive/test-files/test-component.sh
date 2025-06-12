#!/bin/bash

# 🧪 Component Testing System
# Test individual components before integration

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test specific component
test_component() {
    local component_path=$1
    local component_name=$(basename "$component_path" .tsx)
    
    echo -e "${GREEN}[TEST]${NC} Testing component: $component_name"
    
    # Create temporary test file
    cat > "test_${component_name}.tsx" << EOF
import React from 'react';
import { createRoot } from 'react-dom/client';
import ${component_name} from '${component_path}';

// Minimal test wrapper
const TestWrapper = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Testing: ${component_name}</h1>
      <${component_name} />
    </div>
  );
};

// Render test
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestWrapper />);
}
EOF
    
    echo -e "${GREEN}[TEST]${NC} Created test file: test_${component_name}.tsx"
    echo -e "${YELLOW}[INFO]${NC} You can now test this component in isolation"
    
    # Clean up test file after user confirmation
    read -p "Press Enter to clean up test file..."
    rm "test_${component_name}.tsx"
    echo -e "${GREEN}[CLEAN]${NC} Cleaned up test file"
}

# Test specific file for TypeScript errors
test_typescript() {
    local file_path=$1
    echo -e "${GREEN}[TS]${NC} Checking TypeScript for: $file_path"
    
    if npx tsc --noEmit "$file_path"; then
        echo -e "${GREEN}[TS]${NC} ✅ TypeScript check passed"
        return 0
    else
        echo -e "${RED}[TS]${NC} ❌ TypeScript errors found"
        return 1
    fi
}

# Test if file imports work
test_imports() {
    local file_path=$1
    echo -e "${GREEN}[IMPORT]${NC} Testing imports for: $file_path"
    
    # Extract import statements and check if files exist
    grep -E "^import.*from ['\"]\." "$file_path" | while read -r line; do
        # Extract the import path
        import_path=$(echo "$line" | sed -E "s/.*from ['\"]([^'\"]*)['\"].*/\1/")
        
        # Convert relative path to absolute
        dir_path=$(dirname "$file_path")
        full_path="$dir_path/$import_path"
        
        # Check different extensions
        if [ -f "${full_path}.tsx" ] || [ -f "${full_path}.ts" ] || [ -f "${full_path}/index.tsx" ] || [ -f "${full_path}/index.ts" ]; then
            echo -e "${GREEN}[IMPORT]${NC} ✅ $import_path"
        else
            echo -e "${RED}[IMPORT]${NC} ❌ $import_path (file not found)"
        fi
    done
}

# Quick syntax check
quick_check() {
    local file_path=$1
    echo -e "${GREEN}[SYNTAX]${NC} Quick syntax check: $file_path"
    
    # Basic syntax check with node
    if node -c "$file_path" 2>/dev/null; then
        echo -e "${GREEN}[SYNTAX]${NC} ✅ Basic syntax OK"
    else
        echo -e "${RED}[SYNTAX]${NC} ❌ Syntax errors found"
        node -c "$file_path"
    fi
}

# Interactive testing menu
show_test_menu() {
    echo
    echo -e "${GREEN}🧪 COMPONENT TESTING SYSTEM${NC}"
    echo "============================"
    echo "1. Test TypeScript compilation"
    echo "2. Test imports"
    echo "3. Quick syntax check"
    echo "4. Test specific component"
    echo "5. Test entire src directory"
    echo "6. Exit"
    echo
    read -p "Choose option: " choice
    
    case $choice in
        1)
            read -p "Enter file path: " file_path
            test_typescript "$file_path"
            ;;
        2)
            read -p "Enter file path: " file_path
            test_imports "$file_path"
            ;;
        3)
            read -p "Enter file path: " file_path
            quick_check "$file_path"
            ;;
        4)
            read -p "Enter component path: " component_path
            test_component "$component_path"
            ;;
        5)
            echo -e "${GREEN}[TEST]${NC} Testing entire src directory..."
            npx tsc --noEmit
            ;;
        6)
            exit 0
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
    
    show_test_menu
}

# Main execution
if [ $# -eq 0 ]; then
    show_test_menu
else
    case $1 in
        "ts")
            test_typescript "$2"
            ;;
        "imports")
            test_imports "$2"
            ;;
        "syntax")
            quick_check "$2"
            ;;
        "component")
            test_component "$2"
            ;;
        *)
            echo "Usage: $0 [ts|imports|syntax|component] <file_path>"
            ;;
    esac
fi
