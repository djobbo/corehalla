import { logInfo } from "logger"
import {
    parsePowerRankingsPage,
    powerRankingsBracketValidator,
    powerRankingsRegionValidator,
} from "web-parser/power-rankings/parsePowerRankingsPage"
import { publicProcedure } from "../../trpc"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"

export const getPowerRankings = publicProcedure
    .input(
        z.object({
            bracket: powerRankingsBracketValidator,
            region: powerRankingsRegionValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { bracket, region } = req.input
            logInfo("getPowerRankings", req.input)

            return []

            // return withTimeLog(
            //     parsePowerRankingsPage,
            //     "parsePowerRankingsPage",
            // )(bracket ?? "1v1", region ?? "us-e")
        }, "getPowerRankings"),
    )
