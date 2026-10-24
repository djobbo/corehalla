import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/http-api"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import { buildGuild } from "../aggregate/guild"

export const guildsGroup = HttpApiBuilder.group(
    CorehallaApi,
    "guilds",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const background = yield* Background

        return handlers.handle("getGuild", ({ params }) =>
            Effect.gen(function* () {
                const cached = yield* brawlhalla.getClan(params.guildId)
                const clan = cached.value

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

                return buildGuild(clan, cached.updatedAt)
            }),
        )
    }),
)
