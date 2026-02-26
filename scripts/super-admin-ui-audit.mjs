#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const targetFiles = [
  'src/pages/SuperAdminDashboard.tsx',
  'src/components/admin/SuperAdminUserManagement.tsx',
  'src/components/admin/RoleBasedUserManagement.tsx',
  'src/components/admin/OrganisationManagement.tsx',
  'src/components/UserManagement.tsx',
  'src/components/layout/RoleDashboardHeader.tsx',
];

const tagPattern = /<(Button|button|TabsTrigger)\b/;
const actionPattern = /(getActionDataAttributes\(|data-sa-action-id=)/;
const placeholderPattern = /placeholder\s*=\s*/;
const labelPattern = /(<Label\b|<AdminField\b|label\s*=|aria-label\s*=)/;

const buttonViolations = [];
const placeholderViolations = [];

for (const relativePath of targetFiles) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (tagPattern.test(line)) {
      const block = lines.slice(index, index + 12).join('\n');
      const requiresAction = /TabsTrigger/.test(line) || /onClick\s*=/.test(block);
      const hasAction = actionPattern.test(block);
      const isExplicitlyHidden = /disabled/.test(block) && !/onClick\s*=/.test(block);

      if (requiresAction && !hasAction && !isExplicitlyHidden) {
        buttonViolations.push({
          file: relativePath,
          line: index + 1,
          snippet: line.trim(),
          issue: 'Missing action registry mapping',
        });
      }
    }

    if (placeholderPattern.test(line)) {
      const context = lines.slice(Math.max(0, index - 12), index + 2).join('\n');
      const hasLabelContext = labelPattern.test(context);
      if (!hasLabelContext) {
        placeholderViolations.push({
          file: relativePath,
          line: index + 1,
          snippet: line.trim(),
          issue: 'Placeholder without nearby label or AdminField wrapper',
        });
      }
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  scope: targetFiles,
  summary: {
    checkedFiles: targetFiles.length,
    buttonViolations: buttonViolations.length,
    placeholderViolations: placeholderViolations.length,
    passed: buttonViolations.length === 0 && placeholderViolations.length === 0,
  },
  violations: {
    buttons: buttonViolations,
    placeholders: placeholderViolations,
  },
};

const outputDir = path.join(repoRoot, 'output');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'super-admin-ui-audit.json'), JSON.stringify(report, null, 2));

if (!report.summary.passed) {
  console.error('super-admin-ui-audit failed. See output/super-admin-ui-audit.json');
  process.exit(1);
}

console.log('super-admin-ui-audit passed.');
