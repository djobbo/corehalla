import { Link } from "@tanstack/react-router"
import { useAtomSet } from "@effect/atom-react"
import { favoriteLegendKey, removeFavoriteAtom } from "@/effect/account"
import { legendIconSrc } from "@/lib/assets"
import { useLegendIcon } from "@/lib/media"
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

const LegendAvatar = ({ nameKey }: { readonly nameKey: string }) => (
    <img
        src={useLegendIcon(nameKey, legendIconSrc(nameKey))}
        alt=""
        className="size-8 shrink-0 object-contain"
    />
)

export const FavoritesGrid = ({
    favorites,
}: {
    readonly favorites: readonly Favorite[]
}) => {
    const remove = useAtomSet(removeFavoriteAtom)

    if (favorites.length === 0) {
        return (
            <Empty className="p-8">
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
                        <CardContent className="flex items-center gap-3 p-3">
                            {legendKey ? (
                                <LegendAvatar nameKey={legendKey} />
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
