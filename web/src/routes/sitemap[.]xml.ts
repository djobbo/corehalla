import { createFileRoute } from "@tanstack/react-router"

/**
 * Server route that replaces the `next-sitemap` generated `sitemap.xml`.
 *
 * Only public, canonical, indexable pages are listed. User-specific pages
 * (`/@me/favorites`) and search/paginated result pages are intentionally
 * omitted because they are marked `noindex` or are not canonical content.
 */
const PUBLIC_PATHS = [
    "/",
    "/calc",
    "/rankings/1v1",
    "/rankings/2v2",
    "/rankings/clans",
    "/rankings/global",
    "/rankings/power/1v1",
    "/rankings/power/2v2",
] as const

function getSiteUrl() {
    return (process.env.SITE_URL ?? "https://dev.corehalla.com").replace(
        /\/$/,
        "",
    )
}

export const Route = createFileRoute("/sitemap.xml")({
    server: {
        handlers: {
            GET() {
                const siteUrl = getSiteUrl()
                const urls = PUBLIC_PATHS.map(
                    (path) =>
                        `<url><loc>${siteUrl}${path}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
                ).join("")

                const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

                return new Response(sitemap, {
                    headers: {
                        "Content-Type": "application/xml",
                        "Cache-Control":
                            "public, s-maxage=3600, stale-while-revalidate=7200",
                    },
                })
            },
        },
    },
})
