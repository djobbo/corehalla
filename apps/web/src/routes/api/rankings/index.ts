import { createFileRoute } from "@tanstack/react-router"
import { getRankings } from "@crh/bhapi"
import type { Bracket } from "@crh/bhapi/types"
import type { RankedRegion } from "@crh/bhapi/constants"

/** Server route replacing `pages/api/rankings/index.ts`. */
export const Route = createFileRoute("/api/rankings/")({
    server: {
        handlers: {
            async GET({ request }) {
                const url = new URL(request.url)
                const bracket = url.searchParams.get("bracket") as Bracket
                const region = url.searchParams.get("region") as RankedRegion
                const page = url.searchParams.get("page") as string
                const name = url.searchParams.get("name") as string

                try {
                    const data = await getRankings(bracket, region, page, name)
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
