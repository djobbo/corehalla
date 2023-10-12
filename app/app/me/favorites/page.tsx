import { FavoritesContent } from "./FavoritesContent"
import { type Metadata } from "next"

export const metadata: Metadata = {
    title: "My Favorites • Corehalla",
    description: "View your favorite players and clans.",
}

export default function FavoritesPage() {
    return (
        <>
            <h1>Favorites</h1>
            <FavoritesContent />
        </>
    )
}
