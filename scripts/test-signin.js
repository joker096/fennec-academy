import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 540, height: 960 });

console.log('Opening app...');
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);

console.log('Looking for sign in button...');
try {
  const button = page.locator('button:has-text("Sign in with Google")').first();
  if (await button.isVisible()) {
    console.log('Found button, clicking...');
    await button.click();
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log('Current URL:', url);

    const content = await page.content();
    console.log('Has Google iframe:', content.includes('accounts.google.com'));
  }
} catch (e) {
  console.log('Error:', e.message);
}

await browser.close();
console.log('Done');