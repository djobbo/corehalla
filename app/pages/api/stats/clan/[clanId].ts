import { getClan } from "bhapi"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { clanId } = req.query
        const data = await getClan(parseInt(clanId as string))

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=480",
        )

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "something went wrong" })
    }
}

export default handler
