import { SEARCH_PLAYERS_ALIASES_PER_PAGE } from "../../helpers/constants"
import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "../../trpc"
import { supabaseService } from "db/supabase/service"
import { withTimeLog } from "../../helpers/withTimeLog"
import { z } from "zod"
import type { BHPlayerAlias } from "db/generated/client"

export const searchPlayerAlias = publicProcedure //
    .input(
        z.object({
            alias: z.string(),
            page: numericLiteralValidator,
        }),
    )
    .query(
        withTimeLog(async (req) => {
            const { alias, page } = req.input
            logInfo("searchPlayerAlias", req.input)

            if (alias.length < 2) {
                return []
            }

            const cleanAlias = alias.trim().replace(/'/g, "\\'")

            const { data, error } = await supabaseService.rpc<BHPlayerAlias>(
                "search_aliases",
                {
                    search: cleanAlias,
                    aliases_offset:
                        (page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE,
                    aliases_per_page: SEARCH_PLAYERS_ALIASES_PER_PAGE,
                },
            )

            if (error) {
                throw error
            }

            const aliases = data?.reduce(
                (acc, alias) => {
                    const player = acc.find(
                        (a) => a.playerId === alias.playerId,
                    )
                    if (!player) {
                        acc.push({
                            playerId: alias.playerId,
                            mainAlias: alias.alias,
                            otherAliases: [],
                        })

                        return acc
                    }

                    if (player.mainAlias !== alias.alias) {
                        player.otherAliases.push(alias.alias)
                    }

                    return acc
                },
                [] as {
                    playerId: string
                    mainAlias: string
                    otherAliases: string[]
                }[],
            )

            return aliases ?? []
        }, "searchPlayerAlias"),
    )
