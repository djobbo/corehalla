import { parsePowerRankingsPage } from "web-parser/power-rankings/parsePowerRankingsPage"
import type { Bracket } from "bhapi/types"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=7200, stale-while-revalidate=10800",
    )

    try {
        const { bracket, region } = req.query
        const data = await parsePowerRankingsPage(
            bracket as Bracket,
            // @ts-expect-error typecheck region
            region,
        )
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "something went wrong" })
    }
}

export default handler
