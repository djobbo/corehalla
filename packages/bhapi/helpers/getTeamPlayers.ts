import type { PlayerRanked, Ranking2v2 } from "../types"

/**
 * Prefer separate name fields; only v0 lacks them and ships a joined
 * `teamname`. Splitting lives here so callers do not each mishandle `+`.
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
