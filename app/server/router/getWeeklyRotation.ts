import { getWeeklyRotation as getWeeklyRotationFn } from "web-parser/weekly-rotation/getWeeklyRotation"
import { publicProcedure } from "@server/trpc"

export const getWeeklyRotation = publicProcedure //
    .query(() => {
        console.log("getWeeklyRotation")

        return getWeeklyRotationFn()
    })
