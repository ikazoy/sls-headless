import { Context } from 'aws-lambda/handler';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { Logger } from '@aws-lambda-powertools/logger';
import chromium from '@sparticuz/chromium';
import { launch, Browser, Page } from 'puppeteer-core';
import { persistentLogAttributes } from './config';

const logger = new Logger({ persistentLogAttributes });
const url = 'https://www.google.com';

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> {
  logger.addContext(context);
  logger.info('Event', { event });
  const { requestContext } = event;

  const browser: Browser = await launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });

  const page: Page = await browser.newPage();

  page.setDefaultNavigationTimeout(0);

  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

  try {
    await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle0'] });

    const buffer: Buffer | string | void = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1024, height: 800 },
      // fullPage: true,
      encoding: 'base64'
    });

    return {
      statusCode: 200,
      body: buffer.toString(),
      headers: {
        'Content-Type': 'image/png',
      },
      isBase64Encoded: true
    };
  } catch (error: any) {
    logger.error('Unable to screenshot page', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ id: requestContext.requestId, message: 'Unable to process' }),
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false
    };
  }
  finally {
    logger.info('finally closing');

    await page.close();
    await browser.close();
  }
};
