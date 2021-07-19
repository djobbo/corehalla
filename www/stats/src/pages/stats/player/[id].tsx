import { fetchPlayerFormat } from '@corehalla/core'
import { MockPlayerStats } from '@corehalla/core/mocks'
import type { IPlayerStatsFormat } from '@corehalla/core/types'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'

import { LegendsTab } from '~layout/pages/stats/PlayerStats_LegendsTab'
import { OverviewTab } from '~layout/pages/stats/PlayerStats_OverviewTab'
import { TeamsTab } from '~layout/pages/stats/PlayerStats_TeamsTab'
import { TabsProvider, useTabs } from '~providers/TabsProvider'
import { formatTime } from '~util'

import { Container } from '@Container'
import { Footer } from '@Footer'
import { Header } from '@Header'
import { ProfileHeader } from '@ProfileHeader'
import { Tabs } from '@Tabs'
import { StatDesc, StatSmall } from '@TextStyles'

interface Props {
    playerStats: IPlayerStatsFormat
}

type PlayerStatsTabs = 'overview' | 'teams' | 'legends'

const Tab = ({ playerStats }: Props) => {
    const { tab } = useTabs<PlayerStatsTabs>()

    switch (tab) {
        case 'overview':
            return <OverviewTab playerStats={playerStats} />
        case 'teams':
            return <TeamsTab teams={playerStats.season.teams ?? []} />
        case 'legends':
            return <LegendsTab playerStats={playerStats} />
        default:
            return <OverviewTab playerStats={playerStats} />
    }
}

const PlayerStatsPage = ({ playerStats }: Props): JSX.Element => {
    return (
        <TabsProvider<PlayerStatsTabs> defaultTab="overview">
            <Head>
                <title>{playerStats.name} Stats • Corehalla</title>
                <meta property="og:image" content={`/api/og/stats/player/${playerStats.id}`} />
                <meta name="twitter:image" content={`/api/og/stats/player/${playerStats.id}`} />
            </Head>
            <Header
                content={
                    <Tabs<PlayerStatsTabs>
                        tabs={[
                            { title: 'Overview', name: 'overview' },
                            { title: 'Teams', name: 'teams' },
                            { title: 'Legends', name: 'legends' },
                        ]}
                    />
                }
            />
            <Container>
                <ProfileHeader
                    title={playerStats.name}
                    bannerURI="/images/backgrounds/Orion.jpg"
                    favorite={{
                        name: playerStats.name,
                        id: playerStats.id.toString(), // TODO: id is a number?
                        type: 'player',
                        thumbURI: `/images/icons/legends/${
                            playerStats.legends.sort((a, b) => b.season.rating - a.season.rating)[0].name
                        }.png`,
                    }}
                >
                    <div>
                        <p>
                            <StatDesc>level</StatDesc>
                            <StatSmall>{playerStats.level}</StatSmall>
                            <StatDesc>({playerStats.xp} xp)</StatDesc>
                        </p>
                        <p>
                            <StatDesc>time spent in game</StatDesc>
                            <StatSmall>{formatTime(playerStats.matchtime)}</StatSmall>
                        </p>
                    </div>
                </ProfileHeader>
                <Tab playerStats={playerStats} />
            </Container>
            <Footer />
        </TabsProvider>
    )
}

export default PlayerStatsPage

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async ({ params: { id } }) => {
    let playerStats: IPlayerStatsFormat

    if (process.env.NODE_ENV === 'production') {
        playerStats = await fetchPlayerFormat(process.env.BH_API_KEY, parseInt(id))
    } else {
        playerStats = MockPlayerStats
    }

    if (!playerStats) return { notFound: true }

    return {
        props: {
            playerStats,
        },
    }
}
