import { useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';
import styles from '../styles/Header.module.scss';

export function Header() {
	const {
		mapData: { levelName },
	} = useContext(MapNodesContext);
	return <div className={styles.container}>{levelName}</div>;
}
