import type { PlayerRanked, Ranking2v2 } from "../types"

/**
 * The two players of a 2v2 team.
 *
 * The names come from the separate fields wherever a source provides them,
 * which every v1-derived row does. Only the legacy v0 payload does not — it
 * ships the pair pre-joined — so the split lives here and nowhere else: one
 * documented fallback instead of five callers each inventing one, and all of
 * them inheriting the same wrong answer for a username containing a `+`.
 */
export const getTeamPlayers = (
    team: PlayerRanked["2v2"][number] | Ranking2v2,
) => {
    const [joinedOne = "", joinedTwo = ""] = team.teamname.split("+")

    return [
        {
            name: team.name_one ?? joinedOne,
            id: team.brawlhalla_id_one,
        },
        {
            name: team.name_two ?? joinedTwo,
            id: team.brawlhalla_id_two,
        },
    ]
}

export const getPlayerTeam = (
    playerId: number,
    team: PlayerRanked["2v2"][number],
) => {
    const [player1, player2] = getTeamPlayers(team)

    if (team.brawlhalla_id_one === playerId) {
        return {
            playerName: player1.name,
            teammate: player2,
        }
    }

    return {
        playerName: player2.name,
        teammate: player1,
    }
}
