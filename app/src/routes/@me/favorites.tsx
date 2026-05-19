import FavoritesPage from "../../../pages/@me/favorites"
import { seoHead } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/@me/favorites")({
    head: () => seoHead({ title: "My Favorites • Corehalla" }),
    component: FavoritesPage,
})
