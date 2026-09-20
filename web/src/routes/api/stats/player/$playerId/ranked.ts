import { createFileRoute } from "@tanstack/react-router"
import { getPlayerRanked } from "bhapi"

/** Server route replacing `pages/api/stats/player/[playerId]/ranked.ts`. */
export const Route = createFileRoute("/api/stats/player/$playerId/ranked")({
    server: {
        handlers: {
            GET: async ({ params }) => {
                try {
                    const data = await getPlayerRanked(parseInt(params.playerId))

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
