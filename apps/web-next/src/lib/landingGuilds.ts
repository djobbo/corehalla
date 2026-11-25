import { cleanString } from "@crh/common/helpers/cleanString"
import type { ClanRanking } from "@crh/api-contract/schemas"
import { clanHref } from "./rankings"

/** The landing previews this many guilds before deferring to the full board. */
export const LANDING_GUILDS_LIMIT = 5

export type LandingGuild = {
    readonly id: string
    readonly rank: number
    readonly name: string
    readonly href: string
    readonly xp: string
}

export const landingGuilds = (
    board: readonly ClanRanking[] | null,
): readonly LandingGuild[] => {
    if (board === null) return []

    return board.slice(0, LANDING_GUILDS_LIMIT).map((clan, index) => ({
        id: clan.id,
        rank: index + 1,
        name: cleanString(clan.name),
        href: clanHref(clan.slug),
        xp: clan.xp.toLocaleString(),
    }))
}
