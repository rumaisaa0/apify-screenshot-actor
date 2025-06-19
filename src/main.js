import { Actor } from 'apify';
import { chromium } from 'playwright';

await Actor.main(async () => {
    const input = await Actor.getInput();
    const urls = input.urls || [];

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    for (const url of urls) {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(4000); // Wait for spreadsheet to fully load

        // Clip only the top part of the page (simulating top 4 rows)
        const screenshot = await page.screenshot({
            path: `top4rows-${Date.now()}.png`,
            clip: {
                x: 0,
                y: 0,
                width: 1920,
                height: 600 // approx height of top 4 rows
            }
        });

        await Actor.pushData({
            url,
            screenshot: screenshot.toString('base64'),
        });
    }

    await browser.close();
});