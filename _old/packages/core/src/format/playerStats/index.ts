import { staticLegendsData } from '../../static'
import type { IPlayerRanked, IPlayerStats, IPlayerStatsFormat } from '../../types'
import { cleanString } from '../../util/cleanString'
import { formatClanStats } from './formatClanStats'
import { formatLegendsStats } from './formatLegendsStats'
import { getSeasonStats } from './getSeasonStats'

export const formatPlayerStats = (
    playerStats: IPlayerStats | undefined,
    playerRanked: IPlayerRanked | undefined,
): IPlayerStatsFormat => {
    const legends = formatLegendsStats(staticLegendsData, playerStats?.legends, playerRanked?.legends)

    const season = getSeasonStats(playerRanked)

    const globalStats = legends.reduce<{
        kos: number
        falls: number
        suicides: number
        teamkos: number
        matchtime: number
        damageDealt: number
        damageTaken: number
    }>(
        (acc, l) => ({
            kos: acc.kos + l.kos,
            falls: acc.falls + l.falls,
            suicides: acc.suicides + l.suicides,
            teamkos: acc.teamkos + l.teamkos,
            matchtime: acc.matchtime + l.matchtime,
            damageDealt: acc.damageDealt + l.damageDealt,
            damageTaken: acc.damageTaken + l.damageTaken,
        }),
        {
            kos: 0,
            falls: 0,
            suicides: 0,
            teamkos: 0,
            matchtime: 0,
            damageDealt: 0,
            damageTaken: 0,
        },
    )

    const gadgets = {
        bomb: {
            damage: parseInt(playerStats?.damagebomb ?? '0', 10),
            kos: playerStats?.kobomb ?? 0,
        },
        mine: {
            damage: parseInt(playerStats?.damagemine ?? '0', 10),
            kos: playerStats?.komine ?? 0,
        },
        spikeball: {
            damage: parseInt(playerStats?.damagespikeball ?? '0', 10),
            kos: playerStats?.kospikeball ?? 0,
        },
        sidekick: {
            damage: parseInt(playerStats?.damagesidekick ?? '0', 10),
            kos: playerStats?.kosidekick ?? 0,
        },
        snowball: {
            hits: playerStats?.hitsnowball ?? 0,
            kos: playerStats?.kosnowball ?? 0,
        },
    }

    return {
        id: playerStats?.brawlhalla_id ?? -1,
        name: cleanString(playerStats?.name ?? ''),
        xp: playerStats?.xp ?? 0,
        level: playerStats?.level ?? 0,
        xpPercentage: playerStats?.xp_percentage ?? 0,
        games: playerStats?.games ?? 0,
        wins: playerStats?.wins ?? 0,
        legends,
        season,
        ...globalStats,
        clan: formatClanStats(playerStats?.clan),
        gadgets,
    }
}
