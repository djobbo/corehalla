import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SectionTitle } from "ui/layout/SectionTitle"
import { useFavorites } from "db/client/AuthProvider"
import Head from "next/head"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const { playerFavorites, clanFavorites } = useFavorites()

    return (
        <>
            <Head>
                <title>My Favorites • Corehalla</title>
            </Head>
            <h1>Favorites</h1>
            <SectionTitle hasBorder>Players</SectionTitle>
            <FavoritesGrid favorites={playerFavorites} />
            <SectionTitle hasBorder>Clans</SectionTitle>
            <FavoritesGrid favorites={clanFavorites} />
        </>
    )
}

export default Page
