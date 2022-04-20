import styles from '../styles/Header.module.scss'

import { useMapNodesContext } from '../providers/MapNodesProvider'

export function Header(): JSX.Element {
    const {
        mapData: { levelName },
    } = useMapNodesContext()
    return <div className={styles.container}>{levelName}</div>
}
