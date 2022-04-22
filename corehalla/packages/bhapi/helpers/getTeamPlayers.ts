import type { PlayerRanked, Ranking2v2 } from "../types"

export const getTeamPlayers = (
    team: PlayerRanked["2v2"][number] | Ranking2v2,
) => {
    const [player1, player2] = team.teamname.split("+")
    return [
        {
            name: player1,
            id: team.brawlhalla_id_one,
        },
        {
            name: player2,
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
