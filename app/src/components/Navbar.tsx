import styles from './Navbar.module.scss';
import { MenuIcon, SearchIcon } from '@components/Icons';
import { useRouter } from 'next/router';
import { FC, useContext, useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@components/SearchBar';
import { SideNavContext } from '@providers/SideNavProvider';

interface Props {
	title?: string;
}

export const Navbar: FC<Props> = ({ title }: Props) => {
	const [showSearch, setShowSearch] = useState(false);

	const { setSideNavOpen } = useContext(SideNavContext);

	return (
		<div
			className={`${styles.container} ${
				showSearch ? styles.showSearch : ''
			}`}
		>
			{showSearch ? (
				<SearchBar setShowSearch={setShowSearch} />
			) : (
				<>
					{title ? (
						<div>
							<a
								href='#'
								onClick={(e) => {
									e.preventDefault();
									setSideNavOpen((open) => !open);
								}}
								className={styles.icon}
							>
								{MenuIcon}
							</a>
							<span className={styles.title}>{title}</span>
						</div>
					) : (
						<Link href='/'>
							<a>
								<img
									className={styles.logo}
									src='/images/logo.png'
									alt='Corehalla Logo'
								/>
							</a>
						</Link>
					)}
					<a
						href='#'
						onClick={(e) => {
							e.preventDefault();
							setShowSearch(true);
						}}
						className={styles.icon}
					>
						{SearchIcon}
					</a>
				</>
			)}
		</div>
	);
};
