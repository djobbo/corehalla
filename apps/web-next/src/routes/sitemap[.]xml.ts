import { createFileRoute } from "@tanstack/react-router"
import { envValue } from "@/env"
import { renderSitemap, sitemapPaths } from "@/lib/sitemap"

const siteOrigin = async (request: Request): Promise<string> =>
    (await envValue("SITE_URL")) ??
    (import.meta.env.VITE_SITE_URL as string | undefined) ??
    new URL(request.url).origin

export const Route = createFileRoute("/sitemap.xml")({
    server: {
        handlers: {
            async GET({ request }) {
                return new Response(
                    renderSitemap(await siteOrigin(request), sitemapPaths()),
                    {
                        headers: {
                            "content-type": "application/xml; charset=utf-8",
                            "cache-control":
                                "public, s-maxage=3600, stale-while-revalidate=7200",
                        },
                    },
                )
            },
        },
    },
})
