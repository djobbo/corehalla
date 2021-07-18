import { BarChartCard } from '@BarChartCard'
// Components imports
import { GamesStatsCard } from '@GamesStatsCard'
import { MiscStats } from '@MiscStats'

import styles from './index.module.scss'

interface Props {
    kos: number
    falls: number
    suicides: number
    teamkos: number
    damageDealt: number
    damageTaken: number
    matchtime: number
    games: number
    wins: number
    losses: number
}

export function SectionOverallStatsContent({
    kos,
    falls,
    suicides,
    teamkos,
    damageDealt,
    damageTaken,
    matchtime,
    games,
    wins,
    losses,
}: Props): JSX.Element {
    const maxKos = Math.max(kos, falls, suicides, teamkos)
    const maxDmg = Math.max(damageDealt, damageTaken)

    return (
        <>
            <div className={styles.container}>
                <GamesStatsCard {...{ games, wins, losses }} winrate={(wins / games) * 100} />
                <BarChartCard
                    title="kos"
                    stats={[
                        { title: 'kos', amount: kos, max: maxKos },
                        { title: 'falls', amount: falls, max: maxKos },
                        { title: 'suicides', amount: suicides, max: maxKos },
                        { title: 'team kos', amount: teamkos, max: maxKos },
                    ]}
                />
                <BarChartCard
                    title="damage"
                    stats={[
                        {
                            title: 'damage dealt',
                            amount: damageDealt,
                            max: maxDmg,
                        },
                        {
                            title: 'damage taken',
                            amount: damageTaken,
                            max: maxDmg,
                        },
                    ]}
                />
            </div>
            <MiscStats
                stats={[
                    {
                        title: 'dps',
                        value: `${(damageDealt / matchtime).toFixed(2)}dmg/s`,
                    },
                    {
                        title: 'time to kill',
                        value: `${(matchtime / kos).toFixed(2)}s`,
                    },
                    {
                        title: 'time to fall',
                        value: `${(matchtime / falls).toFixed(2)}s`,
                    },
                    {
                        title: 'avg. kos/game',
                        value: `${(kos / games).toFixed(1)}`,
                    },
                    {
                        title: 'avg. falls/game',
                        value: `${(falls / games).toFixed(1)}`,
                    },
                    {
                        title: '1 suicide every',
                        value: `${(games / suicides).toFixed(1)}games`,
                    },
                    {
                        title: '1 team ko every',
                        value: `${(games / teamkos).toFixed(1)}games`,
                    },
                    {
                        title: 'avg. game length',
                        value: `${(matchtime / games).toFixed(2)}s`,
                    },
                    {
                        title: 'avg. dmg/ko',
                        value: `${(damageDealt / kos).toFixed(0)}`,
                    },
                    {
                        title: 'avg. dmg/falls',
                        value: `${(damageTaken / falls).toFixed(0)}`,
                    },
                ]}
            />
        </>
    )
}
