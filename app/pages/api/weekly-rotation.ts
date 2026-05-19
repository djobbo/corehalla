import type { NextApiHandler } from "next"
import { getWeeklyRotation } from "web-parser/weekly-rotation/getWeeklyRotation"

const handler: NextApiHandler = async (req, res) => {
    try {
        const weeklyRotation = await getWeeklyRotation()

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=7200",
        )

        res.status(200).json(weeklyRotation)
    } catch {
        res.status(500).json({ error: "Failed to fetch weekly rotation" })
    }
}

export default handler
