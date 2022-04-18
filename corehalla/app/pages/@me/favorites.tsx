import { FavoritesGrid } from "ui/favorites/FavoritesGrid"
import { SectionTitle } from "ui/layout/SectionTitle"
import {
    useClanFavorites,
    usePlayerFavorites,
} from "common/features/favorites/favoritesProvider"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const players = usePlayerFavorites()
    const clans = useClanFavorites()

    return (
        <>
            <h1>Favorites</h1>
            <SectionTitle hasBorder>Players</SectionTitle>
            <FavoritesGrid favorites={players} />
            <SectionTitle hasBorder>Clans</SectionTitle>
            <FavoritesGrid favorites={clans} />
        </>
    )
}

export default Page
