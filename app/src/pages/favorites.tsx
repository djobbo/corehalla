// Library imports
import React, { FC, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

import { FavoritesContext } from '@providers/FavoritesProvider';

// Components imports
import { Page } from '@components/Page';
import { AppBar } from '@components/AppBar';
import { SideNav } from '@components/SideNav';
import { MainLayout } from '@layout/MainLayout';

export default function FavoritesPage() {
	const { favorites } = useContext(FavoritesContext);

	return (
		<MainLayout<
			'players' | 'clans',
			{ players: [null, null]; clans: [null, null] }
		>
			title='Favorites • Corehalla'
			tabs={{
				players: {
					displayName: 'Players',
					component: (active) =>
						active &&
						favorites
							.filter((fav) => fav.type === 'player')
							.map((fav) => <p>{fav.name}</p>),
					chips: null,
					defaultChip: null,
					sortOptions: null,
					defaultSort: null,
					link: '/favorites',
				},
				clans: {
					displayName: 'Clans',
					component: (active) => active && 'Clans',
					chips: null,
					defaultChip: null,
					sortOptions: null,
					defaultSort: null,
					link: '/favorites?tab=clans',
				},
			}}
		/>
		// 	<Head>
		// 		<title>Favorites • Corehalla</title>
		// 	</Head>
		// 	<AppBar title='Favorites' />
		// 	<AnimatePresence exitBeforeEnter initial>
		// 		<motion.div
		// 			key='page'
		// 			animate={{ opacity: 1 }}
		// 			initial={{ opacity: 0 }}
		// 		>
		// 			<main>
		// 				{favorites.map((fav) => (
		// 					<Link
		// 						key={fav.id}
		// 						href={`/stats/${fav.type}/${fav.id}`}
		// 					>
		// 						{fav.name}
		// 						<img src={fav.thumbURI} alt={fav.name} />
		// 					</Link>
		// 				))}
		// 			</main>
		// 		</motion.div>
		// 	</AnimatePresence>
		// 	<SideNav />
		// </MainLayout>
	);
}
