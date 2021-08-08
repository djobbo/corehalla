import chromium from 'chrome-aws-lambda'
import type { NextApiRequest, NextApiResponse } from 'next'
import { chromium as playwrightChromium } from 'playwright-core'

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const execPath = await chromium.executablePath

    // https://github.com/alixaxel/chrome-aws-lambda/wiki/HOWTO:-Local-Development
    if (process.env.NODE_ENV !== 'production') process.env.AWS_LAMBDA_FUNCTION_NAME = 'TEST_FUNCTION'

    const browser = await playwrightChromium.launch({
        args: chromium.args,
        executablePath: execPath,
        headless: chromium.headless,
    })

    const page = await browser.newPage({
        viewport: {
            width: 1200,
            height: 630,
        },
    })

    const relativeUrl = (req.query['path'] as string) || '/'
    const url = (process.env.NODE_ENV === 'production' ? 'https://' : 'http://') + req.headers.host + relativeUrl

    console.log({ url })

    await page.goto(url, { timeout: 15 * 1000 })

    const data = await page.screenshot({
        type: 'png',
    })

    await browser.close()

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.setHeader('Content-Type', 'image/png')

    res.end(data)
}
