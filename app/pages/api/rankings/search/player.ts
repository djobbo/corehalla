import { PLAYERS_PER_PAGE } from "@util/constants"
import { supabaseService } from "db/supabase/service"
import type { BHPlayerAlias } from "db/generated/client"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=600, stale-while-revalidate=3600",
    )

    const { search, page = "1" } = req.query

    if (!search) {
        return res.status(403).json({ error: "Bad request" })
    }

    try {
        let query = supabaseService
            .from<BHPlayerAlias>("BHPlayerAlias")
            .select("*")
            .order("alias", { ascending: true })

        if (search) {
            query = query.match({ alias: search })
        }

        const pageNum = parseInt(page as string)

        const { data, error } = await query.range(
            (pageNum - 1) * PLAYERS_PER_PAGE,
            pageNum * PLAYERS_PER_PAGE - 1,
        )

        if (error) throw error

        //TODO: fetch all aliases used by players

        res.status(200).json(data ?? [])
    } catch (error) {
        res.status(500).json({ error: "something went wrong" })
    }
}

export default handler
