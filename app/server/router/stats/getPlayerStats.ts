import { getPlayerStats as getPlayerStatsFn } from "bhapi"
import { logError, logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { updateDBClanData } from "db-utils/mutations/updateDBClanData"
import { updateDBPlayerAliases } from "db-utils/mutations/updateDBPlayerAliases"
import { z } from "zod"

export const getPlayerStats = publicProcedure //
    .input(
        z.object({
            playerId: numericLiteralValidator,
        }),
    )
    .query(async (req) => {
        const { playerId } = req.input
        logInfo("getPlayerStats", req.input)

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
                logError(
                    `Failed to update clan#${clan.clan_id} for player#${playerId} in database`,
                    e,
                )
            })
        }

        // Fire and forget
        Promise.all([
            updateDBPlayerAliases([
                {
                    playerId: stats.brawlhalla_id.toString(),
                    alias: stats.name,
                    createdAt: new Date(),
                    public: true,
                },
            ]).catch((e) => {
                logError("Error updating player aliases", e)
            }),
            updateClanData(),
        ])

        return stats
    })
