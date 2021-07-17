import styles from '../styles/Layout.module.scss'
import { ReactNode } from 'react'
import { Header } from './Header'
import { SideNav } from './SideNav'
import { PropertiesPanel } from './PropertiesPanel'
import { Timeline } from './Timeline'
// import { Resizable } from './Resizable';

interface Props {
    children: ReactNode
}

export function Layout({ children }: Props): JSX.Element {
    return (
        <div id={styles.App}>
            <Header />
            <SideNav />
            <PropertiesPanel />
            <div className={styles.editor}>{children}</div>
            <Timeline />
        </div>
    )
}
