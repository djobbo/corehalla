import { FavoritesGrid } from "@components/favorites/FavoritesGrid"
import { SEO } from "@components/SEO"
import { SectionTitle } from "@components/layout/SectionTitle"
import { useFavorites } from "@ctx/auth/AuthProvider"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const { playerFavorites, clanFavorites } = useFavorites()

    return (
        <>
            <SEO title="My Favorites • Corehalla" />
            <h1>Favorites</h1>
            <SectionTitle hasBorder>Players</SectionTitle>
            <FavoritesGrid favorites={playerFavorites} />
            <SectionTitle hasBorder>Clans</SectionTitle>
            <FavoritesGrid favorites={clanFavorites} />
        </>
    )
}

export default Page
