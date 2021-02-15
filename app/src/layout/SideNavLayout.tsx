import { SideNav } from '@components/SideNav';
import { SideNavContext } from '@providers/SideNavProvider';
import styles from '@styles/Layout.module.scss';
import { PropsWithChildren, useContext } from 'react';

export function SideNavLayout({ children }: PropsWithChildren<{}>) {
	const { sideNavOpen } = useContext(SideNavContext);

	return (
		<>
			<div
				className={`${styles.sideNavLayout} ${
					sideNavOpen ? styles.sideNavOpen : ''
				}`}
			>
				{children}
			</div>
			<SideNav />
		</>
	);
}
