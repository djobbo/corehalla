import type { PlayerRanked } from "../types"

export const getTeamPlayers = (
    playerId: number,
    team: PlayerRanked["2v2"][number],
) => {
    const [player1, player2] = team.teamname.split("+")
    if (team.brawlhalla_id_one === playerId) {
        return {
            playerName: player1,
            teammate: { name: player2, id: team.brawlhalla_id_two },
        }
    }

    return {
        playerName: player2,
        teammate: { name: player1, id: team.brawlhalla_id_one },
    }
}
