import { fetchPlayerFormat } from '@corehalla/core'
import { MockPlayerStats } from '@corehalla/core/mocks'
import { IPlayerStatsFormat } from '@corehalla/core/types'
import { GetServerSideProps } from 'next'

import { formatTime } from '~util'

import { OpenGraph, styles } from '@OpenGraph'

interface Props {
    playerStats: IPlayerStatsFormat
}

const OGPlayerStatsPage = ({ playerStats }: Props): JSX.Element => {
    const mostPlayedLegends = playerStats.legends.sort((a, b) => b.xp - a.xp).slice(0, 3)

    return (
        <OpenGraph>
            <h1>{playerStats.name}</h1>
            <div className={styles.statgroup}>
                <h2>Level {playerStats.level}</h2>
                <h3>{playerStats.xp} xp</h3>
            </div>

            <div className={styles.statgroup}>
                <h2>{formatTime(playerStats.matchtime)}</h2>
                <h3>spent ingame</h3>
            </div>

            <div className={styles.statgroup}>
                <h2>Most played</h2>
                <h3>
                    {mostPlayedLegends.map((legend) => (
                        <img
                            className={styles.mostPlayedImg}
                            src={`/images/icons/legends/${legend.name}.png`}
                            alt={playerStats.season.region}
                            width={64}
                            height={64}
                            key={legend.id}
                        />
                    ))}
                </h3>
            </div>
            {playerStats.season.games > 0 && (
                <img
                    className={styles.banner}
                    src={`/images/ranked-banners/${playerStats.season.tier}.png`}
                    alt={playerStats.season.region}
                />
            )}
        </OpenGraph>
    )
}

export default OGPlayerStatsPage

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
