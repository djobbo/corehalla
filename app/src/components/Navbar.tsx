import styles from './Navbar.module.scss';
import { GoBackIcon, SearchIcon } from '@components/Icons';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@components/SearchBar';

interface Props {
	title?: string;
}

export const Navbar: FC<Props> = ({ title }: Props) => {
	const [showSearch, setShowSearch] = useState(false);

	const router = useRouter();

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
									router.back();
								}}
							>
								{GoBackIcon}
							</a>
							<span className={styles.title}>{title}</span>
						</div>
					) : (
						<Link href='/'>
							{/* TODO: add width & height to every single Image */}
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
					>
						{SearchIcon}
					</a>
				</>
			)}
		</div>
	);
};
