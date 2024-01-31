"use client"

import {
    DiscordIcon,
    Rankings1v1Icon,
    Rankings2v2Icon,
    RankingsPowerIcon,
} from "ui/icons"
import { HiBookOpen, HiHeart, HiHome, HiUserGroup, HiX } from "react-icons/hi"
// TODO: replace react-icons with lucide
import { Image } from "@/components/Image"
import { type MessageDescriptor } from "@lingui/core"
import { Tooltip } from "ui/base/Tooltip"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "@/lib/utils"
import { css } from "ui/theme"
import { legendsMap } from "bhapi/legends"
import { msg } from "@lingui/macro"
import { useFavorites } from "@/providers/auth/AuthProvider"
import { useLingui } from "@lingui/react"
import { useParams, usePathname } from "next/navigation"
import { useSideNav } from "@/providers/SideNavProvider"
import Link from "next/link"
import type { ReactNode } from "react"

type SideNavIconProps = {
    className?: string
    image?: string
    name: string
    content?: ReactNode
    href: string
    active?: boolean
    onRemove?: () => void
    desc?: string
    external?: boolean
}

const sideNavIconClassName = css({
    "&:hover .remove-btn": {
        display: "flex",
        top: "-0.375rem",
        right: "-0.375rem",
    },
})().className

const SideNavIcon = ({
    className,
    image,
    name,
    content,
    href,
    onRemove,
    active = false,
    desc,
    external = false,
}: SideNavIconProps) => {
    const { closeSideNav } = useSideNav()
    const cleanName = cleanString(name)

    return (
        <Tooltip content={desc ?? cleanName} side="right">
            <div className={cn("relative", sideNavIconClassName)}>
                <Link
                    href={href}
                    className={cn(
                        className,
                        "w-full sm:w-10 h-10 rounded-lg flex gap-2 px-2 sm:uppercase cursor-pointer border border-transparent",
                        "justify-start sm:justify-center items-center",
                        {
                            "bg-accent": active,
                            "bg-bg hover:border-text": !active,
                        },
                    )}
                    target={external ? "_blank" : undefined}
                    onClick={() => {
                        closeSideNav()
                    }}
                >
                    {image && (
                        <Image
                            src={image}
                            alt={`player ${cleanName} icon`}
                            Container="span"
                            containerClassName="w-8 h-8 text-xs z-0 opacity-50 rounded-md overflow-hidden"
                            position="relative sm:absolute"
                            className="object-contain object-center"
                        />
                    )}
                    <span className="font-semibold text-sm z-10 hidden sm:inline-block whitespace-nowrap">
                        {content ?? cleanName.slice(0, 3)}
                    </span>
                    <span className="text-sm inline-flex items-center gap-2 sm:hidden whitespace-nowrap">
                        {content}
                        {cleanName.slice(0, 20)}
                    </span>
                </Link>
                {onRemove && (
                    <button
                        className="items-center justify-center hidden remove-btn absolute w-4 h-4 p-0.5 rounded-full overflow-hidden shadow-md bg-accent hover:bg-text hover:text-bgVar2"
                        onClick={() => onRemove()}
                    >
                        <HiX size={12} />
                    </button>
                )}
            </div>
        </Tooltip>
    )
}

type SideNavProps = {
    className?: string
}

export const SideNav = ({ className }: SideNavProps) => {
    const { favorites, removeFavorite } = useFavorites()
    const { isSideNavOpen, closeSideNav } = useSideNav()
    const pathname = usePathname()
    const { playerId, clanId } = useParams()
    const { _ } = useLingui()

    const nav: {
        id: string
        name: MessageDescriptor
        icon: ReactNode
        href: string
        exact?: boolean
        external?: boolean
    }[] = [
        {
            id: "home",
            name: msg`Home`,
            icon: <HiHome className="w-6 h-6" />,
            href: "/",
            exact: true,
        },
        {
            id: "rankings-1v1",
            name: msg`1v1 Rankings`,
            icon: <Rankings1v1Icon className="w-6 h-6" />,
            href: "/ranked/1v1",
            exact: false,
        },
        {
            id: "rankings-2v2",
            name: msg`2v2 Rankings`,
            icon: <Rankings2v2Icon className="w-6 h-6" />,
            href: "/ranked/2v2",
            exact: false,
        },
        {
            id: "power-rankings",
            name: msg`Power Rankings`,
            href: "/power-rankings",
            icon: <RankingsPowerIcon className="w-6 h-6" />,
        },
        {
            id: "clans",
            name: msg`Clans`,
            href: "/clans",
            icon: <HiUserGroup className="w-6 h-6" />,
        },
        {
            id: "discord",
            name: msg`Discord Server`,
            href: "/discord",
            icon: <DiscordIcon className="w-6 h-6" />,
            external: true,
        },
        {
            id: "wiki",
            name: msg`Wiki`,
            href: "/wiki",
            icon: <HiBookOpen className="w-6 h-6" />,
            external: true,
        },
        {
            id: "favorites",
            name: msg`Favorites`,
            icon: <HiHeart className="w-6 h-6" />,
            href: "/me/favorites",
            exact: false,
        },
    ]

    return (
        <div className="z-50">
            <button
                className={cn(
                    "fixed w-full h-full inset-0 bg-bgVar2 opacity-50 cursor-default",
                    {
                        hidden: !isSideNavOpen,
                    },
                )}
                onClick={() => {
                    closeSideNav()
                }}
            />
            <div
                className={cn(
                    "fixed w-64 sm:w-auto sm:sticky top-0 flex-col border-r border-bg h-screen bg-bgVar2 z-50 overflow-y-auto",
                    className,
                    {
                        "-translate-x-full sm:translate-x-0": !isSideNavOpen,
                        "translate-x-0": isSideNavOpen,
                    },
                )}
                style={{
                    transition: "0.15s all ease",
                }}
            >
                <div className="flex flex-col gap-2 flex-1 p-2">
                    {nav.map((nav) => (
                        <SideNavIcon
                            key={nav.id}
                            name={_(nav.name)}
                            content={nav.icon}
                            href={nav.href}
                            active={
                                nav.exact
                                    ? pathname === nav.href
                                    : pathname.startsWith(nav.href)
                            }
                            external={nav.external}
                        />
                    ))}
                    <hr
                        className={cn("border-b border-bg rounded-full mx-2", {
                            hidden: favorites.length <= 0,
                        })}
                    />
                    {favorites.map((favorite) => {
                        switch (favorite.type) {
                            case "player": {
                                const legendId = favorite.meta.icon?.legend_id
                                const legend =
                                    !!legendId && legendsMap[legendId]
                                return (
                                    <SideNavIcon
                                        key={favorite.id}
                                        href={`/stats/player/${favorite.id}`}
                                        name={cleanString(favorite.name)}
                                        {...(legend && {
                                            image: `/images/icons/roster/legends/${legend.legend_name_key}.png`,
                                        })}
                                        active={
                                            pathname ===
                                                "/stats/player/[playerId]" &&
                                            playerId === favorite.id
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
                                            pathname ===
                                                "/stats/clan/[clanId]" &&
                                            clanId === favorite.id
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
            </div>
        </div>
    )
}
