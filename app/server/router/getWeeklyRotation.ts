import { getWeeklyRotation as getWeeklyRotationFn } from "@ch/web-parser/weekly-rotation/getWeeklyRotation"
import { logInfo } from "@ch/logger"
import { publicProcedure } from "@server/trpc"

export const getWeeklyRotation = publicProcedure //
    .query(async () => {
        logInfo("getWeeklyRotation")

        return getWeeklyRotationFn()
    })
