import { ReactNode } from 'react'

import styles from './Container.module.scss'

interface Props {
    children: ReactNode
}

export const Container = ({ children }: Props): JSX.Element => {
    return <div className={styles.container}>{children}</div>
}
