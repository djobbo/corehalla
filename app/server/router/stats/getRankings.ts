import { getRankings } from "@ch/bhapi"
import { getTeamPlayers } from "@ch/bhapi/helpers/getTeamPlayers"
import { logError, logInfo } from "@ch/logger"
import { numericLiteralValidator } from "@ch/common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { rankedRegionValidator } from "@ch/bhapi/constants"
import { updateDBPlayerAliases } from "@ch/db-utils/mutations/updateDBPlayerAliases"
import { withTimeLog } from "@server/helpers/withTimeLog"
import { z } from "zod"

export const get1v1Rankings = publicProcedure //
    .input(
        z.object({
            region: rankedRegionValidator,
            page: numericLiteralValidator,
            name: z.optional(z.string()),
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { region, page, name } = req.input
            logInfo("get1v1Rankings", req.input)

            const rankings = await withTimeLog(
                getRankings,
                "BHAPI:rankings1v1",
            )("1v1", region, page, name)

            // Fire and forget
            withTimeLog(
                updateDBPlayerAliases,
                "updateDBPlayerAliases",
            )(
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
        }, "get1v1Rankings"),
    )

export const get2v2Rankings = publicProcedure //
    .input(
        z.object({
            region: rankedRegionValidator,
            page: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { region, page } = req.input
            logInfo("get2v2Rankings", req.input)

            const rankings = await withTimeLog(
                getRankings,
                "BHAPI:rankings2v2",
            )("2v2", region, page)

            // Fire and forget
            withTimeLog(
                updateDBPlayerAliases,
                "updateDBPlayerAliases",
            )(
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
        }, "get2v2Rankings"),
    )
