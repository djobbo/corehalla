import { createFileRoute } from "@tanstack/react-router"
import { envValue } from "@/env"
import { renderRobots } from "@/lib/sitemap"

const siteOrigin = async (request: Request): Promise<string> =>
    (await envValue("SITE_URL")) ??
    (import.meta.env.VITE_SITE_URL as string | undefined) ??
    new URL(request.url).origin

export const Route = createFileRoute("/robots.txt")({
    server: {
        handlers: {
            async GET({ request }) {
                return new Response(renderRobots(await siteOrigin(request)), {
                    headers: {
                        "content-type": "text/plain; charset=utf-8",
                    },
                })
            },
        },
    },
})
