import { createFileRoute } from "@tanstack/react-router"
import { parsePowerRankingsPage } from "web-parser/power-rankings/parsePowerRankingsPage"
import type { Bracket } from "bhapi/types"

/** Server route replacing `pages/api/rankings/power.ts`. */
export const Route = createFileRoute("/api/rankings/power")({
    server: {
        handlers: {
            async GET({ request }) {
                const url = new URL(request.url)
                const bracket = url.searchParams.get("bracket") as Bracket
                const region = url.searchParams.get("region") as
                    | "us-e"
                    | "eu"
                    | "sea"
                    | "brz"
                    | "aus"

                try {
                    const data = await parsePowerRankingsPage(bracket, region)

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
