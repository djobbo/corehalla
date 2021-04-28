import styles from './index.module.scss';
import { ReactElement } from 'react';
import Link from 'next/link';

export interface ITab<T extends string> {
	displayName: T;
	link: string;
	active?: boolean;
}

export interface Props<T extends string> {
	tabs: ITab<T>[];
}

export function TabsContainer<T extends string>({
	tabs,
}: Props<T>): ReactElement<Props<T>> {
	return (
		<div className={styles.container}>
			{tabs.map(({ displayName, link, active }, i) => (
				<div
					className={`${styles.tab} ${active ? styles.active : ''}`}
					key={i}
				>
					<Link href={link} replace shallow>
						<a>{displayName}</a>
					</Link>
				</div>
			))}
		</div>
	);
}
