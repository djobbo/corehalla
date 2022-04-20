import { AnimatePresence, motion } from 'framer-motion'
import { PropsWithChildren, useState } from 'react'

import styles from './PageSection.module.scss'

import { ChevronUpIcon, CompressIcon, ExpandIcon } from '@Icons'

interface Props {
    title: string
    collapsed?: boolean
}

export function PageSection({ children, title, collapsed }: PropsWithChildren<Props>): JSX.Element {
    const [foldState, setFoldState] = useState(collapsed ?? false)

    return (
        <div className={styles.container}>
            <a
                className={styles.title}
                href="#"
                onClick={(e) => {
                    e.preventDefault()
                    setFoldState((oldState) => !oldState)
                }}
            >
                {title}
                {foldState ? CompressIcon : ExpandIcon}
            </a>
            <AnimatePresence>
                {foldState && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        variants={{
                            expanded: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                    >
                        <div className={styles.content}>{children}</div>
                        <div className={styles.icon} onClick={() => setFoldState(false)}>
                            {ChevronUpIcon}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export const SectionSeparator = (): JSX.Element => <hr className={styles.separator} />
