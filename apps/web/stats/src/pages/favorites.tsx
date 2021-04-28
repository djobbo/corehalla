// Library imports

import { useFavoritesContext } from '~providers/FavoritesProvider';

// Components imports
import { TabLayout } from '~layout/TabLayout';

export default function FavoritesPage(): JSX.Element {
    const { favorites } = useFavoritesContext();

    const playersTabComponent = (active: boolean) =>
        active && (
            <>
                {favorites
                    .filter((fav) => fav.type === 'player')
                    .map((fav, i) => (
                        <p key={i}>{fav.name}</p>
                    ))}
            </>
        );

    const clansTabComponent = (active: boolean) => active && 'Clans';

    return (
        <TabLayout<'players' | 'clans', { players: [null, null]; clans: [null, null] }>
            title="Favorites • Corehalla"
            tabs={{
                players: {
                    displayName: 'Players',
                    component: playersTabComponent,
                    chips: null,
                    defaultChip: null,
                    sortOptions: null,
                    defaultSort: null,
                    link: '/favorites',
                },
                clans: {
                    displayName: 'Clans',
                    component: clansTabComponent,
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
