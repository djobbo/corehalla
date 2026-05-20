declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
    }
}

/**
 * Google Analytics Identifier
 */
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID
/**
 * Google Adsense Identifier
 */
export const ADSENSE_ID = import.meta.env.VITE_ADSENSE_ID

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
    if (typeof window === "undefined" || !GA_TRACKING_ID) return
    const gtag = window.gtag
    if (typeof gtag !== "function") return
    gtag("config", GA_TRACKING_ID, {
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
    if (typeof window === "undefined" || !GA_TRACKING_ID) return
    const gtag = window.gtag
    if (typeof gtag !== "function") return
    gtag("event", action, {
        event_category: category,
        event_label: label,
        value,
    })
}
