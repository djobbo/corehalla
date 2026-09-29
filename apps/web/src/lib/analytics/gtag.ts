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

/** True only when a publisher ID is configured; ad markup is skipped otherwise. */
export const adsenseEnabled = adsenseCaPub !== "ca-pub-"

/**
 * Ad unit IDs, one per placement.
 *
 * Each manual placement should be its own ad unit in AdSense so its revenue and
 * targeting can be tuned independently. They are read from the environment so a
 * unit can be swapped without a code change; the original profile-header unit is
 * the fallback, which keeps every placement functional until dedicated units
 * are created. A non-numeric value (e.g. a placeholder) falls back too, so a
 * half-filled `.env` never breaks rendering.
 */
const adsenseSlot = (value: string | undefined, fallback: string) => {
    const trimmed = value?.trim()
    return trimmed && /^\d+$/.test(trimmed) ? trimmed : fallback
}

/** Unit used before the per-placement variables existed. */
const LEGACY_ADSENSE_SLOT = "8570143014"

export const ADSENSE_SLOTS = {
    /** Overlays the static image at the top of player/clan profiles. */
    profileHeader: adsenseSlot(
        import.meta.env.VITE_ADSENSE_SLOT_PROFILE_HEADER,
        LEGACY_ADSENSE_SLOT,
    ),
    /** Below the tabs on a player profile / below the roster on a clan. */
    profileBottom: adsenseSlot(
        import.meta.env.VITE_ADSENSE_SLOT_PROFILE_BOTTOM,
        LEGACY_ADSENSE_SLOT,
    ),
    /** Middle card of the landing page "Latest News" column. */
    articles: adsenseSlot(
        import.meta.env.VITE_ADSENSE_SLOT_ARTICLES,
        LEGACY_ADSENSE_SLOT,
    ),
    /** Between the search bar and the rankings table (players + clans). */
    rankings: adsenseSlot(
        import.meta.env.VITE_ADSENSE_SLOT_RANKINGS,
        LEGACY_ADSENSE_SLOT,
    ),
    /** Below the landing page search bar, styled like the rankings one. */
    landingSearch: adsenseSlot(
        import.meta.env.VITE_ADSENSE_SLOT_LANDING,
        LEGACY_ADSENSE_SLOT,
    ),
} as const

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
