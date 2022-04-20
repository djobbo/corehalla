import { supabase } from "../supabase/client"
import { useCallback, useEffect, useMemo, useState } from "react"
import type {
    Prisma,
    UserFavorite,
    UserFavoriteType,
} from "../generated/client"
import type { Session } from "@supabase/supabase-js"

type FavoriteBase<
    Type extends UserFavoriteType,
    Meta extends Prisma.JsonValue,
> = {
    id: string
    type: Type
    name: string
    meta: Meta
}

type PlayerFavorite = FavoriteBase<
    "PLAYER",
    {
        icon?: {
            type?: "legend"
            legend_id?: number
        }
    }
>

type ClanFavorite = FavoriteBase<"CLAN", Record<string, never>>

export type Favorite = PlayerFavorite | ClanFavorite

const isFavoritePlayer = (favorite: Favorite): favorite is PlayerFavorite =>
    favorite.type === "PLAYER"
const isFavoriteClan = (favorite: Favorite): favorite is ClanFavorite =>
    favorite.type === "CLAN"

export const useUserFavorites = (session: Session | null) => {
    const [favorites, setFavorites] = useState<Favorite[]>([])
    const userId = session?.user?.id

    const addFavorite = async (favorite: Favorite) => {
        if (!userId) return

        const { error } = await supabase
            .from<UserFavorite>("UserFavorite")
            .upsert({ ...favorite, userId })

        if (error) throw error
    }

    const removeFavorite = async ({ id, type }: Favorite) => {
        if (!userId) return

        const { error } = await supabase
            .from<UserFavorite>("UserFavorite")
            .delete()
            .match({ userId, id, type })

        if (error) throw error
    }

    const editFavorite = async (favorite: Favorite) => {
        if (!userId) return

        const { error } = await supabase
            .from<UserFavorite>("UserFavorite")
            .upsert({ ...favorite, userId })

        if (error) throw error
    }

    const fetchInitialFavorites = useCallback(async () => {
        if (!userId) return

        const { data: initialFavorites, error } = await supabase
            .from<UserFavorite>("UserFavorite")
            .select("*")
            .match({ userId })

        if (error) throw error

        setFavorites(
            // @ts-expect-error ts doesn't know about `type`
            initialFavorites.map(({ id, type, name, meta }) => ({
                id,
                type,
                name,
                meta,
            })),
        )
    }, [userId])

    useEffect(() => {
        if (!userId) return
        fetchInitialFavorites()

        const subscription = supabase
            .from<UserFavorite>("UserFavorite")
            .on("*", (payload) => {
                console.log("favorite changed", payload)
                if (payload.new.userId !== userId) return

                const { id, name, meta, type } = payload.new

                switch (payload.eventType) {
                    case "INSERT":
                        // @ts-expect-error ts doesn't know about `type`
                        return setFavorites((favorites) => [
                            ...favorites,
                            { id, name, meta, type },
                        ])
                    case "UPDATE":
                        // @ts-expect-error ts doesn't know about `type`
                        return setFavorites((favorites) =>
                            favorites.map((favorite) =>
                                favorite.type === type && favorite.id === id
                                    ? { id, name, meta, type }
                                    : favorite,
                            ),
                        )
                    case "DELETE":
                        return setFavorites((favorites) =>
                            favorites.filter(
                                (favorite) =>
                                    favorite.type !== payload.old.type ||
                                    favorite.id !== payload.old.id,
                            ),
                        )
                }
            })
            .subscribe()

        console.log(supabase.getSubscriptions())

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchInitialFavorites, userId])

    const isFavorite = useCallback(
        (favorite: Pick<Favorite, "id" | "type">) =>
            favorites.some(
                (f) => f.id === favorite.id && f.type === favorite.type,
            ),
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
        favorites,
        addFavorite,
        removeFavorite,
        editFavorite,
        isFavorite,
        playerFavorites,
        clanFavorites,
    } as const
}
