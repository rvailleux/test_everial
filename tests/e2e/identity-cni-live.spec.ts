/**
 * Live E2E test — Identity CNI module, end-to-end in a real browser.
 *
 * Strategy: the video capture flow requires a live camera, so we inject
 * the CNI test fixture directly into the React snapshot state via fiber
 * walking, then trigger the normal "Process" button click.
 *
 * Requires: dev server running at https://localhost:5172
 *           .env.local with valid WIZIDEE credentials
 *
 * Run: npx playwright test identity-cni-live --project=chromium
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const FIXTURE = path.resolve(__dirname, '../data_files/cni.png');
const SCREENSHOTS = path.resolve(__dirname, 'screenshots');

test.describe('Identity CNI — live extraction', () => {
  test('extracts identity fields from cni.png and renders them on screen', async ({ page }) => {
    // ── 1. Convert fixture to JPEG (WIZIDEE rejects PNG) ─────────────────────
    const jpegBuffer = await sharp(FIXTURE).jpeg({ quality: 95 }).toBuffer();
    const base64 = jpegBuffer.toString('base64');

    // ── 2. Navigate and join a room ──────────────────────────────────────────
    await page.goto('/video-call');
    await expect(page.getByRole('heading', { name: 'Video Call' })).toBeVisible();

    await page.getByLabel('Room Name').fill('e2e-cni-test');
    await page.getByRole('button', { name: 'Join Room' }).click();

    // Wait for the kernel UI (module selector) to appear
    await expect(page.getByText('Select Module')).toBeVisible();

    // ── 3. Select Identity CNI module ────────────────────────────────────────
    await page.locator('[data-testid="module-identity-cni"]').click();
    await expect(page.locator('[data-testid="module-identity-cni"]')).toHaveAttribute('aria-pressed', 'true');

    // ── 4. Inject the JPEG as the snapshot via React fiber walking ───────────
    // We walk up from the process button's fiber to find VideoCallKernel:
    //   hook[0] = roomName (string)
    //   hook[1] = hasJoined (true after join)
    //   hook[2] = snapshot (null → we set this)
    //   hook[3] = snapshotUrl (null → we set this)
    const injected = await page.evaluate(async (b64: string) => {
      // Build a Blob from the base64 JPEG
      const byteChars = atob(b64);
      const bytes = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      // Walk React fibers from the process button up to VideoCallKernel
      const btn = document.querySelector('[data-testid="process-button"]');
      if (!btn) return 'process-button not found';

      const fiberKey = Object.keys(btn).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return 'no react fiber on process-button';

      let fiber = (btn as any)[fiberKey];
      while (fiber) {
        const headState = fiber.memoizedState;
        if (headState) {
          // Collect the first 5 state-hook slots (skip non-queue entries like useRef)
          const hooks: { value: unknown; dispatch: Function }[] = [];
          let s = headState;
          while (s && hooks.length < 6) {
            if (s.queue?.dispatch) hooks.push({ value: s.memoizedState, dispatch: s.queue.dispatch });
            s = s.next;
          }
          // Signature: roomName=string, hasJoined=true, snapshot=null, snapshotUrl=null
          if (
            hooks.length >= 4 &&
            typeof hooks[0]?.value === 'string' &&
            hooks[1]?.value === true &&
            hooks[2]?.value === null &&
            hooks[3]?.value === null
          ) {
            hooks[2].dispatch(blob);   // setSnapshot(blob)
            hooks[3].dispatch(url);    // setSnapshotUrl(url)
            return 'ok';
          }
        }
        fiber = fiber.return;
      }
      return 'VideoCallKernel fiber not found';
    }, base64);

    expect(injected).toBe('ok');

    // ── 5. Process button should now be enabled ──────────────────────────────
    const processBtn = page.locator('[data-testid="process-button"]');
    await expect(processBtn).toBeEnabled({ timeout: 3000 });

    // Take screenshot before processing
    await page.screenshot({ path: path.join(SCREENSHOTS, 'cni-before-process.png'), fullPage: true });

    // ── 6. Click Process and wait for result ─────────────────────────────────
    await processBtn.click();

    // Wait for the result card to appear (up to 30s for the real API)
    await expect(page.locator('.identity-result')).toBeVisible({ timeout: 30_000 });

    // ── 7. Assert extracted fields ───────────────────────────────────────────
    // Surname — full name from MRZ fallback
    await expect(page.locator('.identity-result')).toContainText('VAILLEUX');

    // First name
    await expect(page.locator('.identity-result')).toContainText('ROMAIN');
    await expect(page.locator('.identity-result')).toContainText('MATTHIEU');

    // Date of birth
    await expect(page.locator('.identity-result')).toContainText('1986');

    // Document number
    await expect(page.locator('.identity-result')).toContainText('140493102878');

    // ── 8. Screenshot of final result ────────────────────────────────────────
    await page.screenshot({ path: path.join(SCREENSHOTS, 'cni-result.png'), fullPage: true });
    console.log('Screenshot saved to tests/e2e/screenshots/cni-result.png');
  });
});
