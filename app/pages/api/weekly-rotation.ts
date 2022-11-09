import { getWeeklyRotation } from "web-parser/weekly-rotation/getWeeklyRotation"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=7200, stale-while-revalidate=10800",
        )

    const weeklyRotation = await getWeeklyRotation()

    res.status(200).json(weeklyRotation)
}

export default handler
