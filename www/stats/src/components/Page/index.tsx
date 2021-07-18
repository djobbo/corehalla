import { motion } from 'framer-motion'
// Library imports
import { ReactNode, useEffect } from 'react'

import styles from './index.module.scss'

interface Props {
    title?: string
    children: ReactNode
}

const pageTransition = {
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    },
}

// TODO: Remove this file

export function Page({ children, title }: Props): JSX.Element {
    useEffect(() => {
        if (!title) return
        document.title = title
    }, [])

    return (
        <motion.div
            className={styles.container}
            initial="out"
            animate="in"
            exit="out"
            variants={pageTransition}
            transition={{ duration: 0.2 }}
        >
            <div>{children}</div>
        </motion.div>
    )
}
