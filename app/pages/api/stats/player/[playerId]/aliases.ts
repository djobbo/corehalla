import { supabaseService } from "db/supabase/service"
import type { BHPlayerAlias } from "db/generated/client"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=480",
    )

    const { playerId } = req.query

    try {
        const { data, error } = await supabaseService
            .from<BHPlayerAlias>("BHPlayerAlias")
            .select("*")
            .match({ playerId })

        if (error) throw error

        res.status(200).json(data.map((alias) => alias.alias))
    } catch (error) {
        res.status(500).json({ error: "something went wrong" })
    }
}

export default handler
