import { getWeeklyRotation } from "web-parser/weekly-rotation/getWeeklyRotation"
import type { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
    const weeklyRotation = await getWeeklyRotation()

    res.status(200).json(weeklyRotation)
}

export default handler
