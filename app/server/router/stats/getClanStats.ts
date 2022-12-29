import { getClan } from "bhapi"
import { logError, logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { updateDBClanData } from "db-utils/mutations/updateDBClanData"
import { updateDBPlayerAliases } from "db-utils/mutations/updateDBPlayerAliases"
import { withTimeLog } from "@server/helpers/withTimeLog"
import { z } from "zod"

export const getClanStats = publicProcedure //
    .input(
        z.object({
            clanId: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { clanId } = req.input
            logInfo("getClanStats", req.input)

            const clan = await withTimeLog(getClan, "BHAPI:clanStats")(clanId)

            // Fire and forget
            Promise.all([
                withTimeLog(
                    updateDBClanData,
                    "updateDBClanData",
                )({
                    id: clan.clan_id.toString(),
                    name: clan.clan_name,
                    created: clan.clan_create_date,
                    xp: parseInt(clan.clan_xp),
                }).catch((e) => {
                    logError(
                        `Failed to update clan#${clan.clan_id} in database`,
                        e,
                    )
                }),
                withTimeLog(
                    updateDBPlayerAliases,
                    "updateDBPlayerAliases",
                )(
                    clan.clan.map((member) => ({
                        playerId: member.brawlhalla_id.toString(),
                        alias: member.name,
                        createdAt: new Date(),
                        public: true,
                    })),
                ).catch((e) => {
                    logError(
                        `Error updating player aliases for clan#${clan.clan_id}`,
                        e,
                    )
                }),
            ])

            return clan
        }, "getClanStats"),
    )
