import { createFileRoute } from "@tanstack/react-router"
import { siteUrl } from "@/effect/config"

/**
 * Server route that replaces the `next-sitemap` generated `robots.txt`.
 *
 * Private, personalized pages are disallowed so they never get crawled even
 * though they are also marked `noindex`.
 */
async function getSiteUrl() {
    return ((await siteUrl()) || "https://dev.corehalla.com").replace(/\/$/, "")
}

export const Route = createFileRoute("/robots.txt")({
    server: {
        handlers: {
            async GET() {
                const siteUrl = await getSiteUrl()

                const robots = `User-agent: *
Allow: /
Disallow: /@me/

Sitemap: ${siteUrl}/sitemap.xml`

                return new Response(robots, {
                    headers: { "Content-Type": "text/plain" },
                })
            },
        },
    },
})
