import styles from './index.module.scss'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

const Stat = (statType: string) => {
    const RawStat = (props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>): JSX.Element => (
        <span className={styles[statType]} {...props} />
    )

    return RawStat
}

export const StatSmall = Stat('statSmall')
export const StatMedium = Stat('statMedium')
export const StatLarge = Stat('statLarge')
export const StatDesc = Stat('statDesc')
