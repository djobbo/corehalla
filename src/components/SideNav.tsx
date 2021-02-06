import { useRouter } from 'next/router';
import { PropsWithChildren, ReactNode } from 'react';
import styles from '../styles/SideNav.module.scss';
import Link from 'next/link';

function NavItem({ navItem: { href, icon } }: { navItem: INavItem }) {
	const { pathname } = useRouter();
	return (
		<Link href={href}>
			<a
				className={`${styles.navItem} ${
					href === pathname ? styles.selected : ''
				}`}
			>
				<svg className={styles.navIcon} viewBox='0 0 80 80' fill='none'>
					{icon}
				</svg>
			</a>
		</Link>
	);
}

interface INavItem {
	name: string;
	href: string;
	icon: ReactNode;
}

const navItems: INavItem[] = [
	{
		name: 'Level Settings',
		href: '/',
		icon: (
			<>
				<path d='M50 23L30 15V57L50 65V23Z' />
				<path d='M30 15L10 23V65L30 57' />
				<path d='M50 23L70 15V57L50 65' />
			</>
		),
	},
	// {
	// 	name: 'Properties',
	// 	href: '/',
	// 	icon: (
	// 		<>
	// 			<path d='M21 17C21 15.8954 21.8954 15 23 15H27C28.1046 15 29 15.8954 29 17V29C29 30.1046 28.1046 31 27 31H23C21.8954 31 21 30.1046 21 29V17Z' />
	// 			<path d='M51 34C51 32.8954 51.8954 32 53 32H57C58.1046 32 59 32.8954 59 34V46C59 47.1046 58.1046 48 57 48H53C51.8954 48 51 47.1046 51 46V34Z' />
	// 			<path d='M33 51C33 49.8954 33.8954 49 35 49H39C40.1046 49 41 49.8954 41 51V63C41 64.1046 40.1046 65 39 65H35C33.8954 65 33 64.1046 33 63V51Z' />
	// 			<path d='M12 23H21M29 23H68' />
	// 			<path d='M12 40H51M59 40H68' />
	// 			<path d='M12 57H33M41 57H68' />
	// 		</>
	// 	),
	// },
	{
		name: 'Code',
		href: '/code',
		icon: (
			<>
				<path d='M30 64.1641L50 16.1641' />
				<path d='M23 24.1641L5.84089 39.4167C5.39337 39.8144 5.39337 40.5137 5.84088 40.9115L23 56.1641' />
				<path d='M57 24.1641L74.1592 39.4167C74.6067 39.8144 74.6067 40.5137 74.1592 40.9115L57 56.1641' />
			</>
		),
	},
];

export function SideNav() {
	return (
		<div className={styles.container}>
			{navItems.map((item) => (
				<NavItem key={item.href} navItem={item} />
			))}
		</div>
	);
}
