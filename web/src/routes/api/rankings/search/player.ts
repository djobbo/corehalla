import { createFileRoute } from "@tanstack/react-router"
import { Effect } from "effect"
import { Database } from "@/effect/Database"
import { runDatabase } from "@/effect/run"

/** Server route replacing `pages/api/rankings/search/player.ts`. */
export const Route = createFileRoute("/api/rankings/search/player")({
    server: {
        handlers: {
            async GET({ request }) {
                const url = new URL(request.url)
                const search = url.searchParams.get("search")
                const page = parseInt(url.searchParams.get("page") ?? "1")

                if (!search) {
                    return Response.json(
                        { error: "Bad request" },
                        { status: 403 },
                    )
                }

                try {
                    const aliases = await runDatabase(
                        Effect.gen(function* () {
                            const db = yield* Database

                            return yield* db.searchExactAliases(search, page)
                        }),
                    )

                    return Response.json(aliases, {
                        headers: {
                            "Cache-Control":
                                "public, s-maxage=600, stale-while-revalidate=3600",
                        },
                    })
                } catch {
                    return Response.json(
                        { error: "something went wrong" },
                        { status: 500 },
                    )
                }
            },
        },
    },
})
