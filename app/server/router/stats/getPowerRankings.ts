import { logInfo } from "logger"
import {
    parsePowerRankingsPage,
    powerRankingsBracketValidator,
    powerRankingsRegionValidator,
} from "web-parser/power-rankings/parsePowerRankingsPage"
import { publicProcedure } from "@server/trpc"
import { withTimeLog } from "@server/helpers/withTimeLog"
import { z } from "zod"

export const getPowerRankings = publicProcedure
    .input(
        z.object({
            bracket: powerRankingsBracketValidator,
            region: powerRankingsRegionValidator,
        }),
    )
    .query(
        withTimeLog((req) => {
            const { bracket, region } = req.input
            logInfo("getPowerRankings", req.input)

            return withTimeLog(
                parsePowerRankingsPage,
                "parsePowerRankingsPage",
            )(bracket ?? "1v1", region ?? "us-e")
        }, "getPowerRankings"),
    )
