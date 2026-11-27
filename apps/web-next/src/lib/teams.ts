import type {
    PlayerRanked2v2,
    PlayerRankedTeam,
} from "@crh/api-contract/schemas"

/** The real pairs: a solo-queue row beside a zero-id phantom partner is not a team. */
export const pairedTeams = (
    teams: readonly PlayerRankedTeam[],
): readonly PlayerRankedTeam[] => teams.filter((team) => team.paired)

/**
 * The other half of a pair. Upstream does not order the tuple around the queried
 * player, so the partner is whichever ref is not the player.
 */
export const teamPartner = (
    playerId: number,
    team: PlayerRankedTeam,
): PlayerRankedTeam["team"][number] => {
    const [first, second] = team.team

    return first.id === playerId ? second : first
}

const outranks = (
    candidate: PlayerRankedTeam,
    current: PlayerRankedTeam,
): boolean => {
    if (candidate.rating !== current.rating) {
        return candidate.rating > current.rating
    }

    if (candidate.peak_rating !== current.peak_rating) {
        return candidate.peak_rating > current.peak_rating
    }

    return candidate.games > current.games
}

/**
 * The player's headline pair. Rating decides, then peak rating, then games; a
 * full tie keeps the upstream order so the choice stays deterministic.
 */
export const bestTeam = (
    teams: readonly PlayerRankedTeam[],
): PlayerRankedTeam | null =>
    pairedTeams(teams).reduce<PlayerRankedTeam | null>(
        (best, team) => (best === null || outranks(team, best) ? team : best),
        null,
    )

export type BestTeamSummary = {
    readonly team: PlayerRankedTeam
    readonly pairedTeams: number
}

/** The overview's headline pair with the rest of the record, or null without one. */
export const bestTeamSummary = (
    record: PlayerRanked2v2 | null,
): BestTeamSummary | null => {
    if (record === null) return null

    const team = bestTeam(record.teams)

    return team === null
        ? null
        : { team, pairedTeams: pairedTeams(record.teams).length }
}
