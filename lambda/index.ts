import { Context } from 'aws-lambda/handler';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { Logger } from '@aws-lambda-powertools/logger';
import chromium from '@sparticuz/chromium';
import { launch, Browser, Page } from 'puppeteer-core';
import { persistentLogAttributes } from './config';

const logger = new Logger({ persistentLogAttributes });

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> {
  logger.addContext(context);
  logger.info('Event', { event });
  const { requestContext } = event;
  const pageUrl = event.queryStringParameters?.pageUrl;
  if (!pageUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing pageUrl parameter" }),
    };
  }
  if (!/^https?:\/\//i.test(pageUrl)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid URL format. URL must start with http:// or https://" }),
    };
  }

  const browser: Browser = await launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });

  const page: Page = await browser.newPage();

  page.setDefaultNavigationTimeout(0);

  try {
    await page.goto(pageUrl, { waitUntil: ['domcontentloaded', 'networkidle0'] });
    
    // Execute code in the context of the browser to fetch candidates of RSS feed URL
		const rssElements = await page.evaluate(() => {
			// すべての要素を取得
			const allElements: NodeListOf<Element> = document.querySelectorAll('*');

			// rssを含む要素をフィルタリング
			const rssElements: Element[] = Array.from(allElements).filter(el => {
				const typeAttr: string | null = el.getAttribute('type');
				const hrefAttr: string | null = el.getAttribute('href');
				const srcAttr: string | null = el.getAttribute('src');
				
				return (typeAttr && typeAttr.includes('rss')) || 
					(hrefAttr && hrefAttr.includes('rss')) || 
					(srcAttr && srcAttr.includes('rss'));
			});

			console.log(rssElements);
			return rssElements.map(el => el.outerHTML); // Return the outer HTML of the elements
		});

    // Get only text other than html tags
    const innerText = await page.evaluate(() => {
      return document.body.innerText;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        pageUrl,
        innerText,
        rssElements,
      }),
    };
  } catch (error: any) {
    logger.error('Unable to crawl the page', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ id: requestContext.requestId, message: 'Unable to process' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
  finally {
    logger.info('finally closing');

    await page.close();
    await browser.close();
  }
};
