import { AppLink } from "../base/AppLink"
import { UserGroupIcon, XIcon } from "@heroicons/react/solid"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { css } from "../theme"
import { legendsMap } from "bhapi/legends"
import { useFavorites } from "db/client/AuthProvider"
import Image from "next/image"
import type { Favorite } from "db/client/useUserFavorites"
import type { ReactNode } from "react"

type FavoritesGridProps = {
    favorites: Favorite[]
}

const favoriteClassName = css({
    "&:hover .remove-btn": {
        display: "block",
        top: "-0.6rem",
        right: "-0.6rem",
    },
})()

export const FavoritesGrid = ({ favorites }: FavoritesGridProps) => {
    const { removeFavorite } = useFavorites()

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols:6 gap-4">
            {favorites.slice(0, 12).map((fav) => {
                let icon: ReactNode = null

                if (fav.type === "player") {
                    const legendId = fav.meta.icon?.legend_id
                    const legend = !!legendId && legendsMap[legendId]
                    if (legend)
                        icon = (
                            <div className="relative w-8 h-8">
                                <Image
                                    src={`/images/icons/roster/legends/${legend.bio_name}.png`}
                                    alt={`player ${cleanString(fav.name)} icon`}
                                    layout="fill"
                                    objectFit="contain"
                                    objectPosition="center"
                                />
                            </div>
                        )
                } else if (fav.type === "clan") {
                    icon = <UserGroupIcon className="w-8 h-8" />
                }

                return (
                    <div
                        className={cn(
                            "relative rounded-lg hover:bg-bgVar2",
                            favoriteClassName,
                        )}
                        key={`${fav.type}/${fav.id}`}
                    >
                        <AppLink
                            href={`/stats/${fav.type}/${fav.id}`}
                            className={cn("flex items-center gap-2 px-3 py-3")}
                        >
                            {icon}
                            <div>
                                <p className="font-bold">
                                    {cleanString(fav.name)}
                                </p>
                                <p className="text-xs text-textVar1">
                                    {fav.type} #{fav.id}
                                </p>
                            </div>
                        </AppLink>
                        <button
                            className="hidden remove-btn absolute w-5 h-5 p-0.5 rounded-full overflow-hidden shadow-md bg-accent hover:bg-text hover:text-bgVar2"
                            onClick={() => removeFavorite(fav)}
                        >
                            <XIcon />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
