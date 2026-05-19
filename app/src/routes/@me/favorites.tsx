import FavoritesPage from "../../../pages/@me/favorites"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/@me/favorites")({
    component: FavoritesPage,
})
