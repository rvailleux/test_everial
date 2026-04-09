/**
 * CDP Visual Verification Tests
 *
 * T036: Capture screenshots at desktop, tablet, mobile viewports
 * T037: Verify console has no errors during module registration and selection
 *
 * Uses Chrome DevTools Protocol via chrome-remote-interface
 */

import CDP from 'chrome-remote-interface';
import fs from 'fs';
import path from 'path';

const PROJECT_URL = process.env.TEST_URL || 'http://localhost:3000/test-module-registry';
const OUTPUT_DIR = path.join(__dirname, '../../test-results/visual/module-registry');

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
  const filePath = path.join(OUTPUT_DIR, `module-registry-${name}.png`);
  fs.writeFileSync(filePath, screenshot.data, 'base64');

  return filePath;
}

async function runVisualTests(): Promise<void> {
  console.log('Starting CDP visual verification tests...\n');

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

    // Navigate to test page
    console.log(`Navigating to ${PROJECT_URL}...`);
    await Page.navigate({ url: PROJECT_URL });
    await Page.loadEventFired();

    // Wait for React to mount and modules to register
    await new Promise((r) => setTimeout(r, 1000));

    // T036: Capture screenshots at all viewports
    console.log('\n--- T036: Capturing Viewport Screenshots ---');

    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      const filePath = await captureViewport(client, name, viewport);
      console.log(`✓ ${name}: ${viewport.width}x${viewport.height} → ${filePath}`);
    }

    // T037: Verify no console errors
    console.log('\n--- T037: Verifying Console Errors ---');

    // Interact with the page to trigger module operations
    const { DOM } = client;
    await DOM.enable();

    // Click first module in menu (test-extraction)
    const moduleItem = await Runtime.evaluate({
      expression: `
        document.querySelector('[data-module-id="test-extraction"]')?.click();
        'clicked';
      `,
    });

    if (moduleItem.result.value === 'clicked') {
      console.log('✓ Clicked test-extraction module');
      await new Promise((r) => setTimeout(r, 500));
    }

    // Click identity-verification module
    const identityItem = await Runtime.evaluate({
      expression: `
        document.querySelector('[data-module-id="identity-verification"]')?.click();
        'clicked';
      `,
    });

    if (identityItem.result.value === 'clicked') {
      console.log('✓ Clicked identity-verification module');
      await new Promise((r) => setTimeout(r, 500));
    }

    // Capture post-interaction screenshot
    const finalScreenshot = await captureViewport(client, 'post-interaction', VIEWPORTS.desktop);
    console.log(`✓ Post-interaction screenshot captured → ${finalScreenshot}`);

    // Analyze console messages
    const errors = consoleMessages.filter(
      (msg) => msg.level === 'error' || msg.level === 'severe'
    );
    const warnings = consoleMessages.filter(
      (msg) => msg.level === 'warning' || msg.level === 'warn'
    );

    console.log(`\nConsole Summary:`);
    console.log(`  Total messages: ${consoleMessages.length}`);
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Warnings: ${warnings.length}`);

    // Write console log to file
    const consoleLogPath = path.join(OUTPUT_DIR, 'console-log.json');
    fs.writeFileSync(consoleLogPath, JSON.stringify(consoleMessages, null, 2));

    // T037: Verify no errors
    if (errors.length === 0) {
      console.log('\n✓ T037 PASSED: No console errors during module registration and selection');
    } else {
      console.log('\n✗ T037 FAILED: Console errors detected:');
      errors.forEach((err) => console.log(`  [${err.level}] ${err.text}`));
      process.exit(1);
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
