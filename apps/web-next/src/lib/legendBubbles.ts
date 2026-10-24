import { legendIconSrc } from "./assets"
import { mediaSlotKey } from "./mediaSlot"
import { playerHref } from "./rankings"
import type { BubbleNode } from "./bubbles"
import type { PlayerLegend } from "@crh/api-contract/schemas"

/** One bubble per played legend, in id order so server and client pack alike. */
export const toLegendBubbles = (
    legends: readonly PlayerLegend[],
): readonly BubbleNode[] =>
    legends
        .filter((legend) => legend.stats.games > 0)
        .sort((a, b) => a.id - b.id)
        .map((legend) => ({
            key: String(legend.id),
            name: legend.name,
            icon: legendIconSrc(legend.name_key),
            slotKey: mediaSlotKey("legend.icon", legend.name_key),
            href: playerHref(legend.slug),
            level: legend.stats.level,
            matchtime: legend.stats.matchtime,
            kos: legend.stats.kos,
            damage_dealt: legend.stats.damage_dealt,
            games: legend.stats.games,
            wins: legend.stats.wins,
        }))
