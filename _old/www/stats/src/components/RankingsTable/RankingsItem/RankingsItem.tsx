import type { IRanking1v1Format } from '@corehalla/core/types'
import Link from 'next/link'

import styles from './RankingsItem.module.scss'

import { Card } from '@Card'
import { BarChart } from '@Charts'
import { StatDesc, StatLarge, StatMedium, StatSmall } from '@TextStyles'

interface Props1v1 {
    player: IRanking1v1Format
}

export const RankingsItem1v1 = ({ player }: Props1v1): JSX.Element => {
    return (
        <>
            <tr className={styles.rankingsItem}>
                <td>{player.rank}</td>
                <td>{player.region}</td>
                <td className={styles.name}>
                    <Link href={`/stats/player/${player.id}`}>
                        <a>{player.name}</a>
                    </Link>
                </td>
                <td>{player.tier}</td>
                <td>{player.games}</td>
                <td>
                    {player.wins}-{player.games - player.wins}
                </td>
                <td>{player.rating}</td>
                <td>{player.peak}</td>
            </tr>
            <div className={styles.mobileRankingsItem}>
                <Card>
                    <div className={styles.stats}>
                        <div>
                            <Link href={`/stats/player/${player.id}`}>
                                <a>
                                    <StatMedium>
                                        {player.rank} - {player.name}
                                    </StatMedium>
                                </a>
                            </Link>
                            <p>
                                <StatSmall>{player.games}</StatSmall>
                                <StatDesc>games</StatDesc>
                                <StatSmall>
                                    ({player.wins}W-{player.games - player.wins}L)
                                </StatSmall>
                            </p>
                        </div>
                        <div className={styles.largeStat}>
                            <StatLarge>{player.rating}</StatLarge>
                            <p>
                                <StatSmall>{player.peak}</StatSmall>
                                <StatDesc>peak</StatDesc>
                            </p>
                        </div>
                    </div>
                    <div className={styles.barChart}>
                        <BarChart width="100%" amount={(player.wins / player.games) * 100} height="0.25rem" rounded />
                        <div className={styles.barChartLabel}>
                            <StatDesc>{((player.wins / player.games) * 100).toFixed(2)}%</StatDesc>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}
