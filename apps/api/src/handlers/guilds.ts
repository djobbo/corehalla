import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/http-api"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { aliasRows } from "../helpers/aliases"
import { buildGuild } from "@crh/domain/aggregate/guild"
import {
    PLAN,
    partFromResult,
    sectionMeta,
    toSectionError,
} from "@crh/domain/sections/meta"
import type { PartEntries } from "@crh/domain/sections/meta"

export const guildsGroup = HttpApiBuilder.group(
    CorehallaApi,
    "guilds",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const background = yield* Background

        return handlers.handle("getGuild", ({ params }) =>
            Effect.gen(function* () {
                const now = Date.now()
                const cached = yield* brawlhalla
                    .getClan(params.guildId)
                    .pipe(Effect.result)

                const parts: PartEntries = {
                    clan: partFromResult(
                        cached,
                        cached._tag === "Success"
                            ? cached.success.updatedAt
                            : now,
                    ),
                }

                if (cached._tag === "Failure") {
                    return yield* Effect.fail(
                        toSectionError(PLAN.guildProfile, parts),
                    )
                }

                const clan = cached.success.value

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

                const envelope = buildGuild(clan, cached.success.updatedAt)

                return {
                    data: envelope.data,
                    meta: sectionMeta(PLAN.guildProfile, parts, now),
                }
            }).pipe(
                Effect.timeoutOrElse({
                    duration: "5000 millis",
                    orElse: () =>
                        Effect.fail(
                            toSectionError(PLAN.guildProfile, {
                                clan: {
                                    status: "timeout",
                                    updated_at: Date.now(),
                                },
                            }),
                        ),
                }),
            ),
        )
    }),
)
