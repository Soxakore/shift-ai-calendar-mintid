# 🔬 Surgical Integration Commands

## Quick Commands for Safe Development

### Backup & Restore
```bash
# Backup file before editing
./surgical-dev.sh backup src/pages/Index.tsx

# Restore if something goes wrong
./surgical-dev.sh restore src/pages/Index.tsx
```

### Testing
```bash
# Test TypeScript compilation
./test-component.sh ts src/pages/Index.tsx

# Test all imports
./test-component.sh imports src/pages/Index.tsx

# Test entire project
npm run build
```

### Git Operations
```bash
# Create feature branch
./surgical-dev.sh branch new-feature

# Safe commit (tests before committing)
./surgical-dev.sh commit "Add new feature"

# Quick rollback to last working state
./surgical-dev.sh rollback

# Rollback specific file
./surgical-dev.sh rollback src/pages/Index.tsx
```

### Interactive Modes
```bash
# Full surgical development menu
./surgical-dev.sh

# Component testing menu
./test-component.sh
```

## Safe Development Workflow

### 1. Before Making Changes
```bash
# Create feature branch
git checkout -b feature/my-change

# Backup the file you're about to edit
./surgical-dev.sh backup src/pages/Index.tsx

# Test current state
./surgical-dev.sh test
```

### 2. Making Changes
```bash
# Edit your file
code src/pages/Index.tsx

# Test just this file
./test-component.sh ts src/pages/Index.tsx

# Test the entire app
npm run build
```

### 3. If Something Breaks
```bash
# Option A: Restore from backup
./surgical-dev.sh restore src/pages/Index.tsx

# Option B: Rollback to git
./surgical-dev.sh rollback src/pages/Index.tsx

# Option C: Full rollback
./surgical-dev.sh rollback
```

### 4. If Everything Works
```bash
# Safe commit (tests before committing)
./surgical-dev.sh commit "Working: added new feature"

# Merge to main when ready
git checkout main
git merge feature/my-change
```

## Emergency Recovery

### If App is Completely Broken
```bash
# Go back to last stable state
git reset --hard HEAD~1

# Or go back to tagged stable version
git checkout v1.0-stable
```

### If Specific Component is Broken
```bash
# Restore just that component
git checkout HEAD -- src/pages/Index.tsx
```

## File-Specific Operations

### Common Files to Backup Before Editing
```bash
./surgical-dev.sh backup src/pages/Index.tsx
./surgical-dev.sh backup src/App.tsx
./surgical-dev.sh backup src/hooks/useAuth.tsx
./surgical-dev.sh backup package.json
```

### Test Critical Components
```bash
./test-component.sh component src/components/ScheduleCalendar.tsx
./test-component.sh component src/components/TaskManagement.tsx
```

This system ensures you never lose working functionality! 🛡️
