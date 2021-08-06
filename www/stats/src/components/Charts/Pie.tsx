import styles from './Charts.module.scss'

import { ChartProps } from './common'

type Props = ChartProps

const getCoordinatesForPercent = (percent: number) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)]

export const PieChart = ({ width = '2rem', height = '2rem', amount = 0 }: Props): JSX.Element => {
    const percent = amount / 100
    const [startX, startY] = getCoordinatesForPercent(0)
    const [endX, endY] = getCoordinatesForPercent(percent)
    const largeArcFlag = percent > 0.5 ? 1 : 0

    return (
        <svg width={width} height={height} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
            <circle r="1" cx="0" cy="0" className={styles.bg} />
            {/* <circle
				r='5'
				cx='10'
				cy='10'
				fill='transparent'
				className={styles.fg}
				strokeWidth='10'
				strokeDasharray={`calc(${amount} * 31.4 / 100) 31.4`}
				transform='rotate(-90) translate(-20)'
			/> */}
            <path d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`} className={styles.fg} />
        </svg>
    )
}
