import styles from './Charts.module.scss'

import { ChartProps } from './common'

interface Props extends ChartProps {
    rounded?: boolean
}

export const BarChart = ({ width = '100%', height = '0.25rem', amount = 0, rounded }: Props): JSX.Element => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            className={rounded ? styles.rounded : ''}
        >
            <rect x="0" y="0" width="1" height="1" className={styles.bg} />
            <rect x="0" y="0" width={amount / 100} height="1" className={styles.fg} />
        </svg>
    )
}
