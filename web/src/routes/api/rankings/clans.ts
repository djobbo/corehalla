import { createFileRoute } from "@tanstack/react-router"
import { CLANS_RANKINGS_PER_PAGE } from "@util/constants"
import { supabaseService } from "db/supabase/service"
/** Server route replacing `pages/api/rankings/clans.ts`. */
export const Route = createFileRoute("/api/rankings/clans")({
    server: {
        handlers: {
            async GET({ request }) {
                const url = new URL(request.url)
                const name = url.searchParams.get("name") ?? ""
                const page = url.searchParams.get("page") ?? "1"

                try {
                    let query = supabaseService
                        .from("BHClan")
                        .select("*")
                        .order("xp", { ascending: false })

                    if (name) {
                        query = query.match({ name })
                    }

                    const pageNum = parseInt(page)

                    const { data, error } = await query.range(
                        (pageNum - 1) * CLANS_RANKINGS_PER_PAGE,
                        pageNum * CLANS_RANKINGS_PER_PAGE - 1,
                    )

                    if (error) throw error

                    return Response.json(data ?? [], {
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
