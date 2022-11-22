import { getRankings } from "bhapi"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
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
        console.log("get1v1Rankings", req.input)

        const rankings = await getRankings("1v1", region, page, name)

        await updateDBPlayerAliases(
            rankings.map((player) => ({
                playerId: player.brawlhalla_id.toString(),
                alias: player.name,
            })),
        ).catch((e) => {
            console.error("Error updating player aliases", e)
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
        console.log("get2v2Rankings", req.input)

        const rankings = await getRankings("2v2", region, page)

        await updateDBPlayerAliases(
            rankings
                .map(getTeamPlayers)
                .flat()
                .map((player) => ({
                    playerId: player.id.toString(),
                    alias: player.name,
                }))
                .flat(),
        ).catch((e) => {
            console.error("Error updating player aliases", e)
        })

        return rankings
    })
