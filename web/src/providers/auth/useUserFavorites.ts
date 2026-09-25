import { toast } from "react-hot-toast"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFeatureFlags } from "@hooks/useFeatures"
import type { JsonValue, UserFavorite, UserProfile } from "db/schema"

/**
 * The signed-in user's favourites.
 *
 * Supabase's browser client wrote these rows through PostgREST and watched
 * `postgres_changes`; both are gone. The server scopes every write to the
 * session's user, and this hook keeps the list in sync optimistically (the user
 * is the only writer of their own favourites).
 */

type FavoriteType = "player" | "clan"

type FavoriteBase<Type extends FavoriteType, Meta extends JsonValue> = {
    id: string
    type: Type
    name: string
    meta: Meta
}

type PlayerFavorite = FavoriteBase<
    "player",
    {
        icon?: {
            type?: "legend"
            legend_id?: number
        }
    }
>

type ClanFavorite = FavoriteBase<"clan", Record<string, never>>

export type Favorite = PlayerFavorite | ClanFavorite

const isFavoritePlayer = (favorite: Favorite): favorite is PlayerFavorite =>
    favorite.type === "player"
const isFavoriteClan = (favorite: Favorite): favorite is ClanFavorite =>
    favorite.type === "clan"

const toFavorite = (row: UserFavorite): Favorite =>
    ({
        id: row.id,
        type: row.type as FavoriteType,
        name: row.name,
        meta: row.meta,
    }) as Favorite

const sameFavorite = (
    a: Pick<Favorite, "id" | "type">,
    b: Pick<Favorite, "id" | "type">,
) => a.id === b.id && a.type === b.type

const jsonRequest = (method: "POST" | "DELETE", body: unknown) =>
    fetch("/api/me/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })

export const useUserFavorites = (user: UserProfile | null) => {
    const [favorites, setFavorites] = useState<Favorite[]>([])
    const { shouldShowDummyFavorites } = useFeatureFlags()
    const userId = user?.id

    const addFavorite = async (favorite: Favorite) => {
        if (!userId) return

        const response = await jsonRequest("POST", favorite)

        if (!response.ok) {
            toast.error(`Failed to add favorite`)
            return
        }

        setFavorites((current) => [
            ...current.filter((existing) => !sameFavorite(existing, favorite)),
            favorite,
        ])

        toast.success(favorite.name, {
            icon: "❤️",
        })
    }

    const removeFavorite = async ({
        id,
        type,
        name,
    }: Pick<Favorite, "id" | "type" | "name">) => {
        if (!userId) return

        const response = await jsonRequest("DELETE", { id, type })

        if (!response.ok) {
            toast.error(`Failed to remove favorite`)
            return
        }

        setFavorites((current) =>
            current.filter(
                (favorite) => !(favorite.id === id && favorite.type === type),
            ),
        )

        toast.success(name, {
            icon: "💔",
        })
    }

    const editFavorite = async (favorite: Favorite) => {
        if (!userId) return

        const response = await jsonRequest("POST", favorite)

        if (!response.ok) {
            toast.error(`Failed to edit favorite, please try again.`)
            return
        }

        setFavorites((current) =>
            current.map((existing) =>
                sameFavorite(existing, favorite) ? favorite : existing,
            ),
        )

        toast.success(`${favorite.name} updated`, {
            icon: "✏️",
        })
    }

    useEffect(() => {
        if (!userId) {
            setFavorites([])
            return
        }

        let cancelled = false

        fetch("/api/me/favorites", { headers: { accept: "application/json" } })
            .then((response) => (response.ok ? response.json() : []))
            .then((rows: UserFavorite[]) => {
                if (!cancelled) setFavorites(rows.map(toFavorite))
            })
            .catch(() => {
                if (!cancelled) setFavorites([])
            })

        return () => {
            cancelled = true
        }
    }, [userId])

    const isFavorite = useCallback(
        (favorite: Pick<Favorite, "id" | "type">) =>
            favorites.some((f) => sameFavorite(f, favorite)),
        [favorites],
    )

    const playerFavorites = useMemo(
        () => favorites.filter(isFavoritePlayer),
        [favorites],
    )

    const clanFavorites = useMemo(
        () => favorites.filter(isFavoriteClan),
        [favorites],
    )

    return {
        favorites: shouldShowDummyFavorites
            ? ([
                  {
                      id: "4281946",
                      name: "Test Player",
                      type: "player",
                      meta: {
                          icon: {
                              type: "legend",
                              legend_id: 14,
                          },
                      },
                  },
                  {
                      id: "3",
                      name: "Test Clan",
                      type: "clan",
                      meta: {},
                  },
              ] as Favorite[])
            : favorites,
        addFavorite,
        removeFavorite,
        editFavorite,
        isFavorite,
        playerFavorites,
        clanFavorites,
    } as const
}
