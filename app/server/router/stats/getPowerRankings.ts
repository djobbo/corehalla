import {
    parsePowerRankingsPage,
    powerRankingsBracketValidator,
    powerRankingsRegionValidator,
} from "web-parser/power-rankings/parsePowerRankingsPage"
import { publicProcedure } from "@server/trpc"
import { z } from "zod"

export const getPowerRankings = publicProcedure
    .input(
        z.object({
            bracket: powerRankingsBracketValidator,
            region: powerRankingsRegionValidator,
        }),
    )
    .query((req) => {
        const { bracket, region } = req.input
        console.log("getPowerRankings", req.input)

        return parsePowerRankingsPage(bracket ?? "1v1", region ?? "us-e")
    })
