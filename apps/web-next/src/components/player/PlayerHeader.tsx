import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FavoriteButton } from "@/components/account/FavoriteButton"
import { StatGrid } from "@/components/StatGrid"
import { UpdatedAt } from "@/components/UpdatedAt"
import { playerProfileAtom, useQuery } from "@/effect/atoms"
import { legendIconSrc, regionFlagSrc, weaponIconSrc } from "@/lib/assets"
import { tierColor } from "@/lib/rankings"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatTime } from "@crh/common/helpers/date"
import type { CSSProperties } from "react"
import { cn } from "@/lib/cn"

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
 *
 * Everything numeric here comes from the one profile aggregate. What is left in
 * this file is picking the two art rows: a slice of lists the API already
 * ordered, not a second aggregation.
 */

/** Aliases past this many are noise; the search overlay holds the full list. */
const MAX_SHOWN_ALIASES = 8

/** How many art tiles each header row shows. */
const TOP_ART_COUNT = 3

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
                className={cn("ch-thumb", "bg-primary")}
            />
        ))}
    </span>
)

export const PlayerHeader = ({ playerId }: { readonly playerId: number }) => {
    const envelope = useQuery(playerProfileAtom(playerId))
    const profile = envelope.data

    /*
     * "Main" means where the hours went, so this row is ordered by time played
     * rather than by level: a legend can reach a high level off a handful of
     * long games. The API sorts `legends` by XP for the tab, so the ordering
     * this row wants is picked here — a slice of an already-computed list.
     */
    const topLegends = useMemo(
        () =>
            [...profile.legends]
                .filter((legend) => legend.stats.games > 0)
                .sort((a, b) => b.stats.matchtime - a.stats.matchtime)
                .slice(0, TOP_ART_COUNT),
        [profile.legends],
    )

    // The API orders weapons by time held, so its head is exactly this row.
    const topWeapons = profile.weapons.slice(0, TOP_ART_COUNT)

    /*
     * The API has already filtered the current name out and collapsed
     * duplicates; what remains is the crawler's habit of emitting
     * single-character aliases and "•2" duplicates of a name it has already
     * recorded. Both are artefacts of the source data rather than names, so
     * neither is shown.
     */
    const shownAliases = profile.aliases
        .map(cleanString)
        .filter((alias) => alias.length >= 2 && !alias.endsWith("•2"))
        .slice(0, MAX_SHOWN_ALIASES)

    // The region flag and tier chip describe the player's 1v1 standing, which
    // is the only bracket that can speak for "where they play".
    const ranked = profile.ranked?.["1v1"] ?? null

    const name = cleanString(profile.name)

    return (
        <header className="flex flex-col gap-3">
            <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-2 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-muted-foreground"
            >
                <span>Brawlhalla</span>
                <span aria-hidden className="text-muted-foreground/40">
                    /
                </span>
                <span>Players</span>
                <span aria-hidden className="text-muted-foreground/40">
                    /
                </span>
                <span>#{profile.id}</span>
                <span aria-hidden className="text-muted-foreground/40">
                    ·
                </span>
                <UpdatedAt
                    at={envelope.meta.updated_at}
                    className="normal-case tracking-normal"
                />
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
                {/*
                 * The saved row carries the player's main legend so the
                 * favourites grid can show the same art this header does,
                 * without a second request when the grid renders.
                 */}
                <FavoriteButton
                    type="player"
                    id={String(profile.id)}
                    name={name}
                    meta={
                        topLegends[0]
                            ? {
                                  icon: {
                                      legend_key: topLegends[0].name_key,
                                  },
                              }
                            : {}
                    }
                />
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

            <Card className="bg-transparent shadow-none">
                {/*
                 * Five figures, so the ladder tops out at five: at the default
                 * four they would sit four-then-one on a wide display.
                 */}
                <CardContent>
                    <StatGrid
                        maxColumns={5}
                        stats={[
                            {
                                title: "Account level",
                                value: profile.stats.level,
                            },
                            {
                                title: "Account XP",
                                value: profile.stats.xp.toLocaleString(),
                            },
                            {
                                title: "In-game time",
                                value: formatTime(profile.stats.matchtime),
                            },
                            {
                                title: "Main legends",
                                value:
                                    topLegends.length > 0 ? (
                                        <ThumbRow
                                            items={topLegends.map((legend) => ({
                                                key: String(legend.id),
                                                src: legendIconSrc(
                                                    legend.name_key,
                                                ),
                                                alt: legend.name,
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
                                                key: weapon.name,
                                                src: weaponIconSrc(
                                                    weapon.name,
                                                ),
                                                alt: weapon.name,
                                            }))}
                                        />
                                    ) : (
                                        "—"
                                    ),
                            },
                        ]}
                    />
                </CardContent>
            </Card>
        </header>
    )
}
