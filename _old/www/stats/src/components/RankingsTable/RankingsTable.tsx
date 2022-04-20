import { IRanking1v1Format } from '@corehalla/core/types'

import styles from './RankingsTable.module.scss'

import { RankingsItem1v1 } from './RankingsItem'

interface Props {
    rankings: IRanking1v1Format[]
}

export const RankingsTable = ({ rankings }: Props): JSX.Element => {
    return (
        <table className={styles.rankingsTable}>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Region</th>
                    <th className={styles.name}>Name</th>
                    <th>Tier</th>
                    <th>Games</th>
                    <th>Win-Loss</th>
                    <th>Rating</th>
                    <th>Peak</th>
                </tr>
            </thead>
            {rankings.map((player, i) => (
                <RankingsItem1v1 key={i} player={player} />
            ))}
        </table>
    )
}
