"use client"

import { cn } from "@/lib/utils"
import { css, theme } from "ui/theme"
import { usePlayerStats } from "./PlayerStatsProvider"
import { useSelectedLayoutSegment } from "next/navigation"
import Link from "next/link"

const tabClassName = cn(
    "px-6 py-4 uppercase text-xs border-b-2 z-10 whitespace-nowrap",
    css({
        borderColor: "transparent",
        color: theme.colors.textVar1,
        '&[data-state="active"]': {
            borderColor: theme.colors.accent,
            color: theme.colors.text,
        },
        "&:hover": {
            backgroundColor: theme.colors.bgVar2,
            borderColor: theme.colors.text,
            color: theme.colors.text,
        },
    })(),
)

export const PlayerStatsTabs = () => {
    const {
        stats: { brawlhalla_id: playerId },
        ranked,
    } = usePlayerStats()
    const segment = useSelectedLayoutSegment()

    return (
        <nav className="relative flex mt-8 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-bgVar1 overflow-x-scroll">
            <Link
                href={`/player/${playerId}`}
                className={tabClassName}
                data-state={!segment && "active"}
            >
                Overview
            </Link>
            {ranked && ranked["2v2"].length > 0 && (
                <Link
                    href={`/player/${playerId}/2v2`}
                    className={tabClassName}
                    data-state={segment === "2v2" && "active"}
                >
                    2v2
                </Link>
            )}
            <Link
                href={`/player/${playerId}/legends`}
                className={tabClassName}
                data-state={segment === "legends" && "active"}
            >
                Legends
            </Link>
            <Link
                href={`/player/${playerId}/weapons`}
                className={tabClassName}
                data-state={segment === "weapons" && "active"}
            >
                Weapons
            </Link>
        </nav>
    )
}
