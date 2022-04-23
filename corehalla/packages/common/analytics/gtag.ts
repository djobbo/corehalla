/**
 * Google Analytics Identifier
 */
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

/**
 * Google Adsense Identifier
 */
export const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID

/**
 * Google Adsense Publisher Identifier
 * ca-pub-[publisher-id]
 */
export const adsenseCaPub = `ca-pub-${ADSENSE_ID}`

/**
 * Google Analytics pageview tracking
 * @link https://developers.google.com/analytics/devguides/collection/gtagjs/pages
 * @param url page url
 */
export const gaPageview = (url: string) => {
    // @ts-expect-error window.gtag is not defined
    window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
    })
}

type GAEvent = {
    action: string
    category: string
    label: string
    value?: number
}

/**
 * Google Analytics event tracking
 * @link https://developers.google.com/analytics/devguides/collection/gtagjs/events
 */
export const gaEvent = ({ action, category, label, value }: GAEvent) => {
    // @ts-expect-error window.gtag is not defined
    window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value,
    })
}
