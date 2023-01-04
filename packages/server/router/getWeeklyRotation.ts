import { getWeeklyRotation as getWeeklyRotationFn } from "web-parser/weekly-rotation/getWeeklyRotation"
import { logInfo } from "logger"
import { publicProcedure } from "../trpc"

export const getWeeklyRotation = publicProcedure //
    .query(async () => {
        logInfo("getWeeklyRotation")

        return getWeeklyRotationFn()
    })
