import puppeteer, { Page, Browser } from 'puppeteer';

const url = 'https://www.google.com';

(async () => {
    const browser: Browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: false,
    });
    const page: Page = await browser.newPage();

    page.setDefaultNavigationTimeout(0);

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle0'] });

        const buffer: Buffer | string | void = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width: 1024, height: 800 },
            path: './screenshot.png'
        });

        return buffer;
    } catch (error: any) {
        console.error('Unable to screenshot page', error);

        return;
    }
    finally {
        console.info('finally closing');

        await page.close();
        await browser.close();
    }
})();
