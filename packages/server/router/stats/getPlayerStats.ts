import { getPlayerStats as getPlayerStatsFn } from "bhapi"
import { logError, logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { updateDBClanData } from "../../mutations/updateDBClanData"
import { updateDBPlayerAliases } from "../../mutations/updateDBPlayerAliases"
import { waitForRequestTimeout } from "../../helpers/waitForRequestTimeout"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"

export const getPlayerStats = publicProcedure //
    .input(
        z.object({
            playerId: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { playerId } = req.input
            logInfo("getPlayerStats", req.input)

            const controller = new AbortController()

            const stats = await withTimeLog(
                getPlayerStatsFn,
                "BHAPI:playerStats",
            )(playerId)

            const updateClanData = async () => {
                if (!stats.clan) return

                const clan = stats.clan

                await withTimeLog(updateDBClanData, "updateDBClanData")(
                    {
                        id: clan.clan_id.toString(),
                        name: clan.clan_name,
                        xp: parseInt(clan.clan_xp),
                    },
                    {
                        abortSignal: controller.signal,
                    },
                ).catch((e) => {
                    logError(
                        `Failed to update clan#${clan.clan_id} for player#${playerId} in database`,
                        e,
                    )
                })
            }

            // Fire and forget
            const fireAndForget = Promise.all([
                withTimeLog(updateDBPlayerAliases, "updateDBPlayerAliases")(
                    [
                        {
                            playerId: stats.brawlhalla_id.toString(),
                            alias: stats.name,
                            createdAt: new Date(),
                            public: true,
                        },
                    ],
                    {
                        abortSignal: controller.signal,
                    },
                ).catch((e) => {
                    logError("Error updating player aliases", e)
                }),
                updateClanData(),
            ])

            waitForRequestTimeout(fireAndForget, {
                abortController: controller,
            })

            return stats
        }, "getPlayerStats"),
    )
