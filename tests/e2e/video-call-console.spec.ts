import { test, expect, type ConsoleMessage, type Page } from '@playwright/test';

/**
 * Console error monitoring for video call functionality
 */

test.describe('Video Call - Console Error Monitoring', () => {
  function setupConsoleMonitoring(page: Page, logs: { type: string; text: string }[]) {
    page.on('console', (msg) => {
      logs.push({ type: msg.type(), text: msg.text() });
      const prefix = msg.type() === 'error' ? '❌' :
                     msg.type() === 'warning' ? '⚠️' :
                     msg.type() === 'info' ? 'ℹ️' : '📝';
      console.log(`${prefix} [${msg.type()}] ${msg.text().substring(0, 200)}`);
    });

    page.on('pageerror', (error) => {
      console.log(`❌ Page Error: ${error.message}`);
    });
  }

  test('capture console errors during video call initialization', async ({ page }) => {
    const consoleLogs: { type: string; text: string }[] = [];

    // Grant permissions
    await page.context().grantPermissions(['camera', 'microphone']);

    // Setup monitoring
    setupConsoleMonitoring(page, consoleLogs);

    console.log('\n🚀 Step 1: Navigate to video call page');
    await page.goto('/video-call');
    await expect(page.getByRole('heading', { name: 'Video Call' })).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/01-initial.png', fullPage: true });

    console.log('\n🚀 Step 2: Enter room name and join');
    await page.getByLabel('Room Name').fill(`test-room-${Date.now()}`);
    await page.getByRole('button', { name: 'Join Room' }).click();

    // Wait for dynamic import to load
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tests/e2e/screenshots/02-after-join-click.png', fullPage: true });

    console.log('\n🚀 Step 3: Wait for VideoCall component');
    // Wait for either the "Join Video Call" heading or an error
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tests/e2e/screenshots/03-videocall-loaded.png', fullPage: true });

    // Try to click Join if visible
    const joinButton = page.getByRole('button', { name: /^Join$/ });
    if (await joinButton.isVisible().catch(() => false)) {
      console.log('\n🚀 Step 4: Clicking Join button in VideoCall component');
      await joinButton.click();
      await page.waitForTimeout(5000);

      await page.screenshot({ path: 'tests/e2e/screenshots/04-call-initialized.png', fullPage: true });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('CONSOLE SUMMARY');
    console.log('='.repeat(60));

    const errors = consoleLogs.filter(l => l.type === 'error');
    const warnings = consoleLogs.filter(l => l.type === 'warning');

    console.log(`\n📊 Total messages: ${consoleLogs.length}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Warnings: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors found:');
      errors.forEach((err, i) => console.log(`   ${i + 1}. ${err.text.substring(0, 150)}`));
    }
    console.log('='.repeat(60));

    // Fail test if there are critical errors (excluding known React hydration issues)
    const criticalErrors = errors.filter(e =>
      !e.text.includes('hydration') &&
      !e.text.includes('caret-color') &&
      !e.text.includes('React DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('check API endpoint responses', async ({ page }) => {
    const apiErrors: { url: string; status: number }[] = [];

    page.on('response', (res) => {
      if (res.url().includes('/api/') && res.status() >= 400) {
        apiErrors.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto('/video-call');
    await page.getByLabel('Room Name').fill('api-test-room');
    await page.getByRole('button', { name: 'Join Room' }).click();

    await page.waitForTimeout(5000);

    console.log(`\n📡 API Errors: ${apiErrors.length}`);
    apiErrors.forEach(e => console.log(`   - ${e.status}: ${e.url}`));

    expect(apiErrors).toHaveLength(0);
  });
});
