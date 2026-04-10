/**
 * Visual Verification Test for /video-call Page (K2)
 *
 * Uses Playwright (which uses CDP under the hood) to verify
 * the /video-call page renders correctly at multiple viewports.
 */

import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

test.describe('Video Call Page Visual Verification', () => {
  for (const viewport of VIEWPORTS) {
    test(`renders correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to video-call page (use http://localhost:3000 since production server runs there)
      await page.goto('http://localhost:3000/video-call');

      // Wait for the page to load
      await page.waitForLoadState('domcontentloaded');

      // Verify page title/heading
      await expect(page.getByRole('heading', { name: /video call/i })).toBeVisible();

      // Verify room entry form is present (initial state)
      await expect(page.getByRole('button', { name: /join room/i })).toBeVisible();

      // Capture screenshot
      await page.screenshot({
        path: `test-results/visual/video-call/video-call-${viewport.name}.png`,
        fullPage: true,
      });

      console.log(`✓ Screenshot captured for ${viewport.name}`);
    });
  }

  test('joins room and shows kernel UI', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to video-call page
    await page.goto('http://localhost:3000/video-call');
    await page.waitForLoadState('domcontentloaded');

    // Enter room name
    await page.getByLabel('Room Name').fill('test-room-123');

    // Click join button
    await page.getByRole('button', { name: /join room/i }).click();

    // Verify we're in the room
    await expect(page.getByText('Room: test-room-123')).toBeVisible();

    // Verify kernel UI elements
    await expect(page.getByTestId('capture-button')).toBeVisible();
    await expect(page.getByTestId('process-button')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Modules' })).toBeVisible();

    // Capture screenshot of kernel UI
    await page.screenshot({
      path: 'test-results/visual/video-call/video-call-kernel.png',
      fullPage: true,
    });

    console.log('✓ Kernel UI screenshot captured');
  });
});
