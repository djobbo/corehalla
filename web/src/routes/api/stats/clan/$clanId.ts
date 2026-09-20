import { createFileRoute } from "@tanstack/react-router"
import { getClan } from "bhapi"

/** Server route replacing `pages/api/stats/clan/[clanId].ts`. */
export const Route = createFileRoute("/api/stats/clan/$clanId")({
    server: {
        handlers: {
            GET: async ({ params }) => {
                try {
                    const data = await getClan(parseInt(params.clanId))

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
