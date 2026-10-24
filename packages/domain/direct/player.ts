import { Data, Effect } from "effect"
import {
    buildPlayerClan,
    buildPlayerLegends,
    buildPlayerProfile,
    buildPlayerTeams,
    buildPlayerWeapons,
} from "../aggregate/player"
import { mergePlayerRanked } from "../upstream/v1"
import {
    PLAN,
    partFromResult,
    sectionMeta,
    toSectionError,
} from "../sections/meta"
import type { PartEntries } from "../sections/meta"
import type { V1UpstreamShape } from "../upstream/client"
import type {
    PlayerClanEnvelope,
    PlayerLegendsEnvelope,
    PlayerProfileEnvelope,
    PlayerTeamsEnvelope,
    PlayerWeaponsEnvelope,
    SectionError,
} from "@crh/api-contract/schemas"

export class PlayerNotFound extends Data.TaggedError("PlayerNotFound")<{
    readonly playerId: number
}> {}

const missing = (parts: PartEntries, plan: string) =>
    Effect.fail(toSectionError(plan, parts))

/**
 * Direct-to-v1 rebuild of a section after the API could not serve it.
 * Every function uses the same mappers and builders as the worker, so the
 * envelope is byte-for-byte the shape the components already expect.
 */
export const directPlayerProfile = (
    upstream: V1UpstreamShape,
    playerId: number,
): Effect.Effect<PlayerProfileEnvelope, SectionError | PlayerNotFound> =>
    Effect.gen(function* () {
        const at = Date.now()
        const [stats, account, ranked3v3, teams] = yield* Effect.all(
            [
                upstream.getPlayerStats(playerId).pipe(Effect.result),
                upstream.getPlayerRanked1v1(playerId).pipe(Effect.result),
                upstream.getPlayer3v3Ranked(playerId).pipe(Effect.result),
                upstream.getPlayerTeams(playerId).pipe(Effect.result),
            ],
            { concurrency: 3 },
        )

        const parts: PartEntries = {
            stats: partFromResult(stats, at),
            ranked1v1: partFromResult(account, at),
            ranked3v3: partFromResult(ranked3v3, at),
            teams2v2: partFromResult(teams, at),
        }

        if (stats._tag === "Failure") {
            return yield* missing(parts, PLAN.playerProfile)
        }

        if (stats.success === null) {
            return yield* Effect.fail(new PlayerNotFound({ playerId }))
        }

        return {
            data: buildPlayerProfile({
                stats: stats.success,
                ranked: mergePlayerRanked(
                    account._tag === "Success" ? account.success : null,
                    teams._tag === "Success" ? teams.success : [],
                ),
                ranked3v3:
                    ranked3v3._tag === "Success" ? ranked3v3.success : null,
                // Aliases are archive-only; direct fallback has no database.
                aliases: [],
            }),
            meta: sectionMeta(PLAN.playerProfile, parts, at),
        }
    })

export const directPlayerLegends = (
    upstream: V1UpstreamShape,
    playerId: number,
): Effect.Effect<PlayerLegendsEnvelope, SectionError | PlayerNotFound> =>
    Effect.gen(function* () {
        const at = Date.now()
        const [stats, account] = yield* Effect.all(
            [
                upstream.getPlayerStats(playerId).pipe(Effect.result),
                upstream.getPlayerRanked1v1(playerId).pipe(Effect.result),
            ],
            { concurrency: 2 },
        )

        const parts: PartEntries = {
            stats: partFromResult(stats, at),
            ranked1v1: partFromResult(account, at),
        }

        if (stats._tag === "Failure") {
            return yield* missing(parts, PLAN.playerLegends)
        }

        if (stats.success === null) {
            return yield* Effect.fail(new PlayerNotFound({ playerId }))
        }

        return {
            data: buildPlayerLegends({
                stats: stats.success,
                ranked: account._tag === "Success" ? account.success : null,
                ranked3v3: null,
                aliases: [],
            }),
            meta: sectionMeta(PLAN.playerLegends, parts, at),
        }
    })

export const directPlayerWeapons = (
    upstream: V1UpstreamShape,
    playerId: number,
): Effect.Effect<PlayerWeaponsEnvelope, SectionError | PlayerNotFound> =>
    Effect.gen(function* () {
        const at = Date.now()
        const stats = yield* upstream
            .getPlayerStats(playerId)
            .pipe(Effect.result)

        const parts: PartEntries = { stats: partFromResult(stats, at) }

        if (stats._tag === "Failure") {
            return yield* missing(parts, PLAN.playerWeapons)
        }

        if (stats.success === null) {
            return yield* Effect.fail(new PlayerNotFound({ playerId }))
        }

        return {
            data: buildPlayerWeapons({
                stats: stats.success,
                ranked: null,
                ranked3v3: null,
                aliases: [],
            }),
            meta: sectionMeta(PLAN.playerWeapons, parts, at),
        }
    })

export const directPlayerTeams = (
    upstream: V1UpstreamShape,
    playerId: number,
): Effect.Effect<PlayerTeamsEnvelope, SectionError | PlayerNotFound> =>
    Effect.gen(function* () {
        const at = Date.now()
        const teams = yield* upstream
            .getPlayerTeams(playerId)
            .pipe(Effect.result)

        const parts: PartEntries = { teams2v2: partFromResult(teams, at) }

        if (teams._tag === "Failure") {
            return yield* missing(parts, PLAN.playerTeams)
        }

        return {
            data: buildPlayerTeams(mergePlayerRanked(null, teams.success)),
            meta: sectionMeta(PLAN.playerTeams, parts, at),
        }
    })

export const directPlayerClan = (
    upstream: V1UpstreamShape,
    playerId: number,
): Effect.Effect<PlayerClanEnvelope, SectionError | PlayerNotFound> =>
    Effect.gen(function* () {
        const at = Date.now()
        const membership = yield* upstream
            .getPlayerClan(playerId)
            .pipe(Effect.result)

        const membershipAt = Date.now()
        const parts: PartEntries = {
            guildMembership: partFromResult(membership, membershipAt),
        }

        if (membership._tag === "Failure") {
            return yield* missing(parts, PLAN.playerClan)
        }

        const member = membership.success

        if (member == null) {
            return {
                data: null,
                meta: sectionMeta(PLAN.playerClan, parts, at),
            }
        }

        const guild = yield* upstream
            .getClan(member.clan_id)
            .pipe(Effect.result)

        const all: PartEntries = {
            ...parts,
            guild: partFromResult(guild, Date.now()),
        }

        if (guild._tag === "Failure") {
            return yield* missing(all, PLAN.playerClan)
        }

        if (guild.success === null) {
            return {
                data: null,
                meta: sectionMeta(PLAN.playerClan, all, at),
            }
        }

        return {
            data: buildPlayerClan(member, playerId, guild.success),
            meta: sectionMeta(PLAN.playerClan, all, at),
        }
    })
