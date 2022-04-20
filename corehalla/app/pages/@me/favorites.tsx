import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SectionTitle } from "ui/layout/SectionTitle"
import { useFavorites } from "db/client/AuthProvider"
import type { NextPage } from "next"

const Page: NextPage = () => {
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

export default Page
