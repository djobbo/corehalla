import { clanRanks } from "@crh/bhapi/constants"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"

export type RosterRole = ClanRank

/** `all` keeps every role; a rank narrows the roster to that role. */
export type RosterRoleFilter = "all" | RosterRole

export type RosterFilters = {
    readonly query: string
    readonly role: RosterRoleFilter
}

export type RosterRoleCount = {
    readonly role: RosterRole
    readonly count: number
}

export const allRosterFilters: RosterFilters = { query: "", role: "all" }

/**
 * In-game names arrive padded with zero-width and control characters that the
 * card never renders. Stripping them on both sides lets a player type the name
 * they can see and still match the payload the game sent.
 */
const comparableName = (name: string): string =>
    cleanString(name)
        .replace(/[\p{Cc}\p{Cf}]/gu, "")
        .trim()
        .toLowerCase()

/** Counts only the roles the roster actually contains, in rank order. */
export const rosterRoleCounts = (
    members: readonly GuildMember[],
): readonly RosterRoleCount[] =>
    clanRanks.flatMap((role) => {
        const count = members.filter((member) => member.rank === role).length

        return count === 0 ? [] : [{ role, count }]
    })

export const rosterMatches = (
    members: readonly GuildMember[],
    filters: RosterFilters,
): readonly GuildMember[] => {
    const needle = comparableName(filters.query)

    return members.filter(
        (member) =>
            (filters.role === "all" || member.rank === filters.role) &&
            (needle === "" || comparableName(member.name).includes(needle)),
    )
}

export const isRosterFiltered = (filters: RosterFilters): boolean =>
    filters.role !== "all" || comparableName(filters.query) !== ""

const formatCount = (value: number): string => value.toLocaleString("en-US")

export const rosterMatchSummary = (matched: number, total: number): string =>
    `${formatCount(matched)} of ${formatCount(total)} ${
        total === 1 ? "member" : "members"
    }`

export const rosterEmptyMessage = (filters: RosterFilters): string => {
    const query = filters.query.trim()

    if (query !== "" && filters.role !== "all")
        return `No members match “${query}” with the ${filters.role} role.`
    if (query !== "") return `No members match “${query}”.`
    if (filters.role !== "all")
        return `No members have the ${filters.role} role.`

    return "This roster has no members."
}
