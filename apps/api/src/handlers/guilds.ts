import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/unstable/httpapi"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import { buildGuild } from "../aggregate/guild"

/**
 * The guild page, in one request.
 *
 * The gateway already joins the two upstream calls — `/guild/stats` for the
 * guild and `/guild/members` for the roster — so there is nothing left to fan
 * out here. What remains is the bookkeeping the old handler did: writing the
 * guild and its members into the local indexes behind the response.
 *
 * A guild nobody has heard of is a 404, matching the profile: the page cannot
 * be rendered without the name, and the raw endpoint's `null` said the same
 * thing in a shape the client had to interpret.
 */
export const guildsGroup = HttpApiBuilder.group(
    CorehallaApi,
    "guilds",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const background = yield* Background

        return handlers.handle("getGuild", ({ params }) =>
            Effect.gen(function* () {
                const clan = yield* brawlhalla.getClan(params.guildId)

                if (clan === null) {
                    return yield* new HttpApiError.NotFound()
                }

                yield* background.run(
                    db.upsertClan({
                        id: clan.clan_id.toString(),
                        name: clan.clan_name,
                        nameLower: searchKey(clan.clan_name),
                        created: clan.clan_create_date,
                        xp: parseInt(clan.clan_xp),
                    }),
                )

                yield* background.run(
                    db.upsertPlayerAliases(
                        clan.clan.flatMap((member) =>
                            aliasRows({
                                id: member.brawlhalla_id,
                                name: member.name,
                            }),
                        ),
                    ),
                )

                return buildGuild(clan, Date.now())
            }),
        )
    }),
)
