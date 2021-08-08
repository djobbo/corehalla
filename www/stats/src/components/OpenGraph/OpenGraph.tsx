import { ReactNode } from 'react'

import styles from './OpenGraph.module.scss'

interface Props {
    children: ReactNode
}

export const OpenGraph = ({ children }: Props): JSX.Element => {
    return <div className={styles.og}>{children}</div>
}
