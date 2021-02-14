import styles from './SideNav.module.scss';
// Library imports
import { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { HomeIcon, FavoriteIcon, RankingsIcon } from './Icons';

// Providers imports
import { FavoritesContext } from '../providers/FavoritesProvider';

interface BottomNavigationTab {
	title: string;
	link: string;
	icon: JSX.Element;
	exact?: boolean;
}

const tabs: BottomNavigationTab[] = [
	{
		title: 'Home',
		link: '/',
		icon: HomeIcon,
		exact: true,
	},
	{
		title: 'Rankings',
		link: '/rankings',
		icon: RankingsIcon,
	},
	{
		title: 'Favorites',
		link: '/favorites',
		icon: FavoriteIcon,
	},
	// {
	//     title: 'History',
	//     link: '/history',
	//     icon: HistoryIcon,
	// },
	// {
	//     title: 'Settings',
	//     link: '/settings',
	//     icon: SettingsIcon,
	// },
];

export function SideNav() {
	const { favorites } = useContext(FavoritesContext);
	const { pathname } = useRouter();

	if (typeof document === 'undefined') return null;
	return (
		<div className={styles.container}>
			{tabs.map(({ title, link, icon, exact }, i) => (
				<Link href={link} key={i}>
					<a
						className={`${styles.navItem} ${
							pathname === link ||
							(!exact && pathname.startsWith(link))
								? styles.active
								: ''
						}`}
					>
						{icon}
					</a>
				</Link>
			))}
			<hr className={styles.separator} />
			{favorites.map(({ id, type, name, thumbURI }) => (
				<Link href={`/stats/${type}/${id}`} key={`${type}/${id}`}>
					<a
						className={`${styles.navItem} ${
							pathname === '/stats/${type}/${id}'
								? styles.active
								: ''
						}`}
					>
						<img src={thumbURI} alt={name} />
						<span>{name.substr(0, 3).toUpperCase()}</span>
					</a>
				</Link>
			))}
		</div>
	);
}
