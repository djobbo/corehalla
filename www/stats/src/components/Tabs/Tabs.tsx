import styles from './Tabs.module.scss'

import { useTabs } from '~providers/TabsProvider'

interface Props<T extends string> {
    tabs: { title: string; name: T }[]
}

export const Tabs = <T extends string>({ tabs }: Props<T>): JSX.Element => {
    const { tab: activeTab, setTab } = useTabs<T>()

    return (
        <div className={styles.tabs}>
            {tabs.map(({ title, name }) => (
                <button
                    onClick={() => setTab(name)}
                    key={name}
                    className={`${styles.tab} ${name === activeTab ? styles.active : ''}`}
                >
                    {title}
                </button>
            ))}
        </div>
    )
}
