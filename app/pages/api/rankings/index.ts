import { getRankings } from "bhapi"
import type { RankedRegion } from "bhapi/constants"
import type { Bracket } from "bhapi/types"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=480",
    )

    try {
        const { bracket, region, page, name } = req.query
        const data = await getRankings(
            bracket as Bracket,
            region as RankedRegion,
            page as string,
            name as string,
        )
        res.status(200).json(data)
    } catch {
        res.status(500).json({ error: "something went wrong" })
    }
}

export default handler
