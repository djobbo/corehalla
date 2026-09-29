import { Link } from "@tanstack/react-router"
import { useAtomSet } from "@effect/atom-react"
import { favoriteLegendKey, removeFavoriteAtom } from "@/effect/account"
import { legendIconSrc } from "@/lib/assets"
import { clanHref, playerHref } from "@/lib/rankings"
import { Card, CardContent } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import { Heart } from "lucide-react"
import { cleanString } from "@crh/common/helpers/cleanString"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
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
            <Empty className="p-8">
                {/*
                 * shadcn's `Empty`, so the "nothing here" note is the same
                 * shape on every surface that has one rather than another
                 * centred `<p>`. The heart is decorative: the title already
                 * says what is missing.
                 */}
                <EmptyHeader>
                    <Heart
                        aria-hidden
                        className="size-6 text-muted-foreground"
                    />
                    <EmptyTitle>No favorites yet</EmptyTitle>
                    <EmptyDescription>
                        Open a player or clan and press &ldquo;Favorite&rdquo;.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
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
                    <Card
                        key={`${favorite.type}/${favorite.id}`}
                        className="py-0"
                    >
                        {/*
                         * `ch-panel` is the old name for this surface; a shadcn
                         * `Card` is the same `--card` fill with the same hard
                         * shadow, and `py-0` keeps the row a single padded box
                         * rather than the card's block padding plus the
                         * content's.
                         */}
                        <CardContent className="flex items-center gap-3 p-3">
                            {legendKey ? (
                                <img
                                    src={legendIconSrc(legendKey)}
                                    alt=""
                                    className="size-8 shrink-0 object-contain"
                                />
                            ) : (
                                <span
                                    aria-hidden
                                    className="ch-mark size-8 shrink-0 text-sm"
                                >
                                    <span>
                                        {name.slice(0, 1).toUpperCase()}
                                    </span>
                                </span>
                            )}

                            <Link
                                to={
                                    favorite.type === "player"
                                        ? playerHref(
                                              getEntitySlug(
                                                  favorite.id,
                                                  favorite.name,
                                              ),
                                          )
                                        : clanHref(
                                              getEntitySlug(
                                                  favorite.id,
                                                  favorite.name,
                                              ),
                                          )
                                }
                                className="min-w-0 flex-1 transition-colors hover:text-ring"
                            >
                                <p className="truncate font-bold">{name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {favorite.type} #{favorite.id}
                                </p>
                            </Link>

                            {/*
                             * A chip, not a `Button`: the parallelogram cut is
                             * the app's own shape and cannot come from a
                             * variant. The `aria-label` names the row it
                             * removes, which the visible "Remove" cannot.
                             */}
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
                        </CardContent>
                    </Card>
                )
            })}
        </ul>
    )
}
