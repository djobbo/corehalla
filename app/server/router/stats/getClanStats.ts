import { getClan } from "bhapi"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { updateDBClanData } from "db-utils/mutations/updateDBClanData"
import { updateDBPlayerAliases } from "db-utils/mutations/updateDBPlayerAliases"
import { z } from "zod"

export const getClanStats = publicProcedure //
    .input(
        z.object({
            clanId: numericLiteralValidator,
        }),
    )
    .query(async (req) => {
        const { clanId } = req.input
        console.log("getClanStats", req.input)

        const clan = await getClan(clanId)

        await Promise.all([
            updateDBClanData({
                id: clan.clan_id.toString(),
                name: clan.clan_name,
                created: clan.clan_create_date,
                xp: parseInt(clan.clan_xp),
            }).catch((e) => {
                console.error(
                    `Failed to update clan#${clan.clan_id} in database`,
                    e,
                )
            }),
            updateDBPlayerAliases(
                clan.clan.map((member) => ({
                    playerId: member.brawlhalla_id.toString(),
                    alias: member.name,
                })),
            ).catch((e) => {
                console.error(
                    `Error updating player aliases for clan#${clan.clan_id}`,
                    e,
                )
            }),
        ])

        return clan
    })
