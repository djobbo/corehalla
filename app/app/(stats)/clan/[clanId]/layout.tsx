import { ClanStatsHeader } from "./ClanStatsHeader"
import { ClanStatsProvider } from "./ClanStatsProvider"
import { type Metadata } from "next"
import { type ReactNode, cache } from "react"
import { getClan } from "bhapi"

type ClanStatsLayoutProps = {
    children: ReactNode
    params: {
        clanId: string
    }
}

const fetchClanData = cache(async (clanId: string) => {
    const clan = await getClan(clanId)

    return {
        clan,
    }
})

export const generateMetadata = async ({
    params: { clanId },
}: ClanStatsLayoutProps): Promise<Metadata> => {
    const { clan } = await fetchClanData(clanId)

    return {
        title: `${clan.clan_name} - Clan Stats • Corehalla`,
        description: `${clan.clan_name} Stats - Brawlhalla Clan Stats • Corehalla`,
    }
}

export default async function ClanStatsLayout({
    params: { clanId },
    children,
}: ClanStatsLayoutProps) {
    const { clan } = await fetchClanData(clanId)

    return (
        <ClanStatsProvider clan={clan}>
            <ClanStatsHeader />
            {children}
        </ClanStatsProvider>
    )
}
