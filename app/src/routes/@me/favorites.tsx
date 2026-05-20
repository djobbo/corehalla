import { seoHead } from "#/components/SEO"
import { FavoritesPage } from "#/views/me/favorites"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/@me/favorites")({
    head: () => seoHead({ title: "My Favorites • Corehalla" }),
    component: FavoritesPage,
})
