import type { GuildMember } from "@crh/api-contract/schemas"

export const CONTRIBUTOR_LIMIT = 5

export type ContributorMetric = "guild_points" | "xp"

export type GuildContributors = {
    readonly metric: ContributorMetric
    /** Highest first, capped at `CONTRIBUTOR_LIMIT`. */
    readonly members: readonly GuildMember[]
}

export const contributorMetricLabel = (metric: ContributorMetric): string =>
    metric === "guild_points" ? "guild points" : "clan XP"

export const contributorValue = (
    member: GuildMember,
    metric: ContributorMetric,
): number =>
    metric === "guild_points" ? (member.guild_points ?? 0) : member.xp

/**
 * Guild points are the honest ranking when the source reports them, but only v1
 * reports them — an older payload falls back to XP rather than pretending every
 * member earned nothing. Members whose points are unreported are left out of a
 * points ranking instead of being ranked at zero.
 */
export const topContributors = (
    members: readonly GuildMember[],
): GuildContributors => {
    const metric: ContributorMetric = members.some(
        (member) => member.guild_points !== undefined,
    )
        ? "guild_points"
        : "xp"

    const value = (member: GuildMember): number =>
        contributorValue(member, metric)

    return {
        metric,
        members: [...members]
            .filter((member) => value(member) > 0)
            .sort((a, b) => value(b) - value(a))
            .slice(0, CONTRIBUTOR_LIMIT),
    }
}
