import { createFileRoute } from "@tanstack/react-router"
import { Effect } from "effect"
import { Database } from "@/effect/Database"
import { runDatabase } from "@/effect/run"

/** Server route replacing `pages/api/rankings/clans.ts`. */
export const Route = createFileRoute("/api/rankings/clans")({
    server: {
        handlers: {
            async GET({ request }) {
                const url = new URL(request.url)
                const name = url.searchParams.get("name") ?? ""
                const page = parseInt(url.searchParams.get("page") ?? "1")

                try {
                    const clans = await runDatabase(
                        Effect.gen(function* () {
                            const db = yield* Database

                            return yield* db.getClansRankings(name, page)
                        }),
                    )

                    return Response.json(clans, {
                        headers: {
                            "Cache-Control":
                                "public, s-maxage=300, stale-while-revalidate=480",
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
