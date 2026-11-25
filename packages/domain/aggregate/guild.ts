import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { guildLevel } from "./guild-levels"
import type { Clan } from "@crh/bhapi/types"
import { CONTRACT_VERSION } from "@crh/api-contract/schemas"
import { PLAN } from "../sections/meta"
import type {
    GuildEnvelope,
    GuildMemberRanked,
    GuildStanding,
} from "@crh/api-contract/schemas"

/** One archive row for a member: the contract's ranked shape plus its id. */
export type GuildMemberRating = {
    readonly playerId: string
    readonly rating: number
    readonly peakRating: number
    readonly tier: string
    readonly region: string
}

/**
 * Zero is how the archive spells "no ranked season", so it is not a rating to
 * show. Blank tier and region are the same absence.
 */
const toMemberRanked = (
    rated: GuildMemberRating | undefined,
): GuildMemberRanked | null => {
    if (rated === undefined || rated.rating <= 0) return null

    return {
        rating: rated.rating,
        peak_rating: Math.max(rated.rating, rated.peakRating),
        tier: rated.tier === "" ? null : rated.tier,
        region: rated.region === "" ? null : rated.region,
    }
}

export const buildGuild = (
    clan: Clan,
    updatedAt: number,
    standing: GuildStanding,
    ratings: readonly GuildMemberRating[],
): GuildEnvelope => {
    const xp = Number.parseInt(clan.clan_xp, 10)
    const { level, xpPercentage } = guildLevel(xp)
    const ratedById = new Map(
        ratings.map((rated) => [rated.playerId, rated] as const),
    )

    return {
        data: {
            id: clan.clan_id,
            name: clan.clan_name,
            slug: getEntitySlug(clan.clan_id, clan.clan_name),
            created_at: clan.clan_create_date,
            xp,
            level,
            xp_percentage: xpPercentage,
            // Null, not zero: unknown lifetime XP ≠ earned none.
            lifetime_xp: clan.legacy_xp ?? null,
            guild_points: clan.guild_points ?? null,
            standing,
            members: clan.clan.map((member) => ({
                id: member.brawlhalla_id,
                // Mapper may leave name as `""`; keep the row — client labels with `#id`.
                name: member.name,
                slug: getEntitySlug(member.brawlhalla_id, member.name),
                rank: member.rank,
                joined_at: member.join_date,
                xp: member.xp,
                // Omit when absent; do not invent zero (`GuildMember.guild_points`).
                ...(member.guild_points === undefined
                    ? {}
                    : { guild_points: member.guild_points }),
                ranked: toMemberRanked(
                    ratedById.get(member.brawlhalla_id.toString()),
                ),
            })),
        },
        meta: {
            plan: PLAN.guildProfile,
            contract: CONTRACT_VERSION,
            updated_at: updatedAt,
            complete: true,
            parts: { clan: "ok" },
        },
    }
}
