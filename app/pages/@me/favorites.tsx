import { FavoritesGrid } from "@corehalla/core/src/components/favorites/FavoritesGrid"
import { SEO } from "@corehalla/core/src/components/SEO"
import { SectionTitle } from "@corehalla/core/src/components/layout/SectionTitle"
import { useFavorites } from "@corehalla/core/src/providers/auth/AuthProvider"
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
