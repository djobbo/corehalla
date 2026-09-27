import { Card } from "@/components/ui/Card"
import { StatGrid } from "@/components/ui/StatGrid"
import { usePlayerDerived } from "./usePlayerDerived"
import { playerAliasesAtom, useQuery } from "@/effect/atoms"
import { legendIconSrc, regionFlagSrc, weaponIconSrc } from "@/lib/assets"
import { tierColor } from "@/lib/rankings"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatTime } from "@crh/common/helpers/date"
import type { CSSProperties } from "react"
import { cn } from "@crh/common/helpers/classnames"

/**
 * Who this page is about.
 *
 * The arrangement follows the newer `kubi` client rather than the legacy one:
 * a breadcrumb, then name and chips ranged left, then the account summary as an
 * inset card of labelled figures. The legacy page centred the name and spread
 * the same figures across an icon row; ranging left is what makes the header
 * survive a long name, a long alias list and a narrow phone.
 *
 * The figures are the union of both: kubi's three (level, XP, time) plus the
 * legacy header's two art rows, which are the only place on the page where the
 * game's own artwork appears.
 */

/** Aliases past this many are noise; the search overlay holds the full list. */
const MAX_SHOWN_ALIASES = 8

/** One art tile in a header row. */
type Thumb = {
    readonly key: string
    readonly src: string
    readonly alt: string
}

/**
 * A row of slanted art tiles.
 *
 * The artwork is the label — the tiles are 32px and there is no room for text
 * beneath them — so the name is carried by `alt` for assistive tech and by
 * `title` for the pointer.
 */
const ThumbRow = ({ items }: { readonly items: readonly Thumb[] }) => (
    <span className="flex items-center gap-0.5">
        {items.map((item) => (
            <img
                key={item.key}
                src={item.src}
                alt={item.alt}
                title={item.alt}
                className={cn("ch-thumb", "bg-accent")}
            />
        ))}
    </span>
)

export const PlayerHeader = ({ playerId }: { readonly playerId: number }) => {
    const player = usePlayerDerived(playerId)
    const aliases = useQuery(playerAliasesAtom(playerId))

    if (!player) {
        return (
            <p className="text-sm text-textVar1">
                No player with id {playerId}.
            </p>
        )
    }

    const { stats, ranked, topLegends, topWeapons, totals } = player

    /*
     * The crawler emits single-character aliases and "•2" duplicates of a name
     * it has already recorded. Both are artefacts of the source data rather than
     * names, so neither is shown.
     */
    const shownAliases = aliases
        .map(cleanString)
        .filter((alias) => alias.length >= 2 && !alias.endsWith("•2"))
        .slice(0, MAX_SHOWN_ALIASES)

    const name = cleanString(stats.name)

    return (
        <header className="flex flex-col gap-3">
            <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-2 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-textVar1"
            >
                <span>Brawlhalla</span>
                <span aria-hidden className="text-textVar1/40">
                    /
                </span>
                <span>Players</span>
                <span aria-hidden className="text-textVar1/40">
                    /
                </span>
                <span>#{stats.brawlhalla_id}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
                {/*
                 * The region flag stands where a monogram would, because the
                 * flag is the one fact about a player that a single glyph can
                 * carry. Unranked players have no region, so the monogram stays
                 * as the fallback rather than leaving a hole.
                 */}
                {ranked?.region ? (
                    <img
                        src={regionFlagSrc(ranked.region)}
                        alt={`${ranked.region.toUpperCase()} region`}
                        title={`${ranked.region.toUpperCase()} region`}
                        className="ch-thumb ch-thumb-lg"
                    />
                ) : (
                    <span aria-hidden className="ch-mark h-9 w-9 text-base">
                        <span>{name.slice(0, 1).toUpperCase()}</span>
                    </span>
                )}
                <h1 className="ch-display text-2xl sm:text-3xl">{name}</h1>
                {ranked?.tier ? (
                    <span
                        className="ch-tier"
                        style={
                            {
                                "--ch-tier": tierColor(ranked.tier),
                            } as CSSProperties
                        }
                    >
                        {ranked.tier}
                    </span>
                ) : null}
            </div>

            {shownAliases.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                    {shownAliases.map((alias) => (
                        <li
                            key={alias}
                            className="ch-chip ch-chip-off text-[0.6rem] normal-case tracking-normal"
                        >
                            {alias}
                        </li>
                    ))}
                </ul>
            ) : null}

            <Card variant="ghost">
                {/*
                 * Five figures, so the ladder tops out at five: at the default
                 * four they would sit four-then-one on a wide display.
                 */}
                <StatGrid
                    maxColumns={5}
                    stats={[
                        { title: "Account level", value: stats.level },
                        {
                            title: "Account XP",
                            value: stats.xp.toLocaleString(),
                        },
                        {
                            title: "In-game time",
                            value: formatTime(totals.matchtime),
                        },
                        {
                            title: "Main legends",
                            value:
                                topLegends.length > 0 ? (
                                    <ThumbRow
                                        items={topLegends.map((legend) => ({
                                            key: String(legend.legend_id),
                                            src: legendIconSrc(
                                                legend.legend_name_key,
                                            ),
                                            alt: legend.bio_name,
                                        }))}
                                    />
                                ) : (
                                    "—"
                                ),
                        },
                        {
                            title: "Main weapons",
                            value:
                                topWeapons.length > 0 ? (
                                    <ThumbRow
                                        items={topWeapons.map((weapon) => ({
                                            key: weapon.weapon,
                                            src: weaponIconSrc(weapon.weapon),
                                            alt: weapon.weapon,
                                        }))}
                                    />
                                ) : (
                                    "—"
                                ),
                        },
                    ]}
                />
            </Card>
        </header>
    )
}
