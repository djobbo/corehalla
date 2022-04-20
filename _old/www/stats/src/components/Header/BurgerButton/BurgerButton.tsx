import { MouseEvent as ReactMouseEvent } from 'react'

import styles from './BurgerButton.module.scss'

interface Props {
    onClick: (event: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

export const BurgerButton = ({ onClick }: Props): JSX.Element => {
    return (
        <a
            className={styles.burger}
            onClick={(e) => {
                e.preventDefault()
                onClick(e)
            }}
        >
            XDDDD
        </a>
    )
}
