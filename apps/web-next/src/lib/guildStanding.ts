import type { GuildStanding } from "@crh/api-contract/schemas"

/**
 * In words, because a bare number beside five stats reads as a sixth stat.
 * Null when the standing is unknown: an unindexed guild has no place to claim.
 */
export const standingLabel = (standing: GuildStanding): string | null => {
    if (standing.rank === null || standing.total === null) return null

    return `#${standing.rank.toLocaleString()} of ${standing.total.toLocaleString()} indexed guilds by XP`
}
