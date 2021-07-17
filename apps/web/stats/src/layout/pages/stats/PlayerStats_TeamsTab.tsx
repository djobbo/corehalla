import styles from '~styles/pages/stats/PlayerStatsPage.module.scss'
import layoutStyles from '~layout/Layout.module.scss'
import type { I2v2TeamFormat } from '@corehalla/types'
import { SectionSeparator, PageSection } from '@PageSection'
import { motion } from 'framer-motion'
import { GamesStatsCard } from '@GamesStatsCard'
import { MiscStats } from '@MiscStats'
import { TeamCard } from '@TeamCard'
import { Card } from '@Card'
import { Select } from '@Select'
import { useSort } from '~hooks/useSort'
import { useState } from 'react'

export type TeamsSort = 'rating' | 'peak' | 'games' | 'winrate' | 'wins' | 'losses'

interface Props {
    teams: I2v2TeamFormat[]
}

export const TeamsTab = ({ teams }: Props): JSX.Element => {
    const { sort: sortByProp, setActiveSort: setSortingProp, order: sortOrder, setOrder: setSortOrder } = useSort<
        TeamsSort,
        I2v2TeamFormat
    >('rating', {
        rating: ({ season }) => season.rating,
        peak: ({ season }) => season.peak,
        games: ({ season }) => season.games,
        wins: ({ season }) => season.wins,
        losses: ({ season }) => season.games - season.wins,
        winrate: ({ season }) => (season.games <= 0 ? 0 : season.wins / season.games),
    })

    const [teamSearch, setTeamsearch] = useState('')

    const totalTeamsStats = teams.reduce(
        (acc, team) => ({
            games: acc.games + team.season.games,
            wins: acc.wins + team.season.wins,
            ratingAcc: acc.ratingAcc + team.season.rating,
            peakAcc: acc.peakAcc + team.season.peak,
            ratingAccPond: {
                rating: acc.ratingAccPond.rating + team.season.games * team.season.peak,
                peak: acc.ratingAccPond.peak + team.season.games * team.season.rating,
                total: acc.ratingAccPond.total + team.season.games,
            },
            winrateAcc: acc.winrateAcc + team.season.wins / team.season.games,
        }),
        {
            games: 0,
            wins: 0,
            ratingAcc: 0,
            peakAcc: 0,
            ratingAccPond: { rating: 0, peak: 0, total: 0 },
            winrateAcc: 0,
        },
    )

    return (
        <>
            <Card className={layoutStyles.sortAndFilterContainer}>
                <Select<TeamsSort>
                    onChange={setSortingProp}
                    options={[
                        {
                            value: 'rating',
                            label: 'Rating',
                        },
                        {
                            value: 'peak',
                            label: 'Peak Rating',
                        },
                        {
                            value: 'games',
                            label: 'Games',
                        },
                        {
                            value: 'wins',
                            label: 'Wins',
                        },
                        {
                            value: 'losses',
                            label: 'Losses',
                        },
                        {
                            value: 'winrate',
                            label: 'Winrate',
                        },
                    ]}
                    defaultValue={{
                        value: 'rating',
                        label: 'Rating',
                    }}
                />
                <Select
                    onInputChange={setTeamsearch}
                    onChange={setTeamsearch}
                    options={teams.map(({ teammate }) => ({ value: teammate.name }))}
                    placeholder="All Teams"
                    searchable
                    clearable
                />
                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>Reverse Order</button>
            </Card>
            {teams.length > 0 ? (
                <>
                    {teamSearch ? null : (
                        <>
                            <PageSection title="2v2 overview" initFoldState={true}>
                                <GamesStatsCard
                                    {...totalTeamsStats}
                                    losses={totalTeamsStats.games - totalTeamsStats.wins}
                                    winrate={(totalTeamsStats.winrateAcc / teams.length) * 100}
                                />
                                <MiscStats stats={[]} />
                            </PageSection>
                            <SectionSeparator />
                        </>
                    )}
                    <PageSection title="teams" initFoldState={true}>
                        <div className={styles.teamsContainer}>
                            {sortByProp(
                                teamSearch
                                    ? teams.filter(({ teammate }) =>
                                          teammate.name.toLowerCase().includes(teamSearch.toLowerCase()),
                                      )
                                    : teams,
                            ).map((team) => (
                                <motion.div layoutId={`team_${team.teammate.id}`} key={team.teammate.id}>
                                    <TeamCard team={team} />
                                </motion.div>
                            ))}
                        </div>
                    </PageSection>
                </>
            ) : (
                `No teams`
            )}
        </>
    )
}
