/// <reference types="vite/client" />

/**
 * Cloudflare Web Analytics beacon.
 *
 * Cookieless, and measured at Cloudflare's edge as well as by this beacon, so it
 * keeps working for visitors who block ad/analytics scripts. It is the
 * consent-free complement to GA4: use it for pageview/traffic numbers and treat
 * gtag as the optional, consent-dependent layer.
 *
 * Two ways to install it, and only one is needed:
 *
 * 1. Automatic (preferred). While `corehalla.com` is proxied through Cloudflare,
 *    the dashboard injects the beacon for you — Web Analytics → Add a site →
 *    pick the hostname. Nothing here is required, and `VITE_CF_BEACON_TOKEN`
 *    stays empty. (Automatic injection is skipped for pages served with
 *    `Cache-Control: public, no-transform`.)
 * 2. Manual (fallback). Enable "JS Snippet installation" for the site in the
 *    dashboard, then copy the token from the snippet into
 *    `VITE_CF_BEACON_TOKEN`. This is what dev/self-hosted deployments use, so
 *    the beacon is not silently absent when automatic injection does not apply.
 *
 * The endpoint is derived from the token alone, so this file has no other
 * configuration. Note that only one beacon may run per page: do not set the
 * token *and* leave automatic injection on.
 */
export const CF_BEACON_TOKEN = (
    import.meta.env.VITE_CF_BEACON_TOKEN ?? ""
).trim()

/**
 * The beacon loader. Unlike the GA/AdSense loader this renders a single script:
 * the beacon reads its token from the query string and there is no inline init.
 *
 * `type="module"` is required by Cloudflare (it keeps the beacon out of
 * deprecated browsers); `async` keeps it off the critical path.
 */
export const CFBeacon = () =>
    CF_BEACON_TOKEN ? (
        <script
            async
            type="module"
            src={`https://static.cloudflareinsights.com/beacon.min.js?token=${CF_BEACON_TOKEN}`}
        />
    ) : null
