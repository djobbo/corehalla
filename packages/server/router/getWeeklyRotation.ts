import { logInfo } from "logger"
import { getWeeklyRotation as getWeeklyRotationFn } from "web-parser/common"

import { publicProcedure } from "../trpc"

export const getWeeklyRotation = publicProcedure //
    .query(async () => {
        logInfo("getWeeklyRotation")

        const rotation = await getWeeklyRotationFn()

        return rotation
    })
