import { Container } from '@Container'
import { Header } from '@Header'
import { Tabs } from '@Tabs'
import Link from 'next/link'

import { FavoriteType, useFavorites } from '~providers/FavoritesProvider'
import { TabsProvider, useTabs } from '~providers/TabsProvider'

const Tab = (): JSX.Element => {
    const { tab } = useTabs<FavoriteType>()
    const { favorites } = useFavorites()

    switch (tab) {
        case 'player':
            return (
                <>
                    {favorites
                        .filter((fav) => fav.type === 'player')
                        .map((fav, i) => (
                            <Link href={`/stats/player/${fav.id}`} key={i}>
                                <a>{fav.name}</a>
                            </Link>
                        ))}
                </>
            )
        case 'clan':
            return (
                <>
                    {favorites
                        .filter((fav) => fav.type === 'clan')
                        .map((fav, i) => (
                            <Link href={`/stats/clan/${fav.id}`} key={i}>
                                <a>{fav.name}</a>
                            </Link>
                        ))}
                </>
            )
        default:
            return <>Unknown Favorite Type</>
    }
}

const FavoritesPage = (): JSX.Element => {
    return (
        <TabsProvider<FavoriteType> defaultTab="player">
            <Header
                content={
                    <Tabs<FavoriteType>
                        tabs={[
                            { title: 'Players', name: 'player' },
                            { title: 'Clans', name: 'clan' },
                        ]}
                    />
                }
            />
            <Container>
                <h1>Favorites</h1>
                <Tab />
            </Container>
        </TabsProvider>
    )
}

export default FavoritesPage
