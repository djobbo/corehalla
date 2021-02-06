import styles from '../styles/Layout.module.scss';
import { PropsWithChildren } from 'react';
import { Header } from './Header';
import { SideNav } from './SideNav';

interface Props {}

export function Layout({ children }: PropsWithChildren<Props>) {
	return (
		<div id={styles.App}>
			<Header />
			<SideNav />
			{children}
		</div>
	);
}
