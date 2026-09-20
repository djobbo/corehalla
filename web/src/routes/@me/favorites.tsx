import { FavoritesGrid } from "@components/favorites/FavoritesGrid"
import { SectionTitle } from "@components/layout/SectionTitle"
import { Spinner } from "ui/base/Spinner"
import { createFileRoute } from "@tanstack/react-router"
import { seoTags } from "@components/SEO"
import { useFavorites } from "@ctx/auth/AuthProvider"

export const Route = createFileRoute("/@me/favorites")({
    // Favourites come from the browser Supabase session (localStorage), so the
    // server has nothing meaningful to render for this route.
    ssr: false,
    // Personalised content must never be shared-cached.
    headers: () => ({ "Cache-Control": "private, no-store" }),
    head: () => ({
        meta: [
            ...seoTags({ title: "My Favorites • Corehalla" }),
            { name: "robots", content: "noindex" },
        ],
    }),
    pendingComponent: () => (
        <div className="flex items-center justify-center h-48">
            <Spinner size="4rem" />
        </div>
    ),
    component: Page,
})

function Page() {
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
