import { useMapNodesContext } from '../providers/MapNodesProvider';
import styles from '../styles/Header.module.scss';

export function Header(): JSX.Element {
    const {
        mapData: { levelName },
    } = useMapNodesContext();
    return <div className={styles.container}>{levelName}</div>;
}
