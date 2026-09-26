import { Effect } from "effect"
import { HttpClient } from "effect/unstable/http"
import { envValue } from "../../env"
import { retryTransient } from "../retry"
import type { ClanRank } from "@crh/bhapi/constants"
import type { Clan } from "@crh/bhapi/types"

/**
 * Brawlhalla API **v1** (`https://api.brawlhalla.com/v1`).
 *
 * Hand-written response types rather than Effect `Schema`: the legacy client
 * casts its payloads too, and validating every upstream response is a separate
 * change with its own cost profile. What v1 *does* get is the null contract
 * spelled out — several fields v1 documents as "may appear null … retry the
 * call later", and those are exactly the fields the predicates in `./index.ts`
 * test before accepting a v1 result.
 */

const V1_BASE = "https://api.brawlhalla.com/v1"

/**
 * Region codes v1 accepts.
 *
 * Two traps versus v0: everything is uppercase, and Japan is `JPS`, not `jpn`
 * (our stored vocabulary is lowercase, so a round trip has to translate both
 * ways). `ALL` is a first-class region, which is what lets a global name search
 * be a single request instead of one per region.
 */
export const v1Regions = [
    "ALL",
    "US-E",
    "EU",
    "SEA",
    "BRZ",
    "AUS",
    "US-W",
    "JPS",
    "SA",
    "ME",
] as const

export type V1Region = (typeof v1Regions)[number]

/** Maps our lowercase region vocabulary onto v1's uppercase codes. */
export const toV1Region = (region: string): V1Region => {
    const upper = region.toUpperCase()

    if (upper === "ALL") return "ALL"
    if (upper === "JPN") return "JPS"

    return (v1Regions as readonly string[]).includes(upper)
        ? (upper as V1Region)
        : "ALL"
}

/** Maps a v1 region back into our stored vocabulary (`JPS` -> `jpn`). */
export const fromV1Region = (region: string): string => {
    const lower = region.toLowerCase()

    return lower === "jps" ? "jpn" : lower
}

// --- response shapes -------------------------------------------------------

/** `GetGuildStats`. `rank` and `member_count` may be absent for a new guild. */
export type V1Guild = {
    guild_id: number
    name: string
    create_date: number
    xp: number
    legacy_xp?: number
    notice?: string
    tags?: readonly string[]
    discord_invite_code?: string
    guild_points?: number
    rank?: number | null
    is_recruiting?: boolean
    member_count?: number | null
}

/** `GetGuildMembers`. */
export type V1GuildMember = {
    brawlhalla_id: number
    name: string
    rank: string
    join_date: number
    xp: number
    guild_points?: number
}

/** `GetPlayerGuild`. */
export type V1PlayerGuild = {
    brawlhalla_id: number
    guild?: {
        guild_id: number
        guild_name: string
        personal_xp: number
        personal_xp_this_week?: number
        personal_points?: number
        join_date: number
        rank: string
    }
}

/** Modes `GetPlayerStats` accepts. Note the absence of any 2v2 mode. */
export type V1PlayerMode = "all" | "ranked_1v1" | "ranked_3v3"

// --- client ----------------------------------------------------------------

/**
 * The v1 endpoints this worker uses.
 *
 * `GetGuildStats` and `GetGuildMembers` are the pair that replaces the single
 * v0 `/clan/{id}` call; v1 split one request into two, which is a real cost
 * against the shared upstream rate limit and the reason `getClan` is the only
 * operation moved here so far (see `./index.ts`).
 */
export const v1Ops = (client: HttpClient.HttpClient) => {
    const http = HttpClient.filterStatusOk(client)

    const getJson = <A>(
        path: string,
        params: Record<string, string | number> = {},
    ) =>
        Effect.gen(function* () {
            const query = {
                ...params,
                api_key: yield* Effect.promise(() =>
                    envValue("BRAWLHALLA_API_KEY"),
                ),
            }

            const response = yield* http
                .get(`${V1_BASE}${path}`, {
                    urlParams: query,
                    acceptJson: true,
                })
                .pipe(retryTransient)

            const body = yield* response.json

            return body as unknown as A
        })

    /** `null` when v1 does not know the guild (a real 404 for the caller). */
    const getOptionalJson = <A>(path: string, params: Record<string, string | number>) =>
        getJson<A>(path, params).pipe(Effect.catch(() => Effect.succeed(null)))

    return {
        getPlayerGuild: (playerId: number) =>
            getOptionalJson<V1PlayerGuild>("/player/guild", {
                brawlhalla_id: playerId,
            }),

        getGuildStats: (guildId: number) =>
            getOptionalJson<V1Guild>("/guild/stats", { guild_id: guildId }),

        getGuildMembers: (guildId: number) =>
            getOptionalJson<{ guild_id: number; guild_members: V1GuildMember[] }>(
                "/guild/members",
                { guild_id: guildId },
            ),
    }
}

export type V1Ops = ReturnType<typeof v1Ops>

// --- mapping onto our domain ----------------------------------------------

/**
 * `GetGuildStats` + `GetGuildMembers` -> the `Clan` shape the app renders.
 *
 * Lossless: every field `Clan` needs is present across the two responses. The
 * member `rank` is cast rather than validated because v1 returns the same
 * `Leader`/`Officer`/`Member` vocabulary v0 did.
 */
export const toClan = (
    guild: V1Guild,
    members: readonly V1GuildMember[],
): Clan => ({
    clan_id: guild.guild_id,
    clan_name: guild.name,
    clan_create_date: guild.create_date,
    clan_xp: String(guild.xp),
    clan: members.map((member) => ({
        brawlhalla_id: member.brawlhalla_id,
        name: member.name,
        rank: member.rank as ClanRank,
        join_date: member.join_date,
        xp: member.xp,
    })),
})

/**
 * Whether a mapped guild is complete enough to serve instead of v0.
 *
 * The docs warn that a recently created (uncached) guild can come back with
 * blank `rank`/`member_count` and advise retrying later. Neither is part of
 * `Clan`, so the test is on the fields we actually render: a missing name or
 * creation date means v1 could not answer, and v0 gets the request instead of
 * shipping a blank clan page.
 */
export const isCompleteClan = (clan: Clan | null): boolean =>
    clan !== null &&
    clan.clan_name.trim().length > 0 &&
    clan.clan_create_date > 0
