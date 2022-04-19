import { createContext, useCallback, useContext } from "react"
import { useLocalStorageState } from "../../hooks/useLocalStorageState"
import type { ReactNode } from "react"

type FavoriteBase = {
    type: "player" | "clan"
    id: number
    name: string
}

type PlayerFavorite = FavoriteBase & {
    type: "player"
    legend_id: number
}

type ClanFavorite = FavoriteBase & {
    type: "clan"
}

export type Favorite = PlayerFavorite | ClanFavorite

const isPlayerFavorite = (favorite: Favorite): favorite is PlayerFavorite =>
    favorite.type === "player"
const isClanFavorite = (favorite: Favorite): favorite is ClanFavorite =>
    favorite.type === "clan"

type FavoritesContext = {
    favorites: Favorite[]
    addFavorite: (favorite: Favorite) => void
    removeFavorite: (favorite: FavoriteBase) => void
    editFavorite: (favorite: Partial<Favorite>) => void
    isFavorite: (favorite: Pick<FavoriteBase, "id" | "type">) => boolean
}

const favoritesContext = createContext<FavoritesContext>({
    favorites: [],
    addFavorite: () => void 0,
    removeFavorite: () => void 0,
    editFavorite: () => void 0,
    isFavorite: () => false,
})

export const useFavorites = () => useContext(favoritesContext)
export const usePlayerFavorites = () =>
    useContext(favoritesContext).favorites.filter(isPlayerFavorite)
export const useClanFavorites = () =>
    useContext(favoritesContext).favorites.filter(isClanFavorite)

type FavoritesProviderProps = {
    children: ReactNode
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
    const [favorites, setFavorites] = useLocalStorageState<Favorite[]>(
        "corehalla_favorites",
        [],
    )

    const addFavorite = (favorite: Favorite) => {
        setFavorites((current) => {
            const currentFavoriteIndex = current.findIndex(
                (f) => f.id === favorite.id && f.type === favorite.type,
            )
            if (currentFavoriteIndex >= 0) {
                current.splice(currentFavoriteIndex, 1, favorite)
            } else {
                current.push(favorite)
            }

            return current.slice(0)
        })
    }

    const removeFavorite = (favorite: FavoriteBase) => {
        if (
            !window.confirm(
                `Delete ${favorite.name} from your favorite ${favorite.type}s ?`,
            )
        )
            return
        setFavorites((current) =>
            current.filter(
                (f) => f.id !== favorite.id || f.type !== favorite.type,
            ),
        )
    }

    const editFavorite = (favorite: Partial<Favorite>) => {
        setFavorites((current) => {
            const currentFavoriteIndex = current.findIndex(
                (f) => f.id === favorite.id && f.type === favorite.type,
            )

            if (currentFavoriteIndex >= 0) {
                const currentFavorite = current[currentFavoriteIndex]
                // @ts-expect-error ts doesn't know both are the same type (due to filter above)
                current.splice(currentFavoriteIndex, 1, {
                    ...currentFavorite,
                    ...favorite,
                })
            }

            return current
        })
    }

    const isFavorite = useCallback(
        (favorite: Pick<FavoriteBase, "id" | "type">) =>
            favorites.some(
                (f) => f.id === favorite.id && f.type === favorite.type,
            ),
        [favorites],
    )

    return (
        <favoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                editFavorite,
                isFavorite,
            }}
        >
            {children}
        </favoritesContext.Provider>
    )
}
