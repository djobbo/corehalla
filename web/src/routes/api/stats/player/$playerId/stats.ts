import { createFileRoute } from "@tanstack/react-router"
import { getPlayerStats } from "bhapi"

/** Server route replacing `pages/api/stats/player/[playerId]/stats.ts`. */
export const Route = createFileRoute("/api/stats/player/$playerId/stats")({
    server: {
        handlers: {
            async GET({ params }) {
                try {
                    const data = await getPlayerStats(parseInt(params.playerId))

                    return Response.json(data, {
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
