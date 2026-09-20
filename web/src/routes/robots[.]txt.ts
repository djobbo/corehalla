import { createFileRoute } from "@tanstack/react-router"

/**
 * Server route that replaces the `next-sitemap` generated `robots.txt`.
 *
 * Private, personalized pages are disallowed so they never get crawled even
 * though they are also marked `noindex`.
 */
function getSiteUrl() {
    return (process.env.SITE_URL ?? "https://dev.corehalla.com").replace(
        /\/$/,
        "",
    )
}

export const Route = createFileRoute("/robots.txt")({
    server: {
        handlers: {
            GET: () => {
                const siteUrl = getSiteUrl()

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
