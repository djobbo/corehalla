import { AppLink } from "../base/AppLink"
import {
    ChevronDoubleUpIcon,
    HeartIcon,
    HomeIcon,
    XIcon,
} from "@heroicons/react/solid"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { css } from "../theme"
import { legendsMap } from "bhapi/legends"
import { useFavorites } from "db/client/AuthProvider"
import { useRouter } from "next/router"
import Image from "next/image"
import type { ReactNode } from "react"

type SideNavIconProps = {
    className?: string
    image?: string
    name: string
    content?: ReactNode
    href: string
    active?: boolean
    onRemove?: () => void
}

const sideNavIconClassName = css({
    "&:hover .remove-btn": {
        display: "block",
        top: "-0.375rem",
        right: "-0.375rem",
    },
})()

const SideNavIcon = ({
    className,
    image,
    name,
    content,
    href,
    onRemove,
    active = false,
}: SideNavIconProps) => {
    const cleanName = cleanString(name)
    return (
        <div className={cn("relative", sideNavIconClassName)}>
            <AppLink
                href={href}
                className={cn(
                    className,
                    "w-10 h-10 rounded-lg flex justify-center items-center uppercase cursor-pointer",
                    {
                        "bg-accent": active,
                        "bg-bg hover:border hover:border-text": !active,
                    },
                )}
            >
                {image && (
                    <span
                        className="absolute w-8 h-8 text-xs z-0 opacity-50"
                        aria-hidden
                    >
                        <Image
                            src={image}
                            alt={`player ${cleanName} icon`}
                            layout="fill"
                            objectFit="contain"
                            objectPosition="center"
                        />
                    </span>
                )}
                <span className="font-semibold text-sm z-10">
                    {content ?? cleanName.slice(0, 3)}
                </span>
            </AppLink>
            {onRemove && (
                <button
                    className="hidden remove-btn absolute w-4 h-4 p-0.5 rounded-full overflow-hidden shadow-md bg-accent hover:bg-text hover:text-bgVar2"
                    onClick={() => onRemove()}
                >
                    <XIcon />
                </button>
            )}
        </div>
    )
}

const defaultNav = [
    {
        name: "Home",
        icon: <HomeIcon className="w-6 h-6" />,
        href: "/",
    },
    {
        name: "Rankings",
        icon: <ChevronDoubleUpIcon className="w-6 h-6" />,
        href: "/rankings",
    },
]

export const SideNav = () => {
    const { favorites, removeFavorite } = useFavorites()
    const router = useRouter()

    const { pathname } = router
    const { playerId, clanId } = router.query

    const nav = defaultNav.concat(
        favorites.length > 0
            ? [
                  {
                      name: "Favorites",
                      icon: <HeartIcon className="w-6 h-6" />,
                      href: "/@me/favorites",
                  },
              ]
            : [],
    )

    return (
        <div className="sticky top-0 p-2 flex flex-col gap-2 border-r border-bg h-screen overflow-y-auto bg-bgVar2">
            {nav.map((nav) => (
                <SideNavIcon
                    key={nav.name}
                    name={nav.name}
                    content={nav.icon}
                    href={nav.href}
                    active={pathname === nav.href}
                />
            ))}
            {favorites.map((favorite) => {
                switch (favorite.type) {
                    case "player": {
                        const legendId = favorite.meta.icon?.legend_id
                        const legend = !!legendId && legendsMap[legendId]
                        return (
                            <SideNavIcon
                                key={favorite.id}
                                href={`/stats/player/${favorite.id}`}
                                name={cleanString(favorite.name)}
                                {...(legend && {
                                    image: `/images/icons/roster/legends/${legend.bio_name}.png`,
                                })}
                                active={
                                    pathname === "/stats/player/[playerId]" &&
                                    playerId === favorite.id.toString()
                                }
                                onRemove={() => {
                                    removeFavorite(favorite)
                                }}
                            />
                        )
                    }
                    case "clan":
                        return (
                            <SideNavIcon
                                key={favorite.id}
                                href={`/stats/clan/${favorite.id}`}
                                name={cleanString(favorite.name)}
                                active={
                                    pathname === "/stats/clan/[clanId]" &&
                                    clanId === favorite.id.toString()
                                }
                                onRemove={() => {
                                    removeFavorite(favorite)
                                }}
                            />
                        )
                    default:
                        return null
                }
            })}
        </div>
    )
}
