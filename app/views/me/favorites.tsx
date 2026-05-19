import { FavoritesGrid } from "@components/favorites/FavoritesGrid"
import { SectionTitle } from "@components/layout/SectionTitle"
import { useFavorites } from "@ctx/auth/AuthProvider"
export const FavoritesPage = () => {
    const { playerFavorites, clanFavorites } = useFavorites()

    return (
        <>
            <h1>Favorites</h1>
            <SectionTitle hasBorder>Players</SectionTitle>
            <FavoritesGrid favorites={playerFavorites} />
            <SectionTitle hasBorder>Clans</SectionTitle>
            <FavoritesGrid favorites={clanFavorites} />
        </>
    )
}

export default FavoritesPage
