import { createFileRoute } from "@tanstack/react-router"
import { supabaseService } from "db/supabase/service"
import type { BHPlayerAlias } from "db/generated/client"

/** Server route replacing `pages/api/stats/player/[playerId]/aliases.ts`. */
export const Route = createFileRoute("/api/stats/player/$playerId/aliases")({
    server: {
        handlers: {
            GET: async ({ params }) => {
                try {
                    const { data, error } = await supabaseService
                        .from<BHPlayerAlias>("BHPlayerAlias")
                        .select("*")
                        .match({ playerId: params.playerId })

                    if (error) throw error

                    return Response.json(data.map((alias) => alias.alias), {
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
