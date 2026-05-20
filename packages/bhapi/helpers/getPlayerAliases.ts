import { cleanString } from "common/helpers/cleanString"

import type { PlayerRanked, PlayerStats } from "../types"
import { getPlayerTeam } from "./getTeamPlayers"

export const getPlayerAliases = (
    playerStats: PlayerStats,
    playerRanked?: PlayerRanked,
) => [
    ...new Set([
        cleanString(playerStats.name),
        ...(playerRanked?.["2v2"].map((team) =>
            cleanString(
                getPlayerTeam(playerRanked.brawlhalla_id, team).playerName,
            ),
        ) ?? []),
    ]),
]
