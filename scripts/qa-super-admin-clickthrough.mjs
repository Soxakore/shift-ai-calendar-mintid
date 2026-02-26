#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, 'output', 'qa', 'super-admin');
fs.mkdirSync(outputDir, { recursive: true });

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const credential = process.env.QA_USERNAME || '';
const password = process.env.QA_PASSWORD || '';

const result = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  status: 'failed',
  steps: [],
};

const pushStep = (name, ok, details = '') => {
  result.steps.push({ name, ok, details, at: new Date().toISOString() });
};

try {
  const playwright = await import('playwright').catch(() => null);
  if (!playwright) {
    pushStep('bootstrap', false, 'Playwright is not installed. Run `npm i -D playwright` to enable browser QA.');
    result.status = 'skipped';
    fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (!credential || !password) {
    pushStep('config', false, 'Missing QA_USERNAME or QA_PASSWORD environment variables.');
    result.status = 'skipped';
    fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(result, null, 2));
    process.exit(0);
  }

  const { chromium } = playwright;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  pushStep('open-login', true);

  await page.fill('#credential', credential);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/super-admin', { timeout: 45000 });
  pushStep('login-super-admin', true);

  await page.screenshot({ path: path.join(outputDir, '01-overview.png'), fullPage: true });
  pushStep('overview-screenshot', true, 'Saved 01-overview.png');

  const tabs = [
    ['Users', '02-users.png'],
    ['Role Mgmt', '03-role-mgmt.png'],
    ['Organisations', '04-organisations.png'],
    ['Analytics', '05-analytics.png'],
    ['Security', '06-security.png'],
    ['2FA', '07-2fa.png'],
    ['System', '08-system.png'],
  ];

  for (const [label, fileName] of tabs) {
    await page.getByRole('tab', { name: label }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, fileName), fullPage: true });
    pushStep(`tab-${label.toLowerCase().replace(/\\s+/g, '-')}`, true, `Saved ${fileName}`);
  }

  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('Tab');
  }
  await page.screenshot({ path: path.join(outputDir, '09-keyboard-focus.png'), fullPage: true });
  pushStep('keyboard-focus-pass', true, 'Saved 09-keyboard-focus.png');

  await browser.close();
  result.status = 'passed';
} catch (error) {
  pushStep('runtime-error', false, error instanceof Error ? error.message : String(error));
  result.status = 'failed';
}

fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(result, null, 2));

if (result.status === 'failed') {
  process.exit(1);
}
