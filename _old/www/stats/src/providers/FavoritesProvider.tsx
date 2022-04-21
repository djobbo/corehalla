import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'

import { useAuth } from '~providers/AuthProvider'

import { supabase } from '~supabase/client'

interface Props {
    children: ReactNode
}

export type FavoriteType = 'player' | 'clan'

export interface IFavorite {
    favorite_id: string
    label: string
    thumb_uri: string
    type: FavoriteType
}

interface IFavoritesContext {
    favorites: IFavorite[]
    isFavorite: (value: IFavorite) => Promise<boolean>
    addFavorite: (value: IFavorite) => Promise<void>
    removeFavorite: (value: IFavorite) => Promise<void>
}

const FavoritesContext = createContext<IFavoritesContext>({
    favorites: [],
    isFavorite: async () => false,
    addFavorite: () => Promise.resolve(),
    removeFavorite: () => Promise.resolve(),
})

export const useFavorites = (): IFavoritesContext => useContext(FavoritesContext)

export const FavoritesProvider: FC<Props> = ({ children }: Props) => {
    const [favorites, setFavorites] = useState<IFavorite[]>([])

    const { user } = useAuth()

    const fetchFavorites = async (): Promise<void> => {
        const { error, data: dbFav } = await supabase.from<IFavorite>('favorites')

        if (error) {
            console.error(error)
            setFavorites([])
        }

        console.log({ dbFav })

        setFavorites(dbFav)
    }

    const isFavorite = async ({ favorite_id, type }: IFavorite): Promise<boolean> => {
        return typeof favorites.find((fav) => fav.favorite_id === favorite_id && fav.type === type) !== 'undefined'
        // const { data: existingFav } = await supabase.from('favorites').select('*').match({ favorite_id, type })
        // console.log(existingFav)

        // if (!existingFav) return false

        // return existingFav.length > 0
    }

    const addFavorite = async (favorite: IFavorite): Promise<void> => {
        //TODO: not authenticated
        if (!user) return

        if (await isFavorite(favorite)) return

        const { error } = await supabase.from('favorites').upsert({ ...favorite, user_id: user.id })

        if (error) console.error(error)
    }

    const removeFavorite = async ({ favorite_id, type }: IFavorite): Promise<void> => {
        await supabase.from('favorites').delete().match({ favorite_id, type })
    }

    useEffect(() => {
        ;(async () => {
            await fetchFavorites()
        })()

        if (!user) return

        const listener = supabase
            .from(`favorites:user_id=eq.${user.id}`)
            .on('*', async (payload) => {
                console.log({ payload })

                switch (payload.eventType) {
                    case 'DELETE':
                        setFavorites((current) =>
                            current.filter((favorite) => favorite.favorite_id !== payload.old.favorite_id),
                        )
                        break
                    case 'INSERT':
                        setFavorites((current) => [...current, payload.new])
                        break
                    case 'UPDATE':
                        setFavorites((current) => [
                            ...current.filter((favorite) => favorite.favorite_id !== payload.old.favorite_id),
                            payload.new,
                        ])
                        break
                    default:
                        break
                }
            })
            .subscribe()

        return () => {
            listener.unsubscribe()
        }
    }, [user])

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                isFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    )
}