import { getPlayerRanked as getPlayerRankedFn } from "bhapi"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { updateDBPlayerAliases } from "server/helpers/updateDBPlayerAliases"
import { z } from "zod"
import type { BHPlayerAlias } from "db/generated/client"

export const getPlayerRanked = publicProcedure //
    .input(
        z.object({
            playerId: numericLiteralValidator,
        }),
    )
    .query(async (req) => {
        const { playerId } = req.input
        console.log("getPlayerRanked", req.input)

        const ranked = await getPlayerRankedFn(playerId)

        // TODO: check whole object with zod
        try {
            z.undefined().or(z.object({}).strict()).parse(ranked)
            throw new Error("Player ranked not found")
        } catch {
            // do nothing, continue
        }

        const aliases = [
            {
                id: ranked.brawlhalla_id,
                name: ranked.name,
            },
            ...(ranked["2v2"]?.map(getTeamPlayers).flat() ?? []),
        ].map<BHPlayerAlias>(({ name, id }) => ({
            playerId: id.toString(),
            alias: name,
        }))

        await updateDBPlayerAliases(aliases).catch((e) => {
            console.error("Error updating player aliases", e)
        })

        return ranked
    })
