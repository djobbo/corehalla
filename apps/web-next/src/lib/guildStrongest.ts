import { tierLabel } from "./rankings"
import type { GuildMember } from "@crh/api-contract/schemas"

export const STRONGEST_MEMBER_LIMIT = 5

export type StrongestMember = {
    readonly id: number
    readonly name: string
    readonly slug: string
    readonly rating: number
    readonly peakRating: number
    readonly tier: string
    readonly region: string | null
}

type RatedMember = {
    readonly member: GuildMember
    readonly ranked: NonNullable<GuildMember["ranked"]>
}

/**
 * Highest rating first; equal ratings fall back to the in-game name and then the
 * id, compared by code unit, so the server and the hydration agree on the order.
 */
const compareStrongest = (a: RatedMember, b: RatedMember): number => {
    if (a.ranked.rating !== b.ranked.rating) {
        return b.ranked.rating - a.ranked.rating
    }

    if (a.member.name !== b.member.name) {
        return a.member.name < b.member.name ? -1 : 1
    }

    return a.member.id - b.member.id
}

export const strongestMembers = (
    members: readonly GuildMember[],
    limit: number = STRONGEST_MEMBER_LIMIT,
): readonly StrongestMember[] =>
    members
        .flatMap((member) =>
            member.ranked === null ? [] : [{ member, ranked: member.ranked }],
        )
        .sort(compareStrongest)
        .slice(0, limit)
        .map(({ member, ranked }) => ({
            id: member.id,
            name: member.name,
            slug: member.slug,
            rating: ranked.rating,
            peakRating: ranked.peak_rating,
            tier: tierLabel(ranked.tier),
            region: ranked.region,
        }))
