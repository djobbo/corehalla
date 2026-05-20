import { logInfo } from "logger"
import {
    powerRankingsBracketValidator,
    powerRankingsRegionValidator,
} from "web-parser/power-rankings/parsePowerRankingsPage"
import { z } from "zod"

import { withTimeLog } from "../../helpers/withTimeLog"
import { publicProcedure } from "../../trpc"

export const getPowerRankings = publicProcedure
    .input(
        z.object({
            bracket: powerRankingsBracketValidator,
            region: powerRankingsRegionValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            logInfo("getPowerRankings", req.input)

            return []

            // return withTimeLog(
            //     parsePowerRankingsPage,
            //     "parsePowerRankingsPage",
            // )(bracket ?? "1v1", region ?? "us-e")
        }, "getPowerRankings"),
    )
