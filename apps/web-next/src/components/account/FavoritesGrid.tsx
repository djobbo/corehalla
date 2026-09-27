import { Link } from "@tanstack/react-router"
import { useAtomSet } from "@effect/atom-react"
import { favoriteLegendKey, removeFavoriteAtom } from "@/effect/account"
import { legendIconSrc } from "@/lib/assets"
import { clanHref, playerHref } from "@/lib/rankings"
import { cleanString } from "@crh/common/helpers/cleanString"
import type { Favorite } from "@crh/api-contract/schemas"

/**
 * One grid of saved entities.
 *
 * The row is the smallest thing that can be both a link and a removal: the
 * whole row navigates to the profile, and the remove control is a separate
 * button so a mis-click never destroys a favourite instead of opening it.
 *
 * A player favourite remembers its main legend, so the icon is the same art the
 * profile header shows; a clan ships none, so the fallback monogram stands in.
 * Either way the row never has a hole where an image could not be resolved.
 */
export const FavoritesGrid = ({
    favorites,
}: {
    readonly favorites: readonly Favorite[]
}) => {
    const remove = useAtomSet(removeFavoriteAtom)

    if (favorites.length === 0) {
        return (
            <p className="text-sm text-textVar1">
                Nothing saved here yet. Open a player or clan and press
                &ldquo;Favorite&rdquo;.
            </p>
        )
    }

    return (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => {
                const name = cleanString(favorite.name)
                const legendKey =
                    favorite.type === "player"
                        ? favoriteLegendKey(favorite)
                        : undefined

                return (
                    <li
                        key={`${favorite.type}/${favorite.id}`}
                        className="ch-panel flex items-center gap-3 p-3"
                    >
                        {legendKey ? (
                            <img
                                src={legendIconSrc(legendKey)}
                                alt=""
                                className="h-8 w-8 shrink-0 object-contain"
                            />
                        ) : (
                            <span
                                aria-hidden
                                className="ch-mark h-8 w-8 shrink-0 text-sm"
                            >
                                <span>{name.slice(0, 1).toUpperCase()}</span>
                            </span>
                        )}

                        <Link
                            to={
                                favorite.type === "player"
                                    ? playerHref(favorite.id)
                                    : clanHref(favorite.id)
                            }
                            className="min-w-0 flex-1"
                        >
                            <p className="truncate font-bold">{name}</p>
                            <p className="truncate text-xs text-textVar1">
                                {favorite.type} #{favorite.id}
                            </p>
                        </Link>

                        <button
                            type="button"
                            aria-label={`Remove ${name}`}
                            className="ch-chip ch-chip-off shrink-0"
                            onClick={() =>
                                remove({
                                    query: {
                                        type: favorite.type,
                                        id: favorite.id,
                                    },
                                    reactivityKeys: ["favorites"],
                                })
                            }
                        >
                            Remove
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}
