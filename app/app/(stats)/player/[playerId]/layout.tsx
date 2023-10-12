import { type BHPlayerAlias } from "db/generated/client"
import { type Metadata } from "next"
import { PlayerStatsHeader } from "./PlayerStatsHeader"
import { PlayerStatsProvider } from "./PlayerStatsProvider"
import { PlayerStatsTabs } from "./PlayerStatsTabs"
import { type ReactNode, cache } from "react"
import { getPlayerRanked, getPlayerStats } from "bhapi"
import { supabaseService } from "db/supabase/service"

type PlayerStatsLayoutProps = {
    children: ReactNode
    params: {
        playerId: string
    }
}

const fetchPlayerData = cache(async (playerId: string) => {
    const [stats, ranked, aliases] = await Promise.all([
        getPlayerStats(playerId),
        getPlayerRanked(playerId),
        (async () => {
            const { data, error } = await supabaseService
                .from<BHPlayerAlias>("BHPlayerAlias")
                .select("*")
                .order("createdAt", { ascending: false })
                .match({ playerId, public: true })

            if (error) throw error

            return data
        })(),
    ])

    return {
        stats,
        ranked,
        aliases,
    }
})

export const generateMetadata = async ({
    params: { playerId },
}: PlayerStatsLayoutProps): Promise<Metadata> => {
    const { stats } = await fetchPlayerData(playerId)

    return {
        title: `${stats.name} - Player Stats • Corehalla`,
        description: `${stats.name} Stats - Brawlhalla Player Stats • Corehalla`,
    }
}

export default async function PlayerStatsLayout({
    params: { playerId },
    children,
}: PlayerStatsLayoutProps) {
    const { stats, ranked, aliases } = await fetchPlayerData(playerId)

    return (
        <PlayerStatsProvider stats={stats} ranked={ranked} aliases={aliases}>
            <PlayerStatsHeader />
            <PlayerStatsTabs />
            {children}
        </PlayerStatsProvider>
    )
}
