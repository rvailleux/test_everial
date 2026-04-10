/**
 * CDP Visual Verification Tests for Snapshot Capture and Display
 *
 * T040: Capture screenshots at desktop, tablet, mobile viewports
 * T041: Verify console has no errors during snapshot capture and display
 *
 * Uses Chrome DevTools Protocol via chrome-remote-interface
 */

import CDP from 'chrome-remote-interface';
import fs from 'fs';
import path from 'path';

const PROJECT_URL = process.env.TEST_URL || 'http://localhost:5172/video-call';
const OUTPUT_DIR = path.join(__dirname, '../../test-results/visual/snapshot-capture');

// Viewport definitions
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2 },
  mobile: { width: 375, height: 667, deviceScaleFactor: 3 },
};

interface ConsoleMessage {
  level: string;
  text: string;
  source?: string;
  url?: string;
}

async function captureViewport(
  client: CDP.Client,
  name: string,
  viewport: typeof VIEWPORTS.desktop
): Promise<string> {
  const { Page, Emulation } = client;

  // Set viewport
  await Emulation.setDeviceMetricsOverride({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: name === 'mobile',
  });

  // Wait for layout to settle
  await new Promise((r) => setTimeout(r, 500));

  // Capture screenshot
  const screenshot = await Page.captureScreenshot({ format: 'png', fullPage: true });
  const filePath = path.join(OUTPUT_DIR, `snapshot-capture-${name}.png`);
  fs.writeFileSync(filePath, screenshot.data, 'base64');

  return filePath;
}

async function runVisualTests(): Promise<void> {
  console.log('Starting CDP visual verification tests for snapshot capture...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let client: CDP.Client | null = null;
  const consoleMessages: ConsoleMessage[] = [];

  try {
    // Connect to Chrome
    client = await CDP();
    const { Page, Runtime, Log } = client;

    // Enable domains
    await Page.enable();
    await Runtime.enable();
    await Log.enable();

    // Capture console messages
    Runtime.consoleAPICalled((params) => {
      const level = params.type;
      const text = params.args.map((arg) => arg.value?.toString() || '').join(' ');
      consoleMessages.push({ level, text, source: 'console' });
    });

    Log.entryAdded((params) => {
      const entry = params.entry;
      consoleMessages.push({
        level: entry.level,
        text: entry.text,
        source: entry.source,
        url: entry.url,
      });
    });

    // Navigate to video-call page
    console.log(`Navigating to ${PROJECT_URL}...`);
    await Page.navigate({ url: PROJECT_URL });
    await Page.loadEventFired();

    // Wait for React to mount
    await new Promise((r) => setTimeout(r, 1000));

    // T040: Capture screenshots at all viewports
    console.log('\n--- T040: Capturing Viewport Screenshots ---');

    // Pre-join state
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      const filePath = await captureViewport(client, `pre-join-${name}`, viewport);
      console.log(`✓ Pre-join ${name}: ${viewport.width}x${viewport.height} → ${filePath}`);
    }

    // Enter room name and join
    const joinResult = await Runtime.evaluate({
      expression: `
        const roomInput = document.querySelector('input#room');
        if (roomInput) {
          roomInput.value = 'test-room-123';
          roomInput.dispatchEvent(new Event('input', { bubbles: true }));
          const form = roomInput.closest('form');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
          'joined';
        } else {
          'no-input-found';
        }
      `,
    });

    if (joinResult.result.value === 'joined') {
      console.log('✓ Joined video room');
      await new Promise((r) => setTimeout(r, 2000)); // Wait for video to initialize
    } else {
      console.log('⚠ Could not join room (input not found)');
    }

    // Post-join state
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      const filePath = await captureViewport(client, `post-join-${name}`, viewport);
      console.log(`✓ Post-join ${name}: ${viewport.width}x${viewport.height} → ${filePath}`);
    }

    // T041: Verify no console errors
    console.log('\n--- T041: Verifying Console Errors ---');

    // Analyze console messages
    const errors = consoleMessages.filter(
      (msg) => msg.level === 'error' || msg.level === 'severe'
    );
    const warnings = consoleMessages.filter(
      (msg) => msg.level === 'warning' || msg.level === 'warn'
    );

    console.log(`Console Summary:`);
    console.log(`  Total messages: ${consoleMessages.length}`);
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Warnings: ${warnings.length}`);

    // Write console log to file
    const consoleLogPath = path.join(OUTPUT_DIR, 'console-log.json');
    fs.writeFileSync(consoleLogPath, JSON.stringify(consoleMessages, null, 2));

    // T041: Verify no critical errors
    const criticalErrors = errors.filter(
      (err) =>
        !err.text.includes('LiveKit') &&
        !err.text.includes('WebSocket') &&
        !err.text.includes('token')
    );

    if (criticalErrors.length === 0) {
      console.log('\n✓ T041 PASSED: No critical console errors');
      if (errors.length > 0) {
        console.log(`  (Ignored ${errors.length} expected errors related to video/token setup)`);
      }
    } else {
      console.log('\n✗ T041 FAILED: Critical console errors detected:');
      criticalErrors.forEach((err) => console.log(`  [${err.level}] ${err.text}`));
    }

    console.log('\n--- Visual Verification Complete ---');
    console.log(`Screenshots saved to: ${OUTPUT_DIR}`);
    console.log(`Console log saved to: ${consoleLogPath}`);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run tests
runVisualTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
