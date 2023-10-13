"use client"

import { type Clan } from "bhapi/types"
import { type ReactNode, createContext, useContext } from "react"

type ClanStatsContext = {
    clan: Clan | null
}

const clanStatsContext = createContext<ClanStatsContext>({
    clan: null,
})

export const useClanStats = () => {
    const context = useContext(clanStatsContext)
    if (!context) {
        throw new Error(`useClanStats must be used within a ClanStatsProvider`)
    }

    const { clan } = context

    if (!clan) {
        throw new Error(`useClanStats must be used with a valid clan`)
    }

    return { clan }
}

type ClanStatsProviderProps = {
    children: ReactNode
    clan: Clan
}

export const ClanStatsProvider = ({
    children,
    clan,
}: ClanStatsProviderProps) => {
    return (
        <clanStatsContext.Provider value={{ clan }}>
            {children}
        </clanStatsContext.Provider>
    )
}
