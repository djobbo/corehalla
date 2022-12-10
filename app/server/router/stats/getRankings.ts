import { getRankings } from "bhapi"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { logError, logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { rankedRegionValidator } from "bhapi/constants"
import { updateDBPlayerAliases } from "db-utils/mutations/updateDBPlayerAliases"
import { z } from "zod"

export const get1v1Rankings = publicProcedure //
    .input(
        z.object({
            region: rankedRegionValidator,
            page: numericLiteralValidator,
            name: z.optional(z.string()),
        }),
    )
    .query(async (req) => {
        const { region, page, name } = req.input
        logInfo("get1v1Rankings", req.input)

        const rankings = await getRankings("1v1", region, page, name)

        // Fire and forget
        updateDBPlayerAliases(
            rankings.map((player) => ({
                playerId: player.brawlhalla_id.toString(),
                alias: player.name,
                createdAt: new Date(),
                public: true,
            })),
        ).catch((e) => {
            logError("Error updating player aliases", e)
        })

        return rankings
    })

export const get2v2Rankings = publicProcedure //
    .input(
        z.object({
            region: rankedRegionValidator,
            page: numericLiteralValidator,
        }),
    )
    .query(async (req) => {
        const { region, page } = req.input
        logInfo("get2v2Rankings", req.input)

        const rankings = await getRankings("2v2", region, page)

        // Fire and forget
        updateDBPlayerAliases(
            rankings
                .map(getTeamPlayers)
                .flat()
                .map((player) => ({
                    playerId: player.id.toString(),
                    alias: player.name,
                    createdAt: new Date(),
                    public: true,
                }))
                .flat(),
        ).catch((e) => {
            logError("Error updating player aliases", e)
        })

        return rankings
    })
