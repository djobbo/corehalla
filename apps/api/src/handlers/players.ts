import { Effect } from "effect"
import { HttpApiBuilder, HttpApiError } from "effect/http-api"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { CorehallaApi } from "@crh/api-contract/Api"
import { Brawlhalla } from "@crh/core/services/upstream"
import { Database, searchKey } from "@crh/core/services/archive"
import { Background } from "@crh/core/services/background"
import { snapshotFromRanked } from "@crh/core/services/player-writes"
import { aliasRows } from "../helpers/aliases"
import { PlayerEsports } from "../services/player-esports"
import {
    buildPlayerClan,
    buildPlayerLegends,
    buildPlayerProfile,
    buildPlayerTeams,
    buildPlayerWeapons,
} from "@crh/domain/aggregate/player"
import { mergePlayerRanked } from "@crh/domain/upstream/v1"
import {
    PLAN,
    partFromResult,
    sectionMeta,
    toSectionError,
} from "@crh/domain/sections/meta"
import type { PartEntries } from "@crh/domain/sections/meta"
import type { Clan } from "@crh/bhapi/types"

const SECTION_TIMEOUT = "5000 millis"

export const playersGroup = HttpApiBuilder.group(
    CorehallaApi,
    "players",
    Effect.fnUntraced(function* (handlers) {
        const brawlhalla = yield* Brawlhalla
        const db = yield* Database
        const background = yield* Background
        const playerEsports = yield* PlayerEsports

        return handlers
            .handle("getPlayer", ({ params }) =>
                Effect.gen(function* () {
                    const now = Date.now()
                    const [stats, account, ranked3v3, teams] =
                        yield* Effect.all(
                            [
                                brawlhalla
                                    .getPlayerStatsCore(params.playerId)
                                    .pipe(Effect.result),
                                brawlhalla
                                    .getPlayerRanked1v1(params.playerId)
                                    .pipe(Effect.result),
                                brawlhalla
                                    .getPlayer3v3Ranked(params.playerId)
                                    .pipe(Effect.result),
                                brawlhalla
                                    .getPlayerTeams(params.playerId)
                                    .pipe(Effect.result),
                            ],
                            { concurrency: 4 },
                        )

                    const parts: PartEntries = {
                        stats: partFromResult(
                            stats,
                            stats._tag === "Success"
                                ? stats.success.updatedAt
                                : now,
                        ),
                        ranked1v1: partFromResult(
                            account,
                            account._tag === "Success"
                                ? account.success.updatedAt
                                : now,
                        ),
                        ranked3v3: partFromResult(
                            ranked3v3,
                            ranked3v3._tag === "Success"
                                ? ranked3v3.success.updatedAt
                                : now,
                        ),
                        teams2v2: partFromResult(
                            teams,
                            teams._tag === "Success"
                                ? teams.success.updatedAt
                                : now,
                        ),
                    }

                    if (stats._tag === "Failure") {
                        return yield* Effect.fail(
                            toSectionError(PLAN.playerProfile, parts),
                        )
                    }

                    if (stats.success.value === null) {
                        return yield* new HttpApiError.NotFound()
                    }

                    const ranked = mergePlayerRanked(
                        account._tag === "Success"
                            ? account.success.value
                            : null,
                        teams._tag === "Success" ? teams.success.value : [],
                    )

                    const aliases = yield* db
                        .getPlayerAliases(String(params.playerId))
                        .pipe(
                            Effect.catch(() =>
                                Effect.succeed([] as readonly string[]),
                            ),
                        )

                    const data = buildPlayerProfile({
                        stats: stats.success.value,
                        ranked,
                        ranked3v3:
                            ranked3v3._tag === "Success"
                                ? ranked3v3.success.value
                                : null,
                        aliases,
                    })

                    yield* background.run(
                        db.upsertPlayerAliases([
                            ...aliasRows({
                                id: stats.success.value.brawlhalla_id,
                                name: stats.success.value.name,
                            }),
                            ...(ranked?.["2v2"] ?? [])
                                .map(getTeamPlayers)
                                .flat()
                                .flatMap((player) => aliasRows(player)),
                        ]),
                    )

                    const snapshot =
                        ranked === null ? null : snapshotFromRanked(ranked)

                    if (
                        account._tag === "Success" &&
                        teams._tag === "Success" &&
                        ranked !== null &&
                        snapshot !== null &&
                        stats.success.value.name.length > 0
                    ) {
                        yield* background.run(
                            db.upsertPlayerRanked(
                                {
                                    id: ranked.brawlhalla_id.toString(),
                                    name: ranked.name,
                                },
                                snapshot,
                            ),
                        )
                    }

                    return {
                        data,
                        meta: sectionMeta(PLAN.playerProfile, parts, now),
                    }
                }).pipe(
                    Effect.timeoutOrElse({
                        duration: SECTION_TIMEOUT,
                        orElse: () =>
                            Effect.fail(
                                toSectionError(PLAN.playerProfile, {
                                    stats: {
                                        status: "timeout",
                                        updated_at: Date.now(),
                                    },
                                }),
                            ),
                    }),
                ),
            )
            .handle("getPlayerLegends", ({ params }) =>
                Effect.gen(function* () {
                    const now = Date.now()
                    const [stats, account] = yield* Effect.all(
                        [
                            brawlhalla
                                .getPlayerStatsCore(params.playerId)
                                .pipe(Effect.result),
                            brawlhalla
                                .getPlayerRanked1v1(params.playerId)
                                .pipe(Effect.result),
                        ],
                        { concurrency: 2 },
                    )

                    const parts: PartEntries = {
                        stats: partFromResult(
                            stats,
                            stats._tag === "Success"
                                ? stats.success.updatedAt
                                : now,
                        ),
                        ranked1v1: partFromResult(
                            account,
                            account._tag === "Success"
                                ? account.success.updatedAt
                                : now,
                        ),
                    }

                    if (stats._tag === "Failure") {
                        return yield* Effect.fail(
                            toSectionError(PLAN.playerLegends, parts),
                        )
                    }

                    if (stats.success.value === null) {
                        return yield* new HttpApiError.NotFound()
                    }

                    return {
                        data: buildPlayerLegends({
                            stats: stats.success.value,
                            ranked:
                                account._tag === "Success"
                                    ? account.success.value
                                    : null,
                            ranked3v3: null,
                            aliases: [],
                        }),
                        meta: sectionMeta(PLAN.playerLegends, parts, now),
                    }
                }).pipe(
                    Effect.timeoutOrElse({
                        duration: SECTION_TIMEOUT,
                        orElse: () =>
                            Effect.fail(
                                toSectionError(PLAN.playerLegends, {
                                    stats: {
                                        status: "timeout",
                                        updated_at: Date.now(),
                                    },
                                }),
                            ),
                    }),
                ),
            )
            .handle("getPlayerWeapons", ({ params }) =>
                Effect.gen(function* () {
                    const now = Date.now()
                    const stats = yield* brawlhalla
                        .getPlayerStatsCore(params.playerId)
                        .pipe(Effect.result)

                    const parts: PartEntries = {
                        stats: partFromResult(
                            stats,
                            stats._tag === "Success"
                                ? stats.success.updatedAt
                                : now,
                        ),
                    }

                    if (stats._tag === "Failure") {
                        return yield* Effect.fail(
                            toSectionError(PLAN.playerWeapons, parts),
                        )
                    }

                    if (stats.success.value === null) {
                        return yield* new HttpApiError.NotFound()
                    }

                    return {
                        data: buildPlayerWeapons({
                            stats: stats.success.value,
                            ranked: null,
                            ranked3v3: null,
                            aliases: [],
                        }),
                        meta: sectionMeta(PLAN.playerWeapons, parts, now),
                    }
                }).pipe(
                    Effect.timeoutOrElse({
                        duration: SECTION_TIMEOUT,
                        orElse: () =>
                            Effect.fail(
                                toSectionError(PLAN.playerWeapons, {
                                    stats: {
                                        status: "timeout",
                                        updated_at: Date.now(),
                                    },
                                }),
                            ),
                    }),
                ),
            )
            .handle("getPlayerTeams", ({ params }) =>
                Effect.gen(function* () {
                    const now = Date.now()
                    const teams = yield* brawlhalla
                        .getPlayerTeams(params.playerId)
                        .pipe(Effect.result)

                    const parts: PartEntries = {
                        teams2v2: partFromResult(
                            teams,
                            teams._tag === "Success"
                                ? teams.success.updatedAt
                                : now,
                        ),
                    }

                    if (teams._tag === "Failure") {
                        return yield* Effect.fail(
                            toSectionError(PLAN.playerTeams, parts),
                        )
                    }

                    return {
                        data: buildPlayerTeams(
                            mergePlayerRanked(null, teams.success.value),
                        ),
                        meta: sectionMeta(PLAN.playerTeams, parts, now),
                    }
                }).pipe(
                    Effect.timeoutOrElse({
                        duration: SECTION_TIMEOUT,
                        orElse: () =>
                            Effect.fail(
                                toSectionError(PLAN.playerTeams, {
                                    teams2v2: {
                                        status: "timeout",
                                        updated_at: Date.now(),
                                    },
                                }),
                            ),
                    }),
                ),
            )
            .handle("getPlayerClan", ({ params }) =>
                Effect.gen(function* () {
                    const now = Date.now()
                    const membership = yield* brawlhalla
                        .getPlayerClan(params.playerId)
                        .pipe(Effect.result)

                    const parts: PartEntries = {
                        guildMembership: partFromResult(
                            membership,
                            membership._tag === "Success"
                                ? membership.success.updatedAt
                                : now,
                        ),
                    }

                    if (membership._tag === "Failure") {
                        return yield* Effect.fail(
                            toSectionError(PLAN.playerClan, parts),
                        )
                    }

                    const member = membership.success.value

                    if (member == null) {
                        return {
                            data: null,
                            meta: sectionMeta(PLAN.playerClan, parts, now),
                        }
                    }

                    const guild = yield* brawlhalla
                        .getClan(member.clan_id)
                        .pipe(Effect.result)

                    const all: PartEntries = {
                        ...parts,
                        guild:
                            guild._tag === "Failure"
                                ? partFromResult(guild, now)
                                : guild.success.value === null
                                  ? {
                                        status: "not_found",
                                        updated_at: guild.success.updatedAt,
                                    }
                                  : {
                                        status: "ok",
                                        updated_at: guild.success.updatedAt,
                                    },
                    }

                    if (guild._tag === "Failure") {
                        return yield* Effect.fail(
                            toSectionError(PLAN.playerClan, all),
                        )
                    }

                    if (guild.success.value === null) {
                        return {
                            data: null,
                            meta: sectionMeta(PLAN.playerClan, all, now),
                        }
                    }

                    if (guild.success.value !== null) {
                        const clan: Clan = guild.success.value

                        yield* background.run(
                            db.upsertClan({
                                id: clan.clan_id.toString(),
                                name: clan.clan_name,
                                nameLower: searchKey(clan.clan_name),
                                created: clan.clan_create_date,
                                xp: parseInt(clan.clan_xp),
                            }),
                        )
                    }

                    return {
                        data: buildPlayerClan(
                            member,
                            params.playerId,
                            guild.success.value,
                        ),
                        meta: sectionMeta(PLAN.playerClan, all, now),
                    }
                }).pipe(
                    Effect.timeoutOrElse({
                        duration: SECTION_TIMEOUT,
                        orElse: () =>
                            Effect.fail(
                                toSectionError(PLAN.playerClan, {
                                    guildMembership: {
                                        status: "timeout",
                                        updated_at: Date.now(),
                                    },
                                }),
                            ),
                    }),
                ),
            )
            .handle("getPlayerEsports", ({ params }) =>
                playerEsports.get(params.playerId).pipe(
                    Effect.map((result) => ({
                        data: result.value,
                        meta: { updated_at: result.updatedAt },
                    })),
                    Effect.mapError(() =>
                        toSectionError(PLAN.playerEsports, {
                            brawltools: {
                                status: "status",
                                updated_at: Date.now(),
                            },
                        }),
                    ),
                    Effect.timeoutOrElse({
                        duration: SECTION_TIMEOUT,
                        orElse: () =>
                            Effect.fail(
                                toSectionError(PLAN.playerEsports, {
                                    brawltools: {
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
