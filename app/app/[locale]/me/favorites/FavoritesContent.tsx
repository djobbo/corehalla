"use client"

import { FavoritesGrid } from "@/components/favorites/FavoritesGrid"
import { SectionTitle } from "@/components/layout/SectionTitle"
import { useFavorites } from "@/providers/auth/AuthProvider"

export const FavoritesContent = () => {
    const { playerFavorites, clanFavorites } = useFavorites()

    return (
        <>
            <SectionTitle hasBorder>Players</SectionTitle>
            <FavoritesGrid favorites={playerFavorites} />
            <SectionTitle hasBorder>Clans</SectionTitle>
            <FavoritesGrid favorites={clanFavorites} />
        </>
    )
}
