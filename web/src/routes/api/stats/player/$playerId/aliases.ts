import { createFileRoute } from "@tanstack/react-router"
import { Effect } from "effect"
import { Database } from "@/effect/Database"
import { runDatabase } from "@/effect/run"

/** Server route replacing `pages/api/stats/player/[playerId]/aliases.ts`. */
export const Route = createFileRoute("/api/stats/player/$playerId/aliases")({
    server: {
        handlers: {
            async GET({ params }) {
                try {
                    const aliases = await runDatabase(
                        Effect.gen(function* () {
                            const db = yield* Database

                            return yield* db.getPlayerAliases(params.playerId)
                        }),
                    )

                    return Response.json(aliases, {
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
