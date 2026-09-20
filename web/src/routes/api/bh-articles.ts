import { createFileRoute } from "@tanstack/react-router"
import { parseBHArticlesPage } from "web-parser/bh-articles/parseBHArticlesPage"
import type { BHArticleType } from "web-parser/bh-articles/parseBHArticlesPage"

/**
 * Server route replacing `pages/api/bh-articles.ts`.
 *
 * Server routes are for HTTP endpoints called from outside the Start app; the
 * in-app equivalent is the `getBHArticles` server function.
 */
export const Route = createFileRoute("/api/bh-articles")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const url = new URL(request.url)
                const page = url.searchParams.get("page") ?? "1"
                const type = url.searchParams.get("type") ?? "patch-notes"
                const max = url.searchParams.get("max")

                try {
                    const articles = await parseBHArticlesPage(
                        parseInt(page),
                        type as BHArticleType,
                    )

                    const headers = {
                        "Cache-Control":
                            "public, s-maxage=3600, stale-while-revalidate=7200",
                    }

                    if (max) {
                        return Response.json(
                            articles.slice(0, parseInt(max)),
                            { headers },
                        )
                    }

                    return Response.json(articles, { headers })
                } catch {
                    return Response.json(
                        { error: "Page not found" },
                        { status: 404 },
                    )
                }
            },
        },
    },
})
