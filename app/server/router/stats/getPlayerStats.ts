import { getPlayerStats as getPlayerStatsFn } from "bhapi"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { updateDBClanData } from "server/helpers/updateDBClanData"
import { updateDBPlayerAliases } from "server/helpers/updateDBPlayerAliases"
import { z } from "zod"

export const getPlayerStats = publicProcedure //
    .input(
        z.object({
            playerId: numericLiteralValidator,
        }),
    )
    .query(async (req) => {
        const { playerId } = req.input
        console.log("getPlayerStats", req.input)

        const stats = await getPlayerStatsFn(playerId)

        const updateClanData = async () => {
            if (!stats.clan) return

            const clan = stats.clan

            await updateDBClanData({
                id: clan.clan_id.toString(),
                name: clan.clan_name,
                created: -1,
                xp: parseInt(clan.clan_xp),
            }).catch((e) => {
                console.error(
                    `Failed to update clan#${clan.clan_id} for player#${playerId} in database`,
                    e,
                )
            })
        }

        await Promise.all([
            updateDBPlayerAliases([
                { playerId: stats.brawlhalla_id.toString(), alias: stats.name },
            ]).catch((e) => {
                console.error("Error updating player aliases", e)
            }),
            updateClanData(),
        ])

        return stats
    })
