import styles from '@styles/pages/HomePage.module.scss';
import layoutStyles from '@styles/Layout.module.scss';
// Library imports
import { useContext, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { StatSmall, StatDesc } from '@components/TextStyles';

// Components imports
import { PlayerSearchContext } from '@providers/PlayerSearchProvider';
import { useViewportScroll } from 'framer-motion';
import { SideNavLayout } from '@layout/SideNavLayout';
import { MenuIcon } from '@components/Icons';
import { SideNavContext } from '@providers/SideNavProvider';

export default function HomePage() {
	const { scrollY } = useViewportScroll();
	const { setPlayerSearch } = useContext(PlayerSearchContext);
	const [hasScrolled, setHasScrolled] = useState(scrollY.get() > 0);
	const { setSideNavOpen } = useContext(SideNavContext);

	scrollY.onChange(() => {
		setHasScrolled(scrollY.get() > 0);
	});

	return (
		<SideNavLayout>
			<Head>
				<title>Index • Corehalla</title>
			</Head>
			<div
				className={`${styles.landingNavbar} ${
					hasScrolled ? styles.hasScrolled : ''
				}`}
			>
				<Link href='/'>
					<a>
						<img
							className={styles.mainLogo}
							src='/images/logo.png'
							alt='Corehalla Logo'
						/>
					</a>
				</Link>
				<ul>
					<Link href='/'>Home</Link>
					<Link href='/rankings'>Rankings</Link>
					<Link href='/favorites'>Favorites</Link>
					<Link href='#'>
						<a className={styles.navCTA}>Login</a>
					</Link>
				</ul>
			</div>
			<main className={layoutStyles.container}>
				<div className={styles.landingSections}>
					<div className={styles.landingContent}>
						<div className={styles.text}>
							<h1 className={styles.title}>
								Stats, to the core.
							</h1>
							<p className={styles.desc}>
								Corehalla is a statistics website for the game
								Brawlhalla.
								<br />
								Designed to be as intuitive as possible, it
								gives players all the information they need
								regarding the ranked leaderboard, power rankings
								and specific players & clans stats.
							</p>
							<input
								className={styles.searchInput}
								type='text'
								onChange={(e) =>
									setPlayerSearch(e.target.value)
								}
								placeholder='Search Player...'
							/>
						</div>
						<div className={styles.landingImg}>
							<img
								src='/images/Bodvar Landing.png'
								alt=''
								width='50%'
								height='auto'
							/>
						</div>
					</div>
					{/* <div className={`${styles.landingContent} ${styles.right}`}>
					<div className={styles.text}>
						<h1 className={styles.title}>Find your clan</h1>
						<p className={styles.desc}>XD</p>
						<input
							className={styles.searchInput}
							type='text'
							onChange={(e) => setPlayerSearch(e.target.value)}
							placeholder='Search Clan...'
						/>
					</div>
					<div className={styles.landingImg}>
						<img
							src='/images/Ada Landing.png'
							alt=''
							width='50%'
							height='auto'
						/>
					</div>
				</div> */}

					<div className={styles.mainContent}>
						<div className={styles.blips}>
							<div className={styles.blip}>
								<StatSmall>Rankings</StatSmall>
								<br />
								<StatDesc>
									Lorem ipsum dolor sit, amet consectetur
									adipisicing elit. At, itaque excepturi eius
									repellendus atque.
								</StatDesc>
							</div>
							<div className={styles.blip}>
								<StatSmall>Player Stats</StatSmall>
								<br />
								<StatDesc>
									Lorem ipsum dolor, sit amet consectetur
									adipisicing elit. Vel perspiciatis incidunt
									odio sit.
								</StatDesc>
							</div>
							<div className={styles.blip}>
								<StatSmall>Clan Stats</StatSmall>
								<br />
								<StatDesc>
									Lorem ipsum dolor sit amet consectetur
									adipisicing elit. Temporibus facere natus
									animi ut.
								</StatDesc>
							</div>
						</div>
					</div>
				</div>
			</main>
		</SideNavLayout>
	);
}
