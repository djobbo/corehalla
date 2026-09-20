import { createFileRoute } from "@tanstack/react-router"
import { SEARCH_PLAYERS_ALIASES_PER_PAGE } from "@util/constants"
import { supabaseService } from "db/supabase/service"
/** Server route replacing `pages/api/rankings/search/player.ts`. */
export const Route = createFileRoute("/api/rankings/search/player")({
    server: {
        handlers: {
            async GET({ request }) {
                const url = new URL(request.url)
                const search = url.searchParams.get("search")
                const page = url.searchParams.get("page") ?? "1"

                if (!search) {
                    return Response.json(
                        { error: "Bad request" },
                        { status: 403 },
                    )
                }

                try {
                    let query = supabaseService
                        .from("BHPlayerAlias")
                        .select("*")
                        .order("alias", { ascending: true })

                    query = query.match({ alias: search })

                    const pageNum = parseInt(page)

                    const { data, error } = await query.range(
                        (pageNum - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE,
                        pageNum * SEARCH_PLAYERS_ALIASES_PER_PAGE - 1,
                    )

                    if (error) throw error

                    return Response.json(data ?? [], {
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
