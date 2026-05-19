import { seoHead } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"
import { FavoritesPage } from "@views/me/favorites"

export const Route = createFileRoute("/@me/favorites")({
    head: () => seoHead({ title: "My Favorites • Corehalla" }),
    component: FavoritesPage,
})
