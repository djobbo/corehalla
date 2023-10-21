"use client"

import { type BHPlayerAlias } from "db/generated/client"
import {
    type FullLegend,
    type FullWeapon,
    defaultLegendAccumulativeData,
    defaultWeaponlessData,
    getFullLegends,
    getFullWeapons,
    getLegendsAccumulativeData,
    getWeaponlessData,
} from "bhapi/legends"
import { type PlayerRanked, type PlayerStats } from "bhapi/types"
import { type ReactNode, createContext, useContext } from "react"

type PlayerStatsContext = {
    stats: PlayerStats | null
    ranked: PlayerRanked | null
    aliases: BHPlayerAlias[]
    legends: FullLegend[]
    legendsAccumulativeData: ReturnType<typeof getLegendsAccumulativeData>
    weapons: FullWeapon[]
    weaponLessData: ReturnType<typeof getWeaponlessData>
}

const playerStatsContext = createContext<PlayerStatsContext>({
    stats: null,
    ranked: null,
    aliases: [],
    legends: [],
    weapons: [],
    legendsAccumulativeData: defaultLegendAccumulativeData,
    weaponLessData: defaultWeaponlessData,
})

export const usePlayerStats = () => {
    const context = useContext(playerStatsContext)
    if (!context) {
        throw new Error(
            `usePlayerStats must be used within a PlayerStatsProvider`,
        )
    }

    const { stats, ...rest } = context

    if (!stats) {
        throw new Error(`usePlayerStats must be used with a valid player`)
    }

    return { stats, ...rest }
}

type PlayerStatsProviderProps = {
    children: ReactNode
    stats: PlayerStats
    ranked: PlayerRanked
    aliases: BHPlayerAlias[]
}

export const PlayerStatsProvider = ({
    children,
    stats,
    ranked,
    aliases,
}: PlayerStatsProviderProps) => {
    const legends = getFullLegends(stats.legends || [], ranked?.legends)
    const legendsAccumulativeData = getLegendsAccumulativeData(legends)
    const weapons = getFullWeapons(legends)
    const weaponLessData = getWeaponlessData(legends)

    return (
        <playerStatsContext.Provider
            value={{
                stats,
                ranked,
                aliases,
                legends,
                weapons,
                legendsAccumulativeData,
                weaponLessData,
            }}
        >
            {children}
        </playerStatsContext.Provider>
    )
}
