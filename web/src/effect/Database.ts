import { Context, Effect, Layer } from "effect"
import { supabaseService } from "db/supabase/service"
import {
    CLANS_RANKINGS_PER_PAGE,
    GLOBAL_PLAYER_RANKINGS_PER_PAGE,
    SEARCH_PLAYERS_ALIASES_PER_PAGE,
} from "@util/constants"
import type { BHClan, BHPlayerAlias, BHPlayerData } from "db/generated/client"
import { DatabaseError } from "./errors"
import type { AliasSearchResult, GlobalPlayerRanking } from "./schemas"

/**
 * Server-side database access.
 *
 * Wraps the Supabase service-role client in Effects. Operations fail with a
 * typed `DatabaseError`; handlers decide whether that becomes a defect
 * (HTTP 500) or an empty result (e.g. optional player aliases).
 */
export class Database extends Context.Service<
    Database,
    {
        readonly getPlayerAliases: (
            playerId: string,
        ) => Effect.Effect<readonly string[], DatabaseError>
        readonly upsertPlayerAliases: (
            aliases: readonly BHPlayerAlias[],
        ) => Effect.Effect<void, DatabaseError>
        readonly upsertClan: (
            clan: Partial<BHClan>,
        ) => Effect.Effect<void, DatabaseError>
        readonly getClansRankings: (
            name: string,
            page: number,
        ) => Effect.Effect<readonly BHClan[], DatabaseError>
        readonly getGlobalPlayerRankings: (
            sortBy: string,
            page: number,
        ) => Effect.Effect<readonly GlobalPlayerRanking[], DatabaseError>
        readonly searchAliases: (
            alias: string,
            page: number,
        ) => Effect.Effect<readonly AliasSearchResult[], DatabaseError>
    }
>()("app/Database") {}

const run = <A>(f: () => PromiseLike<A>) =>
    Effect.tryPromise({
        try: () => Promise.resolve(f()),
        catch: (cause) => new DatabaseError({ cause }),
    })

export const layer = Layer.succeed(Database, {
    getPlayerAliases: (playerId) =>
        run(async () => {
            const { data, error } = await supabaseService
                .from<BHPlayerAlias>("BHPlayerAlias")
                .select("*")
                .order("createdAt", { ascending: false })
                .match({ playerId, public: true })

            if (error) throw error

            return (data ?? []).map((alias) => alias.alias)
        }),

    upsertPlayerAliases: (aliases) =>
        run(async () => {
            const filtered = aliases.filter(
                (alias, i) =>
                    aliases.findIndex(
                        (a) =>
                            a.playerId === alias.playerId &&
                            a.alias === alias.alias,
                    ) === i,
            )

            if (filtered.length === 0) return

            const { error } = await supabaseService
                .from<BHPlayerAlias>("BHPlayerAlias")
                .upsert(filtered)

            if (error) throw error
        }),

    upsertClan: (clan) =>
        run(async () => {
            const { error } = await supabaseService
                .from<BHClan>("BHClan")
                .upsert(clan)

            if (error) throw error
        }),

    getClansRankings: (name, page) =>
        run(async () => {
            let query = supabaseService.from<BHClan>("BHClan").select("*")

            const cleanName = name.trim().replace(/'/g, "\\'")

            if (cleanName.length > 0) {
                query = query.ilike("name", `${cleanName}%`)
            } else {
                query = query.select("*")
            }

            const { data, error } = await query
                .order("xp", { ascending: false })
                .range(
                    (page - 1) * CLANS_RANKINGS_PER_PAGE,
                    page * CLANS_RANKINGS_PER_PAGE - 1,
                )

            if (error) throw error

            return data ?? []
        }),

    getGlobalPlayerRankings: (sortBy, page) =>
        run(async () => {
            const { data, error } = await supabaseService
                .from<BHPlayerData>("BHPlayerData")
                .select(`id,name,tier,rating,region,peakRating,${sortBy}`)
                .order(sortBy as keyof BHPlayerData, { ascending: false })
                .range(
                    (page - 1) * GLOBAL_PLAYER_RANKINGS_PER_PAGE,
                    page * GLOBAL_PLAYER_RANKINGS_PER_PAGE - 1,
                )

            if (error) throw error

            return (data ?? []).map((playerData) => {
                const { [sortBy as keyof BHPlayerData]: prop, ...rest } =
                    playerData

                return {
                    ...(rest as unknown as GlobalPlayerRanking),
                    prop: prop as number,
                }
            })
        }),

    searchAliases: (alias, page) =>
        run(async () => {
            if (alias.length < 2) return []

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

            if (error) throw error

            return (data ?? []).reduce(
                (acc, row) => {
                    const player = acc.find((a) => a.playerId === row.playerId)

                    if (!player) {
                        acc.push({
                            playerId: row.playerId,
                            mainAlias: row.alias,
                            otherAliases: [],
                        })

                        return acc
                    }

                    if (player.mainAlias !== row.alias) {
                        player.otherAliases.push(row.alias)
                    }

                    return acc
                },
                [] as AliasSearchResult[],
            )
        }),
})
