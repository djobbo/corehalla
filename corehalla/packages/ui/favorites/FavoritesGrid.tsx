import { UserGroupIcon, XIcon } from "@heroicons/react/solid"
import { bg, css, text } from "../theme"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { legendsMap } from "bhapi/legends"
import { useFavorites } from "db/client/AuthProvider"
import Image from "next/image"
import Link from "next/link"
import type { Favorite } from "db/client/useUserFavorites"
import type { ReactNode } from "react"

type FavoritesGridProps = {
    favorites: Favorite[]
}

const favoriteClassName = css({
    "&:hover .remove-btn": {
        display: "block",
        top: "-0.25rem",
        right: "-0.25rem",
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
                            "relative rounded hover:shadow-md",
                            bg("blue6", "&:hover"),
                            favoriteClassName,
                        )}
                        key={`${fav.type}/${fav.id}`}
                    >
                        <Link href={`/stats/${fav.type}/${fav.id}`}>
                            <a
                                key={fav.id}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2",
                                )}
                            >
                                {icon}
                                <div>
                                    <p className="font-bold">
                                        {cleanString(fav.name)}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-xs uppercase",
                                            text("blue11"),
                                        )}
                                    >
                                        {fav.type} #{fav.id}
                                    </p>
                                </div>
                            </a>
                        </Link>
                        <button
                            className={cn(
                                "hidden remove-btn absolute w-4 h-4 p-0.5 rounded-full overflow-hidden shadow-md",
                                bg("blue10"),
                                bg("blue12", "&:hover"),
                                text("blue11", "&:hover"),
                            )}
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
