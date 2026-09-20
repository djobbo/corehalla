import { createFileRoute, redirect } from "@tanstack/react-router"

const BRAWLHALLA_WIKI_URL = "https://brawlhalla.wiki.gg"

/**
 * Permanent redirect ported from `next.config.js` `redirects()`.
 * Next.js used `permanent: true`, which is HTTP 308.
 */
export const Route = createFileRoute("/wiki")({
    beforeLoad: () => {
        throw redirect({ href: BRAWLHALLA_WIKI_URL, statusCode: 308 })
    },
})
