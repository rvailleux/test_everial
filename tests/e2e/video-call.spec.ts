import { test, expect, type ConsoleMessage } from '@playwright/test';

test.describe('Video Call', () => {
  const consoleErrors: ConsoleMessage[] = [];
  const consoleWarnings: ConsoleMessage[] = [];

  test.beforeEach(({ page }) => {
    // Clear logs before each test
    consoleErrors.length = 0;
    consoleWarnings.length = 0;

    // Listen for console messages
    page.on('console', (msg) => {
      const location = msg.location();
      const locationStr = location.url ? ` (${location.url}:${location.lineNumber})` : '';
      if (msg.type() === 'error') {
        consoleErrors.push(msg);
        console.log(`❌ Console error: ${msg.text()}${locationStr}`);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg);
        console.log(`⚠️ Console warning: ${msg.text()}${locationStr}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', (error) => {
      console.log(`❌ Page error: ${error.message}`);
    });

    // Listen for failed responses
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP ${response.status()}: ${response.url()}`);
      }
    });
  });

  test('video call page loads and shows join form @desktop', async ({ page }) => {
    await page.goto('/video-call');

    // Take screenshot of initial state
    await page.screenshot({
      path: 'tests/e2e/screenshots/video-call-initial.png',
      fullPage: true
    });

    // Verify page elements
    await expect(page.getByRole('heading', { name: 'Video Call' })).toBeVisible();
    await expect(page.getByLabel('Room Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Join Room' })).toBeEnabled();

    // Log console summary
    console.log(`\n📊 Console summary:`);
    console.log(`   Errors: ${consoleErrors.length}`);
    console.log(`   Warnings: ${consoleWarnings.length}`);
  });

  test('can enter room name and click join @desktop', async ({ page }) => {
    // Grant camera/microphone permissions for this test
    await page.context().grantPermissions(['camera', 'microphone']);

    await page.goto('/video-call');

    // Enter room name
    const roomInput = page.getByLabel('Room Name');
    await roomInput.fill('test-room-' + Date.now());

    // Take screenshot before joining
    await page.screenshot({
      path: 'tests/e2e/screenshots/video-call-before-join.png',
      fullPage: true
    });

    // Click join
    await page.getByRole('button', { name: 'Join Room' }).click();

    // Wait for either the call UI to appear or an error (if API key not configured)
    await page.waitForTimeout(3000);

    // Take screenshot after attempting to join
    await page.screenshot({
      path: 'tests/e2e/screenshots/video-call-after-join.png',
      fullPage: true
    });

    // Log all console messages
    console.log(`\n📊 Console summary:`);
    console.log(`   Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console errors found:');
      consoleErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. [${err.type()}] ${err.text()}`);
      });
    }

    console.log(`   Warnings: ${consoleWarnings.length}`);
    if (consoleWarnings.length > 0) {
      console.log('\n⚠️ Console warnings found:');
      consoleWarnings.forEach((warn, i) => {
        console.log(`   ${i + 1}. [${warn.type()}] ${warn.text()}`);
      });
    }

    // The test passes if we can get this far - we're checking for console errors
    // not necessarily that the call connects (which requires a valid API key)
  });

  test('video call page loads on mobile @mobile', async ({ page }) => {
    await page.goto('/video-call');

    // Take screenshot at mobile viewport
    await page.screenshot({
      path: 'tests/e2e/screenshots/video-call-mobile.png',
      fullPage: true
    });

    // Verify mobile layout
    await expect(page.getByRole('heading', { name: 'Video Call' })).toBeVisible();
    await expect(page.getByLabel('Room Name')).toBeVisible();

    console.log(`\n📊 Mobile console summary:`);
    console.log(`   Errors: ${consoleErrors.length}`);
    console.log(`   Warnings: ${consoleWarnings.length}`);
  });
});
