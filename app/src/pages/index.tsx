import styles from '@styles/pages/HomePage.module.scss';
// Library imports
import { useContext, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { StatSmall, StatDesc } from '@components/TextStyles';

// Components imports
import { LandingLayout } from '@layout/LandingLayout';
import { PlayerSearchContext } from '@providers/PlayerSearchProvider';
import { useScrollPosition } from '@hooks/useScrollPosition';

// const ScrollIndicator = styled.div`
//     position: absolute;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     text-align: center;
//     padding: 2rem;
//     margin: 1rem;
//     border: 1px solid $text-2;
// `;

export default function HomePage() {
	const { setPlayerSearch } = useContext(PlayerSearchContext);
	const [hasScrolled, setHasScrolled] = useState(false);
	useScrollPosition(
		({ currScrollPos }) => {
			setHasScrolled(currScrollPos > 0);
		},
		[hasScrolled]
	);

	return (
		<LandingLayout>
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
			<div className={styles.landingContent}>
				<div>
					<h1 className={styles.title}>Stats, to the core.</h1>
					<p className={styles.desc}>
						Corehalla is a statistics website for the game
						Brawlhalla.
						<br />
						Designed to be as intuitive as possible, it gives
						players all the information they need regarding the
						ranked leaderboard, power rankings and specific players
						& clans stats.
					</p>
					<input
						className={styles.searchInput}
						type='text'
						onChange={(e) => setPlayerSearch(e.target.value)}
						placeholder='Search Player...'
					/>
				</div>
				<img
					className={styles.landingImg}
					src='/images/Nix Landing.png'
					alt=''
					width='50%'
					height='auto'
				/>
			</div>

			<div className={styles.mainContent}>
				<div className={styles.blips}>
					<div className={styles.blip}>
						<StatSmall className='title'>Rankings</StatSmall>
						<br />
						<StatDesc className='desc'>
							Lorem ipsum dolor sit, amet consectetur adipisicing
							elit. At, itaque excepturi eius repellendus atque.
						</StatDesc>
					</div>
					<div className={styles.blip}>
						<StatSmall className='title'>Player Stats</StatSmall>
						<br />
						<StatDesc className='desc'>
							Lorem ipsum dolor, sit amet consectetur adipisicing
							elit. Vel perspiciatis incidunt odio sit.
						</StatDesc>
					</div>
					<div className={styles.blip}>
						<StatSmall className='title'>Clan Stats</StatSmall>
						<br />
						<StatDesc className='desc'>
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit. Temporibus facere natus animi ut.
						</StatDesc>
					</div>
				</div>
			</div>
		</LandingLayout>
	);
}
