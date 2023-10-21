import { ClanIcon, CloseIcon } from "ui/icons"
import { Image } from "@/components/Image"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "@/lib/utils"
import { css } from "ui/theme"
import { legendsMap } from "bhapi/legends"
import { useFavorites } from "@/providers/auth/AuthProvider"
import Link from "next/link"
import type { Favorite } from "@/providers/auth/useUserFavorites"
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
                            <Image
                                src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                                alt={`player ${cleanString(fav.name)} icon`}
                                containerClassName="w-8 h-8"
                                className="object-contain object-center flex-shrink-0"
                            />
                        )
                } else if (fav.type === "clan") {
                    icon = <ClanIcon className="w-8 h-8" />
                }

                return (
                    <div
                        className={cn(
                            "relative rounded-lg hover:bg-bgVar2",
                            favoriteClassName,
                        )}
                        key={`${fav.type}/${fav.id}`}
                    >
                        <Link
                            href={`/stats/${fav.type}/${fav.id}`}
                            className={cn("flex items-center gap-2 px-3 py-3")}
                        >
                            {icon}
                            <div className="min-w-0">
                                <p className="font-bold truncate">
                                    {cleanString(fav.name)}
                                </p>
                                <p className="text-xs text-textVar1 truncate">
                                    {fav.type} #{fav.id}
                                </p>
                            </div>
                        </Link>
                        <button
                            className="hidden remove-btn absolute w-5 h-5 p-0.5 rounded-full overflow-hidden shadow-md bg-accent hover:bg-text hover:text-bgVar2"
                            onClick={() => removeFavorite(fav)}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
