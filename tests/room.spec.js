import { test, expect } from '@playwright/test';

test('create room and check UI', async ({ page }) => {
    // Go to home page
    await page.goto('http://localhost:5173');

    // Click Create Room
    await page.click('text=Create Room');

    // Wait for navigation
    await page.waitForURL(/\/room\//);

    // Check if Room ID is displayed
    await expect(page.locator('text=Room ID:')).toBeVisible();

    // Check if Start Screen Share button is visible (Host view)
    // This verifies that isHost became true
    await expect(page.locator('text=Start Screen Share')).toBeVisible({ timeout: 10000 });

    // Check status
    await expect(page.locator('.status-badge')).toContainText(/Waiting for guest|Guest connected/);
});

test('guest join flow', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    // Host creates room
    await hostPage.goto('http://localhost:5173');
    await hostPage.click('text=Create Room');
    await hostPage.waitForURL(/\/room\//);
    const url = hostPage.url();
    const roomId = url.split('/').pop();

    // Guest joins room
    await guestPage.goto(url);

    // Verify Guest sees "Waiting for host"
    await expect(guestPage.locator('text=Waiting for host to share screen...')).toBeVisible();

    // Verify Host sees "Guest connected" (might take a moment for P2P)
    // Note: P2P might fail in some CI environments or if ICE fails, but locally it should work.
    // We'll give it a generous timeout.
    await expect(hostPage.locator('.status-badge')).toContainText('Guest connected', { timeout: 15000 });
    await expect(guestPage.locator('.status-badge')).toContainText('Connected to Host', { timeout: 15000 });

    await hostContext.close();
    await guestContext.close();
});
