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

const MAX_SHOWN_ALIASES = 8

const TOP_ART_COUNT = 3

type Thumb = {
    readonly key: string
    readonly src: string
    readonly alt: string
}

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

    const topLegends = useMemo(
        () =>
            [...profile.legends]
                .filter((legend) => legend.stats.games > 0)
                .sort((a, b) => b.stats.matchtime - a.stats.matchtime)
                .slice(0, TOP_ART_COUNT),
        [profile.legends],
    )

    const topWeapons = profile.weapons.slice(0, TOP_ART_COUNT)

    const shownAliases = profile.aliases
        .map(cleanString)
        .filter((alias) => alias.length >= 2 && !alias.endsWith("•2"))
        .slice(0, MAX_SHOWN_ALIASES)

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
                                                src: weaponIconSrc(weapon.name),
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
