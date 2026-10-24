import { legendIconSrc } from "./assets"
import { mediaSlotKey } from "./mediaSlot"
import { playerHref } from "./rankings"
import type { BubbleNode } from "./bubbles"
import type { LegendBubble, PlayerLegend } from "@crh/api-contract/schemas"

/** One bubble per played legend, in id order so server and client pack alike. */
export const toLegendBubbles = (
    legends: readonly (LegendBubble | PlayerLegend)[],
): readonly BubbleNode[] =>
    legends
        .map((legend) => ({
            legend,
            stats: "stats" in legend ? legend.stats : legend,
        }))
        .filter(({ stats }) => stats.games > 0)
        .sort((a, b) => a.legend.id - b.legend.id)
        .map(({ legend, stats }) => ({
            key: String(legend.id),
            name: legend.name,
            icon: legendIconSrc(legend.name_key),
            slotKey: mediaSlotKey("legend.icon", legend.name_key),
            href: playerHref(legend.slug),
            level: stats.level,
            matchtime: stats.matchtime,
            kos: stats.kos,
            damage_dealt: stats.damage_dealt,
            games: stats.games,
            wins: stats.wins,
        }))
