import { AdsenseStatsHeader } from "common/analytics/Adsense"
import { MiscStatGroup } from "./MiscStatGroup"
import { UserAddIcon, UserRemoveIcon } from "@heroicons/react/solid"
import { cn } from "common/helpers/classnames"
import { useFavorites } from "db/client/AuthProvider"
import type { Favorite } from "db/client/useUserFavorites"
import type { MiscStat } from "./MiscStatGroup"
import type { ReactNode } from "react"

type StatsHeaderProps = {
    name: string
    id: number
    icon?: ReactNode
    aliases?: string[]
    miscStats?: MiscStat[]
    favorite?: Favorite
}

export const StatsHeader = ({
    name,
    id,
    icon,
    aliases,
    miscStats,
    favorite,
}: StatsHeaderProps) => {
    const { isFavorite, removeFavorite, addFavorite } = useFavorites()

    const isItemFavorite = favorite && isFavorite(favorite)

    return (
        <>
            <div
                className="w-full h-28 relative rounded-md overflow-hidden shadow-md"
                style={{
                    background: "url(/images/backgrounds/orion.jpg)",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}
            >
                <AdsenseStatsHeader />
            </div>
            <div className="flex justify-end py-2">
                {favorite && (
                    <button
                        className={cn(
                            "text-sm flex items-center rounded-md px-4 py-1 cursor-pointer border border-blue6",
                            {
                                "bg-blue9": !isItemFavorite,
                            },
                        )}
                        onClick={() => {
                            if (isItemFavorite) return removeFavorite(favorite)
                            addFavorite(favorite)
                        }}
                    >
                        {isItemFavorite ? (
                            <>
                                Remove Favorite
                                <UserRemoveIcon className="ml-2 w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Add favorite
                                <UserAddIcon className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </button>
                )}
            </div>
            <div
                className={cn("flex flex-col justify-center items-center", {
                    "mt-8": !favorite,
                    "mt-4": !!favorite,
                })}
            >
                <h1 className="font-bold text-3xl lg:text-5xl flex items-center">
                    {icon}
                    {name}
                </h1>
                <span className="text-xs font-bold mt-1 text-blue9">#{id}</span>
            </div>
            {aliases && aliases.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-2 justify-center mt-4">
                    {aliases.map((alias) => (
                        <p
                            key={alias}
                            className={cn("rounded-lg py-0.5 px-3 bg-blue3")}
                        >
                            {alias}
                        </p>
                    ))}
                </div>
            )}
            {miscStats && (
                <MiscStatGroup
                    className="mt-8 justify-items-center text-center"
                    fit="fit"
                    stats={miscStats}
                />
            )}
        </>
    )
}
