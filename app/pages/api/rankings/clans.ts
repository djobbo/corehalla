import { CLANS_PER_PAGE } from "@util/constants"
import { supabaseService } from "db/supabase/service"
import type { BHClan } from "db/generated/client"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=480, stale-while-revalidate=600",
    )

    const { name = "", page = "1" } = req.query

    try {
        let query = supabaseService
            .from<BHClan>("BHClan")
            .select("*")
            .order("xp", { ascending: false })

        if (name) {
            query = query.match({ name })
        }

        const pageNum = parseInt(page as string)

        const { data, error } = await query.range(
            (pageNum - 1) * CLANS_PER_PAGE,
            pageNum * CLANS_PER_PAGE - 1,
        )

        if (error) throw error

        res.status(200).json(data ?? [])
    } catch (error) {
        res.status(500).json({ error: "something went wrong" })
    }
}

export default handler
