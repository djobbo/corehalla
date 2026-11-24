import type { GuildMember } from "@crh/api-contract/schemas"

/**
 * Rating order for the roster. A member the archive does not know compares
 * below every rated one, so the two groups stay together in both directions
 * and members keep their incoming order within a group.
 */
export const compareMemberRating = (a: GuildMember, b: GuildMember): number => {
    const left = a.ranked?.rating
    const right = b.ranked?.rating

    if (left === undefined && right === undefined) return 0
    if (left === undefined) return -1
    if (right === undefined) return 1

    return left - right
}
