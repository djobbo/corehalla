import type { IRanking1v1Format } from '@corehalla/core/types'
import { SectionSeparator } from '@PageSection'
import { RankingsItem1v1 } from '@RankingsItem'
import { motion } from 'framer-motion'

import styles from '~styles/pages/RankingsPage.module.scss'

export interface Props {
    rankings: IRanking1v1Format[]
}

export const Rankings1v1Tab = ({ rankings }: Props): JSX.Element => {
    return (
        <div className={styles.container}>
            {rankings.map((player, i) => (
                <motion.div layout key={player.id}>
                    {i !== 0 && <SectionSeparator />}
                    <RankingsItem1v1 key={i} player={player} />
                </motion.div>
            ))}
        </div>
    )
}
