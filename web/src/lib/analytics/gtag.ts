/// <reference types="vite/client" />

/**
 * Client analytics identifiers.
 *
 * The Next.js app read `process.env.NEXT_PUBLIC_*` at module scope. Vite only
 * exposes explicitly allowed prefixes, so `vite.config.ts` opts into both
 * `VITE_` and the existing `NEXT_PUBLIC_` prefix. This keeps the deployed
 * environment variable names unchanged while keeping the values out of any
 * server bundle.
 */
export const GA_TRACKING_ID =
    import.meta.env.VITE_GA_TRACKING_ID ??
    import.meta.env.NEXT_PUBLIC_GA_TRACKING_ID ??
    ""

export const ADSENSE_ID =
    import.meta.env.VITE_ADSENSE_ID ??
    import.meta.env.NEXT_PUBLIC_ADSENSE_ID ??
    ""

export const adsenseCaPub = `ca-pub-${ADSENSE_ID}`

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void
        adsbygoogle?: { [key: string]: unknown }[]
        dataLayer?: unknown[]
    }
}

export const gaPageview = (url: string) => {
    if (!GA_TRACKING_ID) return
    window.gtag?.("config", GA_TRACKING_ID, { page_path: url })
}

type GAEvent = {
    action: string
    category: string
    label: string
    value?: number
}

export const gaEvent = ({ action, category, label, value }: GAEvent) => {
    if (!GA_TRACKING_ID) return
    window.gtag?.("event", action, {
        event_category: category,
        event_label: label,
        value,
    })
}
