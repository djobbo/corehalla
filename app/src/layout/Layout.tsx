import { Footer } from '@components/Footer';
import { SideNav } from '@components/SideNav';
import { SideNavContext } from '@providers/SideNavProvider';
import styles from '@styles/Layout.module.scss';
import { PropsWithChildren, useContext } from 'react';

export function Layout({ children }: PropsWithChildren<{}>) {
	const { sideNavOpen } = useContext(SideNavContext);

	return (
		<>
			<div
				className={`${styles.mainGrid} ${
					sideNavOpen ? styles.sideNavOpen : ''
				}`}
			>
				<div>{children}</div>
				<Footer />
			</div>
			<SideNav />
		</>
	);
}
